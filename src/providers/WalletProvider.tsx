import React, { createContext, useContext, useState, useEffect } from 'react'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { WalletKitProvider, ConnectButton, useWalletKit } from '@mysten/dapp-kit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Sui client configuration
const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet')
})

const queryClient = new QueryClient()

// Wallet context
interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: string | null
  connect: () => void
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | null>(null)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

// Wallet provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { currentWallet, currentAccount } = useWalletKit()
  const [balance, setBalance] = useState<string | null>(null)

  const isConnected = !!currentWallet && !!currentAccount
  const address = currentAccount?.address || null

  // Fetch balance when wallet connects
  useEffect(() => {
    if (address) {
      fetchBalance(address)
    } else {
      setBalance(null)
    }
  }, [address])

  const fetchBalance = async (walletAddress: string) => {
    try {
      const coins = await suiClient.getBalance({
        owner: walletAddress,
        coinType: '0x2::sui::SUI'
      })
      setBalance(coins.totalBalance)
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance(null)
    }
  }

  const connect = () => {
    // Wallet connection is handled by ConnectButton
  }

  const disconnect = () => {
    // Wallet disconnection is handled by ConnectButton
  }

  const value: WalletContextType = {
    isConnected,
    address,
    balance,
    connect,
    disconnect
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

// Main wallet provider wrapper
export function AppWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletKitProvider
        features={['zkLogin']}
        storageKey="sui-kahoot-wallet"
        storage={localStorage}
      >
        <WalletProvider>
          {children}
        </WalletProvider>
      </WalletKitProvider>
    </QueryClientProvider>
  )
}

// Custom connect button component
export function CustomConnectButton() {
  const { isConnected, address, balance } = useWallet()

  if (isConnected) {
    return (
      <div className="flex items-center space-x-3">
        <div className="text-right">
          <div className="text-white font-semibold text-sm">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
          </div>
          {balance && (
            <div className="text-white/60 text-xs">
              {parseFloat(balance) / 1_000_000_000} SUI
            </div>
          )}
        </div>
        <ConnectButton />
      </div>
    )
  }

  return <ConnectButton />
}
