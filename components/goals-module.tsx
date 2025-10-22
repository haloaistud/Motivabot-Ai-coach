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
  const [targetDate, setTargetDate] = useState("") // Added target date functionality
  const [showAnalytics, setShowAnalytics] = useState(false) // Added analytics toggle

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
      targetDate: targetDate ? new Date(targetDate) : undefined, // Added target date
    }

    setGoals([...goals, goal])
    setNewGoal("")
    setSelectedCategory("")
    setSelectedPriority("medium")
    setTargetDate("") // Reset target date
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

  const getGoalsByCategory = () => {
    const categoryStats = goalCategories
      .map((category) => ({
        category,
        total: goals.filter((g) => g.category === category).length,
        completed: goals.filter((g) => g.category === category && g.completed).length,
        completion:
          goals.filter((g) => g.category === category).length > 0
            ? Math.round(
                (goals.filter((g) => g.category === category && g.completed).length /
                  goals.filter((g) => g.category === category).length) *
                  100,
              )
            : 0,
      }))
      .filter((stat) => stat.total > 0)

    return categoryStats
  }

  const getUpcomingDeadlines = () => {
    const now = new Date()
    const upcoming = goals
      .filter((g) => !g.completed && g.targetDate)
      .sort((a, b) => (a.targetDate?.getTime() || 0) - (b.targetDate?.getTime() || 0))
      .slice(0, 5)

    return upcoming
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 border-golden-primary/20 bg-gradient-to-br from-golden-light/5 to-golden-primary/5">
        <CardHeader className="bg-gradient-to-r from-golden-primary/10 to-golden-accent/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-golden-primary">
              <Target className="w-6 h-6" />
              Goal Management & Achievement Tracker
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="border-golden-primary text-golden-primary hover:bg-golden-primary hover:text-black"
              >
                {showAnalytics ? "Hide" : "Show"} Analytics
              </Button>
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-32 border-golden-primary text-golden-primary">
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
        <CardContent className="p-6">
          <form
            id="goal-form"
            onSubmit={(e) => {
              e.preventDefault()
              addGoal()
            }}
            className="space-y-4 mb-6 p-4 bg-golden-light/10 rounded-lg border border-golden-primary/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                placeholder="Enter your goal..."
                required
                className="px-3 py-2 border-2 border-golden-primary/30 rounded-lg bg-white text-golden-primary placeholder-golden-dark/60 focus:border-golden-primary"
              />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="border-golden-primary text-golden-primary">
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
                <SelectTrigger className="border-golden-primary text-golden-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                </SelectContent>
              </Select>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="px-3 py-2 border-2 border-golden-primary/30 rounded-lg bg-white text-golden-primary focus:border-golden-primary"
                title="Target completion date (optional)"
              />
            </div>
            <button
              type="submit"
              disabled={!newGoal.trim() || !selectedCategory}
              className="w-full px-4 py-3 bg-gradient-to-r from-golden-primary to-golden-accent text-black font-semibold rounded-lg hover:from-golden-accent hover:to-golden-primary disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Goal to Your Success Journey
            </button>
          </form>

          <ul id="goal-list" className="space-y-4">
            {filteredGoals.length === 0 ? (
              <li className="text-center py-12 text-golden-dark bg-golden-light/10 rounded-lg border border-golden-primary/20">
                <Target className="w-16 h-16 mx-auto mb-4 text-golden-primary/50" />
                <h3 className="text-lg font-semibold text-golden-primary mb-2">
                  {filter === "all" ? "Ready to Set Your First Goal?" : `No ${filter} goals found.`}
                </h3>
                <p className="text-golden-dark">
                  {filter === "all"
                    ? "Every great achievement starts with a single goal. Add one above to begin your success journey!"
                    : `Switch to "All Goals" to see your complete list.`}
                </p>
              </li>
            ) : (
              filteredGoals.map((goal) => (
                <li
                  key={goal.id}
                  className="p-5 border-2 border-golden-primary/20 rounded-xl bg-gradient-to-r from-white to-golden-light/10 hover:border-golden-primary/40 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleGoalCompletion(goal.id)}
                          className="p-0 h-auto hover:bg-transparent"
                        >
                          {goal.completed ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Circle className="w-6 h-6 text-golden-primary hover:text-golden-accent" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div
                            className={`font-semibold text-lg ${goal.completed ? "line-through text-golden-dark/60" : "text-golden-primary"}`}
                          >
                            {goal.text}
                          </div>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className="bg-golden-primary text-black text-xs font-medium">{goal.category}</Badge>
                            <Badge
                              variant="outline"
                              className={`text-xs font-medium ${priorityColors[goal.priority]} border-current`}
                            >
                              {goal.priority} priority
                            </Badge>
                            <span className="text-xs text-golden-dark">
                              Created {goal.createdAt.toLocaleDateString()}
                            </span>
                            {goal.targetDate && (
                              <Badge variant="outline" className="text-xs text-golden-dark border-golden-primary/30">
                                Due {goal.targetDate.toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      {!goal.completed && (
                        <div className="ml-9">
                          <div className="progress-bar mb-3 bg-golden-light/20 border border-golden-primary/20">
                            <div
                              className="progress-fill bg-gradient-to-r from-golden-primary to-golden-accent"
                              style={{ width: `${goal.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-golden-primary">Progress: {goal.progress}%</span>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateProgress(goal.id, Math.min(100, goal.progress + 25))}
                                className="text-xs px-3 py-1 border-golden-primary text-golden-primary hover:bg-golden-primary hover:text-black"
                              >
                                +25%
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateProgress(goal.id, Math.max(0, goal.progress - 25))}
                                className="text-xs px-3 py-1 border-golden-primary text-golden-primary hover:bg-golden-primary hover:text-black"
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
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
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

      {showAnalytics && (
        <>
          <Card className="border-2 border-golden-primary/20 bg-gradient-to-br from-golden-light/5 to-golden-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-golden-primary">
                <TrendingUp className="w-6 h-6" />
                Your Success Analytics & Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center p-4 bg-gradient-to-br from-golden-primary/10 to-golden-accent/10 rounded-lg border border-golden-primary/20">
                  <div className="text-4xl font-bold text-golden-primary mb-2">{totalGoals}</div>
                  <div className="text-sm text-golden-dark font-medium">Total Goals Set</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-lg border border-green-300">
                  <div className="text-4xl font-bold text-green-700 mb-2">{completedGoals}</div>
                  <div className="text-sm text-green-600 font-medium">Goals Achieved</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg border border-blue-300">
                  <div className="text-4xl font-bold text-blue-700 mb-2">{activeGoals}</div>
                  <div className="text-sm text-blue-600 font-medium">Goals In Progress</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg border border-purple-300">
                  <div className="text-4xl font-bold text-purple-700 mb-2">{completionRate}%</div>
                  <div className="text-sm text-purple-600 font-medium">Success Rate</div>
                </div>
              </div>

              {totalGoals > 0 && (
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-golden-primary">Overall Progress</span>
                      <span className="text-sm text-golden-dark font-medium">{completionRate}%</span>
                    </div>
                    <div className="progress-bar h-6 bg-golden-light/20 border border-golden-primary/20">
                      <div
                        className="progress-fill bg-gradient-to-r from-golden-primary to-golden-accent h-full flex items-center justify-center text-black font-semibold text-sm"
                        style={{ width: `${completionRate}%` }}
                      >
                        {completionRate > 15 && `${completionRate}%`}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-golden-primary mb-4">Goals by Category</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getGoalsByCategory().map((stat) => (
                        <div key={stat.category} className="p-4 bg-white/50 rounded-lg border border-golden-primary/20">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-golden-primary">{stat.category}</span>
                            <span className="text-sm text-golden-dark">
                              {stat.completed}/{stat.total}
                            </span>
                          </div>
                          <div className="progress-bar h-3 bg-golden-light/20">
                            <div
                              className="progress-fill bg-gradient-to-r from-golden-primary to-golden-accent"
                              style={{ width: `${stat.completion}%` }}
                            />
                          </div>
                          <div className="text-xs text-golden-dark mt-1">{stat.completion}% complete</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {getUpcomingDeadlines().length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-golden-primary mb-4">Upcoming Deadlines</h4>
                      <div className="space-y-2">
                        {getUpcomingDeadlines().map((goal) => (
                          <div
                            key={goal.id}
                            className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200"
                          >
                            <div>
                              <div className="font-medium text-orange-800">{goal.text}</div>
                              <div className="text-sm text-orange-600">{goal.category}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-orange-800">
                                {goal.targetDate?.toLocaleDateString()}
                              </div>
                              <div className="text-xs text-orange-600">
                                {Math.ceil((goal.targetDate!.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}{" "}
                                days left
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
