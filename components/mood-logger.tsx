"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Heart, Calendar, TrendingUp, Plus, Check, AlertCircle, CheckCircle } from 'lucide-react'
import { dataStore } from "@/lib/data-store"
import type { MoodEntry } from "@/lib/data-store"

interface MoodEntry {
  timestamp: string
  mood: string
  energy: number
  notes: string
  habits: string[]
}

export default function MoodLogger() {
  const [selectedMood, setSelectedMood] = useState("")
  const [energy, setEnergy] = useState(5)
  const [moodNotes, setMoodNotes] = useState("")
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [habits, setHabits] = useState<string[]>([
    "Drink 8 glasses of water",
    "Exercise for 30 minutes",
    "Meditate for 10 minutes",
    "Read for 20 minutes",
    "Practice gratitude",
  ])
  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set())
  const [newHabit, setNewHabit] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const moodOptions = [
    { value: "excellent", emoji: "😁", label: "Excellent", color: "text-green-600" },
    { value: "good", emoji: "😊", label: "Good", color: "text-blue-600" },
    { value: "okay", emoji: "😐", label: "Okay", color: "text-yellow-600" },
    { value: "down", emoji: "😟", label: "Down", color: "text-orange-600" },
    { value: "sad", emoji: "😢", label: "Sad", color: "text-red-600" },
  ]

  useEffect(() => {
    try {
      const moodHistory = dataStore.getMoodHistory()
      setEntries(moodHistory)
    } catch (err) {
      console.error("[MoodLogger] Error loading mood history:", err)
      setError("Failed to load mood history.")
    }
  }, [])

  const saveMoodEntry = () => {
    if (!selectedMood) {
      setError("Please select a mood")
      return
    }

    try {
      setError(null)
      const entry = dataStore.addMoodEntry({
        mood: selectedMood,
        energy: energy,
        notes: moodNotes,
        habits: Array.from(completedHabits),
      })

      if (entry) {
        setEntries(dataStore.getMoodHistory())
        setSelectedMood("")
        setEnergy(5)
        setMoodNotes("")
        setCompletedHabits(new Set())
        setSuccess("Mood logged successfully!")
        setTimeout(() => setSuccess(null), 3000)

        // Update streak
        dataStore.updateStreak()
      } else {
        setError("Failed to save mood entry.")
      }
    } catch (err) {
      console.error("[MoodLogger] Error saving mood:", err)
      setError("An error occurred while saving your mood.")
    }
  }

  const toggleHabit = (habit: string) => {
    const newCompleted = new Set(completedHabits)
    if (newCompleted.has(habit)) {
      newCompleted.delete(habit)
    } else {
      newCompleted.add(habit)
    }
    setCompletedHabits(newCompleted)
  }

  const addHabit = () => {
    if (!newHabit.trim()) return

    try {
      setHabits([...habits, newHabit.trim()])
      setNewHabit("")
    } catch (err) {
      console.error("[MoodLogger] Error adding habit:", err)
      setError("Failed to add habit.")
    }
  }

  const removeHabit = (habit: string) => {
    try {
      setHabits(habits.filter((h) => h !== habit))
      const newCompleted = new Set(completedHabits)
      newCompleted.delete(habit)
      setCompletedHabits(newCompleted)
    } catch (err) {
      console.error("[MoodLogger] Error removing habit:", err)
      setError("Failed to remove habit.")
    }
  }

  const getStats = () => {
    try {
      return dataStore.getMoodStats()
    } catch (err) {
      console.error("[MoodLogger] Error getting stats:", err)
      return { avgEnergy: 0, avgMood: "neutral", totalEntries: 0 }
    }
  }

  const stats = getStats()
  const todaysEntry = entries.find(
    (entry) => new Date(entry.timestamp).toDateString() === new Date().toDateString()
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6" />
            Mood & Wellness Tracker
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
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm">{error}</p>
              <Button variant="ghost" size="sm" onClick={() => setError(null)} className="ml-auto">
                ×
              </Button>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

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
                    {completedHabits.size}/{habits.length} completed
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {habits.map((habit) => (
                    <div
                      key={habit}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                        completedHabits.has(habit)
                          ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
                          : "bg-card hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Button variant="ghost" size="sm" onClick={() => toggleHabit(habit)} className="p-0 h-auto">
                          {completedHabits.has(habit) ? (
                            <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 border-2 border-muted-foreground rounded-full" />
                          )}
                        </Button>
                        <span className={completedHabits.has(habit) ? "line-through text-muted-foreground" : ""}>
                          {habit}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeHabit(habit)}
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

              <Button onClick={saveMoodEntry} disabled={selectedMood === ""} className="w-full">
                Save Today's Entry
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">{moodOptions.find((m) => m.value === todaysEntry.mood)?.emoji || "😐"}</div>
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
                  const filteredEntries = entries.filter((e) => e.timestamp !== todaysEntry.timestamp)
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
                Wellness Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{stats.totalEntries}</div>
                  <div className="text-sm text-muted-foreground">Days Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{stats.avgEnergy.toFixed(1)}/10</div>
                  <div className="text-sm text-muted-foreground">Avg Energy</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">
                    {moodOptions.find((m) => m.value === stats.avgMood)?.emoji || "😐"}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Mood</div>
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
                      <div className="text-2xl mb-1">{moodOptions.find((m) => m.value === entry.mood)?.emoji}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{moodOptions.find((m) => m.value === entry.mood)?.label}</span>
                        <Badge variant="outline" className="text-xs">
                          {entry.mood}
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
