"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import PersonalityTest, { type PersonalityData } from "@/components/personality-test"
import { elevenLabsService } from "@/lib/elevenlabs"
import {
  Brain,
  MessageCircle,
  Target,
  Heart,
  Star,
  Users,
  Gauge,
  BotIcon as Robot,
  Plus,
  Volume2,
  FlameIcon as Fire,
  Trophy,
  Smile,
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
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [currentPattern, setCurrentPattern] = useState("geometric")
  const [userName, setUserName] = useState("")
  const [personalityData, setPersonalityData] = useState<PersonalityData | null>(null)
  const [isPersonalityComplete, setIsPersonalityComplete] = useState(false)
  const [currentQuote, setCurrentQuote] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasAutoSpoken, setHasAutoSpoken] = useState(false)

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

  if (!isPersonalityComplete) {
    return <PersonalityTest onComplete={handlePersonalityComplete} />
  }

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: Gauge,
      description: "Your motivation hub with daily insights, progress tracking, and quick actions",
    },
    {
      id: "personality",
      label: "Personality",
      icon: Brain,
      description: "Complete your personality assessment for personalized motivation",
    },
    {
      id: "chat",
      label: "AI Chat",
      icon: MessageCircle,
      description: "Chat with your personal AI motivation coach for guidance and support",
    },
    {
      id: "goals",
      label: "Goals",
      icon: Target,
      description: "Set, track, and achieve your personal and professional goals",
    },
    {
      id: "mood",
      label: "Mood Tracker",
      icon: Heart,
      description: "Log your daily mood and emotions to track your mental wellness journey",
    },
    {
      id: "horoscope",
      label: "Horoscope",
      icon: Star,
      description: "Get daily horoscope insights and cosmic motivation for your zodiac sign",
    },
    {
      id: "friends",
      label: "Friend Wall",
      icon: Users,
      description: "Connect with fellow motivators and share your journey with others",
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
                <Icon size={24} />
                {tab.label}
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
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>0</div>
                    <div style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>Day Streak</div>
                  </div>
                  <Fire className="w-8 h-8" style={{ color: "var(--primary)" }} />
                </div>

                <div
                  className="card"
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem" }}
                >
                  <div>
                    <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>0</div>
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

          {activeTab !== "dashboard" && (
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
