import React from 'react'
import { Plus, Target, Heart, Check, MessageCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface QuickAddButtonProps {
  setActiveTab: (tabId: string) => void
}

const QuickAddButton: React.FC<QuickAddButtonProps> = ({ setActiveTab }) => {
  const quickActions = [
    { id: "goals", label: "Set a New Goal", icon: Target },
    { id: "mood", label: "Log Your Mood", icon: Heart },
    { id: "habits", label: "Add a Habit", icon: Check },
    { id: "chat", label: "Ask Your AI Coach", icon: MessageCircle },
  ]

  const handleAction = (tabId: string) => {
    setActiveTab(tabId)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="default"
          size="icon" 
          className="rounded-full shadow-lg h-10 w-10 transition-transform duration-300 hover:scale-105 bg-primary hover:bg-primary/90 text-primary-foreground"
          title="Quick Add"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="text-xs font-semibold uppercase text-muted-foreground px-2 py-1">Quick Actions</div>
        {quickActions.map(action => {
          const Icon = action.icon
          return (
            <DropdownMenuItem 
              key={action.id} 
              onClick={() => handleAction(action.id)}
              className="cursor-pointer"
            >
              <Icon className="mr-2 h-4 w-4 text-primary" />
              <span>{action.label}</span>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default QuickAddButton
