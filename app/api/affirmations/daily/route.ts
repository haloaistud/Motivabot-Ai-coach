import { NextResponse } from "next/server"

const dailyAffirmations = [
  {
    id: "daily-1",
    text: "Today is a new beginning, full of endless possibilities and opportunities for growth.",
    category: "motivation",
    author: "MotivaBOT",
    tags: ["new-beginning", "possibilities"],
    moodBoost: ["neutral", "happy", "excited"],
    difficulty: "beginner",
    popularity: 500,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function GET() {
  try {
    const today = new Date().toDateString()
    const dailyAffirmation = dailyAffirmations[0] // In production, this would be date-based selection

    return NextResponse.json({
      affirmation: dailyAffirmation,
      date: today,
      specialMessage: "Remember: You have the power to make today amazing!",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch daily affirmation", code: "DAILY_ERROR" }, { status: 500 })
  }
}
