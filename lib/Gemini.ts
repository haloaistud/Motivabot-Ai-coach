import "server-only";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

export async function geminiGenerate(prompt: string) {
  const res = await fetch(
    `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      })
    }
  );

  if (!res.ok) throw new Error("Gemini API error");

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}
