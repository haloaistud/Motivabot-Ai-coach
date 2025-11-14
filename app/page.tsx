"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import PersonalityTest, { type PersonalityData } from "@/components/personality-test"
import AffirmationsModule from "@/components/affirmations-module"
import AchievementsModule from "@/components/achievements-module"
import HabitTracker from "@/components/habit-tracker"
import DataExport from "@/components/data-export"
import { elevenLabsService } from "@/lib/elevenlabs"
import { dataStore } from "@/lib/data-store"
import { Brain, MessageCircle, Target, Heart, Star, Users, Gauge, Bot as Robot, Plus, Volume2, File as Fire, Trophy, Smile, Sparkles, Check, Download } from 'lucide-react'

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

  useEffect(() => {
    setCurrentQuote(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)])

    document.body.setAttribute("data-theme", isDarkMode ? "dark" : "light")
    document.body.className = `pattern-${currentPattern}`

    createParticles(10)

    if (isPersonalityComplete && userName && !hasAutoSpoken) {
      const welcomeMessage = `Welcome ${userName}! I'm MotivaBOT, your personal AI motivation coach. Let's achieve greatness together!`
      setTimeout(async () => {
        await speakText(welcomeMessage)
        setHasAutoSpoken(true)
      }, 1000)
    }
  }, [isDarkMode, currentPattern, isPersonalityComplete, userName, hasAutoSpoken])

  useEffect(() => {
    if (activeTab === "dashboard" && currentQuote && isPersonalityComplete && hasAutoSpoken) {
      setTimeout(async () => {
        const quoteMessage = `Here's your daily motivation: ${currentQuote}`
        await speakText(quoteMessage)
      }, 3000)
    }
  }, [activeTab, currentQuote, isPersonalityComplete, hasAutoSpoken])

  useEffect(() => {
    const loadedHabits = dataStore.get('habits', [])
    const loadedGoals = dataStore.get('goals', [])
    const loadedMood = dataStore.get('moodEntries', [])
    const loadedStreak = dataStore.get('streak', 0)
    
    setHabits(loadedHabits)
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

    const completionMessage = `Great job completing your personality assessment, ${data.name}! Now I can provide you with personalized motivation based on your goals and preferences.`
    setTimeout(async () => {
      await speakText(completionMessage)
    }, 500)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
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
    dataStore.set('habits', newHabits)
  }

  const handleRemoveHabit = (habit: string) => {
    const newHabits = habits.filter((h) => h !== habit)
    setHabits(newHabits)
    dataStore.set('habits', newHabits)
  }

  if (!isPersonalityComplete) {
    return <PersonalityTest onComplete={handlePersonalityComplete} />
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

  return (
    <div className="min-h-screen">
      <div className="particles" id="particles"></div>

      <div className="app-container">
        <header className="main-header">
          <div className="logo-section">
            <div className="logo">
              <i className="fas fa-robot"></i>
              <span>MotivaBOT</span>
            </div>
            <div className="tagline">Your Personal AI Motivation Coach</div>
          </div>
          <div className="user-profile">
            <div className="profile-pic">
              <i className="fas fa-user"></i>
            </div>
            <div className="profile-info">
              <div className="username">Welcome, {userName}!</div>
              <div className="personality-type">Ready to achieve greatness</div>
            </div>
          </div>
        </header>

        <h1 className="app-title">Achieve Your Goals with MotivaBOT</h1>
        <p className="app-subtitle">Your personalized AI companion for growth and inspiration.</p>

        <div className="theme-controls">
          <button className="theme-btn" onClick={toggleTheme} title="Toggle Theme">
            <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"}`}></i>
          </button>
          <button
            className="pattern-btn"
            onClick={() => changePattern("geometric")}
            style={{ background: "linear-gradient(45deg, #FFD700, #DAA520)" }}
            title="Geometric Pattern"
          ></button>
          <button
            className="pattern-btn"
            onClick={() => changePattern("organic")}
            style={{ background: "linear-gradient(45deg, #667eea, #764ba2)" }}
            title="Organic Pattern"
          ></button>
          <button
            className="pattern-btn"
            onClick={() => changePattern("waves")}
            style={{ background: "linear-gradient(45deg, #33ccff, #3366ff)" }}
            title="Wave Pattern"
          ></button>
        </div>

        <nav className="tab-navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
                title={tab.description}
              >
                <Icon size={28} />
                <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>{tab.label}</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    opacity: 0.8,
                    textAlign: "center",
                    lineHeight: "1.2",
                    marginTop: "0.25rem",
                  }}
                >
                  {tab.description.split(",")[0]}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="space-y-6">
          {activeTab === "dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div
                className="card lg:col-span-2"
                style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", color: "white" }}
              >
                <h2 style={{ color: "white", marginBottom: "1rem" }}>Welcome Back, {userName}!</h2>
                <div style={{ fontStyle: "italic", fontSize: "1.1rem", marginBottom: "1.5rem" }}>
                  <i className="fas fa-quote-left"></i>
                  <p>"{currentQuote}"</p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Button
                    onClick={speakCurrentQuote}
                    disabled={isSpeaking}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "white",
                    }}
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    {isSpeaking ? "Speaking..." : "Speak This"}
                  </Button>
                  <Button
                    onClick={getNewQuote}
                    disabled={isSpeaking}
                    style={{
                      background: "rgba(255,255,255,0.2)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "white",
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    New Quote
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div
                  className="card"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem" }}
                >
                  <div>
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>{streak}</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Day Streak</div>
                  </div>
                  <Fire className="w-8 h-8" style={{ color: "var(--primary)" }} />
                </div>

                <div
                  className="card"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem" }}
                >
                  <div>
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>{goals.length}</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Goals Achieved</div>
                  </div>
                  <Trophy className="w-8 h-8" style={{ color: "var(--primary)" }} />
                </div>

                <div
                  className="card"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem" }}
                >
                  <div>
                    <div style={{ fontSize: "2rem", fontWeight: "bold" }}>😊</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Avg Mood</div>
                  </div>
                  <Smile className="w-8 h-8" style={{ color: "var(--primary)" }} />
                </div>
              </div>

              <div className="card lg:col-span-3">
                <h3 style={{ color: "var(--primary)", marginBottom: "1.5rem" }}>Quick Actions</h3>
                <div
                  style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}
                >
                  <Button
                    onClick={() => setActiveTab("chat")}
                    style={{
                      background: "linear-gradient(135deg, var(--secondary), var(--secondary-dark))",
                      color: "white",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Robot className="w-4 h-4 mr-2" />
                    Chat with MotivaBOT
                  </Button>
                  <Button
                    onClick={() => setActiveTab("affirmations")}
                    style={{
                      background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                      color: "black",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Daily Affirmations
                  </Button>
                  <Button
                    onClick={() => setActiveTab("goals")}
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Goal
                  </Button>
                  <Button
                    onClick={() => setActiveTab("mood")}
                    style={{
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      justifyContent: "flex-start",
                    }}
                  >
                    <Heart className="w-4 h-4 mr-2" />
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

          {activeTab !== "dashboard" && activeTab !== "affirmations" && activeTab !== "achievements" && activeTab !== "habits" && activeTab !== "export" && (
            <div className="card">
              <h2 className="card-title">{tabs.find((tab) => tab.id === activeTab)?.label}</h2>
              <p>This section is under development. Advanced features coming soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
