"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, TrendingUp, Plus, Check } from "lucide-react"

interface MoodEntry {
  date: string
  mood: number
  notes: string
  habits: string[]
}

interface Habit {
  id: string
  name: string
  completed: boolean
}

export default function MoodLogger() {
  const [selectedMood, setSelectedMood] = useState(0)
  const [moodNotes, setMoodNotes] = useState("")
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [habits, setHabits] = useState<Habit[]>([
    { id: "1", name: "Drink 8 glasses of water", completed: false },
    { id: "2", name: "Exercise for 30 minutes", completed: false },
    { id: "3", name: "Meditate for 10 minutes", completed: false },
    { id: "4", name: "Read for 20 minutes", completed: false },
    { id: "5", name: "Practice gratitude", completed: false },
  ])
  const [newHabit, setNewHabit] = useState("")

  const moodOptions = [
    { value: 5, emoji: "😁", label: "Excellent", color: "text-green-600" },
    { value: 4, emoji: "😊", label: "Good", color: "text-blue-600" },
    { value: 3, emoji: "😐", label: "Okay", color: "text-yellow-600" },
    { value: 2, emoji: "😟", label: "Down", color: "text-orange-600" },
    { value: 1, emoji: "😢", label: "Sad", color: "text-red-600" },
  ]

  useEffect(() => {
    const savedEntries = localStorage.getItem("motivabotMoodEntries")
    const savedHabits = localStorage.getItem("motivabotHabits")

    if (savedEntries) {
      try {
        setEntries(JSON.parse(savedEntries))
      } catch (error) {
        console.error("Error loading mood entries:", error)
      }
    }

    if (savedHabits) {
      try {
        setHabits(JSON.parse(savedHabits))
      } catch (error) {
        console.error("Error loading habits:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("motivabotMoodEntries", JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem("motivabotHabits", JSON.stringify(habits))
  }, [habits])

  const saveMoodEntry = () => {
    if (selectedMood === 0) return

    const today = new Date().toISOString().split("T")[0]
    const completedHabits = habits.filter((h) => h.completed).map((h) => h.name)

    const entry: MoodEntry = {
      date: today,
      mood: selectedMood,
      notes: moodNotes,
      habits: completedHabits,
    }

    // Remove existing entry for today if it exists
    const filteredEntries = entries.filter((e) => e.date !== today)
    setEntries([entry, ...filteredEntries])

    setSelectedMood(0)
    setMoodNotes("")

    // Reset habits for next day
    setHabits(habits.map((h) => ({ ...h, completed: false })))
  }

  const toggleHabit = (id: string) => {
    setHabits(habits.map((habit) => (habit.id === id ? { ...habit, completed: !habit.completed } : habit)))
  }

  const addHabit = () => {
    if (!newHabit.trim()) return

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabit.trim(),
      completed: false,
    }

    setHabits([...habits, habit])
    setNewHabit("")
  }

  const removeHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id))
  }

  const getAverageMood = () => {
    if (entries.length === 0) return 0
    const sum = entries.reduce((acc, entry) => acc + entry.mood, 0)
    return (sum / entries.length).toFixed(1)
  }

  const getMoodEmoji = (mood: number) => {
    const option = moodOptions.find((opt) => opt.value === mood)
    return option ? option.emoji : "😐"
  }

  const todaysEntry = entries.find((entry) => entry.date === new Date().toISOString().split("T")[0])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6" />
            Mood & Habit Tracker
          </CardTitle>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </CardHeader>
        <CardContent>
          {!todaysEntry ? (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">How are you feeling today?</h3>
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {moodOptions.map((mood) => (
                    <Button
                      key={mood.value}
                      variant={selectedMood === mood.value ? "default" : "outline"}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`flex flex-col items-center p-4 h-auto transition-all ${
                        selectedMood === mood.value ? "scale-105 shadow-lg" : "hover:scale-102"
                      }`}
                    >
                      <span className="text-2xl mb-2">{mood.emoji}</span>
                      <span className="text-xs font-medium">{mood.label}</span>
                    </Button>
                  ))}
                </div>

                <Textarea
                  value={moodNotes}
                  onChange={(e) => setMoodNotes(e.target.value)}
                  placeholder="What's on your mind? How was your day? (optional)"
                  className="mb-4"
                  rows={3}
                />
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Daily Habits</h3>
                  <Badge variant="outline" className="text-xs">
                    {habits.filter((h) => h.completed).length}/{habits.length} completed
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {habits.map((habit) => (
                    <div
                      key={habit.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        habit.completed
                          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                          : "bg-card hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => toggleHabit(habit.id)} className="p-0 h-auto">
                          {habit.completed ? (
                            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                          )}
                        </Button>
                        <span className={habit.completed ? "line-through text-muted-foreground" : ""}>
                          {habit.name}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHabit(habit.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={newHabit}
                    onChange={(e) => setNewHabit(e.target.value)}
                    placeholder="Add a new habit..."
                    className="flex-1 px-3 py-2 border rounded-md"
                    onKeyPress={(e) => e.key === "Enter" && addHabit()}
                  />
                  <Button onClick={addHabit} disabled={!newHabit.trim()}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button onClick={saveMoodEntry} disabled={selectedMood === 0} className="w-full">
                Save Today's Entry
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">{getMoodEmoji(todaysEntry.mood)}</div>
              <h3 className="text-lg font-semibold mb-2">Today's mood logged!</h3>
              <p className="text-muted-foreground mb-4">
                You felt {moodOptions.find((m) => m.value === todaysEntry.mood)?.label.toLowerCase()} today
              </p>
              {todaysEntry.habits.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Completed habits:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {todaysEntry.habits.map((habit, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {habit}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  const filteredEntries = entries.filter((e) => e.date !== todaysEntry.date)
                  setEntries(filteredEntries)
                }}
              >
                Edit Today's Entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Mood Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{entries.length}</div>
                  <div className="text-sm text-muted-foreground">Days Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{getMoodEmoji(Math.round(Number(getAverageMood())))}</div>
                  <div className="text-sm text-muted-foreground">Average Mood</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{getAverageMood()}/5</div>
                  <div className="text-sm text-muted-foreground">Mood Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Mood History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {entries.slice(0, 10).map((entry, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 bg-muted/20 rounded-lg">
                    <div className="text-center min-w-0">
                      <div className="text-2xl mb-1">{getMoodEmoji(entry.mood)}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{moodOptions.find((m) => m.value === entry.mood)?.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.mood}/5
                        </Badge>
                      </div>
                      {entry.notes && <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{entry.notes}</p>}
                      {entry.habits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {entry.habits.slice(0, 3).map((habit, habitIndex) => (
                            <Badge key={habitIndex} variant="secondary" className="text-xs">
                              {habit}
                            </Badge>
                          ))}
                          {entry.habits.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{entry.habits.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
