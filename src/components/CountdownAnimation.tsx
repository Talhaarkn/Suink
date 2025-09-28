import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'

interface CountdownAnimationProps {
  duration: number
  onComplete: () => void
  onTick?: (remaining: number) => void
  size?: 'sm' | 'md' | 'lg'
  showControls?: boolean
}

export function CountdownAnimation({ 
  duration, 
  onComplete, 
  onTick, 
  size = 'md',
  showControls = false 
}: CountdownAnimationProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(true)
  const [isPaused, setIsPaused] = useState(false)

  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-6xl'
  }

  useEffect(() => {
    if (!isRunning || isPaused) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1
        onTick?.(newTime)
        
        if (newTime <= 0) {
          clearInterval(timer)
          onComplete()
          return 0
        }
        
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isRunning, isPaused, onComplete, onTick])

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleReset = () => {
    setTimeLeft(duration)
    setIsPaused(false)
    setIsRunning(true)
  }

  const progress = ((duration - timeLeft) / duration) * 100
  const isLowTime = timeLeft <= 10
  const isCritical = timeLeft <= 5

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Countdown Circle */}
      <div className="relative">
        <div className={`${sizeClasses[size]} relative flex items-center justify-center`}>
          {/* Background Circle */}
          <div className="absolute inset-0 rounded-full bg-white/10 border-4 border-white/20"></div>
          
          {/* Progress Circle */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-transparent"
            style={{
              background: `conic-gradient(from 0deg, ${
                isCritical ? '#ef4444' : isLowTime ? '#f59e0b' : '#10b981'
              } 0deg, ${
                isCritical ? '#ef4444' : isLowTime ? '#f59e0b' : '#10b981'
              } ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`
            }}
          ></div>
          
          {/* Time Display */}
          <div className={`relative z-10 font-bold ${
            isCritical ? 'text-red-400 animate-pulse' : 
            isLowTime ? 'text-yellow-400' : 'text-white'
          }`}>
            {timeLeft}
          </div>
        </div>
        
        {/* Pulse Animation for Critical Time */}
        {isCritical && (
          <div className="absolute inset-0 rounded-full bg-red-400/20 animate-ping"></div>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex space-x-2">
          <button
            onClick={handlePause}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-white" />
            ) : (
              <Pause className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>
        </div>
      )}

      {/* Status Text */}
      <div className="text-center">
        <p className={`text-sm font-medium ${
          isCritical ? 'text-red-400' : 
          isLowTime ? 'text-yellow-400' : 'text-white/70'
        }`}>
          {isCritical ? 'Time is running out!' : 
           isLowTime ? 'Hurry up!' : 'Time remaining'}
        </p>
      </div>
    </div>
  )
}

