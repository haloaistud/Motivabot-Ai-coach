"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Target, Plus, Trash2, CheckCircle, Circle, TrendingUp } from "lucide-react"

interface Goal {
  id: string
  text: string
  completed: boolean
  createdAt: Date
  progress: number
  category: string
  priority: "low" | "medium" | "high"
  targetDate?: Date
}

const goalCategories = [
  "Personal Development",
  "Health & Fitness",
  "Career",
  "Education",
  "Relationships",
  "Finance",
  "Hobbies",
  "Other",
]

const priorityColors = {
  low: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-red-100 text-red-800 border-red-200",
}

export default function GoalsModule() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [newGoal, setNewGoal] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedPriority, setSelectedPriority] = useState<"low" | "medium" | "high">("medium")
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  useEffect(() => {
    const savedGoals = localStorage.getItem("motivabotGoals")
    if (savedGoals) {
      try {
        const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
          ...goal,
          createdAt: new Date(goal.createdAt),
          targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
        }))
        setGoals(parsedGoals)
      } catch (error) {
        console.error("Error loading goals:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("motivabotGoals", JSON.stringify(goals))
  }, [goals])

  const addGoal = () => {
    if (!newGoal.trim() || !selectedCategory) return

    const goal: Goal = {
      id: Date.now().toString(),
      text: newGoal.trim(),
      completed: false,
      createdAt: new Date(),
      progress: 0,
      category: selectedCategory,
      priority: selectedPriority,
    }

    setGoals([...goals, goal])
    setNewGoal("")
    setSelectedCategory("")
    setSelectedPriority("medium")
  }

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((goal) => goal.id !== id))
  }

  const toggleGoalCompletion = (id: string) => {
    setGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed, progress: goal.completed ? 0 : 100 } : goal,
      ),
    )
  }

  const updateProgress = (id: string, progress: number) => {
    setGoals(goals.map((goal) => (goal.id === id ? { ...goal, progress, completed: progress >= 100 } : goal)))
  }

  const filteredGoals = goals.filter((goal) => {
    switch (filter) {
      case "active":
        return !goal.completed
      case "completed":
        return goal.completed
      default:
        return true
    }
  })

  const completionRate =
    goals.length > 0 ? Math.round((goals.filter((g) => g.completed).length / goals.length) * 100) : 0

  const totalGoals = goals.length
  const completedGoals = goals.filter((g) => g.completed).length
  const activeGoals = goals.filter((g) => !g.completed).length

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6" />
              Goal Management
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form
            id="goal-form"
            onSubmit={(e) => {
              e.preventDefault()
              addGoal()
            }}
            className="space-y-4 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Enter your goal..."
                required
                className="md:col-span-1"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {goalCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedPriority} onValueChange={(value: any) => setSelectedPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <button type="submit" disabled={!newGoal.trim() || !selectedCategory}>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </button>
          </form>

          <ul id="goal-list" className="space-y-3">
            {filteredGoals.length === 0 ? (
              <li className="text-center py-8 text-muted-foreground">
                {filter === "all" ? "No goals added yet. Start by adding one!" : `No ${filter} goals found.`}
              </li>
            ) : (
              filteredGoals.map((goal) => (
                <li key={goal.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleGoalCompletion(goal.id)}
                          className="p-0 h-auto"
                        >
                          {goal.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Circle className="w-5 h-5 text-muted-foreground" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className={`font-medium ${goal.completed ? "line-through text-muted-foreground" : ""}`}>
                            {goal.text}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {goal.category}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${priorityColors[goal.priority]}`}>
                              {goal.priority} priority
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Created {goal.createdAt.toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {!goal.completed && (
                        <div className="ml-8">
                          <div className="progress-bar mb-2">
                            <div className="progress-fill" style={{ width: `${goal.progress}%` }} />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress: {goal.progress}%</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateProgress(goal.id, Math.min(100, goal.progress + 25))}
                                className="text-xs px-2 py-1"
                              >
                                +25%
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateProgress(goal.id, Math.max(0, goal.progress - 25))}
                                className="text-xs px-2 py-1"
                              >
                                -25%
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6" />
            Your Progress Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{totalGoals}</div>
              <div className="text-sm text-muted-foreground">Total Goals</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{completedGoals}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{completionRate}%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>

          {totalGoals > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">{completionRate}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completionRate}%` }} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
