"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, Plus } from 'lucide-react'

interface HabitTrackerProps {
  habits: string[]
  completedHabits: Set<string>
  onToggle: (habit: string) => void
  onAdd: (habit: string) => void
  onRemove: (habit: string) => void
}

export default function HabitTracker({ habits, completedHabits, onToggle, onAdd, onRemove }: HabitTrackerProps) {
  const [newHabit, setNewHabit] = useState("")

  const addHabit = () => {
    if (newHabit.trim()) {
      onAdd(newHabit.trim())
      setNewHabit("")
    }
  }

  const completionRate = habits.length > 0 ? Math.round((completedHabits.size / habits.length) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Daily Habits
          </CardTitle>
          <Badge variant="outline">
            {completedHabits.size}/{habits.length} completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">Daily Progress</span>
            <span className="text-muted-foreground">{completionRate}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.map((habit) => (
            <div
              key={habit}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                completedHabits.has(habit) ? "bg-green-50 border-green-200" : "bg-background hover:bg-muted/50"
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <button onClick={() => onToggle(habit)} className="shrink-0">
                  {completedHabits.has(habit) ? (
                    <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 border-2 border-gray-400 rounded-full" />
                  )}
                </button>
                <span className={`text-sm ${completedHabits.has(habit) ? "line-through text-muted-foreground" : ""}`}>
                  {habit}
                </span>
              </div>
              <button onClick={() => onRemove(habit)} className="text-muted-foreground hover:text-destructive">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addHabit()}
            placeholder="Add a new habit..."
            className="flex-1 px-3 py-2 border rounded-lg text-sm"
          />
          <Button onClick={addHabit} disabled={!newHabit.trim()} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
