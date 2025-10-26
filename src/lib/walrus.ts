import { SuiClient } from '@mysten/sui/client'
import { Transaction } from '@mysten/sui/transactions'
import { useState } from 'react'

// Walrus Protocol configuration
export const WALRUS_CONFIG = {
  // Walrus API configuration
  WALRUS_API_URL: import.meta.env.VITE_WALRUS_API_URL || 'https://api.wal.app',
  WALRUS_API_KEY: import.meta.env.VITE_WALRUS_API_KEY || 'your-walrus-api-key',
  
  // Walrus protocol settings
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
}

// Walrus Protocol service for seamless wallet integration
export class WalrusProtocolService {
  private client: SuiClient

  constructor() {
    this.client = new SuiClient({
      url: import.meta.env.VITE_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443'
    })
  }

  // Initialize Walrus wallet connection
  async initializeWallet() {
    try {
      const response = await fetch(`${WALRUS_CONFIG.WALRUS_API_URL}/v1/wallet/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WALRUS_CONFIG.WALRUS_API_KEY}`,
        },
        body: JSON.stringify({
          network: 'testnet',
          features: ['zkLogin', 'sponsoredTransactions', 'multiSig'],
        }),
      })

      if (!response.ok) {
        throw new Error(`Walrus wallet initialization failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error initializing Walrus wallet:', error)
      throw error
    }
  }

  // Create a seamless transaction (auto-handles gas, signing, etc.)
  async createSeamlessTransaction(
    transactionBlock: Transaction,
    userAddress: string,
    options?: {
      autoGas?: boolean
      autoSign?: boolean
      autoSubmit?: boolean
      gasBudget?: number
    }
  ) {
    try {
      const response = await fetch(`${WALRUS_CONFIG.WALRUS_API_URL}/v1/transaction/seamless`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WALRUS_CONFIG.WALRUS_API_KEY}`,
        },
        body: JSON.stringify({
          transactionBytes: await transactionBlock.build({ client: this.client }),
          userAddress,
          options: {
            autoGas: true,
            autoSign: true,
            autoSubmit: true,
            gasBudget: options?.gasBudget || 10000000,
            ...options,
          },
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Walrus seamless transaction failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating seamless transaction:', error)
      throw error
    }
  }

  // Create a multi-step transaction flow
  async createMultiStepTransaction(
    steps: Array<{
      type: 'quiz_creation' | 'quiz_participation' | 'sbt_minting' | 'prize_claim'
      data: any
    }>,
    userAddress: string
  ) {
    try {
      const response = await fetch(`${WALRUS_CONFIG.WALRUS_API_URL}/v1/transaction/multistep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WALRUS_CONFIG.WALRUS_API_KEY}`,
        },
        body: JSON.stringify({
          steps,
          userAddress,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Walrus multi-step transaction failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating multi-step transaction:', error)
      throw error
    }
  }

  // Create a batch transaction (multiple operations in one tx)
  async createBatchTransaction(
    transactions: Transaction[],
    userAddress: string
  ) {
    try {
      const transactionBytes = await Promise.all(
        transactions.map(tx => tx.build({ client: this.client }))
      )

      const response = await fetch(`${WALRUS_CONFIG.WALRUS_API_URL}/v1/transaction/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WALRUS_CONFIG.WALRUS_API_KEY}`,
        },
        body: JSON.stringify({
          transactions: transactionBytes,
          userAddress,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Walrus batch transaction failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating batch transaction:', error)
      throw error
    }
  }

  // Create a conditional transaction (executes based on conditions)
  async createConditionalTransaction(
    transactionBlock: Transaction,
    conditions: Array<{
      type: 'quiz_completion' | 'score_threshold' | 'time_elapsed'
      value: any
    }>,
    userAddress: string
  ) {
    try {
      const response = await fetch(`${WALRUS_CONFIG.WALRUS_API_URL}/v1/transaction/conditional`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WALRUS_CONFIG.WALRUS_API_KEY}`,
        },
        body: JSON.stringify({
          transactionBytes: await transactionBlock.build({ client: this.client }),
          conditions,
          userAddress,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Walrus conditional transaction failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating conditional transaction:', error)
      throw error
    }
  }

  // Get wallet status and capabilities
  async getWalletStatus(userAddress: string) {
    try {
      const response = await fetch(`${WALRUS_CONFIG.WALRUS_API_URL}/v1/wallet/status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WALRUS_CONFIG.WALRUS_API_KEY}`,
        },
        body: JSON.stringify({
          userAddress,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Walrus wallet status check failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting wallet status:', error)
      throw error
    }
  }

  // Create a smart transaction (auto-optimizes based on user behavior)
  async createSmartTransaction(
    transactionBlock: Transaction,
    userAddress: string,
    context?: {
      userHistory?: any
      preferences?: any
      networkConditions?: any
    }
  ) {
    try {
      const response = await fetch(`${WALRUS_CONFIG.WALRUS_API_URL}/v1/transaction/smart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WALRUS_CONFIG.WALRUS_API_KEY}`,
        },
        body: JSON.stringify({
          transactionBytes: await transactionBlock.build({ client: this.client }),
          userAddress,
          context,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Walrus smart transaction failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating smart transaction:', error)
      throw error
    }
  }

  // Create a social transaction (involves multiple users)
  async createSocialTransaction(
    transactionBlock: Transaction,
    participants: string[],
    socialContext: {
      type: 'collaborative_quiz' | 'team_competition' | 'group_learning'
      metadata: any
    }
  ) {
    try {
      const response = await fetch(`${WALRUS_CONFIG.WALRUS_API_URL}/v1/transaction/social`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${WALRUS_CONFIG.WALRUS_API_KEY}`,
        },
        body: JSON.stringify({
          transactionBytes: await transactionBlock.build({ client: this.client }),
          participants,
          socialContext,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Walrus social transaction failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating social transaction:', error)
      throw error
    }
  }
}

// Global Walrus protocol service
export const walrusService = new WalrusProtocolService()

// React hook for Walrus protocol features
export function useWalrusProtocol() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [walletStatus, setWalletStatus] = useState<any>(null)

  const initializeWallet = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await walrusService.initializeWallet()
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const createSeamlessTransaction = async (
    transactionBlock: Transaction,
    userAddress: string,
    options?: any
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await walrusService.createSeamlessTransaction(transactionBlock, userAddress, options)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const createMultiStepTransaction = async (
    steps: Array<{
      type: 'quiz_creation' | 'quiz_participation' | 'sbt_minting' | 'prize_claim'
      data: any
    }>,
    userAddress: string
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await walrusService.createMultiStepTransaction(steps, userAddress)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const createBatchTransaction = async (
    transactions: Transaction[],
    userAddress: string
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await walrusService.createBatchTransaction(transactions, userAddress)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const createConditionalTransaction = async (
    transactionBlock: Transaction,
    conditions: Array<{
      type: 'quiz_completion' | 'score_threshold' | 'time_elapsed'
      value: any
    }>,
    userAddress: string
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await walrusService.createConditionalTransaction(transactionBlock, conditions, userAddress)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const getWalletStatus = async (userAddress: string) => {
    try {
      const result = await walrusService.getWalletStatus(userAddress)
      setWalletStatus(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    }
  }

  const createSmartTransaction = async (
    transactionBlock: Transaction,
    userAddress: string,
    context?: any
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await walrusService.createSmartTransaction(transactionBlock, userAddress, context)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const createSocialTransaction = async (
    transactionBlock: Transaction,
    participants: string[],
    socialContext: {
      type: 'collaborative_quiz' | 'team_competition' | 'group_learning'
      metadata: any
    }
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await walrusService.createSocialTransaction(transactionBlock, participants, socialContext)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  return {
    loading,
    error,
    walletStatus,
    initializeWallet,
    createSeamlessTransaction,
    createMultiStepTransaction,
    createBatchTransaction,
    createConditionalTransaction,
    getWalletStatus,
    createSmartTransaction,
    createSocialTransaction,
  }
}
