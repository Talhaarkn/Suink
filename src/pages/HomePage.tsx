import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Play, Trophy, Users, Zap, Star, Clock, Copy, Check } from 'lucide-react'
import { JoinQuizById } from '../components/JoinQuizById'
import { walrusDatabaseService } from '../lib/walrusDatabaseService'

interface Quiz {
  id: string
  title: string
  description: string
  questions: any[]
  participantCount: number
  prizePool: number
  isActive: boolean
  createdBy: string
  createdAt: string
  duration?: number // Quiz süresi (dakika)
  endTime?: string // Bitiş zamanı
  status?: 'active' | 'ended' | 'completed'
  winner?: string | null
  sealId?: string
  imageUrl?: string
  imageId?: string
}

export function HomePage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyQuizId = async (quizId: string) => {
    try {
      await navigator.clipboard.writeText(quizId)
      setCopiedId(quizId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy quiz ID:', error)
    }
  }

  const loadQuizzes = async () => {
    try {
      // Debug: Check what's in localStorage
      const storedQuizzes = localStorage.getItem('quizzes')
      if (storedQuizzes) {
        const allStoredQuizzes = JSON.parse(storedQuizzes)
        console.log('🔍 All stored quizzes in localStorage:', allStoredQuizzes.length)
        console.log('🔍 Stored quiz IDs:', allStoredQuizzes.map((q: any) => ({
          id: q.id,
          title: q.title,
          type: q.id.startsWith('0x') ? 'blockchain' : 
                q.id.startsWith('debug_') ? 'debug' : 
                q.id.startsWith('quiz_') ? 'legacy' : 'unknown'
        })))
      }
      
      // Try to load from Walrus database first
      const walrusQuizzes = await walrusDatabaseService.getAllQuizzes()
      if (walrusQuizzes.length > 0) {
        // Helper: get timestamp for sorting (createdAt or id-based fallback)
        const ts = (q: any) => {
          if (q?.createdAt) {
            const t = new Date(q.createdAt).getTime()
            if (!Number.isNaN(t)) return t
          }
          if (q?.id && typeof q.id === 'string') {
            const m = q.id.match(/quiz_(\d+)_/)
            if (m) return parseInt(m[1], 10)
          }
          return 0
        }

        const processedQuizzes = walrusQuizzes
          .filter((q: any) => {
            // Show quizzes with valid Sui object IDs or debug IDs
            return q?.id && (
              (q.id.startsWith('0x') && q.id.length >= 10) || 
              q.id.startsWith('debug_') ||
              q.id.startsWith('quiz_')
            )
          })
          .map((q: any) => {
            // Infer isActive from endTime if missing
            if (q?.endTime && typeof q.isActive === 'undefined') {
              const now = Date.now()
              const end = new Date(q.endTime).getTime()
              return { ...q, isActive: end > now }
            }
            return q
          })
          .sort((a: any, b: any) => ts(b) - ts(a))
        
        setQuizzes(processedQuizzes)
        console.log('✅ Loaded quizzes from Walrus database:', processedQuizzes.length)
        console.log('📋 Quiz details:', processedQuizzes.map(q => ({
          id: q.id,
          title: q.title,
          isActive: q.isActive,
          isValidId: /^0x[a-fA-F0-9]{64}$/.test(q.id),
          isDebugId: q.id.startsWith('debug_'),
          isQuizId: q.id.startsWith('quiz_')
        })))
      } else {
        // Fallback to localStorage
        const storedQuizzes = localStorage.getItem('quizzes')
        if (storedQuizzes) {
          const parsedQuizzes = JSON.parse(storedQuizzes)
          const ts = (q: any) => {
            if (q?.createdAt) {
              const t = new Date(q.createdAt).getTime()
              if (!Number.isNaN(t)) return t
            }
            if (q?.id && typeof q.id === 'string') {
              const m = q.id.match(/quiz_(\d+)_/)
              if (m) return parseInt(m[1], 10)
            }
            return 0
          }

          const validQuizzes = parsedQuizzes
            .filter((q: any) => {
              // Show quizzes with valid Sui object IDs or debug IDs
              return q?.id && (
                (q.id.startsWith('0x') && q.id.length >= 10) || 
                q.id.startsWith('debug_') ||
                q.id.startsWith('quiz_')
              )
            })
            .map((q: any) => {
              if (q?.endTime && typeof q.isActive === 'undefined') {
                const now = Date.now()
                const end = new Date(q.endTime).getTime()
                return { ...q, isActive: end > now }
              }
              return q
            })
            .sort((a: any, b: any) => ts(b) - ts(a))
          
          setQuizzes(validQuizzes)
          console.log('⚠️ Loaded quizzes from localStorage (Walrus unavailable):', validQuizzes.length)
          console.log('📋 localStorage Quiz details:', validQuizzes.map(q => ({
            id: q.id,
            title: q.title,
            isActive: q.isActive,
            isValidId: /^0x[a-fA-F0-9]{64}$/.test(q.id),
            isDebugId: q.id.startsWith('debug_'),
            isQuizId: q.id.startsWith('quiz_')
          })))
        } else {
          setQuizzes([])
        }
      }
    } catch (error) {
      console.error('Error loading quizzes:', error)
      // Fallback to localStorage
      try {
        const storedQuizzes = localStorage.getItem('quizzes')
        if (storedQuizzes) {
          const parsedQuizzes = JSON.parse(storedQuizzes)
          setQuizzes(parsedQuizzes)
        } else {
          setQuizzes([])
        }
      } catch (fallbackError) {
        console.error('Fallback loading failed:', fallbackError)
        setQuizzes([])
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    loadQuizzes()
    
    // Listen for storage changes to refresh quizzes when new ones are created
    const handleStorageChange = () => {
      loadQuizzes()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also refresh when page becomes visible (in case of same-tab updates)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadQuizzes()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
                <h1 className="text-5xl font-bold text-white mb-4 text-shadow">
                  Welcome to SuiKnow! 🎯
                </h1>
        <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
          Play interactive quizzes on the Sui blockchain, earn SBT rewards, and compete with players worldwide!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/create" className="quiz-button text-lg px-8 py-4 inline-flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Create Quiz</span>
          </Link>
          <Link to="/leaderboard" className="quiz-button-secondary text-lg px-8 py-4 inline-flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>View Leaderboard</span>
          </Link>
        </div>
      </div>

      {/* Join Quiz by ID */}
      <JoinQuizById />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="quiz-card text-center">
          <Users className="w-8 h-8 text-sui-light-blue mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">1,247</div>
          <div className="text-white/60">Active Players</div>
        </div>
        <div className="quiz-card text-center">
          <Trophy className="w-8 h-8 text-quiz-yellow mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">89</div>
          <div className="text-white/60">Quizzes Completed</div>
        </div>
        <div className="quiz-card text-center">
          <Zap className="w-8 h-8 text-quiz-green mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">45,000</div>
          <div className="text-white/60">SUI Rewarded</div>
        </div>
      </div>

      {/* Active Quizzes */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold text-white text-shadow">
            Active Quizzes
          </h2>
          <button
            onClick={loadQuizzes}
            className="px-4 py-2 bg-sui-light-blue text-white rounded-lg hover:bg-sui-light-blue/80 transition-colors flex items-center space-x-2"
          >
            <span>🔄</span>
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.filter(quiz => {
            // Temporarily show all active quizzes for debugging
            const isValidSuiObjectId = /^0x[a-fA-F0-9]{64}$/.test(quiz.id)
            const shouldShow = quiz.isActive // Remove ID validation temporarily
            console.log(`🔍 Quiz filter: ${quiz.title} - isActive: ${quiz.isActive}, isValidId: ${isValidSuiObjectId}, shouldShow: ${shouldShow}`)
            return shouldShow
          }).map((quiz) => (
            <div key={quiz.id} className="quiz-card hover:scale-105 transition-transform duration-300">
              {/* Quiz Image */}
              {quiz.imageUrl && (
                <div className="mb-4">
                  <img 
                    src={quiz.imageUrl} 
                    alt={quiz.title}
                    className="w-full h-32 object-cover rounded-lg border border-white/20"
                  />
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{quiz.title}</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-quiz-green">
                    <div className="w-2 h-2 bg-quiz-green rounded-full animate-pulse"></div>
                    <span className="text-sm">Live</span>
                  </div>
                </div>
              </div>

              {/* Quiz ID */}
              <div className="mb-4">
                <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                  <div className="flex-1">
                    <span className="text-white/60 text-xs block">Quiz ID:</span>
                    <code className="text-sui-light-blue text-sm font-mono break-all">
                      {quiz.id}
                    </code>
                  </div>
                  <button
                    onClick={() => copyQuizId(quiz.id)}
                    className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
                    title="Copy Quiz ID"
                  >
                    {copiedId === quiz.id ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-white/60 hover:text-white" />
                    )}
                  </button>
                </div>
              </div>
              
              <p className="text-white/70 mb-4">{quiz.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Questions</span>
                  <span className="text-white">{quiz.questions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Participants</span>
                  <span className="text-white">{quiz.participantCount}</span>
                </div>
                {quiz.endTime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Time Left</span>
                    </span>
                    <span className="text-white">
                      {(() => {
                        const now = new Date().getTime()
                        const end = new Date(quiz.endTime).getTime()
                        const diff = end - now
                        
                        if (diff <= 0) return 'Expired'
                        
                        const hours = Math.floor(diff / (1000 * 60 * 60))
                        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                        
                        if (hours > 0) return `${hours}h ${minutes}m`
                        return `${minutes}m`
                      })()}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Prize Pool</span>
                  <span className="text-quiz-yellow font-semibold">{quiz.prizePool} SUI</span>
                </div>
              </div>
              
              <Link 
                to={`/quiz/${quiz.id}`}
                className="quiz-button w-full text-center block"
                onClick={() => {
                  console.log('Join button clicked for quiz:', quiz.id)
                  console.log('Quiz object:', quiz)
                  console.log('Navigating to:', `/quiz/${quiz.id}`)
                }}
              >
                Join Quiz
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Quizzes */}
      <div>
        <h2 className="text-3xl font-bold text-white mb-6 text-shadow">
          Recent Quizzes
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.filter(quiz => !quiz.isActive).map((quiz) => (
            <div key={quiz.id} className="quiz-card opacity-75">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">{quiz.title}</h3>
                <div className="flex items-center space-x-1 text-white/60">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    {(() => {
                      if (!quiz.endTime) return 'Ended'
                      const now = new Date().getTime()
                      const end = new Date(quiz.endTime).getTime()
                      const diff = end - now
                      if (diff <= 0) return 'Ended'
                      const hours = Math.floor(diff / (1000 * 60 * 60))
                      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
                      if (hours > 0) return `${hours}h ${minutes}m left`
                      return `${minutes}m left`
                    })()}
                  </span>
                </div>
              </div>
              
              <p className="text-white/70 mb-4">{quiz.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Questions</span>
                  <span className="text-white">{quiz.questions.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Final Participants</span>
                  <span className="text-white">{quiz.participantCount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">Prize Pool</span>
                  <span className="text-quiz-yellow font-semibold">{quiz.prizePool} SUI</span>
                </div>
              </div>
              
              <Link 
                to={`/quiz/${quiz.id}`}
                className="quiz-button-secondary w-full text-center block"
              >
                View Results
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

