import { useState, useEffect } from 'react'
import { Database, Upload, Download, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { walrusDatabaseService } from '../lib/walrusDatabaseService'
import { realWalrusService } from '../lib/realWalrusService'

export function WalrusTestPage() {
  const [healthStatus, setHealthStatus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<any[]>([])
  const [walrusFiles, setWalrusFiles] = useState<any[]>([])

  const runHealthCheck = async () => {
    setIsLoading(true)
    try {
      const health = await walrusDatabaseService.healthCheck()
      setHealthStatus(health)
      console.log('Health check result:', health)
    } catch (error) {
      console.error('Health check failed:', error)
      setHealthStatus({
        walrus: false,
        localStorage: false,
        status: 'offline'
      })
    }
    setIsLoading(false)
  }

  const testFileUpload = async () => {
    setIsLoading(true)
    try {
      // Create a test file
      const testContent = JSON.stringify({
        test: true,
        timestamp: new Date().toISOString(),
        message: 'This is a test file for Walrus integration'
      })
      
      const testFile = new File([testContent], 'test-file.json', { type: 'application/json' })
      
      const result = await realWalrusService.uploadFile(testFile, true)
      
      setTestResults(prev => [...prev, {
        test: 'File Upload',
        status: 'success',
        message: `File uploaded successfully: ${result.fileId}`,
        timestamp: new Date().toISOString()
      }])
      
      // Refresh file list
      await loadWalrusFiles()
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'File Upload',
        status: 'error',
        message: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }])
    }
    setIsLoading(false)
  }

  const testQuizSave = async () => {
    setIsLoading(true)
    try {
      const testQuiz = {
        id: `test_quiz_${Date.now()}`,
        title: 'Test Quiz - Walrus Integration',
        description: 'This is a test quiz to verify Walrus database integration',
        questions: [
          {
            id: '1',
            text: 'Is Walrus working?',
            options: ['Yes', 'No', 'Maybe', 'I hope so'],
            correctAnswer: 0,
            timeLimit: 30
          }
        ],
        prizePool: 100,
        duration: 30,
        endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        createdBy: 'test_user',
        participantCount: 0,
        timeLimit: 30,
        status: 'active' as const,
        winner: null
      }

      const saved = await walrusDatabaseService.saveQuiz(testQuiz)
      
      setTestResults(prev => [...prev, {
        test: 'Quiz Save',
        status: saved ? 'success' : 'warning',
        message: saved ? 'Quiz saved to Walrus database' : 'Quiz saved to localStorage (Walrus unavailable)',
        timestamp: new Date().toISOString()
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Quiz Save',
        status: 'error',
        message: `Quiz save failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }])
    }
    setIsLoading(false)
  }

  const testQuizLoad = async () => {
    setIsLoading(true)
    try {
      const quizzes = await walrusDatabaseService.getAllQuizzes()
      
      setTestResults(prev => [...prev, {
        test: 'Quiz Load',
        status: 'success',
        message: `Loaded ${quizzes.length} quizzes from database`,
        timestamp: new Date().toISOString()
      }])
    } catch (error) {
      setTestResults(prev => [...prev, {
        test: 'Quiz Load',
        status: 'error',
        message: `Quiz load failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString()
      }])
    }
    setIsLoading(false)
  }

  const loadWalrusFiles = async () => {
    try {
      // This would need to be implemented in WalrusService
      // For now, we'll show a placeholder
      setWalrusFiles([
        {
          id: 'placeholder',
          name: 'File listing not implemented yet',
          size: 0,
          uploadedAt: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Failed to load Walrus files:', error)
    }
  }

  const clearTestResults = () => {
    setTestResults([])
  }

  useEffect(() => {
    runHealthCheck()
    loadWalrusFiles()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-400'
      case 'degraded':
        return 'text-yellow-400'
      case 'offline':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 text-shadow">
          Walrus Database Test
        </h1>
        <p className="text-white/80 text-lg">
          Test Walrus API integration and database functionality
        </p>
      </div>

      {/* Health Status */}
      <div className="quiz-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white flex items-center space-x-2">
            <Database className="w-6 h-6" />
            <span>System Health</span>
          </h2>
          <button
            onClick={runHealthCheck}
            disabled={isLoading}
            className="quiz-button-secondary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {healthStatus && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {healthStatus.walrus ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-white font-medium">Walrus API</span>
              </div>
              <p className="text-white/60 text-sm">
                {healthStatus.walrus ? 'Connected' : 'Disconnected'}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                {healthStatus.localStorage ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-white font-medium">LocalStorage</span>
              </div>
              <p className="text-white/60 text-sm">
                {healthStatus.localStorage ? 'Available' : 'Unavailable'}
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  healthStatus.status === 'healthy' ? 'bg-green-400' :
                  healthStatus.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                }`}></div>
                <span className={`font-medium ${getStatusColor(healthStatus.status)}`}>
                  {healthStatus.status.toUpperCase()}
                </span>
              </div>
              <p className="text-white/60 text-sm">Overall Status</p>
            </div>
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="quiz-card">
        <h2 className="text-2xl font-semibold text-white mb-6">Test Functions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={testFileUpload}
            disabled={isLoading}
            className="quiz-button-secondary flex items-center justify-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Test Upload</span>
          </button>

          <button
            onClick={testQuizSave}
            disabled={isLoading}
            className="quiz-button-secondary flex items-center justify-center space-x-2"
          >
            <Database className="w-4 h-4" />
            <span>Test Quiz Save</span>
          </button>

          <button
            onClick={testQuizLoad}
            disabled={isLoading}
            className="quiz-button-secondary flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Test Quiz Load</span>
          </button>

          <button
            onClick={clearTestResults}
            className="quiz-button-secondary flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Clear Results</span>
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="quiz-card">
          <h2 className="text-2xl font-semibold text-white mb-6">Test Results</h2>
          
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <h3 className="text-white font-medium">{result.test}</h3>
                      <p className="text-white/60 text-sm">{result.message}</p>
                    </div>
                  </div>
                  <span className="text-white/40 text-xs">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Walrus Files */}
      <div className="quiz-card">
        <h2 className="text-2xl font-semibold text-white mb-6">Walrus Files</h2>
        
        <div className="space-y-3">
          {walrusFiles.map((file, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium">{file.name}</h3>
                  <p className="text-white/60 text-sm">
                    Size: {file.size} bytes • Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-white/40 text-xs">
                  ID: {file.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Environment Info */}
      <div className="quiz-card">
        <h2 className="text-2xl font-semibold text-white mb-6">Environment Configuration</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Walrus API</h3>
            <p className="text-white/60 text-sm">
              URL: {import.meta.env.VITE_WALRUS_API_URL || 'Not configured'}
            </p>
            <p className="text-white/60 text-sm">
              Key: {import.meta.env.VITE_WALRUS_API_KEY ? '***configured***' : 'Not configured'}
            </p>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-white font-medium mb-2">Sui Network</h3>
            <p className="text-white/60 text-sm">
              RPC: {import.meta.env.VITE_SUI_RPC_URL || 'Not configured'}
            </p>
            <p className="text-white/60 text-sm">
              Package ID: {import.meta.env.VITE_SUI_PACKAGE_ID || 'Not configured'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
