// ElevenLabs API integration for high-quality speech synthesis
export class ElevenLabsService {
  private baseUrl = "/api/elevenlabs-speech"

  async synthesizeSpeech(text: string, emotion = "neutral"): Promise<ArrayBuffer | null> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          emotion,
        }),
      })

      if (!response.ok) {
        throw new Error(`Speech API error: ${response.status}`)
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

  async speak(text: string, emotion = "neutral"): Promise<void> {
    const audioBuffer = await this.synthesizeSpeech(text, emotion)

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
}

// Create singleton instance
export const elevenLabsService = new ElevenLabsService()
