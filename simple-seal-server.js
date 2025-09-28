const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 2024;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0-simple',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint working!' });
});

// Encrypt endpoint
app.post('/api/v1/encrypt', (req, res) => {
  console.log('🔒 Encrypt request received:', req.body);
  
  res.json({ 
    encryptedObject: {
      encrypted: "test_encrypted_data",
      iv: "test_iv",
      authTag: "test_auth_tag"
    },
    key: "test_key_123",
    sealId: "test_seal_id_456"
  });
});

// Decrypt endpoint
app.post('/api/v1/decrypt', (req, res) => {
  console.log('🔓 Decrypt request received:', req.body);
  
  res.json({ 
    decryptedData: "test_decrypted_data"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Simple Seal Key Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log(`🔐 API Base: http://localhost:${PORT}/api/v1`);
});

