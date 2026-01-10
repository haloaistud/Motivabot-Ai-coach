"use client"

import type React from "react"

import Script from "next/script"
import { useState, useEffect } from "react"

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "elevenlabs-convai": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { "agent-id": string },
        HTMLElement
      >
    }
  }
}

interface ElevenLabsAgentProps {
  agentId?: string
  className?: string
}

export default function ElevenLabsAgent({
  agentId = "agent_0901k9c4ay4afym87m7p8beshsm5",
  className = "",
}: ElevenLabsAgentProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Check if the widget is already loaded
    const checkLoaded = () => {
      if (typeof window !== "undefined" && (window as any).ElevenLabsConvai) {
        setIsLoaded(true)
      }
    }

    const timeout = setTimeout(() => {
      if (!isLoaded) {
        checkLoaded()
      }
    }, 3000)

    return () => clearTimeout(timeout)
  }, [isLoaded])

  return (
    <div className={`elevenlabs-agent-container ${className}`}>
      <elevenlabs-convai agent-id={agentId} />

      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed"
        strategy="afterInteractive"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />

      {hasError && (
        <div className="text-sm text-red-500 mt-2">Failed to load voice assistant. Please refresh the page.</div>
      )}
    </div>
  )
}
