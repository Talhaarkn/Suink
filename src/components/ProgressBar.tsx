import { useState, useEffect } from 'react'

interface ProgressBarProps {
  progress: number // 0-100
  size?: 'sm' | 'md' | 'lg'
  showPercentage?: boolean
  animated?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gradient'
  label?: string
}

export function ProgressBar({ 
  progress, 
  size = 'md',
  showPercentage = true,
  animated = true,
  color = 'gradient',
  label
}: ProgressBarProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-sui-blue to-sui-light-blue'
  }

  useEffect(() => {
    if (animated) {
      const duration = 1000 // 1 second
      const steps = 60
      const increment = progress / steps
      const stepDuration = duration / steps

      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        setAnimatedProgress(Math.min(increment * currentStep, progress))
        
        if (currentStep >= steps) {
          clearInterval(timer)
        }
      }, stepDuration)

      return () => clearInterval(timer)
    } else {
      setAnimatedProgress(progress)
    }
  }, [progress, animated])

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/70 text-sm font-medium">{label}</span>
          {showPercentage && (
            <span className="text-white/60 text-sm">
              {Math.round(animatedProgress)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className={`w-full ${sizeClasses[size]} bg-white/10 rounded-full overflow-hidden`}>
        <div 
          className={`h-full ${colorClasses[color]} transition-all duration-1000 ease-out ${
            animated ? 'transform' : ''
          }`}
          style={{ 
            width: `${animatedProgress}%`,
            transform: animated ? 'translateX(0)' : 'none'
          }}
        ></div>
      </div>

      {/* Percentage without label */}
      {!label && showPercentage && (
        <div className="text-center mt-1">
          <span className="text-white/60 text-xs">
            {Math.round(animatedProgress)}%
          </span>
        </div>
      )}
    </div>
  )
}

