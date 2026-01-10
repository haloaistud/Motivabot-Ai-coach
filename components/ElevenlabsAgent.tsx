"use client";

import Script from "next/script";

export default function ElevenLabsAgent() {
  return (
    <>
      <elevenlabs-convai agent-id="agent_0901k9c4ay4afym87m7p8beshsm5" />

      <Script
        src="https://unpkg.com/@elevenlabs/convai-widget-embed@beta"
        strategy="afterInteractive"
      />
    </>
  );
}
