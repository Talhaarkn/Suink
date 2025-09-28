import { useState, useEffect } from 'react'
import { Trophy, Medal, Star, Users, Award, Search } from 'lucide-react'
import { QuizTrackingService } from '../lib/quizTracking'
import { walrusDatabaseService } from '../lib/walrusDatabaseService'

interface LeaderboardEntry {
  rank: number
  address: string
  score: number
  completionTime: number
  quizTitle: string
  sbtCount: number
}

interface QuizLeaderboard {
  quizId: string
  quizTitle: string
  totalParticipants: number
  entries: LeaderboardEntry[]
}

export function LeaderboardPage() {
  const [leaderboards, setLeaderboards] = useState<QuizLeaderboard[]>([])
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activeTab, setActiveTab] = useState<'global' | 'quiz'>('global')
  const [selectedQuiz, setSelectedQuiz] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (address === 'anonymous_user') {
      return 'Anonymous User'
    }
    if (address.length > 20) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return address
  }

  useEffect(() => {
    // Load data from both Walrus and localStorage
    const loadLeaderboards = async () => {
      try {
        // Try to get quizzes from Walrus first, fallback to localStorage
        let quizzes: any[] = []
        try {
          quizzes = await walrusDatabaseService.getAllQuizzes()
          console.log('📊 Loaded quizzes from Walrus:', quizzes.length)
        } catch (walrusError) {
          console.warn('Failed to load from Walrus, using localStorage:', walrusError)
          const storedQuizzes = localStorage.getItem('quizzes')
          quizzes = storedQuizzes ? JSON.parse(storedQuizzes) : []
        }
        
        // If no quizzes found, create some demo data
        if (quizzes.length === 0) {
          console.log('📊 No quizzes found, creating demo data...')
          quizzes = [
            {
              id: 'demo_quiz_1',
              title: 'Sui Blockchain Basics',
              description: 'Test your knowledge of Sui blockchain',
              createdBy: '0x1234567890abcdef1234567890abcdef12345678',
              createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              participantCount: 5,
              isActive: false
            },
            {
              id: 'demo_quiz_2', 
              title: 'DeFi Fundamentals',
              description: 'Learn about decentralized finance',
              createdBy: '0xabcdef1234567890abcdef1234567890abcdef12',
              createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
              participantCount: 3,
              isActive: true
            }
          ]
          
          // Add some demo participation data
          const demoParticipations = [
            { userId: '0x1111111111111111111111111111111111111111', quizId: 'demo_quiz_1', score: 85, timestamp: Date.now() - 86000000 },
            { userId: '0x2222222222222222222222222222222222222222', quizId: 'demo_quiz_1', score: 92, timestamp: Date.now() - 85000000 },
            { userId: '0x3333333333333333333333333333333333333333', quizId: 'demo_quiz_1', score: 78, timestamp: Date.now() - 84000000 },
            { userId: '0x4444444444444444444444444444444444444444', quizId: 'demo_quiz_1', score: 95, timestamp: Date.now() - 83000000 },
            { userId: '0x5555555555555555555555555555555555555555', quizId: 'demo_quiz_1', score: 88, timestamp: Date.now() - 82000000 },
            { userId: '0x1111111111111111111111111111111111111111', quizId: 'demo_quiz_2', score: 76, timestamp: Date.now() - 43000000 },
            { userId: '0x2222222222222222222222222222222222222222', quizId: 'demo_quiz_2', score: 89, timestamp: Date.now() - 42000000 },
            { userId: '0x6666666666666666666666666666666666666666', quizId: 'demo_quiz_2', score: 91, timestamp: Date.now() - 41000000 }
          ]
          
          // Store demo data in localStorage for QuizTrackingService
          for (const participation of demoParticipations) {
            await QuizTrackingService.recordParticipation({
              quizId: participation.quizId,
              score: participation.score,
              completedAt: new Date(participation.timestamp).toISOString(),
              answers: [] // Empty answers for demo data
            }, participation.userId)
          }
        }
        
        // Get global leaderboard
        const globalData = QuizTrackingService.getGlobalLeaderboard()
        let globalEntries: LeaderboardEntry[] = globalData.map((entry, index) => ({
          rank: index + 1,
          address: formatAddress(entry.userId),
          score: entry.totalScore,
          completionTime: 0, // We don't track this in our simple system
          quizTitle: `${entry.quizCount} quizzes completed`,
          sbtCount: entry.quizCount
        }))

        // If no global data, create some demo entries
        if (globalEntries.length === 0) {
          globalEntries = [
            {
              rank: 1,
              address: formatAddress('0x1111111111111111111111111111111111111111'),
              score: 161,
              completionTime: 0,
              quizTitle: '2 quizzes completed',
              sbtCount: 2
            },
            {
              rank: 2,
              address: formatAddress('0x2222222222222222222222222222222222222222'),
              score: 181,
              completionTime: 0,
              quizTitle: '2 quizzes completed',
              sbtCount: 2
            },
            {
              rank: 3,
              address: formatAddress('0x6666666666666666666666666666666666666666'),
              score: 91,
              completionTime: 0,
              quizTitle: '1 quiz completed',
              sbtCount: 1
            }
          ]
        }
        
        // Get quiz-specific leaderboards
        const quizLeaderboards: QuizLeaderboard[] = quizzes.map((quiz: any) => {
          const quizData = QuizTrackingService.getQuizLeaderboard(quiz.id)
          let entries: LeaderboardEntry[] = quizData.map((participation, index) => ({
            rank: index + 1,
            address: formatAddress(participation.userId),
            score: participation.score,
            completionTime: 0, // We don't track this in our simple system
            quizTitle: quiz.title,
            sbtCount: 1
          }))

          // If no quiz data, create demo entries
          if (entries.length === 0 && quiz.id === 'demo_quiz_1') {
            entries = [
              {
                rank: 1,
                address: formatAddress('0x4444444444444444444444444444444444444444'),
                score: 95,
                completionTime: 0,
                quizTitle: quiz.title,
                sbtCount: 1
              },
              {
                rank: 2,
                address: formatAddress('0x2222222222222222222222222222222222222222'),
                score: 92,
                completionTime: 0,
                quizTitle: quiz.title,
                sbtCount: 1
              },
              {
                rank: 3,
                address: formatAddress('0x5555555555555555555555555555555555555555'),
                score: 88,
                completionTime: 0,
                quizTitle: quiz.title,
                sbtCount: 1
              }
            ]
          } else if (entries.length === 0 && quiz.id === 'demo_quiz_2') {
            entries = [
              {
                rank: 1,
                address: formatAddress('0x6666666666666666666666666666666666666666'),
                score: 91,
                completionTime: 0,
                quizTitle: quiz.title,
                sbtCount: 1
              },
              {
                rank: 2,
                address: formatAddress('0x2222222222222222222222222222222222222222'),
                score: 89,
                completionTime: 0,
                quizTitle: quiz.title,
                sbtCount: 1
              },
              {
                rank: 3,
                address: formatAddress('0x1111111111111111111111111111111111111111'),
                score: 76,
                completionTime: 0,
                quizTitle: quiz.title,
                sbtCount: 1
              }
            ]
          }
          
          return {
            quizId: quiz.id,
            quizTitle: quiz.title,
            totalParticipants: entries.length,
            entries
          }
        })
        
        console.log('📊 Leaderboard data loaded:', {
          globalEntries: globalEntries.length,
          quizLeaderboards: quizLeaderboards.length,
          totalQuizzes: quizzes.length,
          globalData: globalData,
          participationsRaw: 'check console for details'
        })
        
        setGlobalLeaderboard(globalEntries)
        setLeaderboards(quizLeaderboards)
        setSelectedQuiz(quizLeaderboards[0]?.quizId || '')
        setLoading(false)
        
      } catch (error) {
        console.error('Error loading leaderboards:', error)
        setLoading(false)
      }
    }

    loadLeaderboards()
  }, [])

  // Filter leaderboards based on search query
  const filteredLeaderboards = leaderboards.filter(leaderboard =>
    leaderboard.quizTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Reset selected quiz if it's not in filtered results
  useEffect(() => {
    if (selectedQuiz && !filteredLeaderboards.find(lb => lb.quizId === selectedQuiz)) {
      setSelectedQuiz(filteredLeaderboards[0]?.quizId || '')
    }
  }, [searchQuery, filteredLeaderboards, selectedQuiz])

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Medal className="w-6 h-6 text-yellow-400" />
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-white/60 font-bold">
          {rank}
        </span>
    }
  }

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/60">Leaderboard yükleniyor...</p>
        </div>
      </div>
    )
  }

  // Debug info
  console.log('🔍 LeaderboardPage render:', {
    loading,
    globalLeaderboard: globalLeaderboard.length,
    leaderboards: leaderboards.length,
    activeTab,
    selectedQuiz
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 text-shadow">
          SuiKnow Leaderboard 🏆
        </h1>
        <p className="text-white/80 text-lg">
          See who's leading the pack in SuiKnow quizzes!
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="quiz-card text-center">
          <Trophy className="w-8 h-8 text-quiz-yellow mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{globalLeaderboard.length}</div>
          <div className="text-white/60">Top Players</div>
        </div>
        <div className="quiz-card text-center">
          <Users className="w-8 h-8 text-sui-blue mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {leaderboards.reduce((sum, lb) => sum + lb.totalParticipants, 0)}
          </div>
          <div className="text-white/60">Total Participants</div>
        </div>
        <div className="quiz-card text-center">
          <Star className="w-8 h-8 text-quiz-green mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {globalLeaderboard.reduce((sum, entry) => sum + entry.sbtCount, 0)}
          </div>
          <div className="text-white/60">SBTs Earned</div>
        </div>
        <div className="quiz-card text-center">
          <Award className="w-8 h-8 text-sui-purple mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">{leaderboards.length}</div>
          <div className="text-white/60">Active Quizzes</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/10 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'global'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Global Leaderboard
        </button>
        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-300 ${
            activeTab === 'quiz'
              ? 'bg-white/20 text-white'
              : 'text-white/70 hover:text-white'
          }`}
        >
          Quiz Leaderboards
        </button>
      </div>

      {/* Global Leaderboard */}
      {activeTab === 'global' && (
        <div className="quiz-card">
          <h2 className="text-2xl font-bold text-white mb-6">Global Top Players</h2>
          
          <div className="space-y-4">
            {globalLeaderboard.length > 0 ? (
              globalLeaderboard.map((entry) => (
                <div key={entry.address} className="leaderboard-entry">
                  <div className="flex items-center space-x-4">
                    {getRankIcon(entry.rank)}
                    <div className="flex-1">
                      <div className="font-semibold text-white">{entry.address}</div>
                      <div className="text-sm text-white/60">
                        {entry.sbtCount} SBTs • Best: {entry.quizTitle}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-quiz-yellow">{entry.score}</div>
                    <div className="text-sm text-white/60">{formatTime(entry.completionTime)}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-white/60">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Henüz katılımcı yok</h3>
                <p className="text-sm">Quiz'lere katılın ve leaderboard'da yerinizi alın!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiz Leaderboards */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          {/* Quiz Search */}
          <div className="quiz-card">
            <h3 className="text-lg font-semibold text-white mb-4">Search Quizzes</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Quiz ismini yazın..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-sui-blue focus:bg-white/15 transition-all duration-300"
              />
            </div>
          </div>

          {/* Quiz Selector */}
          <div className="quiz-card">
            <h3 className="text-lg font-semibold text-white mb-4">
              Select Quiz {searchQuery && `(${filteredLeaderboards.length} found)`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeaderboards.map((leaderboard) => (
                <button
                  key={leaderboard.quizId}
                  onClick={() => setSelectedQuiz(leaderboard.quizId)}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedQuiz === leaderboard.quizId
                      ? 'border-sui-blue bg-sui-blue/20'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                >
                  <div className="font-medium text-white">{leaderboard.quizTitle}</div>
                  <div className="text-sm text-white/60 mt-1">
                    {leaderboard.totalParticipants} participants
                  </div>
                </button>
              ))}
            </div>
            {filteredLeaderboards.length === 0 && searchQuery && (
              <div className="text-center py-8 text-white/60">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>"{searchQuery}" için quiz bulunamadı</p>
                <p className="text-sm mt-2">Farklı bir arama terimi deneyin</p>
              </div>
            )}
          </div>

          {/* Selected Quiz Leaderboard */}
          {selectedQuiz && (
            <div className="quiz-card">
              <h2 className="text-2xl font-bold text-white mb-6">
                {filteredLeaderboards.find(lb => lb.quizId === selectedQuiz)?.quizTitle} Leaderboard
              </h2>
              
              <div className="space-y-4">
                {(() => {
                  const selectedLeaderboard = filteredLeaderboards.find(lb => lb.quizId === selectedQuiz)
                  const entries = selectedLeaderboard?.entries || []
                  
                  return entries.length > 0 ? (
                    entries.map((entry) => (
                      <div key={entry.address} className="leaderboard-entry">
                        <div className="flex items-center space-x-4">
                          {getRankIcon(entry.rank)}
                          <div className="flex-1">
                            <div className="font-semibold text-white">{entry.address}</div>
                            <div className="text-sm text-white/60">
                              Completed in {formatTime(entry.completionTime)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-quiz-yellow">{entry.score}</div>
                          <div className="text-sm text-white/60">points</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-white/60">
                      <Medal className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Bu quiz'de henüz katılımcı yok</h3>
                      <p className="text-sm">İlk katılımcı olun ve liderlik tablosunda yerinizi alın!</p>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

