import { speechSchema } from "./speech-schema"

export interface AIMessage {
  id: string
  role: "user" | "assistant"
  content: string
  emotion?: string
  timestamp: string
}

export interface AIConversation {
  id: string
  messages: AIMessage[]
  context: Record<string, any>
  createdAt: string
  updatedAt: string
}

class AIAgentService {
  private static instance: AIAgentService
  private conversations: Map<string, AIConversation> = new Map()

  private constructor() {}

  static getInstance(): AIAgentService {
    if (!AIAgentService.instance) {
      AIAgentService.instance = new AIAgentService()
    }
    return AIAgentService.instance
  }

  async sendMessage(conversationId: string, userMessage: string, userId?: string): Promise<AIMessage | null> {
    try {
      // Get or create conversation
      let conversation = this.conversations.get(conversationId)
      
      if (!conversation) {
        conversation = {
          id: conversationId,
          messages: [],
          context: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        this.conversations.set(conversationId, conversation)
      }

      // Add user message
      const userMsg: AIMessage = {
        id: `msg_${Date.now()}_user`,
        role: "user",
        content: userMessage,
        timestamp: new Date().toISOString(),
      }
      conversation.messages.push(userMsg)

      // Process with speech schema
      const response = speechSchema.processMessage(userMessage, userId)

      // Create assistant message
      const assistantMsg: AIMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: "assistant",
        content: response.text,
        emotion: response.emotion,
        timestamp: new Date().toISOString(),
      }
      conversation.messages.push(assistantMsg)

      // Update conversation
      conversation.updatedAt = new Date().toISOString()
      conversation.context = {
        ...conversation.context,
        lastEmotion: response.emotion,
        messageCount: conversation.messages.length,
      }

      return assistantMsg
    } catch (error) {
      console.error("[AIAgent] Error sending message:", error)
      return null
    }
  }

  getConversation(conversationId: string): AIConversation | null {
    return this.conversations.get(conversationId) || null
  }

  clearConversation(conversationId: string): boolean {
    try {
      this.conversations.delete(conversationId)
      return true
    } catch (error) {
      console.error("[AIAgent] Error clearing conversation:", error)
      return false
    }
  }

  async generateMotivationalMessage(context: {
    mood?: string
    goals?: string[]
    recentActivity?: string
  }): Promise<string> {
    try {
      const prompts = {
        happy: "Keep riding this wave of positivity! Your energy is contagious and will fuel your success.",
        sad: "Even on tough days, remember that storms pass and growth happens in challenging times. You're stronger than you know.",
        anxious: "Take a deep breath. Break things down into small steps. You've overcome challenges before, and you will again.",
        neutral:
          "Every moment is an opportunity for growth. What small action can you take right now to move closer to your goals?",
      }

      const mood = context.mood || "neutral"
      return prompts[mood as keyof typeof prompts] || prompts.neutral
    } catch (error) {
      console.error("[AIAgent] Error generating motivational message:", error)
      return "You're doing great! Keep moving forward, one step at a time."
    }
  }
}

export const aiAgent = AIAgentService.getInstance()
