"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Mic, Bot as Robot, Trash2, MicOff } from "lucide-react"

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
    {
      type: "bot",
      message:
        "Welcome! I'm MotivaBOT, your personal AI motivation coach. I'm here to help you achieve your dreams and stay motivated on your journey to success!",
      timestamp: new Date(),
      emotion: "enthusiastic",
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [recognition, setRecognition] = useState<any | null>(null)
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [conversationContext, setConversationContext] = useState<string[]>([])
  const [userProfile, setUserProfile] = useState({ name: "", goals: [], preferences: [] })
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

      recognitionInstance.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInput(transcript)
        setIsListening(false)
      }

      recognitionInstance.onerror = (event: any) => {
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
    setConversationContext((prev) => [...prev.slice(-5), input.trim()]) // Update conversation context
    setIsProcessing(true)

    try {
      const response = await fetch("/api/speech-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input.trim(),
          userId: userId,
          context: conversationContext,
          userProfile: userProfile,
          timestamp: new Date().toISOString(),
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

      if (onMessageSpeak) {
        setIsSpeaking(true)
        try {
          await onMessageSpeak(data.text, data.emotion)
        } catch (error) {
          console.error("Speech synthesis error:", error)
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(data.text)
            utterance.rate = 0.9
            utterance.pitch = 1.1
            speechSynthesis.speak(utterance)
          }
        } finally {
          setIsSpeaking(false)
        }
      }

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

      if (data.userInsights) {
        setUserProfile((prev) => ({
          ...prev,
          ...data.userInsights,
        }))
      }
    } catch (error) {
      console.error("Error getting bot response:", error)

      const fallbackResponses = [
        "I'm having trouble processing that right now, but I believe in your ability to overcome any challenge! Could you try rephrasing your message?",
        "My circuits are a bit tangled at the moment, but my enthusiasm for helping you succeed is unwavering! Let's try that again.",
        "Technical hiccup on my end, but that won't stop us from achieving greatness together! Please rephrase your question.",
      ]

      const fallbackMessage: ChatMessage = {
        type: "bot",
        message: fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)],
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
    { text: "I need motivation for work", label: "💼 Work Motivation", category: "work" },
    { text: "Help me set a meaningful goal", label: "🎯 Goal Setting", category: "goals" },
    { text: "I'm feeling down and need support", label: "💙 Emotional Support", category: "support" },
    { text: "Give me an inspiring pep talk", label: "🔥 Pep Talk", category: "motivation" },
    { text: "I'm struggling with staying motivated", label: "💪 Stay Motivated", category: "persistence" },
    { text: "What's my purpose in life?", label: "🌟 Find Purpose", category: "purpose" },
    { text: "How can I build better habits?", label: "🔄 Build Habits", category: "habits" },
    { text: "I need help with time management", label: "⏰ Time Management", category: "productivity" },
    { text: "How do I overcome fear and anxiety?", label: "🦋 Overcome Fear", category: "courage" },
    { text: "I want to improve my self-confidence", label: "✨ Build Confidence", category: "confidence" },
  ]

  return (
    <Card className="chat-box border-2 border-golden-primary/20 bg-gradient-to-br from-golden-light/5 to-golden-primary/5">
      <CardHeader className="bg-gradient-to-r from-golden-primary/10 to-golden-accent/10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gradient-to-r from-golden-primary to-golden-accent rounded-full flex items-center justify-center shadow-lg">
                <Robot className="w-7 h-7 text-black" />
              </div>
              <div>
                <div className="font-bold text-golden-primary text-lg">MotivaBOT</div>
                <div className="text-sm text-golden-dark">
                  {isProcessing ? (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-golden-primary rounded-full animate-pulse"></div>
                      Crafting your motivation...
                    </span>
                  ) : isSpeaking ? (
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Speaking with inspiration...
                    </span>
                  ) : (
                    "Your Personal Success Coach • Online 24/7"
                  )}
                </div>
              </div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleVoiceRecognition}
              className={`border-golden-primary ${isListening ? "bg-red-100 border-red-300 text-red-600" : "text-golden-primary hover:bg-golden-primary hover:text-black"}`}
              title={isListening ? "Stop listening" : "Start voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              title="Clear chat history"
              className="border-golden-primary text-golden-primary hover:bg-golden-primary hover:text-black bg-transparent"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div
          id="chat-log"
          ref={chatLogRef}
          className="h-80 overflow-y-auto mb-6 p-4 bg-gradient-to-b from-golden-light/5 to-transparent rounded-lg border border-golden-primary/20"
        >
          {messages.map((msg, index) => (
            <div key={index} className={`mb-4 ${msg.type === "user" ? "text-right" : "text-left"}`}>
              <div
                className={`inline-block max-w-[85%] ${
                  msg.type === "user"
                    ? "bg-gradient-to-r from-golden-primary to-golden-accent text-black ml-auto shadow-lg"
                    : "bg-gradient-to-r from-white to-golden-light/20 text-golden-primary mr-auto border border-golden-primary/20 shadow-md"
                } p-4 rounded-2xl`}
              >
                {msg.type === "bot" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Robot className="w-4 h-4 text-golden-primary" />
                    <span className="font-semibold text-sm text-golden-primary">MotivaBOT</span>
                    {msg.emotion && (
                      <span className="text-xs bg-golden-primary/20 text-golden-dark px-2 py-1 rounded-full">
                        {msg.emotion}
                      </span>
                    )}
                  </div>
                )}
                <div className="break-words leading-relaxed">{msg.message}</div>
                <div
                  className={`text-xs mt-2 opacity-70 ${msg.type === "user" ? "text-black/70" : "text-golden-dark"}`}
                >
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            </div>
          ))}
          {(isSpeaking || isProcessing) && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-3 text-golden-primary bg-golden-light/20 px-4 py-2 rounded-full border border-golden-primary/20">
                <div className="speaking-animation text-xl">{isProcessing ? "🤔" : "🔊"}</div>
                <span className="font-medium">
                  {isProcessing ? "MotivaBOT is thinking deeply..." : "MotivaBOT is speaking with passion..."}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-container flex gap-3 mb-4">
          <input
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isListening
                ? "🎤 Listening to your voice..."
                : isProcessing
                  ? "⏳ Processing your message..."
                  : "Share what's on your mind..."
            }
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            disabled={isListening || isProcessing}
            className="flex-1 px-4 py-3 border-2 border-golden-primary/30 rounded-xl bg-white/90 text-golden-primary placeholder-golden-dark/60 focus:border-golden-primary focus:ring-2 focus:ring-golden-primary/20"
          />
          <button
            id="send-button"
            onClick={sendMessage}
            disabled={!input.trim() || isListening || isProcessing}
            className="px-6 py-3 bg-gradient-to-r from-golden-primary to-golden-accent text-black font-semibold rounded-xl hover:from-golden-accent hover:to-golden-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg transition-all duration-200"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-golden-primary">Quick Actions - Get Instant Motivation:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInput(action.text)}
                className="text-xs justify-start border-golden-primary/30 text-golden-primary hover:bg-golden-primary hover:text-black transition-all duration-200"
                disabled={isProcessing}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ChatModule
