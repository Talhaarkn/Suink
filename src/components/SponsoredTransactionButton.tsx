import React, { useState } from 'react'
import { useCurrentAccount, useSignTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { sponsorAndExecuteTransaction } from '../lib/enokiSponsored'

interface SponsoredTransactionButtonProps {
  onSuccess?: (digest: string) => void
  onError?: (error: Error) => void
  children: React.ReactNode
  transaction: (txb: Transaction) => void
  allowedMoveCallTargets?: string[]
  allowedAddresses?: string[]
}

export function SponsoredTransactionButton({ 
  onSuccess, 
  onError, 
  children, 
  transaction,
  allowedMoveCallTargets = [],
  allowedAddresses = []
}: SponsoredTransactionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const currentAccount = useCurrentAccount()
  const { mutateAsync: signTransaction } = useSignTransaction()

  const handleTransaction = async () => {
    try {
      setIsLoading(true)
      
      // Check if user is connected
      if (!currentAccount) {
        throw new Error('Please connect your wallet first')
      }

      console.log('🎫 Creating sponsored transaction for account:', currentAccount.address)
      
      // Create transaction
      const txb = new Transaction()
      txb.setSender(currentAccount.address)
      
      // Execute transaction builder function
      transaction(txb)
      
      // Sign function wrapper
      const signFn = async (bytes: Uint8Array) => {
        const { signature } = await signTransaction({
          transaction: bytes as any, // Type assertion due to version mismatch
        })
        if (!signature) {
          throw new Error('Failed to get signature')
        }
        return signature
      }

      console.log('🎫 Sponsoring and executing transaction...')
      
      // Use Enoki to sponsor and execute
      const result = await sponsorAndExecuteTransaction(
        txb,
        currentAccount.address,
        signFn,
        allowedMoveCallTargets,
        allowedAddresses
      )

      console.log('✅ Sponsored transaction success:', result.txDigest)
      onSuccess?.(result.txDigest)
      setIsLoading(false)
      
    } catch (error) {
      console.error('❌ Sponsored transaction error:', error)
      onError?.(error as Error)
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleTransaction}
      disabled={isLoading}
      className="quiz-button disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Processing (Sponsored)...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
