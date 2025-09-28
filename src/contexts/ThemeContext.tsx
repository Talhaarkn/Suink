import { createContext, useContext, useEffect, useState } from 'react'
import { walrusDatabaseService } from '../lib/walrusDatabaseService'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  isDark: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme)

    // Apply theme
    const root = document.documentElement
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const applyTheme = () => {
      let shouldBeDark = false
      
      if (theme === 'dark') {
        shouldBeDark = true
      } else if (theme === 'light') {
        shouldBeDark = false
      } else { // auto
        shouldBeDark = mediaQuery.matches
      }
      
      setIsDark(shouldBeDark)
      
      if (shouldBeDark) {
        root.classList.add('dark')
        root.classList.remove('light')
      } else {
        root.classList.add('light')
        root.classList.remove('dark')
      }
    }

    applyTheme()
    
    // Listen for system theme changes
    mediaQuery.addEventListener('change', applyTheme)
    
    return () => {
      mediaQuery.removeEventListener('change', applyTheme)
    }
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
