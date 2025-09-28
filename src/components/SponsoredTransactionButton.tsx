import React, { useState } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'

interface SponsoredTransactionButtonProps {
  onSuccess?: (digest: string) => void
  onError?: (error: Error) => void
  children: React.ReactNode
  transaction?: (txb: Transaction) => void
}

export function SponsoredTransactionButton({ 
  onSuccess, 
  onError, 
  children, 
  transaction 
}: SponsoredTransactionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const currentAccount = useCurrentAccount()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const client = useSuiClient()

  const handleTransaction = async () => {
    try {
      setIsLoading(true)
      
      // Check if user is connected
      if (!currentAccount) {
        throw new Error('Please connect your wallet first')
      }

      console.log('Creating transaction for account:', currentAccount.address)
      
      // Create transaction using the provided transaction or create a default one
      const txb = new Transaction()
      
      // Set the sender for the transaction
      txb.setSender(currentAccount.address)
      
      if (typeof transaction === 'function') {
        // Use the provided transaction logic
        ;(transaction as (txb: Transaction) => void)(txb)
      } else if (transaction !== undefined) {
        console.warn('SponsoredTransactionButton: "transaction" prop is not a function. Ignoring it.', transaction)
      } else {
        // Default transaction: just a simple move call or empty transaction
        // For now, we'll create an empty transaction that just pays gas
        console.log('Using default empty transaction')
      }

      // Build the transaction with gas coin selection
      const transactionBlockKindBytes = await txb.build({ 
        client: client as any, // Type assertion to avoid type conflicts
        onlyTransactionKind: false // We need full transaction to get gas coins
      })
      
      console.log('Transaction built successfully:', transactionBlockKindBytes)

      // Sign and execute the transaction
      signAndExecute(
        {
          transaction: txb as any, // Type assertion to avoid type conflicts
        },
        {
          onSuccess: (result) => {
            console.log('Transaction success:', result.digest)
            onSuccess?.(result.digest)
            setIsLoading(false)
          },
          onError: (error) => {
            console.error('Transaction error:', error)
            onError?.(error as Error)
            setIsLoading(false)
          },
        }
      )
      
    } catch (error) {
      console.error('Transaction error:', error)
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
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
