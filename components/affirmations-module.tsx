"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Shuffle, Volume2, Star, TrendingUp } from "lucide-react"

interface Affirmation {
  id: string
  text: string
  category: string
  author?: string
  tags: string[]
  moodBoost: string[]
  difficulty: string
  popularity: number
  createdAt: string
  updatedAt: string
}

interface AffirmationsResponse {
  affirmations: Affirmation[]
  total: number
  page: number
  hasMore: boolean
}

interface DailyAffirmationResponse {
  affirmation: Affirmation
  date: string
  specialMessage: string
}

export default function AffirmationsModule() {
  const [affirmations, setAffirmations] = useState<Affirmation[]>([])
  const [dailyAffirmation, setDailyAffirmation] = useState<DailyAffirmationResponse | null>(null)
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation | null>(null)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [selectedMood, setSelectedMood] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [streak, setStreak] = useState(7) // Mock streak data

  const categories = ["confidence", "motivation", "self-love", "success", "mindfulness", "gratitude", "resilience"]
  const moods = ["anxious", "sad", "stressed", "neutral", "happy", "excited"]

  useEffect(() => {
    fetchDailyAffirmation()
    fetchAffirmations()
  }, [])

  useEffect(() => {
    fetchAffirmations()
  }, [selectedCategory, selectedMood])

  const fetchAffirmations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append("category", selectedCategory)
      if (selectedMood) params.append("mood", selectedMood)
      params.append("limit", "10")
      params.append("random", "true")

      const response = await fetch(`/api/affirmations?${params}`)
      const data: AffirmationsResponse = await response.json()
      setAffirmations(data.affirmations)

      if (data.affirmations.length > 0 && !currentAffirmation) {
        setCurrentAffirmation(data.affirmations[0])
      }
    } catch (error) {
      console.error("Failed to fetch affirmations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDailyAffirmation = async () => {
    try {
      const response = await fetch("/api/affirmations/daily")
      const data: DailyAffirmationResponse = await response.json()
      setDailyAffirmation(data)
    } catch (error) {
      console.error("Failed to fetch daily affirmation:", error)
    }
  }

  const getRandomAffirmation = () => {
    if (affirmations.length > 0) {
      const randomIndex = Math.floor(Math.random() * affirmations.length)
      setCurrentAffirmation(affirmations[randomIndex])
    }
  }

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(id)) {
      newFavorites.delete(id)
    } else {
      newFavorites.add(id)
    }
    setFavorites(newFavorites)
  }

  const speakAffirmation = async (text: string) => {
    try {
      const response = await fetch("/api/elevenlabs-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, emotion: "inspiring" }),
      })

      if (response.ok) {
        const audioBlob = await response.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        const audio = new Audio(audioUrl)
        await audio.play()
      } else {
        // Fallback to browser speech synthesis
        const data = await response.json()
        if (data.fallback) {
          console.log("[v0] Using browser speech synthesis fallback")
          // Fallback to browser speech synthesis
          if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel()
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.rate = 0.9
            utterance.pitch = 1.1
            utterance.volume = 0.9
            utterance.lang = "en-US"

            // Try to use a more pleasant voice if available
            const voices = window.speechSynthesis.getVoices()
            const preferredVoice = voices.find(
              (voice) => voice.name.includes("Google") || voice.name.includes("Microsoft") || voice.lang === "en-US",
            )
            if (preferredVoice) {
              utterance.voice = preferredVoice
            }

            window.speechSynthesis.speak(utterance)
          }
        }
      }
    } catch (error) {
      console.error("Failed to speak affirmation:", error)
      // Fallback to browser speech synthesis on error
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.9
        utterance.pitch = 1.1
        utterance.volume = 0.9
        utterance.lang = "en-US"

        // Try to use a more pleasant voice if available
        const voices = window.speechSynthesis.getVoices()
        const preferredVoice = voices.find(
          (voice) => voice.name.includes("Google") || voice.name.includes("Microsoft") || voice.lang === "en-US",
        )
        if (preferredVoice) {
          utterance.voice = preferredVoice
        }

        window.speechSynthesis.speak(utterance)
      }
    }
  }

  return (
    <div className="affirmations-module space-y-6">
      {/* Daily Affirmation */}
      {dailyAffirmation && (
        <Card className="daily-affirmation-card border-2 border-golden-primary bg-gradient-to-br from-golden-light/10 to-golden-primary/5">
          <CardHeader className="text-center">
            <CardTitle className="text-golden-primary flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              Daily Affirmation
              <Star className="w-5 h-5" />
            </CardTitle>
            <p className="text-sm text-golden-dark">{dailyAffirmation.date}</p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <blockquote className="text-lg font-medium text-golden-primary italic">
              "{dailyAffirmation.affirmation.text}"
            </blockquote>
            {dailyAffirmation.affirmation.author && (
              <p className="text-sm text-golden-dark">— {dailyAffirmation.affirmation.author}</p>
            )}
            <p className="text-golden-accent font-medium">{dailyAffirmation.specialMessage}</p>
            <div className="flex justify-center gap-2">
              <Button
                onClick={() => speakAffirmation(dailyAffirmation.affirmation.text)}
                className="bg-golden-primary hover:bg-golden-dark text-black"
                size="sm"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Listen
              </Button>
              <Button
                onClick={() => toggleFavorite(dailyAffirmation.affirmation.id)}
                variant="outline"
                size="sm"
                className="border-golden-primary text-golden-primary hover:bg-golden-primary hover:text-black"
              >
                <Heart className={`w-4 h-4 ${favorites.has(dailyAffirmation.affirmation.id) ? "fill-current" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Streak Counter */}
      <Card className="streak-card bg-gradient-to-r from-golden-primary/10 to-golden-accent/10">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-golden-primary" />
            <div>
              <p className="font-semibold text-golden-primary">Current Streak</p>
              <p className="text-sm text-golden-dark">Keep up the great work!</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-golden-primary">{streak}</p>
            <p className="text-sm text-golden-dark">days</p>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-golden-primary">Find Your Perfect Affirmation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-golden-dark mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-golden-primary rounded-md bg-background text-golden-primary focus:ring-2 focus:ring-golden-primary"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-golden-dark mb-2">Current Mood</label>
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="w-full p-2 border border-golden-primary rounded-md bg-background text-golden-primary focus:ring-2 focus:ring-golden-primary"
              >
                <option value="">Any Mood</option>
                {moods.map((mood) => (
                  <option key={mood} value={mood}>
                    {mood.charAt(0).toUpperCase() + mood.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Affirmation Display */}
      {currentAffirmation && (
        <Card className="current-affirmation-card border-golden-primary">
          <CardContent className="p-6 text-center space-y-4">
            <blockquote className="text-xl font-medium text-golden-primary italic leading-relaxed">
              "{currentAffirmation.text}"
            </blockquote>
            {currentAffirmation.author && <p className="text-golden-dark">— {currentAffirmation.author}</p>}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge className="bg-golden-primary text-black">{currentAffirmation.category}</Badge>
              <Badge variant="outline" className="border-golden-primary text-golden-primary">
                {currentAffirmation.difficulty}
              </Badge>
              {currentAffirmation.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-golden-light text-golden-dark">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex justify-center gap-3">
              <Button
                onClick={getRandomAffirmation}
                className="bg-golden-primary hover:bg-golden-dark text-black"
                disabled={loading}
              >
                <Shuffle className="w-4 h-4 mr-2" />
                New Affirmation
              </Button>
              <Button
                onClick={() => speakAffirmation(currentAffirmation.text)}
                variant="outline"
                className="border-golden-primary text-golden-primary hover:bg-golden-primary hover:text-black"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Listen
              </Button>
              <Button
                onClick={() => toggleFavorite(currentAffirmation.id)}
                variant="outline"
                className="border-golden-primary text-golden-primary hover:bg-golden-primary hover:text-black"
              >
                <Heart className={`w-4 h-4 ${favorites.has(currentAffirmation.id) ? "fill-current" : ""}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Affirmations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {affirmations.slice(1).map((affirmation) => (
          <Card key={affirmation.id} className="affirmation-card hover:border-golden-primary transition-colors">
            <CardContent className="p-4">
              <blockquote className="text-golden-primary italic mb-3 leading-relaxed">"{affirmation.text}"</blockquote>
              {affirmation.author && <p className="text-sm text-golden-dark mb-2">— {affirmation.author}</p>}
              <div className="flex flex-wrap gap-1 mb-3">
                <Badge className="bg-golden-primary text-black text-xs">{affirmation.category}</Badge>
                {affirmation.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="bg-golden-light text-golden-dark text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentAffirmation(affirmation)}
                    size="sm"
                    className="bg-golden-primary hover:bg-golden-dark text-black"
                  >
                    View
                  </Button>
                  <Button
                    onClick={() => speakAffirmation(affirmation.text)}
                    size="sm"
                    variant="outline"
                    className="border-golden-primary text-golden-primary hover:bg-golden-primary hover:text-black"
                  >
                    <Volume2 className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  onClick={() => toggleFavorite(affirmation.id)}
                  size="sm"
                  variant="ghost"
                  className="text-golden-primary hover:bg-golden-primary hover:text-black"
                >
                  <Heart className={`w-4 h-4 ${favorites.has(affirmation.id) ? "fill-current" : ""}`} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
