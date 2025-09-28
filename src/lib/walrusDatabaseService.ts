import { realWalrusService } from './realWalrusService'

export interface QuizData {
  id: string
  title: string
  description: string
  questions: any[]
  prizePool: number
  duration?: number
  endTime?: string
  status?: 'active' | 'ended' | 'completed'
  winner?: string | null
  createdAt: string
  createdBy: string
  participantCount: number
  timeLimit: number
  imageUrl?: string
  imageId?: string
  sealId?: string
}

export interface QuizResult {
  quizId: string
  participantId: string
  score: number
  totalTime: number
  answers: any[]
  completedAt: string
}

export interface UserProfile {
  walletAddress: string
  displayName: string
  bio: string
  avatar: string
  level: number
  xp: number
  stats: {
    quizzesCreated: number
    quizzesParticipated: number
    totalScore: number
  }
  badges: string[]
  preferences: {
    theme: string
    language: string
  }
  lastUpdated: string
}

export class WalrusDatabaseService {
  private walrusService: any
  private bucketId: string = 'sui-know-database'

  constructor() {
    this.walrusService = realWalrusService
  }

  // Quiz Operations
  async saveQuiz(quiz: QuizData): Promise<boolean> {
    try {
      console.log('💾 Saving quiz to Walrus database:', quiz.id)
      
      const quizData = {
        type: 'quiz',
        data: quiz,
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0'
        }
      }

      // Create a JSON file for the quiz data
      const quizFile = new File(
        [JSON.stringify(quizData, null, 2)],
        `quiz_${quiz.id}.json`,
        { type: 'application/json' }
      )

      const result = await this.walrusService.uploadFile(quizFile, true)
      
      if (result.fileId) {
        console.log('✅ Quiz saved to Walrus:', result.fileId)
        // Also save to localStorage as backup
        this.saveToLocalStorage('quizzes', quiz.id, quiz)
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Failed to save quiz to Walrus:', error)
      // Fallback to localStorage
      this.saveToLocalStorage('quizzes', quiz.id, quiz)
      return false
    }
  }

  async getQuiz(quizId: string): Promise<QuizData | null> {
    try {
      console.log('📖 Loading quiz from Walrus database:', quizId)
      
      // Try to get from Walrus first
      const walrusQuiz = await this.getFromWalrus(`quiz_${quizId}.json`)
      if (walrusQuiz) {
        return walrusQuiz.data
      }
      
      // Fallback to localStorage
      return this.getFromLocalStorage('quizzes', quizId)
    } catch (error) {
      console.error('❌ Failed to load quiz from Walrus:', error)
      // Fallback to localStorage
      return this.getFromLocalStorage('quizzes', quizId)
    }
  }

  async getAllQuizzes(): Promise<QuizData[]> {
    try {
      console.log('📚 Loading all quizzes from Walrus database')
      
      // Try to get from Walrus first
      const walrusQuizzes = await this.getAllFromWalrus('quiz_')
      if (walrusQuizzes.length > 0) {
        return walrusQuizzes.map(q => q.data)
      }
      
      // Fallback to localStorage
      return this.getAllFromLocalStorage('quizzes')
    } catch (error) {
      console.error('❌ Failed to load quizzes from Walrus:', error)
      // Fallback to localStorage
      return this.getAllFromLocalStorage('quizzes')
    }
  }

  async updateQuiz(quizId: string, updates: Partial<QuizData>): Promise<boolean> {
    try {
      const existingQuiz = await this.getQuiz(quizId)
      if (!existingQuiz) return false

      const updatedQuiz = { ...existingQuiz, ...updates }
      return await this.saveQuiz(updatedQuiz)
    } catch (error) {
      console.error('❌ Failed to update quiz:', error)
      return false
    }
  }

  // Quiz Results Operations
  async saveQuizResult(result: QuizResult): Promise<boolean> {
    try {
      console.log('💾 Saving quiz result to Walrus database:', result.quizId)
      
      const resultData = {
        type: 'quiz_result',
        data: result,
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0'
        }
      }

      const resultFile = new File(
        [JSON.stringify(resultData, null, 2)],
        `result_${result.quizId}_${result.participantId}.json`,
        { type: 'application/json' }
      )

      const walrusResult = await this.walrusService.uploadFile(resultFile, false) // Private
      
      if (walrusResult.fileId) {
        console.log('✅ Quiz result saved to Walrus:', walrusResult.fileId)
        // Also save to localStorage as backup
        this.saveToLocalStorage('quiz_results', `${result.quizId}_${result.participantId}`, result)
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Failed to save quiz result to Walrus:', error)
      // Fallback to localStorage
      this.saveToLocalStorage('quiz_results', `${result.quizId}_${result.participantId}`, result)
      return false
    }
  }

  async getQuizResults(quizId: string): Promise<QuizResult[]> {
    try {
      // Try to get from Walrus first
      const walrusResults = await this.getAllFromWalrus(`result_${quizId}_`)
      if (walrusResults.length > 0) {
        return walrusResults.map(r => r.data)
      }
      
      // Fallback to localStorage
      return this.getAllFromLocalStorage('quiz_results').filter(r => r.quizId === quizId)
    } catch (error) {
      console.error('❌ Failed to load quiz results from Walrus:', error)
      // Fallback to localStorage
      return this.getAllFromLocalStorage('quiz_results').filter(r => r.quizId === quizId)
    }
  }

