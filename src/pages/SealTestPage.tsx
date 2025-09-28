import { useState, useEffect } from 'react'
import { Shield, Lock, Clock, Users, CheckCircle, XCircle, Play, Eye } from 'lucide-react'
import { sealService } from '../lib/sealService'

interface SealTestResult {
  testName: string
  passed: boolean
  message: string
  details?: any
}

export function SealTestPage() {
  const [testResults, setTestResults] = useState<SealTestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [sealPolicies, setSealPolicies] = useState<any[]>([])

  useEffect(() => {
    loadSealPolicies()
  }, [])

  const loadSealPolicies = () => {
    try {
      const policies = JSON.parse(localStorage.getItem('seal_policies') || '[]')
      setSealPolicies(policies)
    } catch (error) {
      console.error('Error loading Seal policies:', error)
    }
  }

  const runSealTests = async () => {
    setIsRunning(true)
    setTestResults([])

    const results: SealTestResult[] = []

    // Test 1: Seal SDK Connection
    try {
      const sdkConnected = await sealService.testSealConnection()
      results.push({
        testName: 'Seal SDK Connection',
        passed: sdkConnected,
        message: sdkConnected ? '✅ SDK Connected to testnet' : '❌ SDK Connection failed'
      })
    } catch (error) {
      results.push({
        testName: 'Seal SDK Connection',
        passed: false,
        message: `❌ SDK Error: ${error instanceof Error ? error.message : String(error)}`
      })
    }

    // Test 2: Get Key Servers
    try {
      const keyServers = await sealService.getKeyServers()
      results.push({
        testName: 'Key Servers Discovery',
        passed: keyServers.length > 0,
        message: keyServers.length > 0 ? `✅ Found ${keyServers.length} key servers` : '❌ No key servers found',
        details: keyServers
      })
    } catch (error) {
      results.push({
        testName: 'Key Servers Discovery',
        passed: false,
        message: `❌ Key servers error: ${error instanceof Error ? error.message : String(error)}`
      })
    }

    // Test 3: Seal Service Initialization
    try {
      const testQuizData = {
        quizId: 'test_quiz_' + Date.now(),
        title: 'Seal Test Quiz',
        description: 'Test quiz for Seal Protocol',
        questions: [],
        config: {
          timeLockDuration: 1,
          privacyEnabled: true,
          multiSigEnabled: false,
          whitelistAddresses: ['0x1234567890abcdef'],
          threshold: 2
        }
      }

      const sealId = await sealService.createSealProtectedQuiz(testQuizData)
      
      results.push({
        testName: 'Seal Service Initialization',
        passed: true,
        message: 'Seal service initialized successfully',
        details: { sealId }
      })
    } catch (error) {
      results.push({
        testName: 'Seal Service Initialization',
        passed: false,
        message: 'Failed to initialize Seal service',
        details: { error: error instanceof Error ? error.message : String(error) }
      })
    }

    // Test 2: Time Lock Verification
    try {
      const testSealId = 'seal_test_timelock'
      const timeLockValid = await sealService.verifyTimeLock(testSealId)
      
      results.push({
        testName: 'Time Lock Verification',
        passed: timeLockValid,
        message: timeLockValid ? 'Time lock verification passed' : 'Time lock verification failed',
        details: { timeLockValid }
      })
    } catch (error) {
      results.push({
        testName: 'Time Lock Verification',
        passed: false,
        message: 'Time lock verification error',
        details: { error: error instanceof Error ? error.message : String(error) }
      })
    }

    // Test 3: Whitelist Verification
    try {
      const testSealId = 'seal_test_whitelist'
      const testAddress = '0x1234567890abcdef'
      const whitelistValid = await sealService.verifyWhitelist(testSealId, testAddress)
      
      results.push({
        testName: 'Whitelist Verification',
        passed: whitelistValid,
        message: whitelistValid ? 'Whitelist verification passed' : 'Whitelist verification failed',
        details: { whitelistValid, testAddress }
      })
    } catch (error) {
      results.push({
        testName: 'Whitelist Verification',
        passed: false,
        message: 'Whitelist verification error',
        details: { error: error instanceof Error ? error.message : String(error) }
      })
    }

    // Test 4: Quiz Answer Encryption/Decryption
    try {
      const testAnswers = [
        { questionIndex: 0, selectedOption: 1, timeTaken: 15, isCorrect: true }
      ]
      
      const encryptedData = await sealService.encryptQuizAnswers('test_quiz', testAnswers)
      const decryptedAnswers = await sealService.decryptQuizAnswers('test_quiz', encryptedData)
      
      const encryptionWorks = encryptedData && encryptedData.length > 0
      const decryptionWorks = JSON.stringify(testAnswers) === JSON.stringify(decryptedAnswers)
      
      results.push({
        testName: 'Answer Encryption/Decryption',
        passed: Boolean(encryptionWorks && decryptionWorks),
        message: encryptionWorks && decryptionWorks ? 'Encryption/Decryption works correctly' : 'Encryption/Decryption failed',
        details: { encryptionWorks, decryptionWorks, originalLength: testAnswers.length, decryptedLength: decryptedAnswers.length }
      })
    } catch (error) {
      results.push({
        testName: 'Answer Encryption/Decryption',
        passed: false,
        message: 'Encryption/Decryption error',
        details: { error: error instanceof Error ? error.message : String(error) }
      })
    }

    // Test 5: Complete Access Verification
    try {
      const testSealId = 'seal_test_complete'
      const testAddress = '0x1234567890abcdef'
      
      const accessResult = await sealService.verifySealAccess(testSealId, testAddress)
      
      results.push({
        testName: 'Complete Access Verification',
        passed: accessResult.allowed,
        message: accessResult.allowed ? 'Access granted' : `Access denied: ${accessResult.reason}`,
        details: accessResult
      })
    } catch (error) {
      results.push({
        testName: 'Complete Access Verification',
        passed: false,
        message: 'Access verification error',
        details: { error: error instanceof Error ? error.message : String(error) }
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const createTestQuiz = async () => {
    try {
      const testQuiz: any = {
        id: `quiz_${Date.now()}_seal_test`,
        title: 'Seal Protocol Test Quiz',
        description: 'Bu quiz Seal Protocol özelliklerini test etmek için oluşturulmuştur.',
        questions: [
          {
            id: '1',
            text: 'Seal Protocol nedir?',
            options: ['Blockchain', 'Privacy Protocol', 'Game', 'Token'],
            correctAnswer: 1,
            timeLimit: 30
          }
        ],
        prizePool: 1000,
        createdAt: new Date().toISOString(),
        createdBy: 'Test User',
        participantCount: 0,
        isActive: true,
        timeLimit: 30,
        imageUrl: '',
        imageId: ''
      }

      const newSealId = await sealService.createSealProtectedQuiz({
        quizId: testQuiz.id,
        title: testQuiz.title,
        description: testQuiz.description,
        questions: testQuiz.questions,
        config: {
          timeLockDuration: 1,
          privacyEnabled: true,
          multiSigEnabled: false,
          whitelistAddresses: ['0x1234567890abcdef']
        }
      })

      testQuiz.sealId = newSealId

      // Store quiz
      const existingQuizzes = JSON.parse(localStorage.getItem('quizzes') || '[]')
      existingQuizzes.push(testQuiz)
      localStorage.setItem('quizzes', JSON.stringify(existingQuizzes))

      // Reload policies
      loadSealPolicies()

      alert(`Test quiz created successfully!\nQuiz ID: ${testQuiz.id}\nSeal ID: ${newSealId}`)
    } catch (error) {
      console.error('Error creating test quiz:', error)
      alert('Failed to create test quiz: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4 text-shadow">
          Seal Protocol Test Center
        </h1>
        <p className="text-white/80 text-lg">
          Seal Protocol entegrasyonunu test etmek için bu sayfayı kullanın
        </p>
      </div>

      {/* Test Controls */}
      <div className="quiz-card">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-sui-light-blue" />
          <span>Test Controls</span>
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={runSealTests}
            disabled={isRunning}
            className="quiz-button flex items-center justify-center space-x-2"
          >
            <Play className="w-5 h-5" />
            <span>{isRunning ? 'Running Tests...' : 'Run All Tests'}</span>
          </button>
          
          <button
            onClick={createTestQuiz}
            className="quiz-button-secondary flex items-center justify-center space-x-2"
          >
            <Shield className="w-5 h-5" />
            <span>Create Test Quiz</span>
          </button>
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div className="quiz-card">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <CheckCircle className="w-6 h-6 text-quiz-green" />
            <span>Test Results</span>
          </h2>
          
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  result.passed
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-red-500/10 border-red-500/20'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {result.passed ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <h3 className="text-lg font-semibold text-white">{result.testName}</h3>
                </div>
                <p className="text-white/80 mb-2">{result.message}</p>
                {result.details && (
                  <details className="text-sm text-white/60">
                    <summary className="cursor-pointer hover:text-white/80">Details</summary>
                    <pre className="mt-2 p-2 bg-white/5 rounded text-xs overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Seal Policies */}
      <div className="quiz-card">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Lock className="w-6 h-6 text-sui-light-blue" />
          <span>Active Seal Policies</span>
        </h2>
        
        {sealPolicies.length === 0 ? (
          <p className="text-white/60 text-center py-8">No Seal policies found</p>
        ) : (
          <div className="space-y-4">
            {sealPolicies.map((policy, index) => (
              <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Policy {index + 1}</h3>
                  <div className="flex items-center space-x-2">
                    {policy.privacyEnabled && (
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <Eye className="w-3 h-3" />
                        <span>Privacy</span>
                      </span>
                    )}
                    {policy.multiSigEnabled && (
                      <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>MultiSig</span>
                      </span>
                    )}
                    {policy.timeLockUntil && (
                      <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>Time Lock</span>
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-white/60">Seal ID:</span>
                    <p className="text-white font-mono text-xs break-all">{policy.sealId}</p>
                  </div>
                  <div>
                    <span className="text-white/60">Quiz ID:</span>
                    <p className="text-white font-mono text-xs break-all">{policy.quizId}</p>
                  </div>
                  {policy.timeLockUntil && (
                    <div>
                      <span className="text-white/60">Time Lock Until:</span>
                      <p className="text-white">{new Date(policy.timeLockUntil).toLocaleString()}</p>
                    </div>
                  )}
                  {policy.whitelistAddresses && policy.whitelistAddresses.length > 0 && (
                    <div>
                      <span className="text-white/60">Whitelist Addresses:</span>
                      <p className="text-white">{policy.whitelistAddresses.length} addresses</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="quiz-card">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-sui-light-blue" />
          <span>Testing Instructions</span>
        </h2>
        
        <div className="space-y-4 text-white/80">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">1. Run All Tests</h3>
            <p>Seal Protocol entegrasyonunun tüm bileşenlerini test eder.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">2. Create Test Quiz</h3>
            <p>Seal özellikleri ile bir test quiz'i oluşturur ve localStorage'a kaydeder.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">3. Manual Testing</h3>
            <p>Ana sayfaya gidin ve oluşturulan test quiz'ini bulun. Quiz'e tıklayarak Seal verification'ı test edin.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">4. Check Results</h3>
            <p>Test sonuçlarını kontrol edin ve herhangi bir hata varsa düzeltin.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
