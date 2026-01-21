import "server-only"

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

export interface GeminiResponse {
  text: string
  error?: string
}

export interface GeminiGenerateOptions {
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
}

export async function geminiGenerate(prompt: string, options: GeminiGenerateOptions = {}): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    console.error("[Gemini] API key not configured")
    return {
      text: "",
      error: "Gemini API key not configured. Please add GEMINI_API_KEY to your environment variables.",
    }
  }

  try {
    const systemPrompt =
      options.systemPrompt ||
      `You are MotivaBOT, a compassionate and insightful AI motivation coach. 
Your role is to:
- Provide personalized motivation and encouragement
- Help users set and achieve meaningful goals
- Offer emotional support with empathy
- Share practical strategies for personal growth
- Celebrate successes and help learn from setbacks

Always respond with warmth, positivity, and actionable advice. Keep responses concise but impactful.`

    const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\n\nUser: ${prompt}` }],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.8,
          maxOutputTokens: options.maxTokens ?? 1024,
          topP: 0.95,
          topK: 40,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE",
          },
        ],
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      console.error("[Gemini] API error:", res.status, errorData)
      return {
        text: "",
        error: `Gemini API error: ${res.status} - ${errorData?.error?.message || "Unknown error"}`,
      }
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    if (!text) {
      return {
        text: "",
        error: "No response generated from Gemini",
      }
    }

    return { text }
  } catch (error) {
    console.error("[Gemini] Request failed:", error)
    return {
      text: "",
      error: error instanceof Error ? error.message : "Failed to connect to Gemini API",
    }
  }
}

// Generate motivational response based on context
export async function generateMotivation(
  userMessage: string,
  context?: {
    mood?: string
    goals?: string[]
    userName?: string
  },
): Promise<GeminiResponse> {
  const contextInfo = context
    ? `
Context:
- User's name: ${context.userName || "Friend"}
- Current mood: ${context.mood || "unknown"}
- Goals: ${context.goals?.join(", ") || "not specified"}
`
    : ""

  return geminiGenerate(`${contextInfo}\n${userMessage}`)
}
