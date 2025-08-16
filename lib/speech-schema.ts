// ========================================
// MOTIVABOT COMPREHENSIVE SPEECH SCHEMA
// TypeScript Implementation with Vercel Integration
// ========================================

interface ResponsePattern {
  text: string | (() => string)
  emotion: string
  followUp?: string
  confidenceBoost?: boolean
  energyLevel?: string
  tags?: string[]
}

interface PatternCategory {
  patterns: RegExp[]
  responses: ResponsePattern[]
  timeBasedVariations?: Record<string, string>
}

interface UserAnalysis {
  originalInput: string
  normalizedInput: string
  userId: string
  timestamp: string
  matchedPattern: any
  confidence: number
  emotion: string
  intent: string | null
  entities: string[]
  context: any
}

export class MotivaBotSpeechSchema {
  private version = "2.1.0"
  private lastUpdated = new Date().toISOString()
  private supportedLanguages = ["en-US", "en-GB", "es-ES", "fr-FR", "de-DE"]
  private defaultLanguage = "en-US"
  private responsePatterns: Record<string, any>
  private contextMemory = new Map()
  private userProfiles = new Map()

  constructor() {
    this.responsePatterns = this.initializeResponsePatterns()
  }

  private initializeResponsePatterns() {
    return {
      // === GREETINGS & INTRODUCTIONS ===
      greetings: {
        patterns: [
          /^(hi|hello|hey|greetings|good\s+(morning|afternoon|evening)|what'?s\s+up)/i,
          /^(howdy|yo|sup|hiya|salutations)/i,
        ],
        responses: [
          {
            text: "Hello there! I'm MotivaBOT, your personal AI motivation coach. I'm here to help you achieve your dreams and stay motivated on your journey to success!",
            emotion: "enthusiastic",
            followUp: "What brings you here today? Are you looking to set some goals or need a motivational boost?",
          },
          {
            text: "Hey! Great to meet you! I'm MotivaBOT - think of me as your digital cheerleader and goal-achievement partner rolled into one!",
            emotion: "friendly",
            followUp: "I'm excited to learn about your aspirations. What would you like to work on together?",
          },
          {
            text: "Greetings, future champion! I'm MotivaBOT, and I'm absolutely thrilled to be your motivation companion. Every great journey starts with a single step!",
            emotion: "inspiring",
            followUp: "Tell me, what's one goal you've been thinking about lately?",
          },
        ],
        timeBasedVariations: {
          morning:
            "Good morning! I'm MotivaBOT, and I love starting the day with positive energy! Ready to make today amazing?",
          afternoon: "Good afternoon! I'm MotivaBOT, your motivation partner. Hope your day is going great so far!",
          evening:
            "Good evening! I'm MotivaBOT. Whether you're winding down or gearing up for tomorrow, I'm here to help!",
        },
      },

      // === EMOTIONAL SUPPORT ===
      emotionalSupport: {
        sad: {
          patterns: [/i'?m\s+(sad|depressed|down|feeling\s+bad|upset)/i, /(having\s+a\s+)?(bad|rough|tough)\s+day/i],
          responses: [
            {
              text: "I hear you, and I want you to know that it's completely okay to feel this way. Difficult emotions are part of being human, and acknowledging them takes courage.",
              emotion: "empathetic",
              followUp:
                "Would you like to talk about what's been weighing on your heart? Sometimes sharing can lighten the load.",
            },
            {
              text: "I'm really glad you felt comfortable sharing this with me. Tough days happen to everyone, even the strongest people. You're not alone in this feeling.",
              emotion: "compassionate",
              followUp: "What's one small thing that usually brings you even a tiny bit of comfort?",
            },
          ],
        },
        excited: {
          patterns: [/i'?m\s+(excited|thrilled|pumped|amazing|fantastic)/i, /(great|awesome|incredible)\s+news/i],
          responses: [
            {
              text: "Your excitement is absolutely contagious! I love seeing this energy - it's the fuel that powers great achievements!",
              emotion: "celebratory",
              followUp: "I'm dying to know what's got you feeling so fantastic! Please share the good news!",
            },
            {
              text: "This is what I live for - seeing people filled with positive energy and enthusiasm! Your excitement tells me something amazing is happening.",
              emotion: "joyful",
              followUp: "Tell me everything! What's making you feel so incredible today?",
            },
          ],
        },
      },

      // === GOAL-RELATED RESPONSES ===
      goalDiscussion: {
        setting: {
          patterns: [
            /i\s+want\s+to\s+(achieve|accomplish|do|start)/i,
            /my\s+goal\s+is/i,
            /help\s+me\s+(set|create)\s+a\s+goal/i,
          ],
          responses: [
            {
              text: "I absolutely love your goal-setting energy! This is where transformation begins - with the decision to pursue something meaningful.",
              emotion: "supportive",
              followUp:
                "Let's make this goal SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Can you tell me more details about what you want to achieve?",
            },
          ],
        },
        struggling: {
          patterns: [/i'?m\s+struggling\s+with/i, /having\s+trouble/i, /can'?t\s+seem\s+to/i],
          responses: [
            {
              text: "First off, acknowledging that you're struggling shows incredible self-awareness and courage. Every successful person has faced moments exactly like this.",
              emotion: "understanding",
              followUp: "Let's break this down together. What specific part feels most challenging right now?",
            },
          ],
        },
      },

      // === DEFAULT FALLBACKS ===
      fallbacks: [
        {
          text: "That's really interesting! I love learning more about what matters to you. Every conversation helps me understand how to better support your journey.",
          emotion: "curious",
          followUp: "Can you tell me more about that? I'm genuinely interested in your perspective.",
        },
        {
          text: "I appreciate you sharing that with me! Whether we're talking about challenges or celebrations, I'm here to help you navigate your path to success.",
          emotion: "attentive",
          followUp: "How does this connect to your goals or what you're working on in your life?",
        },
      ],
    }
  }

  // --- CONTEXT ANALYSIS & PATTERN MATCHING ---
  analyzeUserInput(input: string, userId = "anonymous"): UserAnalysis {
    const analysis: UserAnalysis = {
      originalInput: input,
      normalizedInput: input.toLowerCase().trim(),
      userId: userId,
      timestamp: new Date().toISOString(),
      matchedPattern: null,
      confidence: 0,
      emotion: this.detectEmotion(input),
      intent: null,
      entities: this.extractEntities(input),
      context: this.getContext(userId),
    }

    // Find the best matching pattern
    let bestMatch = null
    let highestConfidence = 0

    for (const [category, data] of Object.entries(this.responsePatterns)) {
      if (category === "fallbacks") continue

      const patterns = data.patterns || []
      for (const pattern of patterns) {
        if (pattern.test(input)) {
          const confidence = this.calculateConfidence(input, pattern)
          if (confidence > highestConfidence) {
            highestConfidence = confidence
            bestMatch = { category, data, pattern }
          }
        }
      }

      // Check nested patterns (like emotional support)
      if (typeof data === "object" && !data.patterns) {
        for (const [subCategory, subData] of Object.entries(data)) {
          if (subData.patterns) {
            for (const pattern of subData.patterns) {
              if (pattern.test(input)) {
                const confidence = this.calculateConfidence(input, pattern)
                if (confidence > highestConfidence) {
                  highestConfidence = confidence
                  bestMatch = { category: `${category}.${subCategory}`, data: subData, pattern }
                }
              }
            }
          }
        }
      }
    }

    analysis.matchedPattern = bestMatch
    analysis.confidence = highestConfidence
    analysis.intent = bestMatch ? bestMatch.category : "unknown"

    return analysis
  }

  // --- RESPONSE GENERATION ---
  generateResponse(analysis: UserAnalysis) {
    let responseData

    if (analysis.matchedPattern && analysis.confidence > 0.5) {
      const responses = analysis.matchedPattern.data.responses
      responseData = responses[Math.floor(Math.random() * responses.length)]
    } else {
      // Use fallback responses
      responseData = this.responsePatterns.fallbacks[Math.floor(Math.random() * this.responsePatterns.fallbacks.length)]
    }

    // Process dynamic content
    let responseText = typeof responseData.text === "function" ? responseData.text() : responseData.text

    // Add time-based personalization
    responseText = this.addTimeBasedPersonalization(responseText, analysis)

    // Add user-specific personalization
    responseText = this.addUserPersonalization(responseText, analysis)

    return {
      text: responseText,
      emotion: responseData.emotion || "neutral",
      followUp: responseData.followUp || null,
      confidence: analysis.confidence,
      timestamp: new Date().toISOString(),
      category: analysis.intent,
      metadata: {
        userId: analysis.userId,
        originalInput: analysis.originalInput,
        processingTime: Date.now() - new Date(analysis.timestamp).getTime(),
      },
    }
  }

  // --- HELPER METHODS ---
  private detectEmotion(input: string): string {
    const emotionPatterns = {
      happy: /happy|joy|excited|great|awesome|amazing|fantastic/i,
      sad: /sad|depressed|down|upset|disappointed/i,
      angry: /angry|mad|frustrated|annoyed/i,
      anxious: /anxious|worried|nervous|stressed/i,
      confident: /confident|ready|determined|motivated/i,
    }

    for (const [emotion, pattern] of Object.entries(emotionPatterns)) {
      if (pattern.test(input)) {
        return emotion
      }
    }
    return "neutral"
  }

  private extractEntities(input: string): string[] {
    const entities = []
    const goalKeywords = /\b(goal|target|objective|aim|plan|dream|aspiration)\b/gi
    const timeKeywords = /\b(today|tomorrow|week|month|year|daily|weekly)\b/gi

    if (goalKeywords.test(input)) entities.push("goal")
    if (timeKeywords.test(input)) entities.push("time")

    return entities
  }

  private calculateConfidence(input: string, pattern: RegExp): number {
    const match = input.match(pattern)
    if (!match) return 0

    // Simple confidence calculation based on match length
    const matchLength = match[0].length
    const inputLength = input.length
    return Math.min(0.9, matchLength / inputLength + 0.3)
  }

  private getContext(userId: string): any {
    return this.contextMemory.get(userId) || {}
  }

  private addTimeBasedPersonalization(text: string, analysis: UserAnalysis): string {
    const hour = new Date().getHours()
    let timeOfDay = "day"

    if (hour < 12) timeOfDay = "morning"
    else if (hour < 17) timeOfDay = "afternoon"
    else timeOfDay = "evening"

    // Add time-based variations if available
    const pattern = analysis.matchedPattern
    if (pattern && pattern.data.timeBasedVariations && pattern.data.timeBasedVariations[timeOfDay]) {
      return pattern.data.timeBasedVariations[timeOfDay]
    }

    return text
  }

  private addUserPersonalization(text: string, analysis: UserAnalysis): string {
    const userProfile = this.userProfiles.get(analysis.userId)
    if (userProfile && userProfile.name) {
      text = text.replace(/\byou\b/gi, userProfile.name)
    }
    return text
  }

  // --- PUBLIC API METHODS ---
  public processMessage(input: string, userId?: string) {
    const analysis = this.analyzeUserInput(input, userId)
    const response = this.generateResponse(analysis)

    // Store context for future interactions
    this.contextMemory.set(analysis.userId, {
      lastMessage: input,
      lastResponse: response.text,
      timestamp: response.timestamp,
      emotion: analysis.emotion,
    })

    return response
  }

  public setUserProfile(userId: string, profile: any) {
    this.userProfiles.set(userId, profile)
  }

  public getUserProfile(userId: string) {
    return this.userProfiles.get(userId)
  }
}

// Export singleton instance
export const speechSchema = new MotivaBotSpeechSchema()
