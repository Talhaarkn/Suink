// Mock Seal Key Server for Development and Testing
// Bu server Seal Protocol API'sini simüle eder

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 2024;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Request-Id', 'Client-Sdk-Type', 'Client-Sdk-Version'],
  exposedHeaders: ['x-keyserver-version']
}));

app.use(express.json());

// Mock Seal policies storage
let sealPolicies = new Map();
let masterKey = 'mock_master_key_' + Math.random().toString(16).substr(2, 8);

console.log('🔐 Mock Seal Key Server Starting...');
console.log('==================================');
console.log(`Master Key: ${masterKey}`);
console.log(`Port: ${PORT}`);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0-mock',
    timestamp: new Date().toISOString(),
    masterKey: masterKey.substring(0, 20) + '...'
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP seal_requests_total Total number of Seal requests
# TYPE seal_requests_total counter
seal_requests_total{method="create_policy"} ${sealPolicies.size}
seal_requests_total{method="verify_access"} 0
seal_requests_total{method="encrypt"} 0
seal_requests_total{method="decrypt"} 0

# HELP seal_policies_total Total number of active policies
# TYPE seal_policies_total gauge
seal_policies_total ${sealPolicies.size}
  `);
});

// Create Seal policy endpoint
app.post('/api/v1/policies', (req, res) => {
  try {
    const { quizId, config } = req.body;
    
    const policyId = `seal_${Date.now()}_${Math.random().toString(16).substr(2, 8)}`;
    
    const policy = {
      id: policyId,
      quizId,
      config,
      createdAt: new Date().toISOString(),
      timeLockUntil: config.timeLockDuration > 0 
        ? new Date(Date.now() + (config.timeLockDuration * 60 * 60 * 1000)).toISOString()
        : null,
      whitelistAddresses: config.whitelistAddresses || [],
      privacyEnabled: config.privacyEnabled || false,
      multiSigEnabled: config.multiSigEnabled || false
    };
    
    sealPolicies.set(policyId, policy);
    
    console.log(`✅ Created Seal policy: ${policyId}`);
    console.log(`   Quiz ID: ${quizId}`);
    console.log(`   Time Lock: ${policy.timeLockUntil || 'None'}`);
    console.log(`   Whitelist: ${policy.whitelistAddresses.length} addresses`);
    console.log(`   Privacy: ${policy.privacyEnabled}`);
    
    res.json({
      success: true,
      policyId,
      policy
    });
    
  } catch (error) {
    console.error('❌ Error creating policy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Verify access endpoint
app.post('/api/v1/verify', (req, res) => {
  try {
    const { policyId, userAddress } = req.body;
    
    const policy = sealPolicies.get(policyId);
    if (!policy) {
      return res.json({
        success: false,
        allowed: false,
        reason: 'Policy not found'
      });
    }
    
    // Check time lock
    if (policy.timeLockUntil) {
      const now = new Date();
      const unlockTime = new Date(policy.timeLockUntil);
      if (now < unlockTime) {
        return res.json({
          success: true,
          allowed: false,
          reason: 'Quiz is still time-locked',
          timeLockUntil: policy.timeLockUntil
        });
      }
    }
    
    // Check whitelist
    if (policy.whitelistAddresses.length > 0) {
      const isWhitelisted = policy.whitelistAddresses.includes(userAddress.toLowerCase());
      if (!isWhitelisted) {
        return res.json({
          success: true,
          allowed: false,
          reason: 'Address not whitelisted'
        });
      }
    }
    
    console.log(`✅ Access granted for ${userAddress} to policy ${policyId}`);
    
    res.json({
      success: true,
      allowed: true,
      policy
    });
    
  } catch (error) {
    console.error('❌ Error verifying access:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Encrypt data endpoint
app.post('/api/v1/encrypt', (req, res) => {
  try {
    const { data, policyId } = req.body;
    
    // Simple base64 encoding for mock
    const encryptedData = Buffer.from(JSON.stringify(data)).toString('base64');
    
    console.log(`🔒 Encrypted data for policy ${policyId}`);
    
    res.json({
      success: true,
      encryptedData,
      algorithm: 'mock-base64'
    });
    
  } catch (error) {
    console.error('❌ Error encrypting data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Decrypt data endpoint
app.post('/api/v1/decrypt', (req, res) => {
  try {
    const { encryptedData, policyId } = req.body;
    
    // Simple base64 decoding for mock
    const decryptedData = JSON.parse(Buffer.from(encryptedData, 'base64').toString());
    
    console.log(`🔓 Decrypted data for policy ${policyId}`);
    
    res.json({
      success: true,
      data: decryptedData
    });
    
  } catch (error) {
    console.error('❌ Error decrypting data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get policy endpoint
app.get('/api/v1/policies/:policyId', (req, res) => {
  try {
    const { policyId } = req.params;
    const policy = sealPolicies.get(policyId);
    
    if (!policy) {
      return res.status(404).json({
        success: false,
        error: 'Policy not found'
      });
    }
    
    res.json({
      success: true,
      policy
    });
    
  } catch (error) {
    console.error('❌ Error getting policy:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// List all policies endpoint
app.get('/api/v1/policies', (req, res) => {
  try {
    const policies = Array.from(sealPolicies.values());
    
    res.json({
      success: true,
      policies,
      count: policies.length
    });
    
  } catch (error) {
    console.error('❌ Error listing policies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Mock Seal Key Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`🔐 API Base: http://localhost:${PORT}/api/v1`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  POST /api/v1/policies - Create Seal policy');
  console.log('  POST /api/v1/verify - Verify access');
  console.log('  POST /api/v1/encrypt - Encrypt data');
  console.log('  POST /api/v1/decrypt - Decrypt data');
  console.log('  GET  /api/v1/policies/:id - Get policy');
  console.log('  GET  /api/v1/policies - List all policies');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Mock Seal Key Server...');
  process.exit(0);
});


