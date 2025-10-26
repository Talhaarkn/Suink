#!/usr/bin/env node
/**
 * Walrus Upload Test Script
 * Tests real Walrus publisher endpoints with a simple file upload
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

// Create a small test file
const testContent = `Test file for Walrus
Timestamp: ${new Date().toISOString()}
Random: ${Math.random()}`;

const testBuffer = Buffer.from(testContent, 'utf-8');

console.log('🧪 Walrus Upload Test Script');
console.log('📦 Test file size:', testBuffer.length, 'bytes');
console.log('');

// Walrus testnet publisher endpoints
const publishers = [
  'https://wal-publisher-testnet.staketab.org',
  'https://walrus-testnet-publisher.bartestnet.com',
  'https://walrus-testnet.blockscope.net',
  'https://publisher.walrus-testnet.walrus.space',
];

const numEpochs = 1; // Store for 1 epoch for testing

async function testPublisher(publisherBaseUrl, method = 'PUT') {
  return new Promise((resolve, reject) => {
    const url = new URL(`${publisherBaseUrl}/v1/store?epochs=${numEpochs}`);
    
    console.log(`🔄 Testing: ${publisherBaseUrl} (${method})`);
    console.log(`   URL: ${url.href}`);
    
    const protocol = url.protocol === 'https:' ? https : http;
    
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Length': testBuffer.length,
      },
      timeout: 30000, // 30 second timeout
    };
    
    const startTime = Date.now();
    
    const req = protocol.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const duration = Date.now() - startTime;
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          try {
            const result = JSON.parse(data);
            console.log(`✅ Success! (${duration}ms)`);
            console.log(`   Response:`, JSON.stringify(result, null, 2));
            
            // Extract blob ID
            let blobId = null;
            if (result.newlyCreated?.blobObject?.blobId) {
              blobId = result.newlyCreated.blobObject.blobId;
            } else if (result.alreadyCertified?.blobId) {
              blobId = result.alreadyCertified.blobId;
            } else if (result.blobId) {
              blobId = result.blobId;
            }
            
            if (blobId) {
              const walrusUrl = `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;
              console.log(`   📝 Blob ID: ${blobId}`);
              console.log(`   🔗 Walrus URL: ${walrusUrl}`);
            }
            
            resolve({ success: true, publisher: publisherBaseUrl, method, duration, blobId, response: result });
          } catch (e) {
            console.log(`⚠️  Response not JSON (${duration}ms):`, data.substring(0, 200));
            resolve({ success: false, publisher: publisherBaseUrl, method, error: 'Invalid JSON response' });
          }
        } else {
          console.log(`❌ Failed with status ${res.statusCode} (${duration}ms)`);
          console.log(`   Response:`, data.substring(0, 200));
          resolve({ success: false, publisher: publisherBaseUrl, method, error: `HTTP ${res.statusCode}` });
        }
      });
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      console.log(`❌ Error (${duration}ms):`, error.message);
      resolve({ success: false, publisher: publisherBaseUrl, method, error: error.message });
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`⏱️  Timeout after 30s`);
      resolve({ success: false, publisher: publisherBaseUrl, method, error: 'Timeout' });
    });
    
    // Write test data
    req.write(testBuffer);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Walrus publisher tests...\n');
  
  const results = [];
  
  // Test each publisher with both PUT and POST
  for (const publisher of publishers) {
    for (const method of ['PUT', 'POST']) {
      const result = await testPublisher(publisher, method);
      results.push(result);
      console.log(''); // Empty line between tests
      
      // If successful, we can stop testing
      if (result.success) {
        console.log('✅ Found working publisher! Stopping tests.\n');
        break;
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // If we found a working publisher, stop
    if (results[results.length - 1].success) {
      break;
    }
  }
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('================');
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`Total tests: ${results.length}`);
  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ Walrus is working! Working publishers:');
    successful.forEach(r => {
      console.log(`   - ${r.publisher} (${r.method}) - ${r.duration}ms`);
    });
    
    // Try to fetch the uploaded file
    if (successful[0].blobId) {
      console.log('\n🔍 Testing file retrieval...');
      const walrusUrl = `https://aggregator.walrus-testnet.walrus.space/v1/${successful[0].blobId}`;
      console.log(`   URL: ${walrusUrl}`);
      
      // Test retrieval
      https.get(walrusUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('✅ File retrieved successfully!');
            console.log('   Content:', data);
          } else {
            console.log(`⚠️  Retrieval returned status ${res.statusCode}`);
          }
        });
      }).on('error', (e) => {
        console.log('❌ Retrieval failed:', e.message);
      });
    }
  } else {
    console.log('\n❌ All Walrus publishers failed!');
    console.log('\nCommon issues:');
    console.log('   1. Network connectivity issues');
    console.log('   2. Publishers are down/maintenance');
    console.log('   3. CORS/firewall blocking requests');
    console.log('   4. Testnet might be experiencing issues');
  }
}

runTests().catch(console.error);