  // User Profile Operations
  async saveUserProfile(profile: UserProfile): Promise<boolean> {
    try {
      console.log('💾 Saving user profile to Walrus database:', profile.walletAddress)
      
      const profileData = {
        type: 'user_profile',
        data: profile,
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0'
        }
      }

      const profileFile = new File(
        [JSON.stringify(profileData, null, 2)],
        `profile_${profile.walletAddress}.json`,
        { type: 'application/json' }
      )

      const result = await this.walrusService.uploadFile(profileFile, false) // Private
      
      if (result.fileId) {
        console.log('✅ User profile saved to Walrus:', result.fileId)
        // Do NOT save large profiles to localStorage to avoid quota issues
        return true
      }
      
      return false
    } catch (error) {
      console.error('❌ Failed to save user profile to Walrus:', error)
      // Skip localStorage fallback for profiles to prevent quota errors
      return false
    }
  }

  async getUserProfile(walletAddress: string): Promise<UserProfile | null> {
    try {
      // Try to get from Walrus first
      const walrusProfile = await this.getFromWalrus(`profile_${walletAddress}.json`)
      if (walrusProfile) {
        return walrusProfile.data
      }
      
      // Fallback to localStorage
      return this.getFromLocalStorage('user_profiles', walletAddress)
    } catch (error) {
      console.error('❌ Failed to load user profile from Walrus:', error)
      // Fallback to localStorage
      return this.getFromLocalStorage('user_profiles', walletAddress)
    }
  }

  // Helper Methods
  private async getFromWalrus(filename: string): Promise<any> {
    try {
      // This would need to be implemented in WalrusService
      // For now, return null to use localStorage fallback
      return null
    } catch (error) {
      console.error('Error getting from Walrus:', error)
      return null
    }
  }

  private async getAllFromWalrus(prefix: string): Promise<any[]> {
    try {
      // This would need to be implemented in WalrusService
      // For now, return empty array to use localStorage fallback
      return []
    } catch (error) {
      console.error('Error getting all from Walrus:', error)
      return []
    }
  }

  // LocalStorage fallback methods
  private saveToLocalStorage(key: string, id: string, data: any): void {
    try {
      const existingRaw = this.getAllFromLocalStorage(key)
      const existing: any[] = Array.isArray(existingRaw) ? existingRaw : []

      // Determine identifier key based on collection
      const idKey = key === 'user_profiles' ? 'walletAddress' : 'id'
      const index = existing.findIndex((item: any) => {
        if (item && typeof item === 'object') {
          return (item[idKey] === id) || (item.walletAddress === id) || (item.id === id)
        }
        return false
      })
      
      if (index >= 0) {
        existing[index] = data
      } else {
        existing.push(data)
      }
      
      localStorage.setItem(key, JSON.stringify(existing))
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  private getFromLocalStorage(key: string, id: string): any {
    try {
      const all = this.getAllFromLocalStorage(key)
      return all.find(item => item.id === id || item.walletAddress === id) || null
    } catch (error) {
      console.error('Error getting from localStorage:', error)
      return null
    }
  }

  private getAllFromLocalStorage(key: string): any[] {
    try {
      const stored = localStorage.getItem(key)
      const parsed = stored ? JSON.parse(stored) : []
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      console.error('Error getting all from localStorage:', error)
      return []
    }
  }

  // Health Check
  async healthCheck(): Promise<{
    walrus: boolean
    localStorage: boolean
    status: 'healthy' | 'degraded' | 'offline'
  }> {
    try {
      // Test Walrus connection
      const walrusHealthy = await this.testWalrusConnection()
      
      // Test localStorage
      const localStorageHealthy = this.testLocalStorage()
      
      let status: 'healthy' | 'degraded' | 'offline'
      if (walrusHealthy && localStorageHealthy) {
        status = 'healthy'
      } else if (localStorageHealthy) {
        status = 'degraded'
      } else {
        status = 'offline'
      }
      
      return {
        walrus: walrusHealthy,
        localStorage: localStorageHealthy,
        status
      }
    } catch (error) {
      console.error('Health check failed:', error)
      return {
        walrus: false,
        localStorage: false,
        status: 'offline'
      }
    }
  }

  private async testWalrusConnection(): Promise<boolean> {
    try {
      // Test with a small file
      const testFile = new File(['test'], 'test.txt', { type: 'text/plain' })
      await this.walrusService.uploadFile(testFile, true)
      return true
    } catch (error) {
      console.error('Walrus connection test failed:', error)
      return false
    }
  }

  private testLocalStorage(): boolean {
    try {
      const testKey = 'walrus_test'
      const testValue = 'test'
      localStorage.setItem(testKey, testValue)
      const retrieved = localStorage.getItem(testKey)
      localStorage.removeItem(testKey)
      return retrieved === testValue
    } catch (error) {
      console.error('LocalStorage test failed:', error)
      return false
    }
  }
}

// Global instance
export const walrusDatabaseService = new WalrusDatabaseService()
