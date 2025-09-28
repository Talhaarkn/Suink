import { useState, useEffect } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { User, Trophy, Plus, Award, ExternalLink, Copy, Check, Edit, Settings, Star, Target, Zap, Calendar, Users, TrendingUp } from 'lucide-react'
import { QuizTrackingService } from '../lib/quizTracking'
import { sealService } from '../lib/sealService'
import { ProfileService, UserProfile } from '../lib/profileService'
import { ProfileEditor } from '../components/ProfileEditor'
import { Link } from 'react-router-dom'

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
  sealId?: string
  imageUrl?: string
  imageId?: string
}

export function ProfilePage() {
  const currentAccount = useCurrentAccount()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [userQuizzes, setUserQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const copyQuizId = async (quizId: string) => {
    try {
      await navigator.clipboard.writeText(quizId)
      setCopiedId(quizId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (error) {
      console.error('Failed to copy quiz ID:', error)
    }
  }

  const loadUserData = async () => {
    try {
      if (!currentAccount?.address) {
        setLoading(false)
        return
      }

      // Load user profile (now async)
      const profile = await ProfileService.getProfile(currentAccount.address)
      setUserProfile(profile)

      // Load user quizzes
      const storedQuizzes = localStorage.getItem('quizzes')
      if (storedQuizzes) {
        const allQuizzes = JSON.parse(storedQuizzes)
        // Filter quizzes created by current user
        const userCreatedQuizzes = allQuizzes.filter((quiz: Quiz) => 
          quiz.createdBy === currentAccount.address
        )
        setUserQuizzes(userCreatedQuizzes)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserData()
  }, [currentAccount])

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile)
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAddress = (address: string) => {
    if (!address) return 'N/A'
    if (address.length > 20) {
      return `${address.slice(0, 6)}...${address.slice(-4)}`
    }
    return address
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen-content">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sui-light-blue"></div>
        <p className="ml-4 text-white text-lg">Loading Profile...</p>
      </div>
    )
  }

  if (!currentAccount?.address) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="quiz-card max-w-md mx-auto">
          <User className="w-16 h-16 text-white/50 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-white/70 mb-6">Please connect your wallet to view your profile</p>
          <Link to="/" className="quiz-button">
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="quiz-card max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sui-light-blue mx-auto mb-4"></div>
          <p className="text-white/70">Creating your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 min-h-screen text-white">
      {/* Profile Header */}
      <div className="quiz-card mb-8">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-sui-blue to-sui-light-blue rounded-full flex items-center justify-center overflow-hidden">
              {userProfile.avatar ? (
                <img
                  src={userProfile.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-sui-light-blue rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">{userProfile.level}</span>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-3xl font-bold text-white">{userProfile.displayName}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Edit Profile"
              >
                <Edit className="w-5 h-5 text-white/70 hover:text-white" />
              </button>
            </div>
            <p className="text-white/70 text-lg mb-2">{userProfile.bio}</p>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-white/60" />
                <span className="text-white/80">Joined {formatDate(userProfile.joinDate)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-quiz-yellow" />
                <span className="text-white/80">{userProfile.xp} XP</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-sui-light-blue" />
                <span className="text-white/80">Level {userProfile.level}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Link to="/create" className="quiz-button flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create Quiz</span>
            </Link>
            <button className="quiz-button-secondary flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="quiz-card text-center">
          <div className="w-12 h-12 bg-sui-light-blue/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Trophy className="w-6 h-6 text-sui-light-blue" />
          </div>
          <div className="text-2xl font-bold text-white">{userProfile.stats.quizzesParticipated}</div>
          <div className="text-white/60">Quizzes Played</div>
        </div>
        
        <div className="quiz-card text-center">
          <div className="w-12 h-12 bg-quiz-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="w-6 h-6 text-quiz-green" />
          </div>
          <div className="text-2xl font-bold text-white">{userProfile.stats.quizzesCreated}</div>
          <div className="text-white/60">Quizzes Created</div>
        </div>
        
        <div className="quiz-card text-center">
          <div className="w-12 h-12 bg-quiz-yellow/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-quiz-yellow" />
          </div>
          <div className="text-2xl font-bold text-white">{userProfile.stats.bestScore}</div>
          <div className="text-white/60">Best Score</div>
        </div>
        
        <div className="quiz-card text-center">
          <div className="w-12 h-12 bg-quiz-red/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-quiz-red" />
          </div>
          <div className="text-2xl font-bold text-white">{userProfile.stats.averageScore}</div>
          <div className="text-white/60">Average Score</div>
        </div>
      </div>

      {/* Badges */}
      {userProfile.badges.length > 0 && (
        <div className="quiz-card mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Badges</h2>
          <div className="flex flex-wrap gap-3">
            {userProfile.badges.map((badge, index) => (
              <div key={index} className="bg-sui-light-blue/20 text-sui-light-blue px-3 py-1 rounded-full text-sm font-medium">
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet Info */}
      <div className="quiz-card mb-8">
        <h2 className="text-2xl font-semibold text-white mb-4">Wallet Information</h2>
        <div className="flex items-center justify-between bg-white/5 p-4 rounded-lg border border-white/10">
          <div>
            <p className="text-white/60 text-sm">Connected Address</p>
            <p className="text-white text-lg font-bold">{formatAddress(currentAccount.address)}</p>
          </div>
          <button
            onClick={() => copyQuizId(currentAccount.address)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Copy Address"
          >
            {copiedId === currentAccount.address ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5 text-white/60 hover:text-white" />
            )}
          </button>
        </div>
      </div>

      {/* My Quizzes Section */}
      <div className="quiz-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">My Created Quizzes</h2>
          <div className="text-white/60">
            {userQuizzes.length} quiz{userQuizzes.length !== 1 ? 'es' : ''}
          </div>
        </div>

        {userQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white/50" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No Quizzes Yet</h3>
            <p className="text-white/60 mb-6">Create your first quiz to get started!</p>
            <Link to="/create" className="quiz-button inline-flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Create Your First Quiz</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors">
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
                  <h3 className="text-lg font-semibold text-white line-clamp-2">{quiz.title}</h3>
                  <div className="flex items-center space-x-1 text-quiz-green ml-2">
                    <div className="w-2 h-2 bg-quiz-green rounded-full animate-pulse"></div>
                    <span className="text-xs">Live</span>
                  </div>
                </div>
                
                <p className="text-white/70 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                
                {/* Quiz ID */}
                <div className="mb-4">
                  <div className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/10">
                    <div className="flex-1">
                      <span className="text-white/60 text-xs block">Quiz ID:</span>
                      <code className="text-sui-light-blue text-xs font-mono break-all">
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
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Questions</span>
                    <span className="text-white">{quiz.questions.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Participants</span>
                    <span className="text-white">{quiz.participantCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Prize Pool</span>
                    <span className="text-quiz-yellow font-semibold">{quiz.prizePool} SUI</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60">Created</span>
                    <span className="text-white/80 text-xs">{formatDate(quiz.createdAt)}</span>
                  </div>
                </div>

                {/* Seal Protection Badge */}
                {quiz.sealId && (
                  <div className="mb-4">
                    <div className="inline-flex items-center space-x-1 bg-sui-light-blue/20 text-sui-light-blue px-2 py-1 rounded text-xs">
                      <Award className="w-3 h-3" />
                      <span>Seal Protected</span>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Link 
                    to={`/quiz/${quiz.id}`}
                    className="flex-1 quiz-button text-center text-sm py-2 flex items-center justify-center space-x-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Editor Modal */}
      {isEditing && userProfile && (
        <ProfileEditor
          profile={userProfile}
          onSave={handleProfileUpdate}
          onCancel={() => setIsEditing(false)}
        />
      )}
    </div>
  )
}