// Utility functions for Sui Kahoot

import { formatDistanceToNow, format } from 'date-fns'

// Format time in milliseconds to readable format
export function formatTime(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Format SUI amount
export function formatSUI(amount: number): string {
  return `${(amount / 1_000_000_000).toFixed(2)} SUI`
}

// Format address (truncate middle)
export function formatAddress(address: string, start = 6, end = 4): string {
  if (!address) return ''
  if (address.length <= start + end) return address
  return `${address.slice(0, start)}...${address.slice(-end)}`
}

// Format score with commas
export function formatScore(score: number): string {
  return score.toLocaleString()
}

// Calculate rank badge color
export function getRankBadgeColor(rank: number): string {
  if (rank === 1) return 'bg-yellow-500/20 text-yellow-400'
  if (rank === 2) return 'bg-gray-400/20 text-gray-300'
  if (rank === 3) return 'bg-amber-600/20 text-amber-400'
  return 'bg-white/20 text-white'
}

// Calculate rank emoji
export function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇'
  if (rank === 2) return '🥈'
  if (rank === 3) return '🥉'
  return '🏅'
}

// Format relative time
export function formatRelativeTime(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
}

// Format absolute time
export function formatAbsoluteTime(timestamp: number): string {
  return format(new Date(timestamp), 'MMM dd, yyyy HH:mm')
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate Sui address
export function isValidSuiAddress(address: string): boolean {
  const suiAddressRegex = /^0x[a-fA-F0-9]{64}$/
  return suiAddressRegex.test(address)
}

// Calculate quiz difficulty based on questions
export function calculateDifficulty(questions: any[]): 'easy' | 'medium' | 'hard' {
  if (questions.length <= 5) return 'easy'
  if (questions.length <= 10) return 'medium'
  return 'hard'
}

// Calculate estimated quiz duration
export function calculateQuizDuration(questions: any[]): number {
  return questions.reduce((total, question) => total + (question.timeLimit || 30), 0)
}

// Generate quiz share URL
export function generateQuizShareUrl(quizId: string, baseUrl: string): string {
  return `${baseUrl}/quiz/${quizId}`
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Local storage helpers
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return defaultValue || null
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to localStorage:', error)
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  },
  
  clear: (): void => {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }
}

// Session storage helpers
export const sessionStorage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = window.sessionStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue || null
    } catch (error) {
      console.error('Error reading from sessionStorage:', error)
      return defaultValue || null
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Error writing to sessionStorage:', error)
    }
  },
  
  remove: (key: string): void => {
    try {
      window.sessionStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from sessionStorage:', error)
    }
  },
  
  clear: (): void => {
    try {
      window.sessionStorage.clear()
    } catch (error) {
      console.error('Error clearing sessionStorage:', error)
    }
  }
}

// Error handling
export function handleError(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

// Retry function
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return retry(fn, retries - 1, delay * 2)
    }
    throw error
  }
}

// Sleep function
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Generate random color
export function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

// Format large numbers
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Check if device is mobile
export function isMobile(): boolean {
  return window.innerWidth <= 768
}

// Check if device is tablet
export function isTablet(): boolean {
  return window.innerWidth > 768 && window.innerWidth <= 1024
}

// Check if device is desktop
export function isDesktop(): boolean {
  return window.innerWidth > 1024
}

// Get device type
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile()) return 'mobile'
  if (isTablet()) return 'tablet'
  return 'desktop'
}

