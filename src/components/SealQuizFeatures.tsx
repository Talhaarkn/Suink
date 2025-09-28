import React, { useState } from 'react'
import { Lock, Clock, Users, Shield, Eye, EyeOff } from 'lucide-react'

interface SealQuizFeaturesProps {
  onTimeLock?: (duration: number) => void
  onPrivacyMode?: (enabled: boolean) => void
  onMultiSig?: (enabled: boolean) => void
  onWhitelist?: (addresses: string[]) => void
}

export function SealQuizFeatures({ 
  onTimeLock, 
  onPrivacyMode, 
  onMultiSig, 
  onWhitelist 
}: SealQuizFeaturesProps) {
  const [timeLockDuration, setTimeLockDuration] = useState(0)
  const [privacyEnabled, setPrivacyEnabled] = useState(false)
  const [multiSigEnabled, setMultiSigEnabled] = useState(false)
  const [whitelistAddresses, setWhitelistAddresses] = useState<string[]>([])
  const [newAddress, setNewAddress] = useState('')

  const addToWhitelist = () => {
    if (newAddress.trim() && !whitelistAddresses.includes(newAddress.trim())) {
      const updated = [...whitelistAddresses, newAddress.trim()]
      setWhitelistAddresses(updated)
      onWhitelist?.(updated)
      setNewAddress('')
    }
  }

  const removeFromWhitelist = (address: string) => {
    const updated = whitelistAddresses.filter(addr => addr !== address)
    setWhitelistAddresses(updated)
    onWhitelist?.(updated)
  }

  return (
    <div className="quiz-card space-y-6">
      <div className="flex items-center space-x-2 mb-6">
        <Shield className="w-6 h-6 text-blue-400" />
        <h3 className="text-xl font-bold text-white">Seal Protocol Features</h3>
      </div>

      {/* Time Lock */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-yellow-400" />
          <label className="text-white font-medium">Time Lock (Hours)</label>
        </div>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            min="0"
            max="168"
            value={timeLockDuration}
            onChange={(e) => {
              const duration = parseInt(e.target.value) || 0
              setTimeLockDuration(duration)
              onTimeLock?.(duration)
            }}
            className="w-20 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
            placeholder="0"
          />
          <span className="text-white/60 text-sm">
            Quiz will be locked for {timeLockDuration} hours after creation
          </span>
        </div>
      </div>

      {/* Privacy Mode */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          {privacyEnabled ? (
            <EyeOff className="w-5 h-5 text-red-400" />
          ) : (
            <Eye className="w-5 h-5 text-green-400" />
          )}
          <label className="text-white font-medium">Privacy Mode</label>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setPrivacyEnabled(!privacyEnabled)
              onPrivacyMode?.(!privacyEnabled)
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              privacyEnabled
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-green-500/20 text-green-400 border border-green-500/30'
            }`}
          >
            {privacyEnabled ? 'Private' : 'Public'}
          </button>
          <span className="text-white/60 text-sm">
            {privacyEnabled 
              ? 'Quiz answers will be encrypted and private'
              : 'Quiz answers will be publicly visible'
            }
          </span>
        </div>
      </div>

      {/* Multi-Signature */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-purple-400" />
          <label className="text-white font-medium">Multi-Signature</label>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              setMultiSigEnabled(!multiSigEnabled)
              onMultiSig?.(!multiSigEnabled)
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              multiSigEnabled
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
          >
            {multiSigEnabled ? 'Enabled' : 'Disabled'}
          </button>
          <span className="text-white/60 text-sm">
            {multiSigEnabled 
              ? 'Quiz requires multiple signatures to start'
              : 'Quiz can be started by creator only'
            }
          </span>
        </div>
      </div>

      {/* Whitelist */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Lock className="w-5 h-5 text-orange-400" />
          <label className="text-white font-medium">Whitelist Participants</label>
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
            placeholder="Enter wallet address"
            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
          />
          <button
            onClick={addToWhitelist}
            className="px-4 py-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-lg hover:bg-orange-500/30 transition-colors"
          >
            Add
          </button>
        </div>

        {whitelistAddresses.length > 0 && (
          <div className="space-y-2">
            <p className="text-white/60 text-sm">Whitelisted addresses:</p>
            <div className="space-y-1">
              {whitelistAddresses.map((address, index) => (
                <div key={index} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                  <span className="text-white/80 text-sm font-mono">
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </span>
                  <button
                    onClick={() => removeFromWhitelist(address)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Seal Status */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <span className="text-blue-400 font-medium">Seal Protection Active</span>
        </div>
        <p className="text-white/60 text-sm">
          Your quiz is protected by Seal Protocol with enhanced security features.
        </p>
      </div>
    </div>
  )
}

