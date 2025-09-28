import { useState, useEffect } from 'react'
import { Trophy, Star, Zap, Target } from 'lucide-react'

interface ScoreAnimationProps {
  score: number
  maxScore: number
  showDetails?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreAnimation({ 
  score, 
  maxScore, 
  showDetails = true,
  size = 'md' 
}: ScoreAnimationProps) {
  const [animatedScore, setAnimatedScore] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  }

  const percentage = (score / maxScore) * 100
  const isExcellent = percentage >= 90
  const isGood = percentage >= 70
  const isAverage = percentage >= 50

  useEffect(() => {
    setIsAnimating(true)
    
    const duration = 2000 // 2 seconds
    const steps = 60
    const increment = score / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      setAnimatedScore(Math.min(increment * currentStep, score))
      
      if (currentStep >= steps) {
        clearInterval(timer)
        setIsAnimating(false)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [score])

  const getScoreColor = () => {
    if (isExcellent) return 'text-green-400'
    if (isGood) return 'text-blue-400'
    if (isAverage) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreIcon = () => {
    if (isExcellent) return <Trophy className="w-8 h-8 text-yellow-400" />
    if (isGood) return <Star className="w-8 h-8 text-blue-400" />
    if (isAverage) return <Target className="w-8 h-8 text-yellow-400" />
    return <Zap className="w-8 h-8 text-red-400" />
  }

  const getScoreMessage = () => {
    if (isExcellent) return 'Excellent! 🎉'
    if (isGood) return 'Great job! 👏'
    if (isAverage) return 'Good effort! 👍'
    return 'Keep trying! 💪'
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Score Display */}
      <div className="relative">
        <div className={`${sizeClasses[size]} font-bold ${getScoreColor()} transition-all duration-500 ${
          isAnimating ? 'scale-110' : 'scale-100'
        }`}>
          {Math.round(animatedScore)}
        </div>
        
        {/* Score Icon */}
        <div className={`absolute -top-2 -right-2 transition-all duration-500 ${
          isAnimating ? 'animate-bounce' : ''
        }`}>
          {getScoreIcon()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-4 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-2000 ease-out ${
            isExcellent ? 'bg-gradient-to-r from-green-400 to-green-600' :
            isGood ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
            isAverage ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
            'bg-gradient-to-r from-red-400 to-red-600'
          }`}
          style={{ width: `${(animatedScore / maxScore) * 100}%` }}
        ></div>
      </div>

      {/* Score Details */}
      {showDetails && (
        <div className="text-center space-y-2">
          <p className="text-white/70 text-sm">
            {Math.round(animatedScore)} / {maxScore} points
          </p>
          <p className={`font-semibold ${
            isExcellent ? 'text-green-400' :
            isGood ? 'text-blue-400' :
            isAverage ? 'text-yellow-400' :
            'text-red-400'
          }`}>
            {getScoreMessage()}
          </p>
          <p className="text-white/60 text-xs">
            {percentage.toFixed(1)}% accuracy
          </p>
        </div>
      )}

      {/* Celebration Particles */}
      {isExcellent && !isAnimating && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${20 + i * 10}%`,
                top: `${30 + (i % 2) * 20}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            ></div>
          ))}
        </div>
      )}
    </div>
  )
}

