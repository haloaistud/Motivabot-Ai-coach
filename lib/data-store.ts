// Unified data store for all MotivaBOT features
export interface Goal {
  id: string
  title: string
  category: string
  description: string
  deadline: string
  progress: number
  completed: boolean
  createdAt: string
  updatedAt: string
}

export interface MoodEntry {
  id: string
  mood: string
  energy: number
  notes: string
  timestamp: string
  habits: string[]
}

export interface Affirmation {
  id: string
  text: string
  category: string
  author?: string
  isFavorite: boolean
}

export interface UserData {
  name: string
  goals: Goal[]
  moodHistory: MoodEntry[]
  favoriteAffirmations: string[]
  streak: number
  lastActive: string
}

class DataStore {
  private static instance: DataStore
  private storageKey = "motivabot_data"

  private constructor() {}

  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore()
    }
    return DataStore.instance
  }

  // Generic error-handled storage operations
  private safeGetItem<T>(key: string, defaultValue: T): T {
    try {
      if (typeof window === "undefined") return defaultValue
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`[DataStore] Error reading ${key}:`, error)
      return defaultValue
    }
  }

  private safeSetItem<T>(key: string, value: T): boolean {
    try {
      if (typeof window === "undefined") return false
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`[DataStore] Error saving ${key}:`, error)
      return false
    }
  }

  // User Data Operations
  getUserData(): UserData {
    return this.safeGetItem<UserData>(this.storageKey, {
      name: "",
      goals: [],
      moodHistory: [],
      favoriteAffirmations: [],
      streak: 0,
      lastActive: new Date().toISOString(),
    })
  }

  updateUserData(updates: Partial<UserData>): boolean {
    try {
      const currentData = this.getUserData()
      const updatedData = { ...currentData, ...updates, lastActive: new Date().toISOString() }
      return this.safeSetItem(this.storageKey, updatedData)
    } catch (error) {
      console.error("[DataStore] Error updating user data:", error)
      return false
    }
  }

  // Goals Operations
  addGoal(goal: Omit<Goal, "id" | "createdAt" | "updatedAt">): Goal | null {
    try {
      const newGoal: Goal = {
        ...goal,
        id: `goal_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const userData = this.getUserData()
      userData.goals.push(newGoal)
      
      if (this.updateUserData(userData)) {
        return newGoal
      }
      return null
    } catch (error) {
      console.error("[DataStore] Error adding goal:", error)
      return null
    }
  }

  updateGoal(id: string, updates: Partial<Goal>): boolean {
    try {
      const userData = this.getUserData()
      const goalIndex = userData.goals.findIndex((g) => g.id === id)
      
      if (goalIndex === -1) return false

      userData.goals[goalIndex] = {
        ...userData.goals[goalIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      return this.updateUserData(userData)
    } catch (error) {
      console.error("[DataStore] Error updating goal:", error)
      return false
    }
  }

  deleteGoal(id: string): boolean {
    try {
      const userData = this.getUserData()
      userData.goals = userData.goals.filter((g) => g.id !== id)
      return this.updateUserData(userData)
    } catch (error) {
      console.error("[DataStore] Error deleting goal:", error)
      return false
    }
  }

  getGoals(): Goal[] {
    return this.getUserData().goals
  }

  // Mood Operations
  addMoodEntry(entry: Omit<MoodEntry, "id" | "timestamp">): MoodEntry | null {
    try {
      const newEntry: MoodEntry = {
        ...entry,
        id: `mood_${Date.now()}`,
        timestamp: new Date().toISOString(),
      }

      const userData = this.getUserData()
      userData.moodHistory.push(newEntry)
      
      if (this.updateUserData(userData)) {
        return newEntry
      }
      return null
    } catch (error) {
      console.error("[DataStore] Error adding mood entry:", error)
      return null
    }
  }

  getMoodHistory(): MoodEntry[] {
    return this.getUserData().moodHistory
  }

  // Affirmation Operations
  toggleFavoriteAffirmation(affirmationId: string): boolean {
    try {
      const userData = this.getUserData()
      const index = userData.favoriteAffirmations.indexOf(affirmationId)
      
      if (index > -1) {
        userData.favoriteAffirmations.splice(index, 1)
      } else {
        userData.favoriteAffirmations.push(affirmationId)
      }

      return this.updateUserData(userData)
    } catch (error) {
      console.error("[DataStore] Error toggling favorite:", error)
      return false
    }
  }

  isFavoriteAffirmation(affirmationId: string): boolean {
    return this.getUserData().favoriteAffirmations.includes(affirmationId)
  }

  // Streak Operations
  updateStreak(): number {
    try {
      const userData = this.getUserData()
      const lastActive = new Date(userData.lastActive)
      const now = new Date()
      const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

      let newStreak = userData.streak

      if (daysDiff === 1) {
        // Consecutive day
        newStreak += 1
      } else if (daysDiff > 1) {
        // Streak broken
        newStreak = 1
      }
      // daysDiff === 0 means same day, keep streak

      this.updateUserData({ streak: newStreak })
      return newStreak
    } catch (error) {
      console.error("[DataStore] Error updating streak:", error)
      return 0
    }
  }

  getStreak(): number {
    return this.getUserData().streak
  }

  // Analytics
  getGoalStats() {
    try {
      const goals = this.getGoals()
      return {
        total: goals.length,
        completed: goals.filter((g) => g.completed).length,
        inProgress: goals.filter((g) => !g.completed).length,
        avgProgress: goals.length > 0 ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length : 0,
      }
    } catch (error) {
      console.error("[DataStore] Error calculating goal stats:", error)
      return { total: 0, completed: 0, inProgress: 0, avgProgress: 0 }
    }
  }

  getMoodStats() {
    try {
      const moodHistory = this.getMoodHistory()
      const recentMoods = moodHistory.slice(-7) // Last 7 entries
      
      if (recentMoods.length === 0) {
        return { avgEnergy: 0, avgMood: "neutral", totalEntries: 0 }
      }

      const avgEnergy = recentMoods.reduce((sum, m) => sum + m.energy, 0) / recentMoods.length
      
      return {
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        avgMood: recentMoods[recentMoods.length - 1].mood,
        totalEntries: moodHistory.length,
      }
    } catch (error) {
      console.error("[DataStore] Error calculating mood stats:", error)
      return { avgEnergy: 0, avgMood: "neutral", totalEntries: 0 }
    }
  }

  // Clear all data
  clearAllData(): boolean {
    try {
      if (typeof window === "undefined") return false
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error("[DataStore] Error clearing data:", error)
      return false
    }
  }
}

export const dataStore = DataStore.getInstance()
