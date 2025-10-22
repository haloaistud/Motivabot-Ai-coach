import { type NextRequest, NextResponse } from "next/server"

// Sample affirmations database (in production, this would be a real database)
const affirmationsDB = [
  {
    id: "1",
    text: "I am capable of achieving anything I set my mind to.",
    category: "confidence",
    author: "MotivaBOT",
    tags: ["self-belief", "achievement"],
    moodBoost: ["anxious", "sad"],
    difficulty: "beginner",
    popularity: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    text: "Every challenge I face is an opportunity to grow stronger.",
    category: "resilience",
    author: "MotivaBOT",
    tags: ["growth", "strength"],
    moodBoost: ["stressed", "anxious"],
    difficulty: "intermediate",
    popularity: 200,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    text: "I choose to focus on what I can control and let go of what I cannot.",
    category: "mindfulness",
    author: "MotivaBOT",
    tags: ["control", "peace"],
    moodBoost: ["stressed", "anxious"],
    difficulty: "advanced",
    popularity: 180,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    text: "I am grateful for all the opportunities that come my way.",
    category: "gratitude",
    author: "MotivaBOT",
    tags: ["thankfulness", "opportunities"],
    moodBoost: ["neutral", "happy"],
    difficulty: "beginner",
    popularity: 120,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    category: "motivation",
    author: "Winston Churchill",
    tags: ["persistence", "courage"],
    moodBoost: ["sad", "stressed"],
    difficulty: "intermediate",
    popularity: 300,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const mood = searchParams.get("mood")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const random = searchParams.get("random") === "true"

    let filteredAffirmations = [...affirmationsDB]

    // Filter by category
    if (category) {
      filteredAffirmations = filteredAffirmations.filter((affirmation) => affirmation.category === category)
    }

    // Filter by mood
    if (mood) {
      filteredAffirmations = filteredAffirmations.filter((affirmation) => affirmation.moodBoost.includes(mood as any))
    }

    // Randomize if requested
    if (random) {
      filteredAffirmations = filteredAffirmations.sort(() => Math.random() - 0.5)
    }

    // Apply limit
    const limitedAffirmations = filteredAffirmations.slice(0, limit)

    return NextResponse.json({
      affirmations: limitedAffirmations,
      total: filteredAffirmations.length,
      page: 1,
      hasMore: filteredAffirmations.length > limit,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch affirmations", code: "FETCH_ERROR" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, category, author, tags, moodBoost, difficulty } = body

    // Validate required fields
    if (!text || !category) {
      return NextResponse.json({ error: "Text and category are required", code: "VALIDATION_ERROR" }, { status: 400 })
    }

    // Create new affirmation
    const newAffirmation = {
      id: (affirmationsDB.length + 1).toString(),
      text,
      category,
      author: author || "Anonymous",
      tags: tags || [],
      moodBoost: moodBoost || ["neutral"],
      difficulty: difficulty || "beginner",
      popularity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    affirmationsDB.push(newAffirmation)

    return NextResponse.json(newAffirmation, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create affirmation", code: "CREATE_ERROR" }, { status: 500 })
  }
}
