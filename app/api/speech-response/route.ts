import { type NextRequest, NextResponse } from "next/server"
import { speechSchema } from "@/lib/speech-schema"

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Process the message through our speech schema
    const response = speechSchema.processMessage(message, userId)

    // Add CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Accept, Authorization",
    }

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error("Speech response error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "X-Requested-With, Content-Type, Accept, Authorization",
    },
  })
}
