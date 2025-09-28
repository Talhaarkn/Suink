// Seal Key Server Startup Script
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Seal Key Server...');
console.log('==============================');

try {
  // Read environment variables
  const envContent = fs.readFileSync('.env', 'utf8');
  const envLines = envContent.split('\n');
  
  let masterKey = '';
  let objectId = '';
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SEAL_MASTER_KEY=')) {
      masterKey = line.split('=')[1].trim();
    } else if (line.startsWith('VITE_SEAL_KEY_SERVER_OBJECT_ID=')) {
      objectId = line.split('=')[1].trim();
    }
  }

  if (!masterKey) {
    throw new Error('Master key not found. Run generate-seal-keys.js first.');
  }

  if (!objectId) {
    console.log('⚠️  Key server object ID not found. Run register-seal-server.js first.');
    console.log('Starting with empty object ID (for testing)...');
  }

  // Check if key-server binary exists
  const keyServerPath = path.join(__dirname, 'seal-repo', 'target', 'debug', 'key-server');
  const keyServerPathRelease = path.join(__dirname, 'seal-repo', 'target', 'release', 'key-server');
  
  let binaryPath = '';
  if (fs.existsSync(keyServerPathRelease)) {
    binaryPath = keyServerPathRelease;
  } else if (fs.existsSync(keyServerPath)) {
    binaryPath = keyServerPath;
  } else {
    throw new Error('key-server binary not found. Building...');
  }

  console.log(`Using binary: ${binaryPath}`);
  console.log(`Master Key: ${masterKey.substring(0, 20)}...`);
  console.log(`Object ID: ${objectId || 'Not set'}`);
  console.log('');

  // Set environment variables
  const env = {
    ...process.env,
    MASTER_KEY: masterKey,
    CONFIG_PATH: path.join(__dirname, 'seal-key-server-config.yaml'),
    NODE_URL: 'https://fullnode.testnet.sui.io:443'
  };

  // Start the key server
  console.log('🔧 Starting Seal Key Server...');
  console.log('Server will be available at: http://localhost:2024');
  console.log('Health check: http://localhost:2024/health');
  console.log('Metrics: http://localhost:2024/metrics');
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('================================');
  console.log('');

  const serverProcess = spawn(binaryPath, [], {
    env,
    stdio: 'inherit',
    cwd: path.join(__dirname, 'seal-repo')
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Error starting key server:', error.message);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('1. Make sure the binary is built: cargo build --bin key-server');
    console.log('2. Check the configuration file');
    console.log('3. Verify environment variables');
  });

  serverProcess.on('close', (code) => {
    console.log(`\n🛑 Key server stopped with code ${code}`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down key server...');
    serverProcess.kill('SIGINT');
  });

} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('1. Run generate-seal-keys.js first');
  console.log('2. Run register-seal-server.js to register on testnet');
  console.log('3. Make sure Rust and Sui CLI are installed');
}


