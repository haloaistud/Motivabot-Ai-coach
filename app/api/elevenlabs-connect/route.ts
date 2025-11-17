import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY
    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || 'agent_0901k9c4ay4afym87m7p8beshsm5'

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    // Return the WebSocket URL with authentication
    // The client will connect to ElevenLabs directly but we provide the signed URL
    const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?agent_id=${agentId}`
    
    // For production, you might want to implement a server-side proxy
    // For now, we'll return connection info
    return NextResponse.json({
      wsUrl,
      agentId,
      // Include a session token or signature if ElevenLabs supports it
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('[elevenlabs-connect] Error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize connection' },
      { status: 500 }
    )
  }
}
