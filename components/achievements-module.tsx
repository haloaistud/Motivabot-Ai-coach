"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Target, Star, Trophy, Award, Heart, Flame, Sparkles, Brain } from 'lucide-react'

interface Achievement {
  id: string
  title: string
  description: string
  icon: any
  color: string
  bgColor: string
  unlocked: boolean
}

interface AchievementsModuleProps {
  goals: any[]
  moodEntries: any[]
  streak: number
}

export default function AchievementsModule({ goals, moodEntries, streak }: AchievementsModuleProps) {
  const achievements: Achievement[] = [
    {
      id: "first_goal",
      title: "Goal Setter",
      description: "Set your first goal",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      unlocked: goals.length > 0,
    },
    {
      id: "five_goals",
      title: "Ambitious",
      description: "Set 5 goals",
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      unlocked: goals.length >= 5,
    },
    {
      id: "first_complete",
      title: "Achiever",
      description: "Complete your first goal",
      icon: Trophy,
      color: "text-green-600",
      bgColor: "bg-green-50",
      unlocked: goals.some((g) => g.completed),
    },
    {
      id: "five_complete",
      title: "Goal Master",
      description: "Complete 5 goals",
      icon: Award,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      unlocked: goals.filter((g) => g.completed).length >= 5,
    },
    {
      id: "mood_week",
      title: "Mindful Week",
      description: "Log mood for 7 days",
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-50",
      unlocked: moodEntries.length >= 7,
    },
    {
      id: "streak_seven",
      title: "Week Warrior",
      description: "Maintain a 7-day streak",
      icon: Flame,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      unlocked: streak >= 7,
    },
    {
      id: "streak_thirty",
      title: "Monthly Champion",
      description: "Maintain a 30-day streak",
      icon: Sparkles,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      unlocked: streak >= 30,
    },
    {
      id: "mood_month",
      title: "Emotional Intelligence",
      description: "Log mood for 30 days",
      icon: Brain,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      unlocked: moodEntries.length >= 30,
    },
  ]

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const progress = Math.round((unlockedCount / achievements.length) * 100)

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Your Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">
                {unlockedCount} of {achievements.length} Unlocked
              </span>
              <span className="text-2xl font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-white h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {achievements.map((achievement) => {
          const Icon = achievement.icon
          return (
            <Card
              key={achievement.id}
              className={`transition-all ${achievement.unlocked ? "border-2 border-green-500 shadow-lg" : "opacity-60"}`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`${achievement.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-8 h-8 ${achievement.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg">{achievement.title}</h3>
                      {achievement.unlocked && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    {!achievement.unlocked && (
                      <Badge variant="outline" className="mt-2">
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
