import React from 'react'
import { Button } from "@/components/ui/button"
import { Volume2, Trophy, Target, Check, MessageCircle, Sparkles, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DashboardContentProps {
  userName: string
  currentQuote: string
  speakText: (text: string) => Promise<void>
  getNewQuote: () => Promise<void>
  isSpeaking: boolean
  streak: number
  goals: any[]
  moodEntries: any[]
  setActiveTab: (tabId: string) => void
}

const DashboardContent: React.FC<DashboardContentProps> = ({ 
  userName, 
  currentQuote, 
  speakText, 
  getNewQuote, 
  isSpeaking, 
  streak, 
  goals,
  moodEntries,
  setActiveTab
}) => {
  const activeGoalsCount = goals.filter(g => !g.completed).length
  const completedGoalsCount = goals.filter(g => g.completed).length
  const lastMoodEntry = moodEntries.length > 0 ? moodEntries[moodEntries.length - 1]?.mood || 'Good' : 'Good'
  
  const quickActionTiles = [
    { title: "Review Goals", icon: Target, tabId: "goals", actionLabel: "View All", color: "border-primary", description: "View your active goals and progress." },
    { title: "Track Habits", icon: Check, tabId: "habits", actionLabel: "Open Tracker", color: "border-green-500", description: "Check off today's tasks and build consistency." },
    { title: "Chat with AI", icon: MessageCircle, tabId: "chat", actionLabel: "Start Session", color: "border-blue-500", description: "Get instant coaching and personalized advice." },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Quote Card */}
      <Card className="bg-gradient-to-br from-amber-500/10 to-primary/10 shadow-xl border-2 border-primary/20">
        <CardHeader>
          <div className="flex justify-center items-center gap-4">
            <Sparkles className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl font-serif text-primary">Daily Motivation</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <blockquote className="text-2xl md:text-3xl font-serif leading-relaxed italic my-6 text-center text-foreground/90">
            "{currentQuote.split(' - ')[0]}"
          </blockquote>
          <cite className="block text-right text-sm text-muted-foreground mt-4">
            - {currentQuote.split(' - ')[1] || 'MotivaBOT'}
          </cite>
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              onClick={() => speakText(currentQuote)}
              disabled={isSpeaking}
              variant="secondary"
              className="transition-colors duration-300 hover:bg-secondary/80"
            >
              <Volume2 className="w-5 h-5 mr-2" />
              {isSpeaking ? 'Speaking...' : 'Listen'}
            </Button>
            <Button 
              onClick={getNewQuote}
              variant="outline"
              disabled={isSpeaking}
              className="transition-colors duration-300 hover:bg-muted"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              New Quote
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Snapshot */}
      <div>
        <h3 className="text-2xl font-semibold border-b border-border pb-2 text-foreground font-serif mb-6">Progress Snapshot</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Streak Card */}
          <Card className="border-l-4 border-yellow-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                  <p className="text-3xl font-bold text-foreground flex items-center gap-2">
                    {streak} 🔥
                  </p>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => setActiveTab('achievements')}
                  className="text-primary hover:text-primary/80"
                >
                  <Trophy className="w-5 h-5 mr-1" />
                  Milestones
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Goals Card */}
          <Card className="border-l-4 border-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Active Goals</p>
                  <p className="text-3xl font-bold text-foreground">{activeGoalsCount}</p>
                  <p className="text-xs text-muted-foreground">{completedGoalsCount} completed</p>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => setActiveTab('goals')}
                  className="text-primary hover:text-primary/80"
                >
                  <Target className="w-5 h-5 mr-1" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mood Card */}
          <Card className="border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Latest Mood</p>
                  <p className="text-3xl font-bold text-foreground flex items-center gap-2">
                    {lastMoodEntry} 😊
                  </p>
                </div>
                <Button 
                  variant="link" 
                  onClick={() => setActiveTab('mood')}
                  className="text-primary hover:text-primary/80"
                >
                  <TrendingUp className="w-5 h-5 mr-1" />
                  Log Mood
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Action Tiles */}
      <div>
        <h3 className="text-2xl font-semibold border-b border-border pb-2 text-foreground font-serif mb-6">Start Improving Now</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActionTiles.map((tile) => {
            const Icon = tile.icon
            return (
              <Card 
                key={tile.tabId} 
                className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-l-4 ${tile.color}`}
                onClick={() => setActiveTab(tile.tabId)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                    <Button 
                      variant="ghost" 
                      onClick={(e) => { e.stopPropagation(); setActiveTab(tile.tabId) }}
                      className="text-sm text-primary hover:bg-primary/10"
                    >
                      {tile.actionLabel}
                    </Button>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{tile.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {tile.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default DashboardContent
