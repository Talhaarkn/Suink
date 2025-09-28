export interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  timeLimit: number
}

export interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  isActive: boolean
  participantCount: number
  prizePool: number
  duration?: number // Quiz süresi (dakika)
  endTime?: string // Bitiş zamanı
  status?: 'active' | 'ended' | 'completed'
  winner?: string | null
  createdAt: string
  createdBy: string
  timeLimit: number
  imageUrl?: string
  imageId?: string
  sealId?: string
}

export interface Answer {
  questionIndex: number
  selectedOption: number
  timeTaken: number
  isCorrect: boolean
}

export type QuizState = 'waiting' | 'playing' | 'question' | 'results' | 'final'

