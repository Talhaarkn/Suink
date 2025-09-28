import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react'

interface QuestionTransitionProps {
  isVisible: boolean
  questionNumber: number
  totalQuestions: number
  isCorrect: boolean
  correctAnswer: string
  userAnswer: string
  timeSpent: number
  onContinue: () => void
}

export function QuestionTransition({
  isVisible,
  questionNumber,
  totalQuestions,
  isCorrect,
  correctAnswer,
  userAnswer,
  timeSpent,
  onContinue
}: QuestionTransitionProps) {
  const [showResult, setShowResult] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isVisible) {
      // Show result after a short delay
      setTimeout(() => setShowResult(true), 300)
      // Show details after result
      setTimeout(() => setShowDetails(true), 800)
    } else {
      setShowResult(false)
      setShowDetails(false)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-lg border border-white/25 rounded-2xl p-8 w-full max-w-md">
        {/* Question Progress */}
        <div className="text-center mb-6">
          <div className="text-white/60 text-sm mb-2">
            Question {questionNumber} of {totalQuestions}
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sui-blue to-sui-light-blue transition-all duration-500"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Result Icon */}
        <div className="flex justify-center mb-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
            showResult ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          } ${
            isCorrect 
              ? 'bg-green-500/20 border-4 border-green-400' 
              : 'bg-red-500/20 border-4 border-red-400'
          }`}>
            {isCorrect ? (
              <CheckCircle className="w-10 h-10 text-green-400" />
            ) : (
              <XCircle className="w-10 h-10 text-red-400" />
            )}
          </div>
        </div>

        {/* Result Text */}
        <div className="text-center mb-6">
          <h2 className={`text-2xl font-bold mb-2 transition-all duration-500 ${
            showResult ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          } ${
            isCorrect ? 'text-green-400' : 'text-red-400'
          }`}>
            {isCorrect ? 'Correct!' : 'Incorrect'}
          </h2>
          
          {showDetails && (
            <div className="space-y-3 text-white/70">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Time: {timeSpent}s</span>
              </div>
              
              {!isCorrect && (
                <div className="bg-white/5 p-3 rounded-lg">
                  <p className="text-sm">
                    <span className="text-white/60">Correct answer:</span>
                    <span className="text-green-400 ml-2">{correctAnswer}</span>
                  </p>
                  <p className="text-sm mt-1">
                    <span className="text-white/60">Your answer:</span>
                    <span className="text-red-400 ml-2">{userAnswer}</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className={`w-full quiz-button flex items-center justify-center space-x-2 transition-all duration-500 ${
            showDetails ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <span>
            {questionNumber === totalQuestions ? 'See Results' : 'Next Question'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

