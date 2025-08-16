// ElevenLabs API integration for high-quality speech synthesis
export class ElevenLabsService {
  private apiKey: string
  private baseUrl = "https://api.elevenlabs.io/v1"
  private defaultVoiceId = "pNInz6obpgDQGcFmaJgB" // Adam voice - warm, friendly male voice

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || ""
  }

  async synthesizeSpeech(text: string, voiceId?: string): Promise<ArrayBuffer | null> {
    if (!this.apiKey) {
      console.warn("ElevenLabs API key not found, falling back to browser speech synthesis")
      return null
    }

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId || this.defaultVoiceId}`, {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.2,
            use_speaker_boost: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      return await response.arrayBuffer()
    } catch (error) {
      console.error("ElevenLabs synthesis error:", error)
      return null
    }
  }

  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    return new Promise((resolve, reject) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

      audioContext
        .decodeAudioData(audioBuffer)
        .then((decodedData) => {
          const source = audioContext.createBufferSource()
          source.buffer = decodedData
          source.connect(audioContext.destination)

          source.onended = () => resolve()
          source.start(0)
        })
        .catch(reject)
    })
  }

  async speak(text: string, voiceId?: string): Promise<void> {
    const audioBuffer = await this.synthesizeSpeech(text, voiceId)

    if (audioBuffer) {
      await this.playAudio(audioBuffer)
    } else {
      // Fallback to browser speech synthesis
      this.fallbackSpeak(text)
    }
  }

  private fallbackSpeak(text: string): void {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      utterance.lang = "en-US"
      speechSynthesis.speak(utterance)
    }
  }

  // Get available voices from ElevenLabs
  async getVoices(): Promise<any[]> {
    if (!this.apiKey) return []

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          "xi-api-key": this.apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      const data = await response.json()
      return data.voices || []
    } catch (error) {
      console.error("Error fetching ElevenLabs voices:", error)
      return []
    }
  }
}

// Create singleton instance
export const elevenLabsService = new ElevenLabsService()
