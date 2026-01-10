"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Phone, AlertCircle, Volume2 } from "lucide-react"
import ElevenLabsAgent from "./elevenlabs-agent"

export default function VoiceConversation() {
  const [showWidget, setShowWidget] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleStartVoice = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setShowWidget(true)
      setError(null)
    } catch (err) {
      console.error("[VoiceConversation] Microphone access denied:", err)
      setError("Please allow microphone access to use voice chat.")
    }
  }

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-6 h-6 text-primary" />
          Voice Conversation with MotivaBOT
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p className="text-sm flex-1">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              x
            </Button>
          </div>
        )}

        <div className="flex flex-col items-center gap-6">
          {!showWidget ? (
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gradient-to-r from-golden-primary to-golden-accent rounded-full flex items-center justify-center shadow-lg">
                <Volume2 className="w-12 h-12 text-black" />
              </div>
              <h3 className="text-xl font-semibold">Start Voice Chat</h3>
              <p className="text-muted-foreground max-w-md">
                Have a natural conversation with MotivaBOT using your voice. Get personalized motivation and guidance in
                real-time.
              </p>
              <Button
                onClick={handleStartVoice}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                <Phone className="w-5 h-5 mr-2" />
                Enable Voice Chat
              </Button>
            </div>
          ) : (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-medium">Voice chat active</span>
              </div>

              {/* ElevenLabs Conversational Widget */}
              <div className="flex justify-center">
                <ElevenLabsAgent agentId="agent_0901k9c4ay4afym87m7p8beshsm5" />
              </div>

              <Button variant="outline" onClick={() => setShowWidget(false)} className="w-full">
                Disable Voice Chat
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Tip:</strong> Click the microphone icon in the widget to start speaking. MotivaBOT will listen and
            respond with personalized motivation and guidance.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
