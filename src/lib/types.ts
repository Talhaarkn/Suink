// Type definitions for Sui Kahoot

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
  owner: string
  startTime: number
  endTime: number
  isActive: boolean
  participantCount: number
  prizePool: number
  createdAt: number
}

export interface Answer {
  questionIndex: number
  selectedOption: number
  timeTaken: number
  isCorrect: boolean
}

export interface Participation {
  id: string
  quizId: string
  participant: string
  answers: Answer[]
  totalScore: number
  completionTime: number
  rank: number
}

export interface SBT {
  id: string
  quizId: string
  participant: string
  score: number
  rank: number
  completionDate: string
  quizTitle: string
}

export interface LeaderboardEntry {
  rank: number
  participant: string
  score: number
  completionTime: number
  quizTitle: string
  sbtCount: number
}

export interface QuizStats {
  totalQuizzes: number
  totalScore: number
  averageScore: number
  bestRank: number
  totalSBTs: number
  joinDate: string
}

export interface UserProfile {
  address: string
  username: string
  totalQuizzes: number
  totalScore: number
  averageScore: number
  bestRank: number
  sbtCollection: SBT[]
  joinDate: string
}

// Event types
export interface QuizCreatedEvent {
  quiz_id: string
  title: string
  owner: string
  question_count: number
  prize_pool: number
}

export interface QuizCompletedEvent {
  quiz_id: string
  participant: string
  total_score: number
  rank: number
  sbt_minted: boolean
}

export interface AnswerSubmittedEvent {
  quiz_id: string
  participant: string
  question_index: number
  is_correct: boolean
  time_taken: number
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// Wallet types
export interface WalletInfo {
  address: string
  publicKey: string
  isConnected: boolean
  balance?: number
}

// Transaction types
export interface TransactionResult {
  txDigest: string
  effects: any
  events: any[]
  objectChanges: any[]
}

// Configuration types
export interface AppConfig {
  network: 'testnet' | 'mainnet'
  packageId: string
  rpcUrl: string
  features: {
    zkLogin: boolean
    sponsoredTransactions: boolean
    sealProtocol: boolean
    walrusProtocol: boolean
  }
}

// Error types
export interface AppError {
  code: string
  message: string
  details?: any
}

// Quiz creation types
export interface CreateQuizData {
  title: string
  description: string
  questions: Question[]
  prizePool: number
  duration?: number
}

// Quiz participation types
export interface JoinQuizData {
  quizId: string
  participant: string
}

// SBT types
export interface SBTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
}

// Leaderboard types
export interface LeaderboardFilters {
  quizId?: string
  timeRange?: 'day' | 'week' | 'month' | 'all'
  limit?: number
  offset?: number
}

// Search types
export interface SearchFilters {
  query?: string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  isActive?: boolean
  minPrize?: number
  maxPrize?: number
}

// Notification types
export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
}

// Theme types
export interface Theme {
  name: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
  }
}

// Settings types
export interface UserSettings {
  theme: Theme
  notifications: {
    quizUpdates: boolean
    prizeClaims: boolean
    leaderboardChanges: boolean
  }
  privacy: {
    showProfile: boolean
    showScores: boolean
    showActivity: boolean
  }
}

