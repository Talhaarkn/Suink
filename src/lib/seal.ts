import { SuiClient } from '@mysten/sui/client'
import { TransactionBlock } from '@mysten/sui/transactions'

// Seal Protocol configuration
export const SEAL_CONFIG = {
  // Seal API configuration
  SEAL_API_URL: process.env.REACT_APP_SEAL_API_URL || 'https://api.seal.mystenlabs.com',
  SEAL_API_KEY: process.env.REACT_APP_SEAL_API_KEY || 'your-seal-api-key',
  
  // Seal protocol settings
  DEFAULT_TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
}

// Seal Protocol service for enhanced quiz features
export class SealProtocolService {
  private client: SuiClient

  constructor() {
    this.client = new SuiClient({
      url: process.env.REACT_APP_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443'
    })
  }

  // Create a time-locked quiz (questions revealed over time)
  async createTimeLockedQuiz(
    quizId: string,
    questions: any[],
    timeLocks: number[] // Time delays in seconds for each question
  ) {
    try {
      const response = await fetch(`${SEAL_CONFIG.SEAL_API_URL}/v1/timelock/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SEAL_CONFIG.SEAL_API_KEY}`,
        },
        body: JSON.stringify({
          quizId,
          questions,
          timeLocks,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Seal timelock creation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating timelocked quiz:', error)
      throw error
    }
  }

  // Create a multi-signature quiz (requires multiple approvals)
  async createMultiSigQuiz(
    quizId: string,
    requiredSignatures: number,
    approvers: string[]
  ) {
    try {
      const response = await fetch(`${SEAL_CONFIG.SEAL_API_URL}/v1/multisig/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SEAL_CONFIG.SEAL_API_KEY}`,
        },
        body: JSON.stringify({
          quizId,
          requiredSignatures,
          approvers,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Seal multisig creation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating multisig quiz:', error)
      throw error
    }
  }

  // Create a conditional quiz (questions based on previous answers)
  async createConditionalQuiz(
    quizId: string,
    conditions: any[],
    questionBranches: any[]
  ) {
    try {
      const response = await fetch(`${SEAL_CONFIG.SEAL_API_URL}/v1/conditional/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SEAL_CONFIG.SEAL_API_KEY}`,
        },
        body: JSON.stringify({
          quizId,
          conditions,
          questionBranches,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Seal conditional quiz creation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating conditional quiz:', error)
      throw error
    }
  }

  // Create a privacy-preserving quiz (answers encrypted until reveal)
  async createPrivateQuiz(
    quizId: string,
    encryptionKey: string,
    revealConditions: any
  ) {
    try {
      const response = await fetch(`${SEAL_CONFIG.SEAL_API_URL}/v1/privacy/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SEAL_CONFIG.SEAL_API_KEY}`,
        },
        body: JSON.stringify({
          quizId,
          encryptionKey,
          revealConditions,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Seal private quiz creation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating private quiz:', error)
      throw error
    }
  }

  // Submit encrypted answer
  async submitEncryptedAnswer(
    quizId: string,
    questionIndex: number,
    encryptedAnswer: string,
    userAddress: string
  ) {
    try {
      const response = await fetch(`${SEAL_CONFIG.SEAL_API_URL}/v1/privacy/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SEAL_CONFIG.SEAL_API_KEY}`,
        },
        body: JSON.stringify({
          quizId,
          questionIndex,
          encryptedAnswer,
          userAddress,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Seal encrypted answer submission failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error submitting encrypted answer:', error)
      throw error
    }
  }

  // Reveal quiz results (decrypt and calculate scores)
  async revealQuizResults(
    quizId: string,
    revealKey: string
  ) {
    try {
      const response = await fetch(`${SEAL_CONFIG.SEAL_API_URL}/v1/privacy/reveal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SEAL_CONFIG.SEAL_API_KEY}`,
        },
        body: JSON.stringify({
          quizId,
          revealKey,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Seal quiz reveal failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error revealing quiz results:', error)
      throw error
    }
  }

  // Get Seal protocol status
  async getSealStatus(quizId: string) {
    try {
      const response = await fetch(`${SEAL_CONFIG.SEAL_API_URL}/v1/status/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${SEAL_CONFIG.SEAL_API_KEY}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Seal status check failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error getting Seal status:', error)
      throw error
    }
  }

  // Create a collaborative quiz (multiple creators)
  async createCollaborativeQuiz(
    quizId: string,
    creators: string[],
    permissions: any
  ) {
    try {
      const response = await fetch(`${SEAL_CONFIG.SEAL_API_URL}/v1/collaborative/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SEAL_CONFIG.SEAL_API_KEY}`,
        },
        body: JSON.stringify({
          quizId,
          creators,
          permissions,
          network: 'testnet',
        }),
      })

      if (!response.ok) {
        throw new Error(`Seal collaborative quiz creation failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating collaborative quiz:', error)
      throw error
    }
  }
}

// Global Seal protocol service
export const sealService = new SealProtocolService()

// React hook for Seal protocol features
export function useSealProtocol() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTimeLockedQuiz = async (
    quizId: string,
    questions: any[],
    timeLocks: number[]
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await sealService.createTimeLockedQuiz(quizId, questions, timeLocks)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const createMultiSigQuiz = async (
    quizId: string,
    requiredSignatures: number,
    approvers: string[]
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await sealService.createMultiSigQuiz(quizId, requiredSignatures, approvers)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const createConditionalQuiz = async (
    quizId: string,
    conditions: any[],
    questionBranches: any[]
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await sealService.createConditionalQuiz(quizId, conditions, questionBranches)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const createPrivateQuiz = async (
    quizId: string,
    encryptionKey: string,
    revealConditions: any
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await sealService.createPrivateQuiz(quizId, encryptionKey, revealConditions)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const submitEncryptedAnswer = async (
    quizId: string,
    questionIndex: number,
    encryptedAnswer: string,
    userAddress: string
  ) => {
    setLoading(true)
    setError(null)

    try {
      const result = await sealService.submitEncryptedAnswer(quizId, questionIndex, encryptedAnswer, userAddress)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const revealQuizResults = async (quizId: string, revealKey: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await sealService.revealQuizResults(quizId, revealKey)
      setLoading(false)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setLoading(false)
      throw err
    }
  }

  const getSealStatus = async (quizId: string) => {
    try {
      return await sealService.getSealStatus(quizId)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    }
  }

  return {
    loading,
    error,
    createTimeLockedQuiz,
    createMultiSigQuiz,
    createConditionalQuiz,
    createPrivateQuiz,
    submitEncryptedAnswer,
    revealQuizResults,
    getSealStatus,
  }
}

// Import useState for the hook
import { useState } from 'react'

