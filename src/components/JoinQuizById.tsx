import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, AlertCircle } from 'lucide-react'

interface JoinQuizByIdProps {
  onJoin?: (quizId: string) => void
}

export function JoinQuizById({ onJoin }: JoinQuizByIdProps) {
  const [quizId, setQuizId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleJoinQuiz = async () => {
    if (!quizId.trim()) {
      setError('Lütfen bir Quiz ID girin')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Check if quiz exists in localStorage
      const storedQuizzes = localStorage.getItem('quizzes')
      if (storedQuizzes) {
        const quizzes = JSON.parse(storedQuizzes)
        const foundQuiz = quizzes.find((q: any) => q.id === quizId.trim())
        
        if (foundQuiz) {
          // Quiz found, navigate to it
          onJoin?.(quizId.trim())
          navigate(`/quiz/${quizId.trim()}`)
        } else {
          setError('Bu ID ile bir quiz bulunamadı')
        }
      } else {
        setError('Henüz hiç quiz oluşturulmamış')
      }
    } catch (error) {
      console.error('Error joining quiz:', error)
      setError('Quiz katılımında hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJoinQuiz()
    }
  }

  return (
    <div className="quiz-card">
      <div className="flex items-center space-x-2 mb-6">
        <Search className="w-6 h-6 text-sui-light-blue" />
        <h3 className="text-xl font-bold text-white">Quiz ID ile Katıl</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-white/80 text-sm font-medium mb-2">
            Quiz ID
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={quizId}
              onChange={(e) => setQuizId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="quiz_1234567890_abcdef12"
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sui-light-blue focus:border-transparent"
            />
            <button
              onClick={handleJoinQuiz}
              disabled={isLoading || !quizId.trim()}
              className="px-6 py-3 bg-sui-light-blue hover:bg-sui-blue text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Katıl</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        )}

          <div className="bg-sui-light-blue/10 border border-sui-light-blue/20 rounded-lg p-4">
            <h4 className="text-sui-light-blue font-medium mb-2">Nasıl Kullanılır?</h4>
          <ul className="text-white/60 text-sm space-y-1">
            <li>• Quiz oluşturan kişiden Quiz ID'sini alın</li>
            <li>• ID'yi yukarıdaki alana yapıştırın</li>
            <li>• "Katıl" butonuna tıklayın</li>
            <li>• Quiz otomatik olarak açılacak</li>
          </ul>
        </div>

          <div className="bg-sui-light-blue/10 border border-sui-light-blue/20 rounded-lg p-4">
            <h4 className="text-sui-light-blue font-medium mb-2">Quiz ID Örneği</h4>
          <div className="bg-white/5 p-2 rounded border">
            <code className="text-sui-light-blue text-sm font-mono">
              quiz_1703123456789_a1b2c3d4
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
