import { SuiClient } from '@mysten/sui/client'
import { TransactionBlock } from '@mysten/sui/transactions'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'

// Sponsored transaction configuration
export const SPONSORED_CONFIG = {
  // Enoki API configuration
  ENOKI_API_URL: process.env.REACT_APP_ENOKI_API_URL || 'https://api.enoki.mystenlabs.com',
  ENOKI_API_KEY: process.env.REACT_APP_ENOKI_API_KEY || 'your-enoki-api-key',
  
  // Sponsored transaction settings
  MAX_GAS_BUDGET: 10000000, // 0.01 SUI
  GAS_BUDGET_MULTIPLIER: 1.2, // 20% buffer
}

// Sponsored transaction service
export class SponsoredTransactionService {
  private client: SuiClient
  private sponsorKeypair: Ed25519Keypair

  constructor() {
    this.client = new SuiClient({
      url: process.env.REACT_APP_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443'
    })
    
    // In production, this would be a secure keypair for the sponsor
    // For demo purposes, we'll generate a random one
    this.sponsorKeypair = new Ed25519Keypair()
  }

  // Create a sponsored transaction
  async createSponsoredTransaction(
    transactionBlock: TransactionBlock,
    userAddress: string,
    gasBudget?: number
  ): Promise<{
    sponsoredTxBytes: string
    sponsoredTxDigest: string
  }> {
    try {
      // Set gas budget
      const budget = gasBudget || SPONSORED_CONFIG.MAX_GAS_BUDGET
      transactionBlock.setGasBudget(budget)

      // Build the transaction
      const txBytes = await transactionBlock.build({ client: this.client })

      // Create sponsored transaction using Enoki API
      const response = await fetch(`${SPONSORED_CONFIG.ENOKI_API_URL}/v1/sponsored-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SPONSORED_CONFIG.ENOKI_API_KEY}`,
        },
        body: JSON.stringify({
          transactionBytes: txBytes,
          userAddress,
          gasBudget: budget,
          network: 'testnet', // Change to 'mainnet' for production
        }),
      })

      if (!response.ok) {
        throw new Error(`Sponsored transaction failed: ${response.statusText}`)
      }

      const result = await response.json()
      
      return {
        sponsoredTxBytes: result.sponsoredTxBytes,
        sponsoredTxDigest: result.sponsoredTxDigest,
      }
    } catch (error) {
      console.error('Error creating sponsored transaction:', error)
      throw error
    }
  }

  // Execute a sponsored transaction
  async executeSponsoredTransaction(
    sponsoredTxBytes: string,
    userSignature: string
  ): Promise<{
    txDigest: string
    effects: any
  }> {
    try {
      // Submit the sponsored transaction
      const response = await this.client.executeTransactionBlock({
        transactionBlock: sponsoredTxBytes,
        signature: userSignature,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      })

      return {
        txDigest: response.digest,
        effects: response.effects,
      }
    } catch (error) {
      console.error('Error executing sponsored transaction:', error)
      throw error
    }
  }

  // Get sponsored transaction status
  async getSponsoredTransactionStatus(txDigest: string) {
    try {
      const response = await this.client.getTransactionBlock({
        digest: txDigest,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      })

      return {
        status: response.effects?.status?.status,
        gasUsed: response.effects?.gasUsed,
        gasCost: response.effects?.gasCost,
        events: response.events,
      }
    } catch (error) {
      console.error('Error getting transaction status:', error)
      throw error
    }
  }

  // Estimate gas for a transaction
  async estimateGas(transactionBlock: TransactionBlock, userAddress: string) {
    try {
      const response = await this.client.dryRunTransactionBlock({
        transactionBlock: await transactionBlock.build({ client: this.client }),
        sender: userAddress,
      })

      const gasUsed = response.effects?.gasUsed?.computationCost || 0
      const storageCost = response.effects?.gasUsed?.storageCost || 0
      const storageRebate = response.effects?.gasUsed?.storageRebate || 0
      
      const totalGas = gasUsed + storageCost - storageRebate
      const estimatedBudget = Math.ceil(totalGas * SPONSORED_CONFIG.GAS_BUDGET_MULTIPLIER)

      return {
        gasUsed: totalGas,
        estimatedBudget,
        isWithinLimit: estimatedBudget <= SPONSORED_CONFIG.MAX_GAS_BUDGET,
      }
    } catch (error) {
      console.error('Error estimating gas:', error)
      throw error
    }
  }
}

// Global sponsored transaction service
export const sponsoredTxService = new SponsoredTransactionService()

// React hook for sponsored transactions
export function useSponsoredTransactions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeSponsoredTransaction = async (
    transactionBlock: TransactionBlock,
    userAddress: string,
    userSignature: string,
    gasBudget?: number
  ) => {
    setLoading(true)
    setError(null)

    try {
      // Create sponsored transaction
      const { sponsoredTxBytes } = await sponsoredTxService.createSponsoredTransaction(
        transactionBlock,
        userAddress,
        gasBudget
      )

      // Execute sponsored transaction
      const result = await sponsoredTxService.executeSponsoredTransaction(
        sponsoredTxBytes,
        userSignature
      )

      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const estimateGas = async (transactionBlock: TransactionBlock, userAddress: string) => {
    try {
      return await sponsoredTxService.estimateGas(transactionBlock, userAddress)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    }
  }

  const getTransactionStatus = async (txDigest: string) => {
    try {
      return await sponsoredTxService.getSponsoredTransactionStatus(txDigest)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    }
  }

  return {
    loading,
    error,
    executeSponsoredTransaction,
    estimateGas,
    getTransactionStatus,
  }
}

// Import useState for the hook
import { useState } from 'react'

