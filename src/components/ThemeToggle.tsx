import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'auto', icon: Monitor, label: 'Auto' }
  ] as const

  return (
    <div className="flex items-center space-x-1 bg-gradient-to-r from-gray-700/80 to-gray-800/80 dark:bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-gray-600/60 dark:border-white/20">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => {
            console.log('Setting theme to:', value)
            setTheme(value)
          }}
          className={`p-2 rounded-md transition-all duration-200 ${
            theme === value
              ? 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 dark:bg-white/20 text-white dark:text-white shadow-lg transform scale-105'
              : 'text-white/80 dark:text-white/60 hover:text-white dark:hover:text-white hover:bg-gradient-to-r hover:from-gray-600/60 hover:to-gray-700/60 dark:hover:bg-white/10'
          }`}
          title={label}
        >
          <Icon className="w-4 h-4" />
        </button>
      ))}
    </div>
  )
}
