"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import PersonalityTest, { type PersonalityData } from "@/components/personality-test"
import AffirmationsModule from "@/components/affirmations-module"
import AchievementsModule from "@/components/achievements-module"
import HabitTracker from "@/components/habit-tracker"
import DataExport from "@/components/data-export"
import PersonaProfile from "@/components/persona-profile"
import CommunityModule from "@/components/community-module"
import ChatModule from "@/components/chat-module"
import GoalsModule from "@/components/goals-module"
import MoodLogger from "@/components/mood-logger"
import HoroscopeModule from "@/components/horoscope-module"
import QuoteModule from "@/components/quote-module"
import { elevenLabsService } from "@/lib/elevenlabs"
import { dataStore } from "@/lib/data-store"
import { Brain, MessageCircle, Target, Heart, Star, Users, Gauge, Bot as Robot, Plus, Volume2, File as Fire, Trophy, Smile, Sparkles, Check, Download, Moon, Sun } from 'lucide-react'

const motivationalQuotes = [
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "Do what you can, with what you have, where you are. - Theodore Roosevelt",
  "It always seems impossible until it's done. - Nelson Mandela",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
  "The best way to predict the future is to create it. - Peter Drucker",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
  "Do not wait to strike till the iron is hot; but make it hot by striking. - William Butler Yeats",
  "Whether you think you can or you think you can't, you're right. - Henry Ford",
]

