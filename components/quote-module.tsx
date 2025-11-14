"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2, RefreshCw, Heart, Share2, BookOpen, Sparkles } from "lucide-react"

interface Quote {
  text: string
  author: string
  category: string
  id: string
}

interface QuoteModuleProps {
  onQuoteSpeak?: (text: string) => void
}

const FAMOUS_QUOTES: Quote[] = [
  { id: "1", text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "success" },
  {
    id: "2",
    text: "Innovation distinguishes between a leader and a follower.",
    author: "Steve Jobs",
    category: "innovation",
  },
  {
    id: "3",
    text: "Life is what happens to you while you're busy making other plans.",
    author: "John Lennon",
    category: "life",
  },
  {
    id: "4",
    text: "The future belongs to those who believe in the beauty of their dreams.",
    author: "Eleanor Roosevelt",
    category: "dreams",
  },
  {
    id: "5",
    text: "It is during our darkest moments that we must focus to see the light.",
    author: "Aristotle",
    category: "perseverance",
  },
  {
    id: "6",
    text: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    category: "action",
  },
  { id: "7", text: "Don't let yesterday take up too much of today.", author: "Will Rogers", category: "mindfulness" },
  {
    id: "8",
    text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
    author: "Unknown",
    category: "resilience",
  },
  {
    id: "9",
    text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
    author: "Steve Jobs",
    category: "passion",
  },
  {
    id: "10",
    text: "People who are crazy enough to think they can change the world, are the ones who do.",
    author: "Rob Siltanen",
    category: "change",
  },
  { id: "11", text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "confidence" },
  {
    id: "12",
    text: "The only impossible journey is the one you never begin.",
    author: "Tony Robbins",
    category: "beginning",
  },
  {
    id: "13",
    text: "In the middle of difficulty lies opportunity.",
    author: "Albert Einstein",
    category: "opportunity",
  },
  {
    id: "14",
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
    category: "courage",
  },
  {
    id: "15",
    text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
    author: "Nelson Mandela",
    category: "resilience",
  },
]

const QUOTE_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "success", label: "Success" },
  { value: "innovation", label: "Innovation" },
  { value: "life", label: "Life Wisdom" },
  { value: "dreams", label: "Dreams" },
  { value: "perseverance", label: "Perseverance" },
  { value: "action", label: "Taking Action" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "resilience", label: "Resilience" },
  { value: "passion", label: "Passion" },
  { value: "change", label: "Change" },
  { value: "confidence", label: "Confidence" },
  { value: "beginning", label: "New Beginnings" },
  { value: "opportunity", label: "Opportunity" },
  { value: "courage", label: "Courage" },
]

