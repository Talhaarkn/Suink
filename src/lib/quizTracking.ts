// Quiz Participation Tracking System
import { walrusDatabaseService } from './walrusDatabaseService'

export interface QuizParticipation {
  quizId: string
  userId: string
  score: number
  completedAt: string
  answers: any[]
}

export class QuizTrackingService {
  private static PARTICIPATIONS_KEY = 'quiz_participations'

  // Get user ID based on wallet address
  static getUserId(walletAddress?: string): string {
    if (walletAddress) {
      // Use wallet address as user ID for proper account separation
      return walletAddress.toLowerCase()
    }
    
    // Fallback: try to get from current account context
    // This will be handled by the calling component
    return 'anonymous_user'
  }

  // Check if user has already participated in a quiz
  static hasParticipated(quizId: string, walletAddress?: string): boolean {
    const participations = this.getParticipations()
    const userId = this.getUserId(walletAddress)
    return participations.some(p => p.quizId === quizId && p.userId === userId)
  }

  // Record quiz participation
  static async recordParticipation(participation: Omit<QuizParticipation, 'userId'>, walletAddress?: string): Promise<void> {
    const participations = this.getParticipations()
    const userId = this.getUserId(walletAddress)
    
    const newParticipation: QuizParticipation = {
      ...participation,
      userId
    }

    // Remove any existing participation for this quiz by this user
    const filteredParticipations = participations.filter(
      p => !(p.quizId === participation.quizId && p.userId === userId)
    )

    // Add new participation
    filteredParticipations.push(newParticipation)
    
    try {
      // Try to save to Walrus database first
      const quizResult = {
        quizId: participation.quizId,
        participantId: userId,
        score: participation.score,
        totalTime: participation.answers.reduce((total, answer) => total + answer.timeTaken, 0),
        answers: participation.answers,
        completedAt: participation.completedAt
      }
      
      const saved = await walrusDatabaseService.saveQuizResult(quizResult)
      if (saved) {
        console.log('✅ Quiz result saved to Walrus database')
      } else {
        console.log('⚠️ Quiz result saved to localStorage (Walrus unavailable)')
      }
    } catch (error) {
      console.error('Error saving quiz result to Walrus:', error)
    }
    
    // Always save to localStorage as backup
    localStorage.setItem(this.PARTICIPATIONS_KEY, JSON.stringify(filteredParticipations))
    
    // Update user profile stats
    if (walletAddress) {
      try {
        const { ProfileService } = require('./profileService')
        await ProfileService.updateStatsAfterQuiz(walletAddress, participation.score)
      } catch (error) {
        console.error('Error updating profile stats:', error)
      }
    }
  }

  // Get all participations
  static getParticipations(): QuizParticipation[] {
    try {
      const stored = localStorage.getItem(this.PARTICIPATIONS_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading participations:', error)
      return []
    }
  }

  // Get participations for a specific quiz
  static getQuizParticipations(quizId: string): QuizParticipation[] {
    const participations = this.getParticipations()
    return participations.filter(p => p.quizId === quizId)
  }

  // Get user's participations
  static getUserParticipations(walletAddress?: string): QuizParticipation[] {
    const participations = this.getParticipations()
    const userId = this.getUserId(walletAddress)
    return participations.filter(p => p.userId === userId)
  }

  // Get leaderboard for a quiz
  static getQuizLeaderboard(quizId: string): QuizParticipation[] {
    const participations = this.getQuizParticipations(quizId)
    return participations.sort((a, b) => b.score - a.score)
  }

  // Get global leaderboard
  static getGlobalLeaderboard(): { userId: string; totalScore: number; quizCount: number }[] {
    const participations = this.getParticipations()
    const userStats = new Map<string, { totalScore: number; quizCount: number }>()

    participations.forEach(p => {
      const existing = userStats.get(p.userId) || { totalScore: 0, quizCount: 0 }
      userStats.set(p.userId, {
        totalScore: existing.totalScore + p.score,
        quizCount: existing.quizCount + 1
      })
    })

    return Array.from(userStats.entries())
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.totalScore - a.totalScore)
  }
}

