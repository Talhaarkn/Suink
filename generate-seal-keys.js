// Seal Key Generation Script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating Seal Master Keys...');
console.log('================================');

try {
  // Check if seal-cli is built
  const sealCliPath = path.join(__dirname, 'seal-repo', 'target', 'debug', 'seal-cli');
  
  if (!fs.existsSync(sealCliPath)) {
    console.log('❌ seal-cli not found. Building...');
    console.log('This may take a few minutes...');
    
    // Build seal-cli
    execSync('cargo build --bin seal-cli', { 
      cwd: path.join(__dirname, 'seal-repo'),
      stdio: 'inherit'
    });
  }

  console.log('✅ seal-cli found. Generating master key...');

  // Generate master key
  const output = execSync(`${sealCliPath} genkey`, { 
    cwd: path.join(__dirname, 'seal-repo'),
    encoding: 'utf8'
  });

  console.log('🔑 Master Key Generated:');
  console.log(output);

  // Parse the output to extract keys
  const lines = output.split('\n');
  let masterKey = '';
  let publicKey = '';

  for (const line of lines) {
    if (line.startsWith('Master key:')) {
      masterKey = line.split('Master key:')[1].trim();
    } else if (line.startsWith('Public key:')) {
      publicKey = line.split('Public key:')[1].trim();
    }
  }

  // Save keys to environment file
  const envContent = `
# Seal Protocol Master Keys (GENERATED - KEEP SECURE!)
VITE_SEAL_MASTER_KEY=${masterKey}
VITE_SEAL_PUBLIC_KEY=${publicKey}
VITE_SEAL_KEY_SERVER_NAME=SuiKnow-KeyServer-${Date.now()}
`;

  // Append to .env file
  fs.appendFileSync('.env', envContent);

  console.log('✅ Keys saved to .env file');
  console.log('');
  console.log('🔐 IMPORTANT SECURITY NOTES:');
  console.log('1. Keep the master key SECRET and secure');
  console.log('2. Never commit the master key to version control');
  console.log('3. Use environment variables in production');
  console.log('');
  console.log('📋 Next Steps:');
  console.log('1. Register key server on Sui testnet');
  console.log('2. Update key_server_object_id in config');
  console.log('3. Start the key server');

} catch (error) {
  console.error('❌ Error generating keys:', error.message);
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('1. Make sure Rust is installed: rustc --version');
  console.log('2. Make sure you are in the correct directory');
  console.log('3. Try building manually: cd seal-repo && cargo build --bin seal-cli');
}


