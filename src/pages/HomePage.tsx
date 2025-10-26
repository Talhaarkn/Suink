import { useCurrentAccount } from '@mysten/dapp-kit'
import { Link } from 'react-router-dom'
import { LinkIcon, Globe, Shield, Rocket } from 'lucide-react'

export function HomePage() {
  const account = useCurrentAccount()

  const features = [
    {
      icon: <LinkIcon className="w-8 h-8" />,
      title: "One Link, Everything",
      description: "Share all your important links in one beautiful page"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "On-Chain Storage",
      description: "Your profile lives on Sui blockchain - truly yours forever"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Decentralized Hosting",
      description: "Hosted on Walrus - no centralized servers, no downtime"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Custom Domains",
      description: "Get your own .sui domain with SuiNS integration"
    }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-block">
          <div className="text-7xl mb-4">🔗</div>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            SuiNK
          </h1>
        </div>
        <p className="text-2xl text-white/80 max-w-2xl mx-auto">
          Your decentralized link-in-bio page, powered by Sui blockchain and Walrus storage
        </p>
        
        {!account ? (
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 max-w-md mx-auto">
            <p className="text-white/80 mb-4">
              Connect your wallet to create your profile
            </p>
            <p className="text-white/60 text-sm">
              Use Sui Wallet or zkLogin with Google
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <Link
              to="/profile"
              className="inline-block px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create Your Profile →
            </Link>
            <p className="text-white/60 text-sm">
              Connected: {account.address.slice(0, 6)}...{account.address.slice(-4)}
            </p>
          </div>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 hover:border-blue-500/50 transition-all"
          >
            <div className="text-blue-400 mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-white/70">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          How It Works
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              1️⃣
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Connect Wallet</h3>
            <p className="text-white/70 text-sm">
              Use Sui Wallet or zkLogin with your Google account
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              2️⃣
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Create Profile</h3>
            <p className="text-white/70 text-sm">
              Add your name, bio, avatar and customize your theme
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              3️⃣
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Share Links</h3>
            <p className="text-white/70 text-sm">
              Add all your social media and important links in one place
            </p>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="text-center space-y-4">
        <h3 className="text-xl text-white/60">Built with cutting-edge tech</h3>
        <div className="flex flex-wrap justify-center gap-4">
          <span className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-medium">
            Sui Blockchain
          </span>
          <span className="px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-medium">
            Walrus Storage
          </span>
          <span className="px-4 py-2 bg-pink-500/20 border border-pink-500/30 rounded-lg text-pink-300 text-sm font-medium">
            SuiNS Domains
          </span>
          <span className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300 text-sm font-medium">
            zkLogin
          </span>
        </div>
      </div>
    </div>
  )
}
