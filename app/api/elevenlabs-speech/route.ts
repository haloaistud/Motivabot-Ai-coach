import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text, emotion = "neutral" } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const voiceId = getVoiceIdByEmotion(emotion)

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "",
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
          style: getStyleByEmotion(emotion),
          use_speaker_boost: true,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("ElevenLabs speech error:", error)
    return NextResponse.json({ error: "Speech synthesis failed" }, { status: 500 })
  }
}

function getVoiceIdByEmotion(emotion: string): string {
  const voiceMap: Record<string, string> = {
    enthusiastic: "pNInz6obpgDQGcFmaJgB", // Adam - energetic
    friendly: "EXAVITQu4vr4xnSDxMaL", // Bella - warm
    inspiring: "VR6AewLTigWG4xSOukaG", // Arnold - motivational
    empathetic: "oWAxZDx7w5VEj9dCyTzz", // Grace - compassionate
    confident: "pNInz6obpgDQGcFmaJgB", // Adam - strong
    default: "pNInz6obpgDQGcFmaJgB", // Adam - default
  }

  return voiceMap[emotion] || voiceMap.default
}

function getStyleByEmotion(emotion: string): number {
  const styleMap: Record<string, number> = {
    enthusiastic: 0.8,
    friendly: 0.6,
    inspiring: 0.9,
    empathetic: 0.4,
    confident: 0.7,
    default: 0.5,
  }

  return styleMap[emotion] || styleMap.default
}
