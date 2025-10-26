#!/usr/bin/env node
/**
 * Enoki Sponsored Transaction Backend
 * Handles transaction sponsorship using Enoki SDK
 */

import express from 'express';
import cors from 'cors';
import { EnokiClient } from '@mysten/enoki';
import { Transaction } from '@mysten/sui/transactions';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Node 18 polyfill for crypto global (Enoki SDK needs it)
if (!globalThis.crypto) {
  globalThis.crypto = crypto.webcrypto;
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Enable CORS
app.use(cors());
app.use(express.json());

// Initialize Enoki client with PRIVATE key (backend only!)
const enokiClient = new EnokiClient({
  apiKey: process.env.ENOKI_PRIVATE_KEY || process.env.VITE_ENOKI_PRIVATE_KEY,
});

console.log('🔐 Enoki client initialized');

/**
 * POST /api/sponsor-transaction
 * Creates a sponsored transaction
 */
app.post('/api/sponsor-transaction', async (req, res) => {
  try {
    const { transactionKindBytes, sender, allowedMoveCallTargets, allowedAddresses, network } = req.body;

    if (!transactionKindBytes || !sender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: transactionKindBytes, sender',
      });
    }

    console.log('📝 Sponsoring transaction...');
    console.log('   Sender:', sender);
    console.log('   Network:', network || 'testnet');
    console.log('   Allowed targets:', allowedMoveCallTargets);
    console.log('   Allowed addresses:', allowedAddresses);

    // Create sponsored transaction using Enoki
    const sponsored = await enokiClient.createSponsoredTransaction({
      network: network || 'testnet',
      transactionKindBytes,
      sender,
      allowedMoveCallTargets: allowedMoveCallTargets || [],
      allowedAddresses: allowedAddresses || [],
    });

    console.log('✅ Transaction sponsored');
    console.log('   Digest:', sponsored.digest);

    res.json({
      success: true,
      bytes: sponsored.bytes,
      digest: sponsored.digest,
    });
  } catch (error) {
    console.error('❌ Sponsorship error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to sponsor transaction',
      error: error.toString(),
    });
  }
});

/**
 * POST /api/execute-sponsored-transaction
 * Executes a sponsored transaction with user signature
 */
app.post('/api/execute-sponsored-transaction', async (req, res) => {
  try {
    const { digest, signature } = req.body;

    if (!digest || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: digest, signature',
      });
    }

    console.log('🚀 Executing sponsored transaction...');
    console.log('   Digest:', digest);

    // Execute sponsored transaction using Enoki
    const result = await enokiClient.executeSponsoredTransaction({
      digest,
      signature,
    });

    console.log('✅ Transaction executed');
    console.log('   TX Digest:', result.digest);

    res.json({
      success: true,
      txDigest: result.digest,
      effects: result.effects,
    });
  } catch (error) {
    console.error('❌ Execution error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to execute transaction',
      error: error.toString(),
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    enoki: 'ready',
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Enoki Sponsored Transaction Backend Started');
  console.log('================================================');
  console.log('   Port:', PORT);
  console.log('   Sponsor endpoint: POST http://localhost:' + PORT + '/api/sponsor-transaction');
  console.log('   Execute endpoint: POST http://localhost:' + PORT + '/api/execute-sponsored-transaction');
  console.log('   Health check: GET http://localhost:' + PORT + '/health');
  console.log('');
  console.log('⚠️  Make sure to set ENOKI_PRIVATE_KEY environment variable!');
  console.log('');
});
