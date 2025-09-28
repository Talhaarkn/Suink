import { Link, useLocation } from 'react-router-dom'
import { Plus, Home, User, BarChart3, Shield, Database } from 'lucide-react'
import { ConnectButton } from '@mysten/dapp-kit'

export function Navbar() {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/create', label: 'Create Quiz', icon: Plus },
    { path: '/leaderboard', label: 'Leaderboard', icon: BarChart3 },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/seal-test', label: 'Seal Test', icon: Shield },
    { path: '/walrus-test', label: 'Walrus Test', icon: Database },
  ]

  return (
    <nav className="bg-gradient-to-r from-gray-800/95 to-gray-900/95 backdrop-blur-lg border-b border-gray-700/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <img 
                src="/logo.png" 
                alt="SuiKnow Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold text-white text-shadow">
              SuiKnow
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-gray-600/80 to-gray-700/80 text-white'
                      : 'text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-gray-700/60 hover:to-gray-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Wallet Button */}
          <ConnectButton />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-4">
          <div className="flex items-center space-x-4 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 whitespace-nowrap ${
                    isActive
                      ? 'bg-gray-700/20 text-white'
                      : 'text-white/80 hover:text-white hover:bg-gray-700/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

