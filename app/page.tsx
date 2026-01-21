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
import SidebarNav from "@/components/sidebar-nav"
import QuickAddButton from "@/components/quick-add-button"
import DashboardContent from "@/components/dashboard-content"
import VoiceConversation from "@/components/voice-conversation"
import { elevenLabsService } from "@/lib/elevenlabs"
import { dataStore } from "@/lib/data-store"
import {
  Brain,
  MessageCircle,
  Target,
  Heart,
  Star,
  Users,
  LayoutDashboard,
  Check,
  Trophy,
  Download,
  Sparkles,
  Moon,
  Sun,
  Menu,
  Phone,
} from "lucide-react"

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
  const [userName, setUserName] = useState("")
  const [personalityData, setPersonalityData] = useState<PersonalityData | null>(null)
  const [isPersonalityComplete, setIsPersonalityComplete] = useState(false)
  const [currentQuote, setCurrentQuote] = useState("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasAutoSpoken, setHasAutoSpoken] = useState(false)
  const [habits, setHabits] = useState<string[]>([])
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set())
  const [goals, setGoals] = useState<any[]>([])
  const [moodEntries, setMoodEntries] = useState<any[]>([])
  const [streak, setStreak] = useState(0)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [appError, setAppError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      const initialTheme = savedTheme || systemTheme
      setTheme(initialTheme)
      document.documentElement.classList.toggle("dark", initialTheme === "dark")

      const savedPersonalityData = localStorage.getItem("personalityData")
      if (savedPersonalityData) {
        const parsedData = JSON.parse(savedPersonalityData)
        setPersonalityData(parsedData)
        setUserName(parsedData.name)
        setIsPersonalityComplete(true)
      }
    } catch (error) {
      console.error("[MotivaBOT] Error loading initial data:", error)
      setAppError("Failed to load saved data. Starting fresh.")
    }
  }, [])

  useEffect(() => {
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])

    if (isPersonalityComplete && userName && !hasAutoSpoken) {
      const welcomeMessage = `Welcome ${userName}! I'm MotivaBOT, your personal AI motivation coach. Let's achieve greatness together!`
      setTimeout(async () => {
        await speakText(welcomeMessage)
        setHasAutoSpoken(true)
      }, 1000)
    }
  }, [isPersonalityComplete, userName, hasAutoSpoken])

  useEffect(() => {
    try {
      const savedHabits = localStorage.getItem("habits")
      const loadedHabits = savedHabits ? JSON.parse(savedHabits) : []
      setHabits(loadedHabits)

      const loadedGoals = dataStore.getGoals()
      const loadedMood = dataStore.getMoodHistory()
      const loadedStreak = dataStore.getStreak()

      setGoals(loadedGoals)
      setMoodEntries(loadedMood)
      setStreak(loadedStreak)
    } catch (error) {
      console.error("[MotivaBOT] Error loading user data:", error)
    }
  }, [])

  const speakText = async (text: string) => {
    if (isSpeaking) return
    setIsSpeaking(true)
    try {
      await elevenLabsService.speak(text)
    } catch (error) {
      console.error("[MotivaBOT] Speech synthesis error:", error)
      // Silent fail - speech is not critical
    } finally {
      setIsSpeaking(false)
    }
  }

  const handlePersonalityComplete = (data: PersonalityData) => {
    try {
      setPersonalityData(data)
      setUserName(data.name)
      setIsPersonalityComplete(true)
      localStorage.setItem("personalityData", JSON.stringify(data))

      const completionMessage = `Great job completing your personality assessment, ${data.name}! Now I can provide you with personalized motivation based on your goals and preferences.`
      setTimeout(async () => {
        await speakText(completionMessage)
      }, 500)
    } catch (error) {
      console.error("[MotivaBOT] Error saving personality data:", error)
      setAppError("Failed to save your profile. Please try again.")
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
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
    try {
      const newHabits = [...habits, habit]
      setHabits(newHabits)
      localStorage.setItem("habits", JSON.stringify(newHabits))
    } catch (error) {
      console.error("[MotivaBOT] Error adding habit:", error)
    }
  }

  const handleRemoveHabit = (habit: string) => {
    try {
      const newHabits = habits.filter((h) => h !== habit)
      setHabits(newHabits)
      localStorage.setItem("habits", JSON.stringify(newHabits))
    } catch (error) {
      console.error("[MotivaBOT] Error removing habit:", error)
    }
  }

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Your motivation hub with daily insights and quick actions.",
    },
    { id: "personality", label: "Personality", icon: Brain, description: "Discover your unique personality traits." },
    {
      id: "affirmations",
      label: "Affirmations",
      icon: Sparkles,
      description: "Powerful positive affirmations for daily habits.",
    },
    {
      id: "chat",
      label: "AI Coach Chat",
      icon: MessageCircle,
      description: "Meaningful conversations with your AI coach.",
    },
    {
      id: "voice",
      label: "Voice Chat",
      icon: Phone,
      description: "Real-time voice conversation with your AI coach.",
    },
    { id: "goals", label: "Goal Tracker", icon: Target, description: "Set SMART goals and track your progress." },
    {
      id: "mood",
      label: "Mood & Wellness",
      icon: Heart,
      description: "Monitor your emotional well-being and patterns.",
    },
    { id: "horoscope", label: "Horoscope", icon: Star, description: "Personalized cosmic insights and motivation." },
    { id: "friends", label: "Community", icon: Users, description: "Connect with like-minded individuals." },
    {
      id: "achievements",
      label: "Achievements",
      icon: Trophy,
      description: "Track your progress milestones and badges.",
    },
    { id: "habits", label: "Habit Tracker", icon: Check, description: "Build and track your daily habits." },
    {
      id: "export",
      label: "Data Export",
      icon: Download,
      description: "Download and backup your motivation journey data.",
    },
  ]

  if (!isPersonalityComplete) {
    return <PersonalityTest onComplete={handlePersonalityComplete} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {appError && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center text-sm">
          {appError}
          <button onClick={() => setAppError(null)} className="ml-4 underline">
            Dismiss
          </button>
        </div>
      )}

      <SidebarNav
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={userName}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileSidebarOpen(false)}>
          <div className="w-64 h-full bg-card shadow-xl" onClick={(e) => e.stopPropagation()}>
            <SidebarNav
              tabs={tabs}
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab)
                setIsMobileSidebarOpen(false)
              }}
              userName={userName}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between p-4 bg-card border-b border-border shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => setIsMobileSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold text-primary">MotivaBOT</h1>
          <div className="flex items-center gap-2">
            <QuickAddButton setActiveTab={setActiveTab} />
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <header className="hidden lg:flex items-center justify-between p-6 bg-card border-b border-border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {tabs.find((t) => t.id === activeTab)?.label || "Dashboard"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{tabs.find((t) => t.id === activeTab)?.description}</p>
          </div>
          <QuickAddButton setActiveTab={setActiveTab} />
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && (
              <DashboardContent
                userName={userName}
                currentQuote={currentQuote}
                speakText={speakText}
                getNewQuote={getNewQuote}
                isSpeaking={isSpeaking}
                streak={streak}
                goals={goals}
                moodEntries={moodEntries}
                setActiveTab={setActiveTab}
              />
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
            {activeTab === "voice" && <VoiceConversation />}
            {activeTab === "goals" && <GoalsModule />}
            {activeTab === "mood" && <MoodLogger />}
            {activeTab === "horoscope" && <HoroscopeModule />}
            {activeTab === "friends" && <CommunityModule />}
          </div>
        </main>
      </div>
    </div>
  )
}
