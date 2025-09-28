import { Routes, Route } from 'react-router-dom'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useState } from 'react'
import { HomePage } from './pages/HomePage'
import { CreateQuizPage } from './pages/CreateQuizPage'
import { QuizPage } from './pages/QuizPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { ProfilePage } from './pages/ProfilePage'
import { SealTestPage } from './pages/SealTestPage'
import { WalrusTestPage } from './pages/WalrusTestPage'
import { Navbar } from './components/Navbar'
import { WalletStatus } from './components/WalletStatus'
import { ZkLoginButton } from './components/ZkLoginButton'
// zkLoginService removed - now using Enoki's built-in system

function App() {
  const account = useCurrentAccount()
  const [zkLoginAddress, setZkLoginAddress] = useState<string | null>(null)

  console.log('Account:', account)
  
  console.log('App rendered, account:', account, 'zkLoginAddress:', zkLoginAddress)
  console.log('Google Client ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID)

  const handleZkLoginLogout = () => {
    // Enoki handles logout automatically through wallet disconnection
    setZkLoginAddress(null)
    console.log('zkLogin logged out')
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {!account && !zkLoginAddress ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-6 shadow-2xl max-w-md">
              <h1 className="text-4xl font-bold text-white mb-6">
                Welcome to SuiKnow! 🎯
              </h1>
              <p className="text-white/80 mb-8 text-lg">
                Connect your Sui wallet or use zkLogin with Google to start playing blockchain-powered quizzes and earn SBT rewards!
              </p>
              
              {/* zkLogin Button */}
              <div className="mb-6">
                <ZkLoginButton 
                  onSuccess={(address) => {
                    console.log('zkLogin success, address:', address)
                    setZkLoginAddress(address)
                  }}
                  onError={(error) => {
                    console.error('zkLogin error:', error)
                  }}
                />
              </div>
              
              <div className="text-white/60 text-sm">
                Or use traditional wallets: Sui Wallet, Suiet, Sui Slush, and more
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Wallet Status */}
            {account ? (
              <WalletStatus />
            ) : zkLoginAddress ? (
              <div className="quiz-card p-4 flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">zkLogin Address</p>
                  <p className="text-white text-lg font-bold">
                    {zkLoginAddress.slice(0, 6)}...{zkLoginAddress.slice(-4)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm">Login Method</p>
                  <p className="text-white text-lg font-bold">Google zkLogin</p>
                  <button 
                    onClick={handleZkLoginLogout}
                    className="text-red-400 hover:text-red-500 text-sm mt-2"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : null}
            
            {/* Main Content */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create" element={<CreateQuizPage />} />
              <Route path="/quiz/" element={<HomePage />} />
              <Route path="/quiz/:id" element={<QuizPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/seal-test" element={<SealTestPage />} />
              <Route path="/walrus-test" element={<WalrusTestPage />} />
            </Routes>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

