import { type NextRequest, NextResponse } from "next/server"
import { geminiGenerate } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, systemPrompt, temperature, maxTokens } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Invalid request: prompt is required" }, { status: 400 })
    }

    const response = await geminiGenerate(prompt, {
      systemPrompt,
      temperature,
      maxTokens,
    })

    if (response.error) {
      return NextResponse.json({ error: response.error }, { status: 500 })
    }

    return NextResponse.json({ text: response.text })
  } catch (error) {
    console.error("[API/Gemini] Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
