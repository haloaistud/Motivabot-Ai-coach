"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Brain, User, Target, Heart, Star } from "lucide-react"

interface PersonalityTestProps {
  onComplete: (data: PersonalityData) => void
}

export interface PersonalityData {
  name: string
  age: string
  goals: string[]
  motivationStyle: string
  preferredTime: string
  challenges: string[]
  personalityType: string
}

const questions = [
  {
    id: "motivationStyle",
    question: "What motivates you most?",
    options: [
      { value: "achievement", label: "Achieving goals and milestones" },
      { value: "recognition", label: "Recognition and praise from others" },
      { value: "growth", label: "Personal growth and learning" },
      { value: "impact", label: "Making a positive impact on others" },
    ],
  },
  {
    id: "preferredTime",
    question: "When do you feel most productive?",
    options: [
      { value: "morning", label: "Early morning (6-9 AM)" },
      { value: "midday", label: "Mid-day (9 AM-2 PM)" },
      { value: "afternoon", label: "Afternoon (2-6 PM)" },
      { value: "evening", label: "Evening (6-10 PM)" },
    ],
  },
  {
    id: "personalityType",
    question: "How do you prefer to work?",
    options: [
      { value: "structured", label: "Structured with clear plans" },
      { value: "flexible", label: "Flexible and adaptable" },
      { value: "collaborative", label: "Collaborative with others" },
      { value: "independent", label: "Independent and self-directed" },
    ],
  },
]

export default function PersonalityTest({ onComplete }: PersonalityTestProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<PersonalityData>>({
    name: "",
    age: "",
    goals: [],
    challenges: [],
  })

  const totalSteps = 5
  const progress = ((currentStep + 1) / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete(formData as PersonalityData)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const updateFormData = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Welcome to MotivaBOT!</h3>
              <p className="text-muted-foreground">Let's get to know you better to provide personalized motivation</p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">What's your name?</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="age">What's your age?</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age || ""}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  placeholder="Enter your age"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Your Goals</h3>
              <p className="text-muted-foreground">What are your main goals? (Select all that apply)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Health & Fitness",
                "Career Growth",
                "Learning & Education",
                "Relationships",
                "Financial Goals",
                "Creative Projects",
                "Personal Development",
                "Travel & Adventure",
              ].map((goal) => (
                <label
                  key={goal}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={formData.goals?.includes(goal) || false}
                    onChange={(e) => {
                      const goals = formData.goals || []
                      if (e.target.checked) {
                        updateFormData("goals", [...goals, goal])
                      } else {
                        updateFormData(
                          "goals",
                          goals.filter((g) => g !== goal),
                        )
                      }
                    }}
                    className="rounded"
                  />
                  <span>{goal}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">Challenges</h3>
              <p className="text-muted-foreground">What challenges do you face? (Select all that apply)</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Procrastination",
                "Lack of Motivation",
                "Time Management",
                "Self-Doubt",
                "Stress & Anxiety",
                "Work-Life Balance",
                "Focus Issues",
                "Perfectionism",
              ].map((challenge) => (
                <label
                  key={challenge}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={formData.challenges?.includes(challenge) || false}
                    onChange={(e) => {
                      const challenges = formData.challenges || []
                      if (e.target.checked) {
                        updateFormData("challenges", [...challenges, challenge])
                      } else {
                        updateFormData(
                          "challenges",
                          challenges.filter((c) => c !== challenge),
                        )
                      }
                    }}
                    className="rounded"
                  />
                  <span>{challenge}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 3:
      case 4:
        const question = questions[currentStep - 3]
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Brain className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h3 className="text-2xl font-bold mb-2">{question.question}</h3>
            </div>
            <RadioGroup
              value={(formData[question.id as keyof PersonalityData] as string) || ""}
              onValueChange={(value) => updateFormData(question.id, value)}
            >
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.name && formData.age
      case 1:
        return formData.goals && formData.goals.length > 0
      case 2:
        return formData.challenges && formData.challenges.length > 0
      case 3:
        return formData.motivationStyle
      case 4:
        return formData.preferredTime
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-6 h-6" />
              Personality Assessment
            </CardTitle>
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent>
          {renderStep()}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack} disabled={currentStep === 0}>
              Back
            </Button>
            <Button onClick={handleNext} disabled={!canProceed()}>
              {currentStep === totalSteps - 1 ? "Complete Assessment" : "Next"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
