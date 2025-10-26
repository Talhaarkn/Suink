#!/usr/bin/env node
/**
 * Walrus SDK Read Test
 * Tests reading files from Walrus using the SDK
 */

// Test reading the file we uploaded earlier
const TEST_BLOB_ID = 'gxjevy-kU69acveRtSzHoLPj8yqgCjqYBKtxXyzaTO0';

console.log('🧪 Walrus SDK Read Test');
console.log('📝 Testing blob ID:', TEST_BLOB_ID);
console.log('');

// Note: This test must be run in a browser environment or with proper polyfills
console.log('ℹ️  This test should be run in the browser console where the app is running.');
console.log('');
console.log('To test in browser console:');
console.log('1. Open http://localhost:3002 (dev server)');
console.log('2. Open browser console (F12)');
console.log('3. Run:');
console.log('');
console.log('   import { realWalrusService } from "./src/lib/realWalrusService"');
console.log(`   await realWalrusService.readFileAsText("${TEST_BLOB_ID}")`);
console.log('');
console.log('Expected output: "Walrus CLI test - Paz 26 Eki 2025 01:11:02 +03"');
console.log('');
console.log('Or test with the new read methods:');
console.log('');
console.log(`   const bytes = await realWalrusService.readFile("${TEST_BLOB_ID}")`);
console.log('   console.log("File size:", bytes.length, "bytes")');
console.log('');
console.log(`   const text = await realWalrusService.readFileAsText("${TEST_BLOB_ID}")`);
console.log('   console.log("Content:", text)');