export default function MotivaBOT() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentPattern, setCurrentPattern] = useState("geometric")
  const [userName, setUserName] = useState("")
  const [personalityData, setPersonalityData] = useState<PersonalityData | null>(null)
  const [isPersonalityComplete, setIsPersonalityComplete] = useState(false)
  const [currentQuote, setCurrentQuote] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasAutoSpoken, setHasAutoSpoken] = useState(false)
  const [habits, setHabits] = useState<string[]>([])
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set())
  const [goals, setGoals] = useState<any[]>([])
  const [moodEntries, setMoodEntries] = useState<any[]>([])
  const [streak, setStreak] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    setTheme(initialTheme)
    setIsDarkMode(initialTheme === 'dark')
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')

    // Use localStorage directly for personality data
    const savedPersonalityData = localStorage.getItem('personalityData')
    if (savedPersonalityData) {
      const parsedData = JSON.parse(savedPersonalityData)
      setPersonalityData(parsedData)
      setUserName(parsedData.name)
      setIsPersonalityComplete(true)
    }
  }, [])

  useEffect(() => {
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])

    document.body.setAttribute("data-theme", theme === 'dark' ? "dark" : "light")
    document.body.className = `pattern-${currentPattern} ${theme === 'dark' ? 'dark-mode' : 'light-mode'}`

    createParticles(10)

    if (isPersonalityComplete && userName && !hasAutoSpoken) {
      const welcomeMessage = `Welcome ${userName}! I'm MotivaBOT, your personal AI motivation coach. Let's achieve greatness together!`
      setTimeout(async () => {
        await speakText(welcomeMessage)
        setHasAutoSpoken(true)
      }, 1000)
    }
  }, [theme, currentPattern, isPersonalityComplete, userName, hasAutoSpoken])

  useEffect(() => {
    // Load habits from localStorage
    const savedHabits = localStorage.getItem('habits')
    const loadedHabits = savedHabits ? JSON.parse(savedHabits) : []
    setHabits(loadedHabits)
    
    // Load goals, mood, and streak from DataStore
    const loadedGoals = dataStore.getGoals()
    const loadedMood = dataStore.getMoodHistory()
    const loadedStreak = dataStore.getStreak()
    
    setGoals(loadedGoals)
    setMoodEntries(loadedMood)
    setStreak(loadedStreak)
  }, [])

  const createParticles = (count: number) => {
    const particlesContainer = document.getElementById("particles")
    if (!particlesContainer) return

    particlesContainer.innerHTML = ""
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"
      const size = Math.random() * 5 + 3
      particle.style.width = `${size}px`
      particle.style.height = `${size}px`
      particle.style.left = `${Math.random() * 100}vw`
      particle.style.animationDelay = `${Math.random() * 8}s`
      particle.style.animationDuration = `${5 + Math.random() * 10}s`
      particlesContainer.appendChild(particle)
    }
  }

  const speakText = async (text: string) => {
    if (isSpeaking) return

    setIsSpeaking(true)
    try {
      await elevenLabsService.speak(text)
    } catch (error) {
      console.error("Speech synthesis error:", error)
    } finally {
      setIsSpeaking(false)
    }
  }

  const handlePersonalityComplete = (data: PersonalityData) => {
    setPersonalityData(data)
    setUserName(data.name)
    setIsPersonalityComplete(true)
    // Use localStorage for personality data
    localStorage.setItem('personalityData', JSON.stringify(data))

    const completionMessage = `Great job completing your personality assessment, ${data.name}! Now I can provide you with personalized motivation based on your goals and preferences.`
    setTimeout(async () => {
      await speakText(completionMessage)
    }, 500)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    setIsDarkMode(newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  const changePattern = (pattern: string) => {
    setCurrentPattern(pattern)
  }

  const speakCurrentQuote = async () => {
    await speakText(currentQuote)
  }

  const getNewQuote = async () => {
    const newQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
    setCurrentQuote(newQuote)
    await speakText(`Here's a new motivation for you: ${newQuote}`)
  }

  const handleToggleHabit = (habit: string) => {
    setCompletedHabits((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(habit)) {
        newSet.delete(habit)
      } else {
        newSet.add(habit)
      }
      return newSet
    })
  }

  const handleAddHabit = (habit: string) => {
    const newHabits = [...habits, habit]
    setHabits(newHabits)
    // Use localStorage for habits
    localStorage.setItem('habits', JSON.stringify(newHabits))
  }

  const handleRemoveHabit = (habit: string) => {
    const newHabits = habits.filter((h) => h !== habit)
    setHabits(newHabits)
    // Use localStorage for habits
    localStorage.setItem('habits', JSON.stringify(newHabits))
  }

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Gauge,
      description:
        "Your motivation hub with daily insights, progress tracking, and quick actions to boost your productivity",
    },
    {
      id: "personality",
      label: "Personality",
      icon: Brain,
      description:
        "Discover your unique personality traits and get personalized motivation strategies tailored just for you",
    },
    {
      id: "affirmations",
      label: "Daily Affirmations",
      icon: Sparkles,
      description: "Discover powerful positive affirmations, build daily habits, and track your motivation streak",
    },
    {
      id: "chat",
      label: "AI Coach Chat",
      icon: MessageCircle,
      description:
        "Have meaningful conversations with your AI motivation coach for guidance, support, and encouragement",
    },
    {
      id: "goals",
      label: "Goal Tracker",
      icon: Target,
      description: "Set SMART goals, break them into actionable steps, and track your progress with visual analytics",
    },
    {
      id: "mood",
      label: "Mood & Wellness",
      icon: Heart,
      description: "Monitor your emotional well-being, track mood patterns, and build healthy mental habits",
    },
    {
      id: "horoscope",
      label: "Daily Horoscope",
      icon: Star,
      description: "Get personalized cosmic insights and astrological motivation based on your zodiac sign",
    },
    {
      id: "friends",
      label: "Community",
      icon: Users,
      description: "Connect with like-minded individuals, share achievements, and find accountability partners",
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: Trophy,
      description: "Track your progress milestones and unlock achievement badges",
    },
    {
      id: "habits",
      label: "Habit Tracker",
      icon: Check,
      description: "Build and track your daily habits for consistent growth",
    },
    {
      id: "export",
      label: "Data Export",
      icon: Download,
      description: "Download and backup your motivation journey data",
    },
  ]

  if (!isPersonalityComplete) {
    return <PersonalityTest onComplete={handlePersonalityComplete} />
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-background text-foreground' : 'bg-gradient-to-br from-amber-50 to-orange-50 text-gray-900'}`}>
      <div className="particles" id="particles"></div>

      <div className="app-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="main-header flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-6 border-b-2">
          <div className="logo-section flex flex-col sm:flex-row items-center gap-4">
            <div className="logo flex items-center gap-2">
              <span className="text-3xl">🤖</span>
              <span className="text-2xl font-bold">MotivaBOT</span>
            </div>
            <div className="tagline text-center sm:text-left">Your Personal AI Motivation Coach</div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full transition-all duration-300 hover:scale-110"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
            <div className="user-profile flex items-center gap-3 p-2 rounded-lg bg-primary/10">
              <div className="profile-pic w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-xl">
                👤
              </div>
              <div className="profile-info hidden sm:block">
                <div className="username font-semibold">Welcome, {userName}!</div>
                <div className="personality-type text-sm opacity-80">Ready to achieve greatness</div>
              </div>
            </div>
          </div>
        </header>

        <h1 className="app-title text-4xl md:text-5xl font-bold text-center mb-4">
          Achieve Your Goals with MotivaBOT
        </h1>
        <p className="app-subtitle text-center text-lg mb-8 opacity-80">
          Your personalized AI companion for growth and inspiration.
        </p>

        <div className="theme-controls flex justify-center gap-3 mb-6">
          <button
            className="pattern-btn w-12 h-12 rounded-full border-2 transition-all hover:scale-110"
            onClick={() => changePattern("geometric")}
            style={{ background: "linear-gradient(45deg, #FFD700, #DAA520)" }}
            title="Geometric Pattern"
          />
          <button
            className="pattern-btn w-12 h-12 rounded-full border-2 transition-all hover:scale-110"
            onClick={() => changePattern("organic")}
            style={{ background: "linear-gradient(45deg, #667eea, #764ba2)" }}
            title="Organic Pattern"
          />
          <button
            className="pattern-btn w-12 h-12 rounded-full border-2 transition-all hover:scale-110"
            onClick={() => changePattern("waves")}
            style={{ background: "linear-gradient(45deg, #33ccff, #3366ff)" }}
            title="Wave Pattern"
          />
        </div>

        <nav className="tab-navigation grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 mb-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.description}
              >
                <Icon className="w-7 h-7 mb-2" />
                <span className="font-semibold text-sm">{tab.label}</span>
                <span className="text-xs opacity-75 mt-1 line-clamp-2">
                  {tab.description.split(",")[0]}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="space-y-6 pb-8">
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              <div
                className="card lg:col-span-2 p-6"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "white" }}
              >
                <h2 className="text-2xl font-bold mb-4" style={{ color: "white" }}>Welcome Back, {userName}!</h2>
                <div className="mb-6">
                  <div className="text-xl italic mb-4">
                    <span className="text-3xl">💭</span>
                    <p className="mt-2">"{currentQuote}"</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={speakCurrentQuote}
                    disabled={isSpeaking}
                    className="bg-white/20 hover:bg-white/30 border border-white/30"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {isSpeaking ? "Speaking..." : "Speak This"}
                  </Button>
                  <Button
                    onClick={getNewQuote}
                    disabled={isSpeaking}
                    className="bg-white/20 hover:bg-white/30 border border-white/30"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Quote
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="card p-6 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-primary">{streak}</div>
                    <div className="text-sm opacity-80">Day Streak</div>
                  </div>
                  <Fire className="w-10 h-10 text-orange-500" />
                </div>

                <div className="card p-6 flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-primary">{goals.length}</div>
                    <div className="text-sm opacity-80">Total Goals</div>
                  </div>
                  <Trophy className="w-10 h-10 text-yellow-500" />
                </div>

                <div className="card p-6 flex items-center justify-between">
                  <div>
                    <div className="text-3xl">😊</div>
                    <div className="text-sm opacity-80">Average Mood</div>
                  </div>
                  <Smile className="w-10 h-10 text-green-500" />
                </div>
              </div>

              <div className="card lg:col-span-3 p-6">
                <h3 className="text-xl font-bold text-primary mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button
                    onClick={() => setActiveTab("chat")}
                    className="justify-start h-auto py-4"
                  >
                    <Robot className="w-5 h-5 mr-2" />
                    Chat with MotivaBOT
                  </Button>
                  <Button
                    onClick={() => setActiveTab("affirmations")}
                    className="justify-start h-auto py-4"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Daily Affirmations
                  </Button>
                  <Button
                    onClick={() => setActiveTab("goals")}
                    className="justify-start h-auto py-4"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New Goal
                  </Button>
                  <Button
                    onClick={() => setActiveTab("mood")}
                    className="justify-start h-auto py-4"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Log Mood
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "affirmations" && <AffirmationsModule />}
          {activeTab === "achievements" && (
            <AchievementsModule goals={goals} moodEntries={moodEntries} streak={streak} />
          )}
          {activeTab === "habits" && (
            <HabitTracker
              habits={habits}
              completedHabits={completedHabits}
              onToggle={handleToggleHabit}
              onAdd={handleAddHabit}
              onRemove={handleRemoveHabit}
            />
          )}
          {activeTab === "export" && (
            <DataExport userData={personalityData} goals={goals} moodEntries={moodEntries} streak={streak} />
          )}
          {activeTab === "personality" && (
            <PersonaProfile
              personalityData={personalityData}
              goals={goals}
              moodEntries={moodEntries}
              streak={streak}
            />
          )}
          {activeTab === "chat" && <ChatModule />}
          {activeTab === "goals" && <GoalsModule />}
          {activeTab === "mood" && <MoodLogger />}
          {activeTab === "horoscope" && <HoroscopeModule />}
          {activeTab === "friends" && <CommunityModule />}
        </div>
      </div>
    </div>
  )
}
