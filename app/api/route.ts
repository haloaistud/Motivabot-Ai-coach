import { geminiGenerate } from "@/lib/gemini";

export const runtime = "edge";

export async function POST(req: Request) {
  const { message } = await req.json();

  const reply = await geminiGenerate(message);

  return Response.json({ reply });
}
