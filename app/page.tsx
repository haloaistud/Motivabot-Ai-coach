"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Simulated login
    setTimeout(() => {
      setLoading(false);
      // setError("Invalid credentials"); // Example error
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.logo}>
        <Image
          src="/MotivaBOT.png"
          alt="MotivaBOT Logo"
          width={200}
          height={200}
          priority
        />
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Email
          <input
            className={styles.input}
            type="email"
            autoComplete="email"
            required
          />
        </label>

        <label className={styles.label}>
          Password
          <input
            className={styles.input}
            type="password"
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
      </form>

      <p className={styles.registerText}>
        Don’t have an account? <Link href="/register">Register</Link>
      </p>
    </div>
  );
        }export default function MotivaBOT() {
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const initialTheme = savedTheme || systemTheme
    setTheme(initialTheme)
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')

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

    if (isPersonalityComplete && userName && !hasAutoSpoken) {
      const welcomeMessage = `Welcome ${userName}! I'm MotivaBOT, your personal AI motivation coach. Let's achieve greatness together!`
      setTimeout(async () => {
        await speakText(welcomeMessage)
        setHasAutoSpoken(true)
      }, 1000)
    }
  }, [isPersonalityComplete, userName, hasAutoSpoken])

  useEffect(() => {
    const savedHabits = localStorage.getItem('habits')
    const loadedHabits = savedHabits ? JSON.parse(savedHabits) : []
    setHabits(loadedHabits)
    
    const loadedGoals = dataStore.getGoals()
    const loadedMood = dataStore.getMoodHistory()
    const loadedStreak = dataStore.getStreak()
    
    setGoals(loadedGoals)
    setMoodEntries(loadedMood)
    setStreak(loadedStreak)
  }, [])

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
    localStorage.setItem('personalityData', JSON.stringify(data))

    const completionMessage = `Great job completing your personality assessment, ${data.name}! Now I can provide you with personalized motivation based on your goals and preferences.`
    setTimeout(async () => {
      await speakText(completionMessage)
    }, 500)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
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
    localStorage.setItem('habits', JSON.stringify(newHabits))
  }

  const handleRemoveHabit = (habit: string) => {
    const newHabits = habits.filter((h) => h !== habit)
    setHabits(newHabits)
    localStorage.setItem('habits', JSON.stringify(newHabits))
  }

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, description: "Your motivation hub with daily insights and quick actions." },
    { id: "personality", label: "Personality", icon: Brain, description: "Discover your unique personality traits." },
    { id: "affirmations", label: "Affirmations", icon: Sparkles, description: "Powerful positive affirmations for daily habits." },
    { id: "chat", label: "AI Coach Chat", icon: MessageCircle, description: "Meaningful conversations with your AI coach." },
    { id: "voice", label: "Voice Chat", icon: Phone, description: "Real-time voice conversation with your AI coach." },
    { id: "goals", label: "Goal Tracker", icon: Target, description: "Set SMART goals and track your progress." },
    { id: "mood", label: "Mood & Wellness", icon: Heart, description: "Monitor your emotional well-being and patterns." },
    { id: "horoscope", label: "Horoscope", icon: Star, description: "Personalized cosmic insights and motivation." },
    { id: "friends", label: "Community", icon: Users, description: "Connect with like-minded individuals." },
    { id: "achievements", label: "Achievements", icon: Trophy, description: "Track your progress milestones and badges." },
    { id: "habits", label: "Habit Tracker", icon: Check, description: "Build and track your daily habits." },
    { id: "export", label: "Data Export", icon: Download, description: "Download and backup your motivation journey data." },
  ]

  if (!isPersonalityComplete) {
    return <PersonalityTest onComplete={handlePersonalityComplete} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SidebarNav 
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userName={userName}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <div 
            className="w-64 h-full bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-bold text-primary">MotivaBOT</h1>
          <div className="flex items-center gap-2">
            <QuickAddButton setActiveTab={setActiveTab} />
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <header className="hidden lg:flex items-center justify-between p-6 bg-card border-b border-border shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {tabs.find(t => t.id === activeTab)?.description}
            </p>
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
