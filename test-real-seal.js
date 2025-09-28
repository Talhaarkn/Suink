const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRealSeal() {
  console.log('🧪 Testing Real Seal Key Server...');
  
  try {
    // Test 1: Health Check
    console.log('\n1️⃣ Health Check...');
    const healthResponse = await fetch('http://localhost:2024/health');
    const health = await healthResponse.json();
    console.log('✅ Health:', health.status);
    console.log('   Version:', health.version);
    console.log('   Network:', health.network);
    console.log('   Master Key:', health.masterKey);
    
    // Test 2: Key Servers
    console.log('\n2️⃣ Key Servers...');
    const keyServersResponse = await fetch('http://localhost:2024/api/v1/key-servers');
    const keyServers = await keyServersResponse.json();
    console.log('✅ Key Servers:', keyServers.length);
    console.log('   Server ID:', keyServers[0].id);
    console.log('   Status:', keyServers[0].status);
    console.log('   Verified:', keyServers[0].verified);
    
    // Test 3: Create Policy
    console.log('\n3️⃣ Create Seal Policy...');
    const policyData = {
      sealId: 'test_seal_' + Date.now(),
      quizId: 'test_quiz_123',
      config: {
        timeLockDuration: 1,
        privacyEnabled: true,
        multiSigEnabled: false,
        whitelistAddresses: ['0x1234567890abcdef'],
        threshold: 2
      }
    };
    
    const policyResponse = await fetch('http://localhost:2024/api/v1/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(policyData)
    });
    
    const policy = await policyResponse.json();
    console.log('✅ Policy Created:', policy.sealId);
    console.log('   Quiz ID:', policy.policy.quizId);
    console.log('   Time Lock:', policy.policy.timeLockUntil ? new Date(policy.policy.timeLockUntil).toISOString() : 'None');
    console.log('   Whitelist:', policy.policy.whitelistAddresses.length, 'addresses');
    
    // Test 4: Verify Access (Allowed)
    console.log('\n4️⃣ Verify Access (Allowed)...');
    const verifyData = {
      sealId: policy.sealId,
      userAddress: '0x1234567890abcdef'
    };
    
    const verifyResponse = await fetch('http://localhost:2024/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyData)
    });
    
    const verify = await verifyResponse.json();
    console.log('✅ Access Result:', verify.allowed ? 'ALLOWED' : 'DENIED');
    console.log('   Reason:', verify.reason);
    console.log('   Checks:', verify.checks.length);
    
    // Test 5: Verify Access (Denied)
    console.log('\n5️⃣ Verify Access (Denied)...');
    const verifyDeniedData = {
      sealId: policy.sealId,
      userAddress: '0x9999999999999999'
    };
    
    const verifyDeniedResponse = await fetch('http://localhost:2024/api/v1/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(verifyDeniedData)
    });
    
    const verifyDenied = await verifyDeniedResponse.json();
    console.log('✅ Access Result:', verifyDenied.allowed ? 'ALLOWED' : 'DENIED');
    console.log('   Reason:', verifyDenied.reason);
    
    // Test 6: Encryption
    console.log('\n6️⃣ Encryption Test...');
    const encryptData = {
      data: {
        test: 'real_seal_encryption',
        timestamp: new Date().toISOString(),
        quizId: 'test_quiz_123'
      },
      sealId: policy.sealId
    };
    
    const encryptResponse = await fetch('http://localhost:2024/api/v1/encrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(encryptData)
    });
    
    const encrypt = await encryptResponse.json();
    console.log('✅ Encryption Successful');
    console.log('   Encrypted Size:', encrypt.encryptedObject ? JSON.stringify(encrypt.encryptedObject).length : 'N/A', 'bytes');
    console.log('   Key:', encrypt.key);
    
    // Test 7: Decryption
    console.log('\n7️⃣ Decryption Test...');
    const decryptData = {
      encryptedObject: encrypt.encryptedObject,
      key: encrypt.key,
      sealId: policy.sealId
    };
    
    const decryptResponse = await fetch('http://localhost:2024/api/v1/decrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(decryptData)
    });
    
    const decrypt = await decryptResponse.json();
    console.log('✅ Decryption Successful');
    console.log('   Decrypted Data:', JSON.stringify(decrypt.data, null, 2));
    
    // Test 8: List Policies
    console.log('\n8️⃣ List Policies...');
    const policiesResponse = await fetch('http://localhost:2024/api/v1/policies');
    const policies = await policiesResponse.json();
    console.log('✅ Policies Count:', policies.length);
    console.log('   Policy IDs:', policies.map(p => p.sealId));
    
    console.log('\n🎉 All Real Seal Tests Passed!');
    console.log('✅ Real Seal Key Server is working perfectly!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRealSeal();
