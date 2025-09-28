// Real Seal Key Generation Script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating Real Seal Master Keys...');
console.log('=====================================');

try {
  // Set Rust PATH
  process.env.PATH += `;${process.env.USERPROFILE}\\.cargo\\bin`;
  
  // Check if seal-cli exists
  const sealCliPath = path.join(__dirname, 'seal-repo', 'target', 'debug', 'seal-cli.exe');
  const sealCliPathRelease = path.join(__dirname, 'seal-repo', 'target', 'release', 'seal-cli.exe');
  
  let binaryPath = '';
  if (fs.existsSync(sealCliPathRelease)) {
    binaryPath = sealCliPathRelease;
    console.log('✅ Using release build');
  } else if (fs.existsSync(sealCliPath)) {
    binaryPath = sealCliPath;
    console.log('✅ Using debug build');
  } else {
    console.log('❌ seal-cli not found. Building...');
    console.log('This may take a few minutes...');
    
    // Build seal-cli
    execSync('cargo build --bin seal-cli', { 
      cwd: path.join(__dirname, 'seal-repo'),
      stdio: 'inherit'
    });
    
    if (fs.existsSync(sealCliPath)) {
      binaryPath = sealCliPath;
      console.log('✅ seal-cli built successfully');
    } else {
      throw new Error('Build failed');
    }
  }

  console.log('🔑 Generating master key...');
  
  // Generate master key
  const output = execSync(`"${binaryPath}" genkey`, { 
    cwd: path.join(__dirname, 'seal-repo'),
    encoding: 'utf8'
  });

  console.log('Seal CLI Output:');
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

  if (!masterKey || !publicKey) {
    throw new Error('Could not extract keys from output');
  }

  console.log('');
  console.log('🔑 Generated Keys:');
  console.log(`Master Key: ${masterKey}`);
  console.log(`Public Key: ${publicKey}`);

  // Save keys to environment file
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').replace('T', '');
  const envContent = `

# Real Seal Protocol Master Keys (GENERATED - KEEP SECURE!)
VITE_SEAL_MASTER_KEY=${masterKey}
VITE_SEAL_PUBLIC_KEY=${publicKey}
VITE_SEAL_KEY_SERVER_NAME=SuiKnow-Real-${timestamp}
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
  console.log('3. Start the real key server');

} catch (error) {
  console.error('❌ Error generating keys:', error.message);
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('1. Make sure Rust is installed: rustc --version');
  console.log('2. Make sure you are in the correct directory');
  console.log('3. Try building manually: cd seal-repo && cargo build --bin seal-cli');
}