export default function QuoteModule({ onQuoteSpeak }: QuoteModuleProps) {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [lastQuoteIndex, setLastQuoteIndex] = useState(-1)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem("motivabot-favorite-quotes")
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("motivabot-favorite-quotes", JSON.stringify(favorites))
  }, [favorites])

  // Get filtered quotes based on category
  const getFilteredQuotes = useCallback(() => {
    if (selectedCategory === "all") {
      return FAMOUS_QUOTES
    }
    return FAMOUS_QUOTES.filter((quote) => quote.category === selectedCategory)
  }, [selectedCategory])

  // Load initial quote only once
  useEffect(() => {
    if (!isInitialized) {
      const filteredQuotes =
        selectedCategory === "all"
          ? FAMOUS_QUOTES
          : FAMOUS_QUOTES.filter((quote) => quote.category === selectedCategory)
      if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length)
        setCurrentQuote(filteredQuotes[randomIndex])
        setLastQuoteIndex(randomIndex)
      }
      setIsInitialized(true)
    }
  }, [selectedCategory, isInitialized])

  // Get a random quote (avoiding repetition)
  const getRandomQuote = useCallback(() => {
    const filteredQuotes = getFilteredQuotes()
    if (filteredQuotes.length === 0) return null

    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * filteredQuotes.length)
    } while (randomIndex === lastQuoteIndex && filteredQuotes.length > 1)

    setLastQuoteIndex(randomIndex)
    return filteredQuotes[randomIndex]
  }, [getFilteredQuotes, lastQuoteIndex])

  useEffect(() => {
    if (isInitialized) {
      setIsInitialized(false)
    }
  }, [selectedCategory])

  // Generate new quote
  const generateNewQuote = async () => {
    setIsLoading(true)

    // Simulate API call delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newQuote = getRandomQuote()
    if (newQuote) {
      setCurrentQuote(newQuote)
    }

    setIsLoading(false)
  }

  // Speech synthesis with optimization
  const speakQuote = useCallback(() => {
    if (!currentQuote) return

    // Cancel any ongoing speech
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel()
    }

    const fullText = `${currentQuote.text} - ${currentQuote.author}`

    // Use parent component's speak function if available
    if (onQuoteSpeak) {
      onQuoteSpeak(fullText)
      return
    }

    // Fallback to built-in speech synthesis
    if ("speechSynthesis" in window) {
      setIsSpeaking(true)

      const utterance = new SpeechSynthesisUtterance(fullText)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8

      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      window.speechSynthesis.speak(utterance)
    }
  }, [currentQuote, onQuoteSpeak])

  // Toggle favorite
  const toggleFavorite = () => {
    if (!currentQuote) return

    setFavorites((prev) => {
      if (prev.includes(currentQuote.id)) {
        return prev.filter((id) => id !== currentQuote.id)
      } else {
        return [...prev, currentQuote.id]
      }
    })
  }

  // Share quote
  const shareQuote = async () => {
    if (!currentQuote) return

    const shareText = `"${currentQuote.text}" - ${currentQuote.author}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Inspirational Quote",
          text: shareText,
        })
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard(shareText)
      }
    } else {
      copyToClipboard(shareText)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // You could show a toast notification here
      console.log("Quote copied to clipboard!")
    })
  }

  if (!currentQuote) {
    return (
      <Card className="quote-module">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Loading inspiration...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="quote-module bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <BookOpen className="w-5 h-5" />
          Daily Inspiration
        </CardTitle>

        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {QUOTE_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Quote Display */}
        <div className="quote-display relative p-6 bg-card/50 rounded-lg border border-primary/10">
          <div className="absolute top-2 left-4 text-6xl text-primary/20 font-serif leading-none">"</div>
          <div className="relative z-10">
            <blockquote className="text-lg md:text-xl font-medium leading-relaxed text-foreground mb-4 pl-8">
              {currentQuote.text}
            </blockquote>
            <cite className="text-primary font-semibold text-right block">— {currentQuote.author}</cite>
          </div>
          <div className="absolute bottom-2 right-4 text-6xl text-primary/20 font-serif leading-none rotate-180">"</div>
        </div>

        {/* Quote Category Badge */}
        <div className="flex justify-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            {QUOTE_CATEGORIES.find((cat) => cat.value === currentQuote.category)?.label || currentQuote.category}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button onClick={generateNewQuote} disabled={isLoading} className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            New Quote
          </Button>

          <Button
            variant="outline"
            onClick={speakQuote}
            disabled={isSpeaking}
            className="flex items-center gap-2 bg-transparent"
          >
            <Volume2 className={`w-4 h-4 ${isSpeaking ? "animate-pulse" : ""}`} />
            {isSpeaking ? "Speaking..." : "Listen"}
          </Button>

          <Button
            variant="outline"
            onClick={toggleFavorite}
            className={`flex items-center gap-2 ${
              favorites.includes(currentQuote.id) ? "text-red-500 border-red-200" : ""
            }`}
          >
            <Heart className={`w-4 h-4 ${favorites.includes(currentQuote.id) ? "fill-current" : ""}`} />
            {favorites.includes(currentQuote.id) ? "Favorited" : "Favorite"}
          </Button>

          <Button variant="outline" onClick={shareQuote} className="flex items-center gap-2 bg-transparent">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        {/* Favorites Counter */}
        {favorites.length > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            You have {favorites.length} favorite quote{favorites.length !== 1 ? "s" : ""}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
