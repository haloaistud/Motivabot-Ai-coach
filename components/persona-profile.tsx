'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Brain, Target, TrendingUp, Star, Award, Zap, Heart, Settings, Edit2, Save, X, Bell, Shield, Download, Trophy } from 'lucide-react'
import { dataStore } from '@/lib/data-store'

interface PersonaProfileProps {
  personalityData: any
  goals: any[]
  moodEntries: any[]
  streak: number
}

export default function PersonaProfile({ personalityData, goals, moodEntries, streak }: PersonaProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState(personalityData || {})
  const [profileStats, setProfileStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    successRate: 0,
    avgMood: 0,
    activeDays: 0
  })

  useEffect(() => {
    calculateStats()
  }, [goals, moodEntries, streak])

  const calculateStats = () => {
    const totalGoals = goals.length
    const completedGoals = goals.filter(g => g.completed).length
    const successRate = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0
    
    const moodValues: Record<string, number> = {
      'Excellent': 5,
      'Good': 4,
      'Okay': 3,
      'Down': 2,
      'Sad': 1
    }
    
    const avgMood = moodEntries.length > 0
      ? moodEntries.reduce((sum, entry) => sum + (moodValues[entry.mood] || 3), 0) / moodEntries.length
      : 3

    setProfileStats({
      totalGoals,
      completedGoals,
      successRate,
      avgMood: Math.round(avgMood * 10) / 10,
      activeDays: streak
    })
  }

  const handleSave = () => {
    dataStore.set('personalityData', editedData)
    setIsEditing(false)
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 4.5) return '😄'
    if (score >= 3.5) return '😊'
    if (score >= 2.5) return '😐'
    if (score >= 1.5) return '😔'
    return '😢'
  }

  const getMotivationStyle = () => {
    const styles: Record<string, { icon: any, color: string, description: string }> = {
      achievement: {
        icon: Trophy,
        color: 'text-yellow-600',
        description: 'Driven by accomplishments and milestones'
      },
      recognition: {
        icon: Star,
        color: 'text-purple-600',
        description: 'Energized by praise and acknowledgment'
      },
      growth: {
        icon: TrendingUp,
        color: 'text-blue-600',
        description: 'Motivated by learning and self-improvement'
      },
      impact: {
        icon: Heart,
        color: 'text-red-600',
        description: 'Inspired by making a difference'
      }
    }
    
    return styles[personalityData?.motivationStyle] || styles.growth
  }

  const motivationStyle = getMotivationStyle()
  const MotivationIcon = motivationStyle.icon

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-full">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{personalityData?.name || 'User'}</h2>
                <p className="text-sm text-muted-foreground">Age {personalityData?.age || 'N/A'}</p>
              </div>
            </CardTitle>
            <Button
              variant={isEditing ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
            >
              {isEditing ? (
                <><X className="w-4 h-4 mr-2" /> Cancel</>
              ) : (
                <><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{profileStats.totalGoals}</div>
              <p className="text-sm text-muted-foreground mt-1">Total Goals</p>
              <div className="mt-3">
                <Progress value={profileStats.successRate} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{profileStats.successRate}% Success Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl">{getMoodEmoji(profileStats.avgMood)}</div>
              <p className="text-sm text-muted-foreground mt-1">Avg Mood</p>
              <div className="mt-3">
                <div className="text-2xl font-bold text-primary">{profileStats.avgMood}/5.0</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{profileStats.activeDays}</div>
              <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
              <div className="mt-3">
                <Badge className="bg-orange-500">
                  🔥 On Fire!
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="personality" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="personality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MotivationIcon className={`w-5 h-5 ${motivationStyle.color}`} />
                Motivation Style
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{motivationStyle.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Primary Goals ({personalityData?.goals?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {personalityData?.goals?.map((goal: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {goal}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Challenges ({personalityData?.challenges?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {personalityData?.challenges?.map((challenge: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {challenge}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Goal Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.slice(0, 5).map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{goal.text}</span>
                    <span className="text-sm text-muted-foreground">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              ))}
              {goals.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No goals set yet. Start tracking your goals today!
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-600" />
                Peak Productivity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground capitalize">
                {personalityData?.preferredTime?.replace('_', ' ') || 'Not set'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-600" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Bell className="w-4 h-4 mr-2" />
                Notification Preferences
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Privacy Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export All Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
