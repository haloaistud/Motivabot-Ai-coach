"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Check } from 'lucide-react'

interface DataExportProps {
  userData: any
  goals: any[]
  moodEntries: any[]
  streak: number
}

export default function DataExport({ userData, goals, moodEntries, streak }: DataExportProps) {
  const exportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      user: userData,
      goals: goals,
      moodEntries: moodEntries,
      streak: streak,
      statistics: {
        totalGoals: goals.length,
        completedGoals: goals.filter((g) => g.completed).length,
        totalMoodEntries: moodEntries.length,
        currentStreak: streak,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `motivabot-data-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    const csvRows = [
      ["Date", "Type", "Description", "Status", "Category"].join(","),
      ...goals.map((g) =>
        [
          new Date(g.createdAt).toLocaleDateString(),
          "Goal",
          g.text.replace(/,/g, ";"),
          g.completed ? "Completed" : "Active",
          g.category,
        ].join(","),
      ),
      ...moodEntries.map((m) =>
        [
          new Date(m.timestamp).toLocaleDateString(),
          "Mood",
          m.mood,
          m.notes ? m.notes.replace(/,/g, ";") : "",
          "Wellness",
        ].join(","),
      ),
    ]

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `motivabot-data-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          Export Your Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Download your progress, goals, and mood data for backup or analysis.
        </p>

        <div className="grid gap-3">
          <Button onClick={exportData} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export as JSON
          </Button>
          <Button onClick={exportCSV} className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export as CSV
          </Button>
        </div>

        <div className="pt-4 border-t space-y-2">
          <h4 className="font-semibold text-sm">Export includes:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              All goals and progress
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Mood tracking history
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Streak information
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-600" />
              Personal preferences
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
