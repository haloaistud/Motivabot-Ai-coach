import React from 'react'
import { Button } from "@/components/ui/button"
import { Moon, Sun, Volume2, Settings } from 'lucide-react'

interface Tab {
  id: string
  label: string
  icon: React.ElementType
  description: string
}

interface SidebarNavProps {
  tabs: Tab[]
  activeTab: string
  setActiveTab: (tabId: string) => void
  userName: string
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

const SidebarNav: React.FC<SidebarNavProps> = ({ 
  tabs, 
  activeTab, 
  setActiveTab, 
  userName, 
  theme, 
  toggleTheme 
}) => {
  const mainTabs = tabs.filter(t => t.id !== 'export')
  const exportTab = tabs.find(t => t.id === 'export')

  return (
    <div className="sidebar hidden lg:flex flex-col justify-between p-4 bg-card shadow-lg dark:bg-card/80 border-r border-border h-screen sticky top-0">
      <div>
        {/* Logo/Branding */}
        <div className="flex items-center gap-2 mb-8 mt-2 p-2">
          <Volume2 className="h-7 w-7 text-primary" />
          <h2 className="text-xl font-bold font-serif text-primary">MotivaBOT</h2>
        </div>
        
        {/* User Profile Snapshot */}
        <div className="p-2 mb-6 border-b border-border/50 pb-4">
          <p className="text-xs text-muted-foreground">Welcome back,</p>
          <h3 className="text-lg font-semibold truncate text-foreground">{userName}</h3>
        </div>
        
        {/* Main Navigation Links */}
        <nav className="space-y-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200
                  ${activeTab === tab.id 
                    ? 'bg-primary/20 text-primary font-bold border-l-4 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-sm">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
      
      {/* Bottom Controls: Export and Theme Toggle */}
      <div className="space-y-2 border-t border-border/50 pt-4">
        {exportTab && (
          <button
            onClick={() => setActiveTab(exportTab.id)}
            className={`w-full text-left flex items-center p-3 rounded-lg transition-colors duration-200
              ${activeTab === exportTab.id 
                ? 'bg-primary/20 text-primary font-bold border-l-4 border-primary' 
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
          >
            <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
            <span className="text-sm">{exportTab.label}</span>
          </button>
        )}
        
        {/* Theme Toggle */}
        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
          <span className="text-sm text-foreground">Theme: {theme === 'light' ? 'Light' : 'Dark'}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-8 w-8 transition-all duration-300 hover:bg-primary/10"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SidebarNav
