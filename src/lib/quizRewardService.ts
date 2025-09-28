import { Quiz } from '../types/quiz'

export interface QuizResult {
  participantId: string
  score: number
  totalTime: number
  answers: Array<{
    questionIndex: number
    selectedOption: number
    timeTaken: number
    isCorrect: boolean
  }>
}

export class QuizRewardService {
  private static RESULTS_KEY = 'quiz_results'
  private static REWARDS_KEY = 'quiz_rewards'

  /**
   * Quiz sonucunu kaydet
   */
  static saveQuizResult(quizId: string, result: QuizResult): void {
    const allResults = this.getAllResults()
    const quizResults = allResults[quizId] || []
    
    // Aynı kullanıcının sonucunu güncelle veya yeni ekle
    const existingIndex = quizResults.findIndex(r => r.participantId === result.participantId)
    if (existingIndex >= 0) {
      quizResults[existingIndex] = result
    } else {
      quizResults.push(result)
    }
    
    allResults[quizId] = quizResults
    localStorage.setItem(this.RESULTS_KEY, JSON.stringify(allResults))
  }

  /**
   * Quiz sonuçlarını al
   */
  static getQuizResults(quizId: string): QuizResult[] {
    const allResults = this.getAllResults()
    return allResults[quizId] || []
  }

  /**
   * Tüm quiz sonuçlarını al
   */
  private static getAllResults(): Record<string, QuizResult[]> {
    try {
      const stored = localStorage.getItem(this.RESULTS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  /**
   * Quiz kazananını belirle
   */
  static determineWinner(quizId: string): QuizResult | null {
    const results = this.getQuizResults(quizId)
    if (results.length === 0) return null

    // En yüksek skor, en hızlı süre
    return results.reduce((winner, current) => {
      if (current.score > winner.score) return current
      if (current.score === winner.score && current.totalTime < winner.totalTime) return current
      return winner
    })
  }

  /**
   * Quiz ödülünü dağıt
   */
  static distributeReward(quizId: string, prizePool: number): {
    winner: QuizResult | null
    rewardAmount: number
    distributed: boolean
  } {
    const winner = this.determineWinner(quizId)
    
    if (!winner) {
      return {
        winner: null,
        rewardAmount: 0,
        distributed: false
      }
    }

    // Ödülü kaydet
    const rewards = this.getAllRewards()
    rewards[quizId] = {
      winnerId: winner.participantId,
      amount: prizePool,
      distributedAt: new Date().toISOString(),
      quizId
    }
    localStorage.setItem(this.REWARDS_KEY, JSON.stringify(rewards))

    return {
      winner,
      rewardAmount: prizePool,
      distributed: true
    }
  }

  /**
   * Tüm ödülleri al
   */
  private static getAllRewards(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.REWARDS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  /**
   * Quiz ödülünü al
   */
  static getQuizReward(quizId: string): any {
    const rewards = this.getAllRewards()
    return rewards[quizId] || null
  }

  /**
   * Kullanıcının kazandığı ödülleri al
   */
  static getUserRewards(userId: string): any[] {
    const rewards = this.getAllRewards()
    return Object.values(rewards).filter((reward: any) => reward.winnerId === userId)
  }

  /**
   * Quiz süresi dolduğunda otomatik ödül dağıtımı
   */
  static checkAndDistributeRewards(): void {
    const quizzes = this.getAllQuizzes()
    const now = new Date().getTime()

    Object.values(quizzes).forEach((quiz: any) => {
      if (quiz.status === 'active' && quiz.endTime) {
        const endTime = new Date(quiz.endTime).getTime()
        
        if (now >= endTime) {
          // Quiz süresi dolmuş, ödülü dağıt
          const result = this.distributeReward(quiz.id, quiz.prizePool)
          
          if (result.distributed) {
            // Quiz durumunu güncelle
            this.updateQuizStatus(quiz.id, 'ended', result.winner?.participantId || null)
            console.log(`Quiz ${quiz.id} ended. Winner: ${result.winner?.participantId}, Reward: ${result.rewardAmount} SUI`)
          }
        }
      }
    })
  }

  /**
   * Quiz durumunu güncelle
   */
  static updateQuizStatus(quizId: string, status: 'active' | 'ended' | 'completed', winner?: string | null): void {
    const quizzes = this.getAllQuizzes()
    if (quizzes[quizId]) {
      quizzes[quizId].status = status
      if (winner) {
        quizzes[quizId].winner = winner
      }
      localStorage.setItem('quizzes', JSON.stringify(quizzes))
    }
  }

  /**
   * Tüm quizleri al
   */
  private static getAllQuizzes(): Record<string, any> {
    try {
      const stored = localStorage.getItem('quizzes')
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  }

  /**
   * Periyodik ödül kontrolü başlat
   */
  static startRewardChecker(): void {
    // Her 30 saniyede bir kontrol et
    setInterval(() => {
      this.checkAndDistributeRewards()
    }, 30000)

    // İlk kontrol
    this.checkAndDistributeRewards()
  }
}

