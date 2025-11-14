export interface VoiceConfig {
  voiceId: string
  stability: number
  similarityBoost: number
  style: number
  useSpeakerBoost: boolean
}

export interface SpeechOptions {
  text: string
  emotion?: string
  priority?: "low" | "normal" | "high"
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: Error) => void
}

class ElevenLabsAgentService {
  private static instance: ElevenLabsAgentService
  private baseUrl = "/api/elevenlabs-speech"
  private currentAudio: HTMLAudioElement | null = null
  private queue: SpeechOptions[] = []
  private isProcessing = false

  // Voice configurations for different emotions
  private voiceConfigs: Record<string, VoiceConfig> = {
    neutral: {
      voiceId: "VR6AewLTigWG4xSOukaG", // Adam voice
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0,
      useSpeakerBoost: true,
    },
    enthusiastic: {
      voiceId: "VR6AewLTigWG4xSOukaG",
      stability: 0.3,
      similarityBoost: 0.8,
      style: 0.3,
      useSpeakerBoost: true,
    },
    empathetic: {
      voiceId: "VR6AewLTigWG4xSOukaG",
      stability: 0.7,
      similarityBoost: 0.75,
      style: 0,
      useSpeakerBoost: true,
    },
    confident: {
      voiceId: "VR6AewLTigWG4xSOukaG",
      stability: 0.6,
      similarityBoost: 0.8,
      style: 0.2,
      useSpeakerBoost: true,
    },
  }

  private constructor() {}

  static getInstance(): ElevenLabsAgentService {
    if (!ElevenLabsAgentService.instance) {
      ElevenLabsAgentService.instance = new ElevenLabsAgentService()
    }
    return ElevenLabsAgentService.instance
  }

  async speak(options: SpeechOptions): Promise<boolean> {
    try {
      // Add to queue
      this.queue.push(options)

      // Process queue if not already processing
      if (!this.isProcessing) {
        await this.processQueue()
      }

      return true
    } catch (error) {
      console.error("[ElevenLabsAgent] Error queuing speech:", error)
      options.onError?.(error as Error)
      return false
    }
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return

    this.isProcessing = true

    while (this.queue.length > 0) {
      const options = this.queue.shift()
      if (options) {
        await this.speakNow(options)
      }
    }

    this.isProcessing = false
  }

  private async speakNow(options: SpeechOptions): Promise<void> {
    try {
      options.onStart?.()

      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: options.text,
          emotion: options.emotion || "neutral",
        }),
      })

      if (!response.ok) {
        throw new Error(`Speech API error: ${response.status}`)
      }

      const audioBlob = await response.blob()
      await this.playAudioBlob(audioBlob)

      options.onEnd?.()
    } catch (error) {
      console.error("[ElevenLabsAgent] Speech error, using fallback:", error)
      options.onError?.(error as Error)
      
      // Fallback to browser speech synthesis
      await this.fallbackSpeak(options.text)
      options.onEnd?.()
    }
  }

  private async playAudioBlob(blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const audioUrl = URL.createObjectURL(blob)
        const audio = new Audio(audioUrl)

        audio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          resolve()
        }

        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          reject(error)
        }

        this.currentAudio = audio
        audio.play()
      } catch (error) {
        reject(error)
      }
    })
  }

  private async fallbackSpeak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 0.8
        utterance.lang = "en-US"
        
        utterance.onend = () => resolve()
        utterance.onerror = () => resolve()
        
        speechSynthesis.speak(utterance)
      } else {
        resolve()
      }
    })
  }

  stop(): void {
    try {
      // Clear queue
      this.queue = []

      // Stop current audio
      if (this.currentAudio) {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
        this.currentAudio = null
      }

      // Stop browser speech synthesis
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
      }
    } catch (error) {
      console.error("[ElevenLabsAgent] Error stopping speech:", error)
    }
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused
  }

  clearQueue(): void {
    this.queue = []
  }

  getQueueLength(): number {
    return this.queue.length
  }
}

export const elevenLabsAgent = ElevenLabsAgentService.getInstance()
