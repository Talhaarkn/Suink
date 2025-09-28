import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, Trophy, Users, CheckCircle, XCircle, ArrowRight, Shield, Lock } from 'lucide-react'
import { SponsoredTransactionButton } from '../components/SponsoredTransactionButton'
import { sealService } from '../lib/sealService'
import { QuizTrackingService } from '../lib/quizTracking'
import { quizContractService, Answer } from '../lib/quizContractService'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
// import { Transaction } from '@mysten/sui/transactions' // Mock version

interface Question {
  id: string
  text: string
  options: string[]
  correctAnswer: number
  timeLimit: number
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
  isActive: boolean
  participantCount: number
  prizePool: number
  sealId?: string
  imageUrl?: string
  imageId?: string
}

interface Answer {
  questionIndex: number
  selectedOption: number
  timeTaken: number
  isCorrect: boolean
}

type QuizState = 'waiting' | 'playing' | 'question' | 'results' | 'final'

export function QuizPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentAccount = useCurrentAccount()
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction()
  
  console.log('🎯 QuizPage component loaded!')
  console.log('QuizPage loaded with ID:', id)
  console.log('Current account:', currentAccount)
  
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [quizState, setQuizState] = useState<QuizState>('waiting')
  const [answers, setAnswers] = useState<Answer[]>([])
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [sealVerified, setSealVerified] = useState(false)
  const [sealError, setSealError] = useState<string | null>(null)
  const [hasParticipated, setHasParticipated] = useState(false)
  const [userScore, setUserScore] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(0)
  const [isExpired, setIsExpired] = useState(false)
  const [isWinner, setIsWinner] = useState(false)
  const [rewardsDistributed, setRewardsDistributed] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [prizeDistributed, setPrizeDistributed] = useState(false)
  const [distributingPrize, setDistributingPrize] = useState(false)

  // Check if quiz ID is valid Sui object ID
  const isValidSuiObjectId = (id: string): boolean => {
    // Sui object IDs are 64 characters long and start with 0x
    return /^0x[a-fA-F0-9]{64}$/.test(id)
  }

  // Check quiz status and remaining time
  useEffect(() => {
    if (!quiz?.id || !currentAccount) return

    const checkQuizStatus = async () => {
      // Skip blockchain calls for non-Sui object IDs (debug/legacy quizzes)
      if (!quiz.id.startsWith('0x') || quiz.id.length < 10) {
        console.log('⚠️ Non-Sui object ID, skipping blockchain calls:', quiz.id)
        return
      }

      try {
        // Check if quiz is expired
        const expired = await quizContractService.isQuizExpired(quiz.id)
        setIsExpired(expired)

        if (!expired) {
          // Get remaining time
          const remaining = await quizContractService.getRemainingTimeSeconds(quiz.id)
          setRemainingTime(remaining)
        }

        // Check if user is a winner
        if (currentAccount.address) {
          const winner = await quizContractService.isWinner(quiz.id, currentAccount.address)
          setIsWinner(winner)
        }

        // Check if rewards are distributed
        const prizesDistributed = await quizContractService.arePrizesDistributed(quiz.id)
        setRewardsDistributed(prizesDistributed)

        // Auto-end quiz if expired
        if (expired && isActive) {
          try {
            await quizContractService.checkAndAutoEndQuiz(quiz.id, signAndExecute)
            console.log('Quiz auto-ended successfully')
          } catch (error) {
            console.error('Error auto-ending quiz:', error)
          }
        }
      } catch (error) {
        console.error('Error checking quiz status:', error)
      }
    }

    checkQuizStatus()
    
    // Check every 30 seconds
    const interval = setInterval(checkQuizStatus, 30000)
    return () => clearInterval(interval)
  }, [quiz?.id, currentAccount, signAndExecute])

  useEffect(() => {
    // Load quiz from blockchain and localStorage
    const loadQuiz = async () => {
      try {
        if (!id) {
          setQuiz(null)
          setLoading(false)
          return
        }

        // Check if the quiz ID is valid first (allow debug and legacy IDs)
        if (!id || (id.length < 5)) {
          console.warn('⚠️ Invalid quiz ID detected:', id)
          setQuiz(null)
          setLoading(false)
          setError('Geçersiz quiz ID. Lütfen doğru quiz linkini kullanın.')
          return
        }
        
        // Log the quiz ID type for debugging
        const idType = id.startsWith('0x') ? 'blockchain' : 
                      id.startsWith('debug_') ? 'debug' : 
                      id.startsWith('quiz_') ? 'legacy' : 'unknown'
        console.log('🔍 Loading quiz with ID type:', idType, 'ID:', id)

        // First try to load from localStorage (for created quizzes)
        const storedQuizzes = localStorage.getItem('quizzes')
        let foundQuiz = null
        
        console.log('Looking for quiz ID:', id)
        console.log('Stored quizzes:', storedQuizzes)
        
        if (storedQuizzes) {
          const quizzes = JSON.parse(storedQuizzes)
          console.log('Parsed quizzes:', quizzes)
          foundQuiz = quizzes.find((q: Quiz) => q.id === id)
          console.log('Found quiz in localStorage:', foundQuiz)
        }

        // If not found in localStorage, try to load from blockchain (only for real Sui object IDs)
        if (!foundQuiz && id.startsWith('0x') && id.length >= 10) {
          try {
            console.log('Loading quiz from blockchain:', id)
            const quizInfo = await quizContractService.getQuizInfo(id)
            if (quizInfo) {
              // Create quiz object from blockchain data
              foundQuiz = {
                id: id,
                title: quizInfo.title,
                description: quizInfo.description,
                questions: [], // Will be loaded separately if needed
                isActive: quizInfo.isActive,
                participantCount: 0, // Will be updated
                prizePool: quizInfo.prizePool / 1000000000, // Convert from MIST to SUI
                sealId: undefined,
                imageUrl: undefined,
                imageId: undefined
              }
              console.log('✅ Loaded quiz from blockchain:', foundQuiz)
            }
          } catch (blockchainError) {
            console.error('Error loading quiz from blockchain:', blockchainError)
          }
        } else if (!foundQuiz && !id.startsWith('0x')) {
          console.log('⚠️ Skipping blockchain load for non-Sui object ID:', id)
        }
        
        if (foundQuiz) {
          setQuiz(foundQuiz)
          
          // Check if user has already participated
          const participated = QuizTrackingService.hasParticipated(foundQuiz.id)
          setHasParticipated(participated)
          
          if (participated) {
            // Get user's score for this quiz
            const userParticipations = QuizTrackingService.getUserParticipations()
            const userParticipation = userParticipations.find(p => p.quizId === foundQuiz.id)
            if (userParticipation) {
              setUserScore(userParticipation.score)
            }
          }
          
          // Verify Seal protection if quiz has Seal ID
          if (foundQuiz.sealId) {
            verifySealProtection(foundQuiz.sealId)
          } else {
            setSealVerified(true) // No Seal protection, allow access
          }
        } else {
          setQuiz(null) // Quiz not found
        }
      } catch (error) {
        console.error('Error loading quiz:', error)
        setQuiz(null)
      }
      setLoading(false)
    }

    loadQuiz()
  }, [id])

  const verifySealProtection = async (sealId: string) => {
    try {
      console.log('Verifying Seal protection for quiz:', sealId)
      
      // Check time lock
      const timeLockValid = await sealService.verifyTimeLock(sealId)
      if (!timeLockValid) {
        setSealError('Quiz is time-locked and not yet available')
        return
      }

      // Check whitelist with real user address
      const userAddress = currentAccount?.address || ''
      const whitelistValid = await sealService.verifyWhitelist(sealId, userAddress)
      if (!whitelistValid) {
        setSealError('You are not authorized to access this quiz')
        return
      }

      setSealVerified(true)
      console.log('Seal protection verified successfully')
      
    } catch (error) {
      console.error('Seal verification error:', error)
      setSealError('Failed to verify quiz access permissions')
    }
  }

  useEffect(() => {
    if (quizState === 'question' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && quizState === 'question') {
      handleAnswerSubmit()
    }
  }, [timeLeft, quizState])

  const startQuiz = () => {
    setQuizState('playing')
    setCurrentQuestionIndex(0)
    setTimeLeft(quiz?.questions[0]?.timeLimit || 30)
    setQuizState('question')
  }

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswer(optionIndex)
  }

  const handleAnswerSubmit = async () => {
    if (!quiz || selectedAnswer === null || !currentAccount) return

    const currentQuestion = quiz.questions[currentQuestionIndex]
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer
    const timeTaken = (currentQuestion.timeLimit - timeLeft) * 1000 // Convert to milliseconds
    
    const newAnswer: Answer = {
      questionIndex: currentQuestionIndex,
      selectedOption: selectedAnswer,
      timeTaken,
      isCorrect
    }

    const newAnswers = [...answers, newAnswer]
    setAnswers(newAnswers)

    // Submit answer to blockchain
    try {
      const signAndExecuteTransaction = async (tx: any) => {
        const result = await signAndExecute({ transaction: tx })
        return result
      }

      await quizContractService.submitAnswer(
        quiz.id,
        currentQuestionIndex,
        selectedAnswer,
        timeTaken,
        signAndExecuteTransaction
      )

      console.log('Answer submitted to blockchain successfully')
    } catch (error) {
      console.error('Error submitting answer to blockchain:', error)
      // Continue with local logic even if blockchain submission fails
    }

    // Calculate score
    const baseScore = isCorrect ? 100 : 0
    const speedBonus = isCorrect && timeTaken < 5000 ? 50 : 0
    setScore(score + baseScore + speedBonus)

    setQuizState('results')
  }

  const nextQuestion = () => {
    if (!quiz) return

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setTimeLeft(quiz.questions[currentQuestionIndex + 1].timeLimit)
      setQuizState('question')
    } else {
      setQuizState('final')
    }
  }

  // Rewards are now distributed automatically when quiz is completed

  const distributePrizeToWinners = async () => {
    if (!quiz || !currentAccount) return

    try {
      setDistributingPrize(true)
      const signAndExecuteTransaction = async (tx: any) => {
        const result = await signAndExecute({ transaction: tx })
        return result
      }

      const success = await quizContractService.distributeWinnerRewards(
        quiz.id,
        signAndExecuteTransaction
      )
      
      if (success) {
        setPrizeDistributed(true)
        alert('🏆 Ödüller başarıyla dağıtıldı! Kazananlar ödüllerini aldı.')
      } else {
        alert('❌ Ödül dağıtımında hata oluştu. Lütfen tekrar deneyin.')
      }
    } catch (error) {
      console.error('Error distributing prize:', error)
      alert('❌ Ödül dağıtımında hata oluştu: ' + error)
    } finally {
      setDistributingPrize(false)
    }
  }

  const createQuizSubmissionTransaction = async () => {
    if (!quiz || !currentAccount) return null

    // Check if quiz ID is valid for blockchain submission
    if (!quiz.id.startsWith('0x') || quiz.id.length < 10) {
      console.warn('⚠️ Cannot submit quiz to blockchain: Non-Sui object ID:', quiz.id)
      
      // For debug/legacy quizzes, show a message but allow local completion
      const isDebugQuiz = quiz.id.startsWith('debug_') || quiz.id.startsWith('quiz_')
      
      if (isDebugQuiz) {
        console.log('📝 This is a debug/legacy quiz, completing locally...')
        // Complete quiz locally without blockchain submission
        setQuizState('final')
        setCurrentQuestionIndex(0)
        setAnswers([])
        setQuizCompleted(true)
        setHasParticipated(true)
        setUserScore(score) // Use current score
        console.log('✅ Debug quiz completed locally with score:', score)
        return null
      } else {
        alert('Bu quiz blockchain\'de bulunamıyor. Lütfen yeni bir quiz oluşturun.')
        return null
      }
    }

    try {
      // Real blockchain transaction for quiz completion
      const signAndExecuteTransaction = async (tx: any) => {
        const result = await signAndExecute({ transaction: tx })
        return result
      }

      const { participationId, sbtId } = await quizContractService.completeQuiz(
        quiz.id,
        answers,
        signAndExecuteTransaction
      )

      return { participationId, sbtId, quizId: quiz.id }
    } catch (error) {
      console.error('Error creating quiz submission transaction:', error)
      throw error
    }
  }

  const handleQuizSubmissionSuccess = async (participationId: string) => {
    console.log('Quiz completed successfully:', participationId)
    
    // Record participation
    if (quiz) {
      await QuizTrackingService.recordParticipation({
        quizId: quiz.id,
        score: score,
        completedAt: new Date().toISOString(),
        answers: answers
      })
    }
    
    // Update rewards status
    setRewardsDistributed(true)
    
    // Show success message
    alert(`🎉 Quiz completed! ${isWinner ? 'You won!' : 'Thanks for participating!'} Rewards have been distributed automatically.`)
    
    navigate('/profile')
  }

  const handleQuizSubmissionError = (error: Error) => {
    console.error('Error submitting quiz:', error)
    alert('Failed to submit quiz. Please try again.')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Quiz not found</h1>
        <button onClick={() => navigate('/')} className="quiz-button">
          Back to Home
        </button>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Quiz Header */}
      <div className="quiz-card text-center">
        {/* Quiz Image */}
        {quiz.imageUrl && (
          <div className="mb-6">
            <img 
              src={quiz.imageUrl} 
              alt={quiz.title}
              className="w-full max-w-md mx-auto h-48 object-cover rounded-xl border border-white/20"
            />
          </div>
        )}
        
        <h1 className="text-3xl font-bold text-white mb-2">{quiz.title}</h1>
        <p className="text-white/80 mb-4">{quiz.description}</p>
        
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-sui-blue" />
            <span className="text-white">{quiz.participantCount} participants</span>
          </div>
          <div className="flex items-center space-x-2">
            <Trophy className="w-4 h-4 text-quiz-yellow" />
            <span className="text-white">{quiz.prizePool} SUI prize</span>
          </div>
          {quiz.sealId && (
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-white">Seal Protected</span>
            </div>
          )}
        </div>
      </div>

      {/* Seal Verification Error */}
      {sealError && (
        <div className="quiz-card text-center bg-red-500/20 border-red-500/50">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-red-400">Access Denied</h2>
          </div>
          <p className="text-red-300 mb-6">{sealError}</p>
          <button onClick={() => navigate('/')} className="quiz-button bg-red-500 hover:bg-red-600">
            Back to Home
          </button>
        </div>
      )}

      {/* Seal Verification Loading */}
      {quiz.sealId && !sealVerified && !sealError && (
        <div className="quiz-card text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
            <Shield className="w-6 h-6 text-green-400" />
            <h2 className="text-2xl font-bold text-white">Verifying Access</h2>
          </div>
          <p className="text-white/80">Checking Seal protection permissions...</p>
        </div>
      )}

      {/* Already Participated */}
      {hasParticipated && (
        <div className="quiz-card text-center bg-yellow-500/20 border-yellow-500/50">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Lock className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-yellow-400">Already Participated</h2>
          </div>
          <p className="text-yellow-300 mb-4">
            You have already completed this quiz!
          </p>
          {userScore !== null && (
            <div className="bg-yellow-500/30 rounded-lg p-4 mb-6">
              <p className="text-yellow-200 text-lg">
                Your Score: <span className="font-bold text-white">{userScore}/{quiz.questions.length}</span>
              </p>
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <button onClick={() => navigate('/leaderboard')} className="quiz-button bg-yellow-500 hover:bg-yellow-600">
              View Leaderboard
            </button>
            <button onClick={() => navigate('/')} className="quiz-button-secondary">
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* Quiz Status Info */}
      {quiz && currentAccount && (
        <div className="quiz-card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-white/60 text-sm">Quiz Status</div>
              <div className={`font-bold ${isExpired ? 'text-red-400' : 'text-green-400'}`}>
                {isExpired ? 'Expired' : 'Active'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-sm">Remaining Time</div>
              <div className="font-bold text-white">
                {remainingTime > 0 ? `${Math.floor(remainingTime / 60)}:${(remainingTime % 60).toString().padStart(2, '0')}` : 'Ended'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-white/60 text-sm">Your Status</div>
              <div className={`font-bold ${isWinner ? 'text-yellow-400' : 'text-blue-400'}`}>
                {isWinner ? '🏆 Winner' : hasParticipated ? '✅ Participated' : '⏳ Not Participated'}
              </div>
            </div>
          </div>
          
          {/* Reward Status */}
          {rewardsDistributed && (
            <div className="mt-6 text-center">
              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <p className="text-green-300 mb-2">🎉 Rewards have been distributed!</p>
                <p className="text-green-200 text-sm">Winners received 70% of the prize pool, all participants received 30%</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quiz States */}
      {quizState === 'waiting' && sealVerified && !hasParticipated && !isExpired && (
        <div className="quiz-card text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Start?</h2>
          <p className="text-white/80 mb-6">
            This quiz has {quiz.questions.length} questions. You'll have {currentQuestion?.timeLimit || 30} seconds per question.
          </p>
          <button onClick={startQuiz} className="quiz-button text-lg px-8 py-4">
            Start Quiz
          </button>
        </div>
      )}

      {/* Quiz Expired Message */}
      {isExpired && !hasParticipated && (
        <div className="quiz-card text-center bg-red-500/20 border-red-500/50">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Clock className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-red-400">Quiz Expired</h2>
          </div>
          <p className="text-red-300 mb-4">
            This quiz has ended. You can no longer participate.
          </p>
          <button onClick={() => navigate('/')} className="quiz-button-secondary">
            Back to Home
          </button>
        </div>
      )}

      {quizState === 'question' && currentQuestion && (
        <div className="quiz-card">
          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-white/60">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-white" />
              <span className={`text-lg font-bold ${timeLeft <= 10 ? 'text-quiz-red' : 'text-white'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Question */}
          <h2 className="text-2xl font-bold text-white mb-8 text-center">
            {currentQuestion.text}
          </h2>

          {/* Answer Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`option-button ${
                  selectedAnswer === index ? 'selected' : ''
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="text-lg">{option}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleAnswerSubmit}
              disabled={selectedAnswer === null}
              className="quiz-button disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Answer
            </button>
          </div>
        </div>
      )}

      {quizState === 'results' && currentQuestion && (
        <div className="quiz-card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">Question Results</h2>
            
            {answers[answers.length - 1]?.isCorrect ? (
              <div className="flex items-center justify-center space-x-2 text-quiz-green mb-4">
                <CheckCircle className="w-8 h-8" />
                <span className="text-xl font-semibold">Correct!</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2 text-quiz-red mb-4">
                <XCircle className="w-8 h-8" />
                <span className="text-xl font-semibold">Incorrect</span>
              </div>
            )}

            <div className="text-white/80 mb-6">
              The correct answer was: <strong>{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
            </div>

            <div className="text-white/60 text-sm">
              Time taken: {answers[answers.length - 1]?.timeTaken}ms
            </div>
          </div>

          <div className="text-center">
            <button onClick={nextQuestion} className="quiz-button flex items-center space-x-2 mx-auto">
              <span>
                {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {quizState === 'final' && (
        <div className="quiz-card text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Quiz Complete! 🎉</h2>
          
          
          <div className="space-y-4 mb-8">
            <div className="text-2xl font-bold text-quiz-yellow">
              Final Score: {score}
            </div>
            <div className="text-white/80">
              You answered {answers.filter(a => a.isCorrect).length} out of {quiz.questions.length} questions correctly
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Your Performance</h3>
            <div className="space-y-2 text-sm">
              {answers.map((answer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-white/80">Question {index + 1}</span>
                  <div className="flex items-center space-x-2">
                    {answer.isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-quiz-green" />
                    ) : (
                      <XCircle className="w-4 h-4 text-quiz-red" />
                    )}
                    <span className="text-white">{answer.timeTaken}ms</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button 
            onClick={async () => {
              try {
                setLoading(true)
                const result = await createQuizSubmissionTransaction()
                if (result) {
                  await handleQuizSubmissionSuccess(result.participationId)
                }
              } catch (error) {
                handleQuizSubmissionError(error)
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
            className="quiz-button text-lg px-8 py-4 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Complete Quiz & Claim SBT'}
          </button>

          {/* Prize Distribution Section */}
          {quiz && quiz.id.startsWith('0x') && quiz.id.length >= 10 && (
            <div className="bg-white/10 rounded-xl p-6 mt-6">
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Trophy className="w-6 h-6 text-yellow-400 mr-2" />
                Prize Distribution
              </h3>
              
              {!prizeDistributed ? (
                <div className="space-y-4">
                  <p className="text-white/80">
                    Quiz bitti! Kazananlara ödül dağıtmak için butona tıklayın.
                  </p>
                  <button
                    onClick={distributePrizeToWinners}
                    disabled={distributingPrize || !quiz || !currentAccount}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {distributingPrize ? 'Distributing...' : '🏆 Distribute Prizes to Winners'}
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-green-400 text-lg font-semibold mb-2">
                    ✅ Prizes Distributed!
                  </div>
                  <p className="text-white/80">
                    Ödüller başarıyla kazananlara dağıtıldı.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

