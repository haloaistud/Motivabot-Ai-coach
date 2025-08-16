"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Mic, BotIcon as Robot, Trash2, MicOff } from "lucide-react"
import type { SpeechRecognition, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from "web-speech-api"

interface ChatMessage {
  type: "user" | "bot"
  message: string
  timestamp: Date
  emotion?: string
}

interface ChatModuleProps {
  onMessageSpeak?: (text: string, emotion?: string) => void
}

const ChatModule = ({ onMessageSpeak }: ChatModuleProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { type: "bot", message: "Welcome! How can I help motivate you today?", timestamp: new Date(), emotion: "friendly" },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null)
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const chatLogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognitionInstance = new SpeechRecognition()

      recognitionInstance.continuous = false
      recognitionInstance.lang = "en-US"
      recognitionInstance.interimResults = false
      recognitionInstance.maxAlternatives = 1

      recognitionInstance.onstart = () => {
        setIsListening(true)
      }

      recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error)
        setIsListening(false)
      }

      recognitionInstance.onend = () => {
        setIsListening(false)
      }

      setRecognition(recognitionInstance)
    }
  }, [])

  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      type: "user",
      message: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsProcessing(true)

    try {
      // Call our speech schema API
      const response = await fetch("/api/speech-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          userId: userId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response from speech API")
      }

      const data = await response.json()

      const botMessage: ChatMessage = {
        type: "bot",
        message: data.text,
        timestamp: new Date(),
        emotion: data.emotion,
      }

      setMessages((prev) => [...prev, botMessage])

      // Use ElevenLabs for speech synthesis with emotion
      if (onMessageSpeak) {
        setIsSpeaking(true)
        try {
          await onMessageSpeak(data.text, data.emotion)
        } catch (error) {
          console.error("Speech synthesis error:", error)
        } finally {
          setIsSpeaking(false)
        }
      }

      // Add follow-up message if provided
      if (data.followUp) {
        setTimeout(() => {
          const followUpMessage: ChatMessage = {
            type: "bot",
            message: data.followUp,
            timestamp: new Date(),
            emotion: "curious",
          }
          setMessages((prev) => [...prev, followUpMessage])
        }, 2000)
      }
    } catch (error) {
      console.error("Error getting bot response:", error)

      // Fallback response
      const fallbackMessage: ChatMessage = {
        type: "bot",
        message:
          "I'm having trouble processing that right now, but I'm here to help! Could you try rephrasing your message?",
        timestamp: new Date(),
        emotion: "apologetic",
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsProcessing(false)
    }

    setInput("")
  }

  const toggleVoiceRecognition = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser.")
      return
    }

    if (isListening) {
      recognition.stop()
    } else {
      try {
        recognition.start()
      } catch (error) {
        console.error("Error starting speech recognition:", error)
        setIsListening(false)
      }
    }
  }

  const clearChat = () => {
    setMessages([
      {
        type: "bot",
        message: "Chat cleared! How can I help motivate you today?",
        timestamp: new Date(),
        emotion: "friendly",
      },
    ])
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  const quickActions = [
    { text: "I need motivation for work", label: "💼 Work motivation" },
    { text: "Help me set a meaningful goal", label: "🎯 Set a goal" },
    { text: "I'm feeling down and need support", label: "😔 Need support" },
    { text: "Give me an inspiring pep talk", label: "🔥 Pep talk" },
    { text: "I'm struggling with staying motivated", label: "💪 Stay motivated" },
    { text: "What's my purpose in life?", label: "🌟 Find purpose" },
  ]

  return (
    <Card className="chat-box">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                <Robot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold">MotivaBOT</div>
                <div className="text-sm text-muted-foreground">
                  {isProcessing ? "Thinking..." : "Online & Ready to Help"}
                </div>
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceRecognition}
              className={isListening ? "bg-red-100 border-red-300" : ""}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4 text-red-600" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={clearChat} title="Clear chat history">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div id="chat-log" ref={chatLogRef} className="h-64 overflow-y-auto mb-4 p-3 bg-muted/20 rounded-lg border">
          {messages.map((msg, index) => (
            <div key={index} className={`mb-3 ${msg.type === "user" ? "text-right" : "text-left"}`}>
              <div
                className={`inline-block max-w-[80%] ${
                  msg.type === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-secondary text-secondary-foreground mr-auto"
                } p-3 rounded-lg`}
              >
                {msg.type === "bot" && (
                  <div className="flex items-center gap-2 mb-1">
                    <Robot className="w-4 h-4" />
                    <span className="font-medium text-sm">MotivaBOT</span>
                    {msg.emotion && (
                      <span className="text-xs opacity-70 bg-primary/10 px-2 py-1 rounded">{msg.emotion}</span>
                    )}
                  </div>
                )}
                <div className="break-words">{msg.message}</div>
                <div className={`text-xs mt-1 opacity-70`}>{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))}
          {(isSpeaking || isProcessing) && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="speaking-animation">{isProcessing ? "🤔" : "🔊"}</div>
                {isProcessing ? "MotivaBOT is thinking..." : "MotivaBOT is speaking..."}
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-container">
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "Listening..." : isProcessing ? "Processing..." : "Type your message..."}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={isListening || isProcessing}
            className="flex-1"
          />
          <button
            id="send-button"
            onClick={sendMessage}
            disabled={!input.trim() || isListening || isProcessing}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => setInput(action.text)}
              className="text-xs"
              disabled={isProcessing}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatModule
