// Enoki Sponsored Transaction Service - Client-side signature approach
import { EnokiClient } from '@mysten/enoki';
import { Transaction } from '@mysten/sui/transactions';
import { toB64, fromB64 } from '@mysten/sui/utils';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

export const ENOKI_CONFIG = {
  NETWORK: (import.meta.env.VITE_SUI_NETWORK || 'testnet') as 'testnet' | 'mainnet',
  PUBLIC_KEY: import.meta.env.VITE_ENOKI_PUBLIC_KEY || 'enoki_public_6e46f0c830405ece028b6c6d7a938b73',
};

// Create Sui client
const suiClient = new SuiClient({
  url: import.meta.env.VITE_SUI_RPC_URL || getFullnodeUrl(ENOKI_CONFIG.NETWORK),
});

/**
 * Create sponsored transaction using Enoki
 * This is typically called from the frontend
 */
export async function createSponsoredTransaction(
  tx: Transaction,
  senderAddress: string,
  allowedMoveCallTargets: string[] = [],
  allowedAddresses: string[] = []
): Promise<{ bytes: string; digest: string }> {
  try {
    console.log('📝 Creating sponsored transaction...');
    console.log('   Sender:', senderAddress);
    console.log('   Allowed targets:', allowedMoveCallTargets);
    console.log('   Allowed addresses:', allowedAddresses);

    // Build transaction kind bytes (only transaction kind, not full transaction)
    const txBytes = await tx.build({
      client: suiClient,
      onlyTransactionKind: true,
    });

    console.log('   Transaction kind bytes built');

    // Make request to backend to sponsor the transaction
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3004';
    
    const response = await fetch(`${backendUrl}/api/sponsor-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionKindBytes: toB64(txBytes),
        sender: senderAddress,
        allowedMoveCallTargets,
        allowedAddresses,
        network: ENOKI_CONFIG.NETWORK,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `Sponsorship failed: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('✅ Transaction sponsored successfully');
    console.log('   Digest:', result.digest);

    return {
      bytes: result.bytes,
      digest: result.digest,
    };
  } catch (error) {
    console.error('❌ Failed to create sponsored transaction:', error);
    throw error;
  }
}

/**
 * Execute sponsored transaction with user signature
 */
export async function executeSponsoredTransaction(
  digest: string,
  signature: string
): Promise<{ txDigest: string }> {
  try {
    console.log('🚀 Executing sponsored transaction...');
    console.log('   Digest:', digest);

    // Make request to backend to execute the transaction
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3004';
    
    const response = await fetch(`${backendUrl}/api/execute-sponsored-transaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        digest,
        signature,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `Execution failed: ${response.statusText}`);
    }

    const result = await response.json();

    console.log('✅ Transaction executed successfully');
    console.log('   TX Digest:', result.txDigest);

    return {
      txDigest: result.txDigest,
    };
  } catch (error) {
    console.error('❌ Failed to execute sponsored transaction:', error);
    throw error;
  }
}

/**
 * Full workflow: Create, sign, and execute sponsored transaction
 */
export async function sponsorAndExecuteTransaction(
  tx: Transaction,
  senderAddress: string,
  signTransaction: (bytes: Uint8Array) => Promise<string>,
  allowedMoveCallTargets: string[] = [],
  allowedAddresses: string[] = []
): Promise<{ txDigest: string }> {
  try {
    // Step 1: Create sponsored transaction
    const { bytes, digest } = await createSponsoredTransaction(
      tx,
      senderAddress,
      allowedMoveCallTargets,
      allowedAddresses
    );

    // Step 2: Get user signature
    console.log('✍️  Requesting user signature...');
    const signature = await signTransaction(fromB64(bytes));
    console.log('✅ Signature received');

    // Step 3: Execute sponsored transaction
    const result = await executeSponsoredTransaction(digest, signature);

    return result;
  } catch (error) {
    console.error('❌ Sponsored transaction workflow failed:', error);
    throw error;
  }
}
