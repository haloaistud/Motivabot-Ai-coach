"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { useVoiceStream } from './use-voice-stream'
import type { ElevenLabsWebSocketEvent } from '../types/websocket'

const sendMessage = (websocket: WebSocket, request: object) => {
  if (websocket.readyState !== WebSocket.OPEN) {
    console.warn('[useAgentConversation] WebSocket not open, cannot send message')
    return false
  }
  try {
    websocket.send(JSON.stringify(request))
    return true
  } catch (error) {
    console.error('[useAgentConversation] Error sending message:', error)
    return false
  }
}

interface ConversationMessage {
  id: string
  role: 'user' | 'agent'
  content: string
  timestamp: Date
}

export const useAgentConversation = () => {
  const websocketRef = useRef<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isReconnecting, setIsReconnecting] = useState(false)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttempts = 3
  const audioQueueRef = useRef<{ id: number; audio: string }[]>([])
  const currentAudioRef = useRef<HTMLAudioElement | null>(null)

  const { startStreaming, stopStreaming, isStreaming } = useVoiceStream({
    onAudioChunked: (audioData) => {
      if (!websocketRef.current) return
      sendMessage(websocketRef.current, {
        user_audio_chunk: audioData,
      })
    },
    onError: (err) => {
      console.error('[useAgentConversation] Voice stream error:', err)
      setError('Microphone error. Please check your permissions.')
    },
  })

  const playAudioQueue = useCallback(async () => {
    if (audioQueueRef.current.length === 0 || isAgentSpeaking) return

    setIsAgentSpeaking(true)
    const audioItem = audioQueueRef.current.shift()

    if (audioItem) {
      try {
        const audioBlob = base64ToBlob(audioItem.audio, 'audio/mpeg')
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)

        currentAudioRef.current = audio

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          currentAudioRef.current = null
          setIsAgentSpeaking(false)
          playAudioQueue()
        }

        audio.onerror = (err) => {
          console.error('[useAgentConversation] Audio playback error:', err)
          URL.revokeObjectURL(audioUrl)
          currentAudioRef.current = null
          setIsAgentSpeaking(false)
          playAudioQueue()
        }

        await audio.play()
      } catch (err) {
        console.error('[useAgentConversation] Audio play error:', err)
        setIsAgentSpeaking(false)
        playAudioQueue()
      }
    }
  }, [isAgentSpeaking])

  const startConversation = useCallback(async () => {
    if (isConnected || isReconnecting) return

    try {
      setError(null)
      setIsReconnecting(true)

      const response = await fetch('/api/elevenlabs-connect')
      if (!response.ok) {
        throw new Error('Failed to initialize connection')
      }

      const { wsUrl, agentId } = await response.json()

      const websocket = new WebSocket(wsUrl)

      websocket.onopen = async () => {
        console.log('[useAgentConversation] WebSocket connected')
        setIsConnected(true)
        setIsReconnecting(false)
        setError(null)
        reconnectAttemptsRef.current = 0

        sendMessage(websocket, {
          type: 'conversation_initiation_client_data',
          conversation_config_override: {
            agent: {
              prompt: {
                prompt: 'You are MotivaBOT, an enthusiastic and empathetic AI motivation coach. Help users achieve their goals with personalized encouragement and actionable advice.',
              },
            },
          },
        })

        await startStreaming()
      }

      websocket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data) as ElevenLabsWebSocketEvent

          if (data.type === 'ping') {
            setTimeout(() => {
              sendMessage(websocket, {
                type: 'pong',
                event_id: data.ping_event.event_id,
              })
            }, data.ping_event.ping_ms || 0)
          }

          if (data.type === 'user_transcript') {
            const { user_transcription_event } = data
            console.log('[useAgentConversation] User:', user_transcription_event.user_transcript)
            
            setMessages((prev) => [
              ...prev,
              {
                id: `user_${Date.now()}`,
                role: 'user',
                content: user_transcription_event.user_transcript,
                timestamp: new Date(),
              },
            ])
          }

          if (data.type === 'agent_response') {
            const { agent_response_event } = data
            console.log('[useAgentConversation] Agent:', agent_response_event.agent_response)
            
            setMessages((prev) => [
              ...prev,
              {
                id: `agent_${Date.now()}`,
                role: 'agent',
                content: agent_response_event.agent_response,
                timestamp: new Date(),
              },
            ])
          }

          if (data.type === 'agent_response_correction') {
            const { agent_response_correction_event } = data
            console.log('[useAgentConversation] Correction:', agent_response_correction_event.corrected_agent_response)
            
            setMessages((prev) => {
              const newMessages = [...prev]
              const lastAgentIndex = newMessages.findLastIndex((m) => m.role === 'agent')
              if (lastAgentIndex !== -1) {
                newMessages[lastAgentIndex].content = agent_response_correction_event.corrected_agent_response
              }
              return newMessages
            })
          }

          if (data.type === 'audio') {
            const { audio_event } = data
            audioQueueRef.current.push({
              id: audio_event.event_id,
              audio: audio_event.audio_base_64,
            })
            playAudioQueue()
          }

          if (data.type === 'interruption') {
            console.log('[useAgentConversation] Interrupted:', data.interruption_event.reason)
            if (currentAudioRef.current) {
              currentAudioRef.current.pause()
              currentAudioRef.current = null
            }
            audioQueueRef.current = []
            setIsAgentSpeaking(false)
          }
        } catch (err) {
          console.error('[useAgentConversation] Message processing error:', err)
        }
      }

      websocketRef.current = websocket

      websocket.onerror = (err) => {
        console.error('[useAgentConversation] WebSocket error:', err)
        setError('Connection error. Attempting to reconnect...')
      }

      websocket.onclose = async () => {
        console.log('[useAgentConversation] WebSocket closed')
        websocketRef.current = null
        setIsConnected(false)
        setIsReconnecting(false)
        await stopStreaming()

        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++
          console.log(`[useAgentConversation] Reconnection attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`)
          setTimeout(() => {
            startConversation()
          }, 2000 * reconnectAttemptsRef.current)
        } else {
          setError('Connection lost. Please restart the conversation.')
        }
      }
    } catch (err) {
      console.error('[useAgentConversation] Start conversation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to start conversation')
      setIsConnected(false)
      setIsReconnecting(false)
    }
  }, [isConnected, isReconnecting, startStreaming, stopStreaming, playAudioQueue])

  const stopConversation = useCallback(async () => {
    try {
      reconnectAttemptsRef.current = maxReconnectAttempts

      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
        currentAudioRef.current = null
      }

      audioQueueRef.current = []
      setIsAgentSpeaking(false)

      if (websocketRef.current) {
        websocketRef.current.close()
        websocketRef.current = null
      }

      await stopStreaming()
      setIsConnected(false)
      setError(null)
    } catch (err) {
      console.error('[useAgentConversation] Stop conversation error:', err)
    }
  }, [stopStreaming])

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  useEffect(() => {
    return () => {
      if (websocketRef.current) {
        websocketRef.current.close()
      }
      if (currentAudioRef.current) {
        currentAudioRef.current.pause()
      }
    }
  }, [])

  return {
    startConversation,
    stopConversation,
    clearMessages,
    isConnected,
    isStreaming,
    isAgentSpeaking,
    error,
    messages,
    isReconnecting,
  }
}

// Helper function
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}
