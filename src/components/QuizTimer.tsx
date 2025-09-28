import { useState, useEffect } from 'react'
import { Clock, Trophy, AlertTriangle } from 'lucide-react'

interface QuizTimerProps {
  endTime: string
  onTimeUp: () => void
  prizePool: number
  winner?: string | null
  status?: 'active' | 'ended' | 'completed'
}

export function QuizTimer({ endTime, onTimeUp, prizePool, winner, status }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endTime).getTime()
      const difference = end - now

      if (difference <= 0) {
        setTimeLeft(0)
        setIsExpired(true)
        onTimeUp()
        return
      }

      setTimeLeft(Math.floor(difference / 1000))
    }

    // Initial calculation
    calculateTimeLeft()

    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [endTime, onTimeUp])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getStatusColor = () => {
    if (status === 'ended' || status === 'completed') return 'text-green-400'
    if (timeLeft && timeLeft < 300) return 'text-red-400' // Less than 5 minutes
    if (timeLeft && timeLeft < 900) return 'text-yellow-400' // Less than 15 minutes
    return 'text-blue-400'
  }

  const getStatusIcon = () => {
    if (status === 'ended' || status === 'completed') return <Trophy className="w-5 h-5" />
    if (timeLeft && timeLeft < 300) return <AlertTriangle className="w-5 h-5" />
    return <Clock className="w-5 h-5" />
  }

  if (status === 'ended' || status === 'completed') {
    return (
      <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Trophy className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="text-green-400 font-semibold">Quiz Completed!</h3>
              <p className="text-white/80 text-sm">
                {winner ? `Winner: ${winner.slice(0, 6)}...${winner.slice(-4)}` : 'No participants'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-green-400 font-bold text-lg">{prizePool} SUI</p>
            <p className="text-white/60 text-sm">Prize Distributed</p>
          </div>
        </div>
      </div>
    )
  }

  if (isExpired || timeLeft === 0) {
    return (
      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-red-400 font-semibold">Quiz Time Expired!</h3>
              <p className="text-white/80 text-sm">Calculating winner...</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-red-400 font-bold text-lg">{prizePool} SUI</p>
            <p className="text-white/60 text-sm">Prize Pool</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className={`${getStatusColor()} font-semibold`}>Quiz Active</h3>
            <p className="text-white/80 text-sm">
              {timeLeft ? formatTime(timeLeft) : 'Calculating...'} remaining
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-blue-400 font-bold text-lg">{prizePool} SUI</p>
          <p className="text-white/60 text-sm">Prize Pool</p>
        </div>
      </div>
    </div>
  )
}

