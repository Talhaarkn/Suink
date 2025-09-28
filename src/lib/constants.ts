// Constants for SuiKnow

// App configuration
export const APP_CONFIG = {
  NAME: 'SuiKnow',
  DESCRIPTION: 'A decentralized quiz platform built on Sui blockchain',
  VERSION: '1.0.0',
  AUTHOR: 'SuiKnow Team',
  REPOSITORY: 'https://github.com/suiknow/suiknow',
  WEBSITE: 'https://suiknow.vercel.app',
}

// Network configuration
export const NETWORKS = {
  TESTNET: {
    name: 'Sui Testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    explorerUrl: 'https://suiexplorer.com',
    faucetUrl: 'https://docs.sui.io/guides/developer/getting-started/get-coins',
  },
  MAINNET: {
    name: 'Sui Mainnet',
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
    explorerUrl: 'https://suiexplorer.com',
    faucetUrl: null,
  },
} as const

// Quiz configuration
export const QUIZ_CONFIG = {
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 50,
  MIN_OPTIONS: 2,
  MAX_OPTIONS: 6,
  DEFAULT_TIME_LIMIT: 30, // seconds
  MIN_TIME_LIMIT: 10,
  MAX_TIME_LIMIT: 300,
  MIN_PRIZE_POOL: 0,
  MAX_PRIZE_POOL: 1000000, // 1000 SUI
  DEFAULT_PRIZE_POOL: 1000, // 0.001 SUI
} as const

// Scoring configuration
export const SCORING_CONFIG = {
  BASE_SCORE_CORRECT: 100,
  BASE_SCORE_INCORRECT: 0,
  SPEED_BONUS_THRESHOLD: 5000, // milliseconds
  SPEED_BONUS_AMOUNT: 50,
  PERFECT_SCORE_BONUS: 100,
  STREAK_BONUS: 25,
  MAX_STREAK_BONUS: 200,
} as const

// Prize distribution
export const PRIZE_DISTRIBUTION = {
  FIRST_PLACE: 0.5, // 50%
  SECOND_PLACE: 0.3, // 30%
  THIRD_PLACE: 0.2, // 20%
  PARTICIPATION_REWARD: 0.01, // 1% for all participants
} as const

// UI configuration
export const UI_CONFIG = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  TOAST_DURATION: 5000,
  LOADING_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
} as const

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'sui-kahoot-user-preferences',
  QUIZ_HISTORY: 'sui-kahoot-quiz-history',
  LEADERBOARD_CACHE: 'sui-kahoot-leaderboard-cache',
  THEME: 'sui-kahoot-theme',
  LANGUAGE: 'sui-kahoot-language',
  NOTIFICATIONS: 'sui-kahoot-notifications',
  WALLET_CONNECTION: 'sui-kahoot-wallet-connection',
} as const

// API endpoints
export const API_ENDPOINTS = {
  QUIZZES: '/api/quizzes',
  LEADERBOARD: '/api/leaderboard',
  USER_PROFILE: '/api/user/profile',
  SBT_COLLECTION: '/api/user/sbts',
  QUIZ_EVENTS: '/api/quiz/events',
  STATISTICS: '/api/statistics',
} as const

// Error codes
export const ERROR_CODES = {
  QUIZ_NOT_FOUND: 'QUIZ_NOT_FOUND',
  QUIZ_ALREADY_STARTED: 'QUIZ_ALREADY_STARTED',
  QUIZ_NOT_STARTED: 'QUIZ_NOT_STARTED',
  QUIZ_ENDED: 'QUIZ_ENDED',
  INVALID_ANSWER: 'INVALID_ANSWER',
  ALREADY_PARTICIPATED: 'ALREADY_PARTICIPATED',
  NOT_QUIZ_OWNER: 'NOT_QUIZ_OWNER',
  INVALID_QUESTION_COUNT: 'INVALID_QUESTION_COUNT',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  RATE_LIMITED: 'RATE_LIMITED',
} as const

// Event types
export const EVENT_TYPES = {
  QUIZ_CREATED: 'QuizCreated',
  QUIZ_STARTED: 'QuizStarted',
  QUIZ_ENDED: 'QuizEnded',
  ANSWER_SUBMITTED: 'AnswerSubmitted',
  QUIZ_COMPLETED: 'QuizCompleted',
  PRIZE_CLAIMED: 'PrizeClaimed',
  SBT_MINTED: 'SBTMinted',
} as const

// Question types
export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  FILL_IN_BLANK: 'fill_in_blank',
  MATCHING: 'matching',
  ORDERING: 'ordering',
} as const

// Difficulty levels
export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
  EXPERT: 'expert',
} as const

// Categories
export const QUIZ_CATEGORIES = {
  BLOCKCHAIN: 'blockchain',
  SUI: 'sui',
  MOVE: 'move',
  DEFI: 'defi',
  NFT: 'nft',
  GAMING: 'gaming',
  EDUCATION: 'education',
  TECHNOLOGY: 'technology',
  GENERAL: 'general',
} as const

// Theme colors
export const THEME_COLORS = {
  PRIMARY: '#4F46E5',
  SECONDARY: '#8B5CF6',
  ACCENT: '#EC4899',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#3B82F6',
  BACKGROUND: '#0F172A',
  SURFACE: '#1E293B',
  TEXT: '#F8FAFC',
  TEXT_SECONDARY: '#94A3B8',
} as const

// Breakpoints
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
  LARGE_DESKTOP: 1536,
} as const

// Z-index values
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000,
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const

// Validation rules
export const VALIDATION_RULES = {
  QUIZ_TITLE_MIN_LENGTH: 3,
  QUIZ_TITLE_MAX_LENGTH: 100,
  QUIZ_DESCRIPTION_MIN_LENGTH: 10,
  QUIZ_DESCRIPTION_MAX_LENGTH: 500,
  QUESTION_TEXT_MIN_LENGTH: 10,
  QUESTION_TEXT_MAX_LENGTH: 200,
  OPTION_TEXT_MIN_LENGTH: 1,
  OPTION_TEXT_MAX_LENGTH: 100,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
} as const

// Feature flags
export const FEATURE_FLAGS = {
  ZKLOGIN: true,
  SPONSORED_TRANSACTIONS: true,
  SEAL_PROTOCOL: true,
  WALRUS_PROTOCOL: true,
  REAL_TIME_UPDATES: true,
  ADVANCED_ANALYTICS: true,
  SOCIAL_FEATURES: true,
  MOBILE_APP: false,
} as const

// Social media links
export const SOCIAL_LINKS = {
  TWITTER: 'https://twitter.com/SuiNetwork',
  DISCORD: 'https://discord.gg/sui',
  GITHUB: 'https://github.com/MystenLabs/sui',
  TELEGRAM: 'https://t.me/SuiNetwork',
  MEDIUM: 'https://medium.com/@SuiNetwork',
} as const

// External links
export const EXTERNAL_LINKS = {
  SUI_DOCS: 'https://docs.sui.io',
  MOVE_BOOK: 'https://move-book.com',
  SUI_EXPLORER: 'https://suiexplorer.com',
  SUI_FAUCET: 'https://docs.sui.io/guides/developer/getting-started/get-coins',
  ENOKI_DOCS: 'https://docs.enoki.mystenlabs.com',
  SEAL_DOCS: 'https://github.com/MystenLabs/seal/tree/main/docs',
  WALRUS_DOCS: 'https://docs.wal.app',
} as const

