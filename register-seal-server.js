// Seal Key Server Registration Script
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌐 Registering Seal Key Server on Sui Testnet...');
console.log('===============================================');

try {
  // Read environment variables
  const envContent = fs.readFileSync('.env', 'utf8');
  const envLines = envContent.split('\n');
  
  let masterKey = '';
  let publicKey = '';
  let serverName = '';
  
  for (const line of envLines) {
    if (line.startsWith('VITE_SEAL_MASTER_KEY=')) {
      masterKey = line.split('=')[1].trim();
    } else if (line.startsWith('VITE_SEAL_PUBLIC_KEY=')) {
      publicKey = line.split('=')[1].trim();
    } else if (line.startsWith('VITE_SEAL_KEY_SERVER_NAME=')) {
      serverName = line.split('=')[1].trim();
    }
  }

  if (!masterKey || !publicKey || !serverName) {
    throw new Error('Missing required environment variables. Run generate-seal-keys.js first.');
  }

  console.log(`Server Name: ${serverName}`);
  console.log(`Public Key: ${publicKey.substring(0, 20)}...`);
  console.log('');

  // Check if Sui CLI is available
  try {
    execSync('sui --version', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Sui CLI not found. Please install Sui CLI first.');
  }

  // Switch to testnet
  console.log('🔄 Switching to Sui testnet...');
  execSync('sui client switch --env testnet', { stdio: 'inherit' });

  // Get active address
  console.log('📍 Getting active address...');
  const activeAddress = execSync('sui client active-address', { encoding: 'utf8' }).trim();
  console.log(`Active Address: ${activeAddress}`);

  // Check if address has funds
  console.log('💰 Checking address balance...');
  try {
    const balance = execSync(`sui client balance`, { encoding: 'utf8' });
    console.log('Balance:', balance);
  } catch (error) {
    console.log('⚠️  Address may need funding. You can get testnet SUI from faucet.');
  }

  // Register key server
  console.log('🚀 Registering key server on Sui testnet...');
  console.log('This will create a transaction on the blockchain...');
  
  const packageId = '0x927a54e9ae803f82ebf480136a9bcff45101ccbe28b13f433c89f5181069d682';
  const serverUrl = 'https://your-server-url.com'; // Update this with your actual URL
  
  const command = `sui client call --function create_and_transfer_v1 --module key_server --package ${packageId} --args "${serverName}" "${serverUrl}" 0 "${publicKey}"`;
  
  console.log('Command:', command);
  console.log('');
  
  const result = execSync(command, { encoding: 'utf8' });
  console.log('✅ Key server registration result:');
  console.log(result);

  // Extract object ID from result
  const objectIdMatch = result.match(/object of type key_server::KeyServer <([^>]+)>/);
  if (objectIdMatch) {
    const objectId = objectIdMatch[1];
    console.log(`🎯 Key Server Object ID: ${objectId}`);
    
    // Update config file
    const configPath = 'seal-key-server-config.yaml';
    let configContent = fs.readFileSync(configPath, 'utf8');
    configContent = configContent.replace(
      'key_server_object_id: ""',
      `key_server_object_id: "${objectId}"`
    );
    fs.writeFileSync(configPath, configContent);
    
    // Update .env file
    const envUpdate = `VITE_SEAL_KEY_SERVER_OBJECT_ID=${objectId}\n`;
    fs.appendFileSync('.env', envUpdate);
    
    console.log('✅ Configuration files updated');
    console.log('');
    console.log('🎉 Key server successfully registered!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Update server URL in the registration');
    console.log('2. Start the key server with: npm run start-seal-server');
    console.log('3. Test the integration');
    
  } else {
    console.log('⚠️  Could not extract object ID from result');
    console.log('Please check the transaction result manually');
  }

} catch (error) {
  console.error('❌ Error registering key server:', error.message);
  console.log('');
  console.log('🔧 Troubleshooting:');
  console.log('1. Make sure Sui CLI is installed and configured');
  console.log('2. Make sure you have testnet SUI tokens');
  console.log('3. Check your internet connection');
  console.log('4. Verify the package ID is correct');
}


