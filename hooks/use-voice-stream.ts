"use client"

import { useCallback, useRef, useState } from 'react'

interface UseVoiceStreamOptions {
  onAudioChunked: (audioData: string) => void
  onError?: (error: Error) => void
}

export const useVoiceStream = ({ onAudioChunked, onError }: UseVoiceStreamOptions) => {
  const [isStreaming, setIsStreaming] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startStreaming = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      })

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64data = reader.result as string
            const base64Audio = base64data.split(',')[1]
            onAudioChunked(base64Audio)
          }
          reader.readAsDataURL(event.data)
        }
      }

      mediaRecorder.start(100) // Collect data every 100ms
      mediaRecorderRef.current = mediaRecorder
      setIsStreaming(true)
    } catch (error) {
      console.error('[useVoiceStream] Error starting stream:', error)
      onError?.(error as Error)
      setIsStreaming(false)
    }
  }, [onAudioChunked, onError])

  const stopStreaming = useCallback(() => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      mediaRecorderRef.current = null
      setIsStreaming(false)
    } catch (error) {
      console.error('[useVoiceStream] Error stopping stream:', error)
      onError?.(error as Error)
    }
  }, [onError])

  return {
    startStreaming,
    stopStreaming,
    isStreaming,
  }
}
