"use client"

import { useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Phone, PhoneOff, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { useAgentConversation } from '@/hooks/use-agent-conversation'

export default function VoiceConversation() {
  const {
    startConversation,
    stopConversation,
    clearMessages,
    isConnected,
    isStreaming,
    isAgentSpeaking,
    error,
    messages,
    isReconnecting,
  } = useAgentConversation()

  const handleStart = useCallback(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      await startConversation()
    } catch (err) {
      console.error('[VoiceConversation] Failed to start:', err)
    }
  }, [startConversation])

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-6 h-6 text-primary" />
          Voice Conversation with MotivaBOT
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm flex-1">{error}</p>
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-3">
            <Button
              onClick={handleStart}
              disabled={isConnected || isReconnecting}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isReconnecting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="w-5 h-5 mr-2" />
                  Start Voice Chat
                </>
              )}
            </Button>

            <Button
              onClick={stopConversation}
              disabled={!isConnected}
              size="lg"
              variant="destructive"
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              End Call
            </Button>

            <Button
              onClick={clearMessages}
              disabled={messages.length === 0}
              size="lg"
              variant="outline"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Clear
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {isStreaming ? (
                  <Mic className="w-5 h-5 text-green-500 animate-pulse" />
                ) : (
                  <MicOff className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium">
                  {isStreaming ? 'Listening...' : 'Mic Off'}
                </span>
              </div>

              <div className="h-6 w-px bg-border" />

              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                  }`}
                />
                <span className="text-sm font-medium">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {isAgentSpeaking && (
                <>
                  <div className="h-6 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-sm font-medium">Agent Speaking</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {messages.length > 0 && (
          <div className="mt-6 space-y-3 max-h-96 overflow-y-auto p-4 bg-muted/30 rounded-lg">
            <h4 className="font-semibold text-sm text-muted-foreground">Conversation Transcript:</h4>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-primary/10 text-foreground ml-8'
                    : 'bg-accent/10 text-foreground mr-8'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs">
                    {msg.role === 'user' ? 'You' : 'MotivaBOT'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{msg.content}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Tip:</strong> Speak naturally with MotivaBOT. The AI will respond with personalized
            motivation and guidance based on your conversation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
