#!/usr/bin/env node
/**
 * Walrus Proxy Server
 * Provides HTTP API for uploading files to Walrus using CLI
 */

import express from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || process.env.WALRUS_PROXY_PORT || 3003;

// Enable CORS
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: '/tmp/walrus-uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

// Ensure upload directory exists
const uploadDir = '/tmp/walrus-uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

/**
 * Execute Walrus CLI command
 */
function executeWalrusCLI(args) {
  return new Promise((resolve, reject) => {
    const walrus = spawn('walrus', args);
    
    let stdout = '';
    let stderr = '';
    
    walrus.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    walrus.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    walrus.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`Walrus CLI failed with code ${code}: ${stderr}`));
      }
    });
    
    walrus.on('error', (error) => {
      reject(new Error(`Failed to execute Walrus CLI: ${error.message}`));
    });
  });
}

/**
 * Parse Walrus CLI output to extract blob ID
 */
function parseBlobId(output) {
  // Look for "Blob ID: <blob-id>" in output
  const match = output.match(/Blob ID:\s*([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Try alternative format
  const match2 = output.match(/blob_id:\s*([a-zA-Z0-9_-]+)/);
  if (match2 && match2[1]) {
    return match2[1];
  }
  
  throw new Error('Could not parse blob ID from Walrus output');
}

/**
 * POST /upload - Upload file to Walrus
 */
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = req.file.path;
    const epochs = parseInt(req.body.epochs) || 5;
    
    console.log('📤 Uploading file to Walrus:', req.file.originalname);
    console.log('   File path:', filePath);
    console.log('   Epochs:', epochs);
    
    // Execute Walrus CLI
    const output = await executeWalrusCLI(['store', filePath, '--epochs', epochs.toString()]);
    
    console.log('✅ Walrus CLI output:', output.substring(0, 500));
    
    // Parse blob ID from output
    const blobId = parseBlobId(output);
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    // Create aggregator URL
    const url = `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`;
    
    console.log('✅ File uploaded successfully');
    console.log('   Blob ID:', blobId);
    console.log('   URL:', url);
    
    res.json({
      success: true,
      fileId: blobId,
      blobId: blobId,
      url: url,
      size: req.file.size,
      uploadedAt: new Date().toISOString(),
      originalName: req.file.originalname,
    });
    
  } catch (error) {
    console.error('❌ Upload failed:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /read/:blobId - Read file from Walrus
 */
app.get('/read/:blobId', async (req, res) => {
  try {
    const { blobId } = req.params;
    const outputPath = `/tmp/walrus-${blobId}-${Date.now()}`;
    
    console.log('📖 Reading file from Walrus:', blobId);
    
    // Execute Walrus CLI
    const output = await executeWalrusCLI(['read', blobId]);
    
    // Write output to temporary file
    fs.writeFileSync(outputPath, output);
    
    // Send file
    res.sendFile(outputPath, (err) => {
      // Clean up temp file
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
      
      if (err) {
        console.error('❌ Send file error:', err);
      }
    });
    
  } catch (error) {
    console.error('❌ Read failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /health - Health check
 */
app.get('/health', async (req, res) => {
  try {
    // Check if Walrus CLI is available
    await executeWalrusCLI(['--version']);
    
    res.json({
      success: true,
      status: 'healthy',
      walrusCLI: 'available',
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      error: 'Walrus CLI not available',
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Walrus Proxy Server Started');
  console.log('================================');
  console.log('   Port:', PORT);
  console.log('   Upload endpoint: POST http://localhost:' + PORT + '/upload');
  console.log('   Read endpoint: GET http://localhost:' + PORT + '/read/:blobId');
  console.log('   Health check: GET http://localhost:' + PORT + '/health');
  console.log('');
  console.log('📝 Usage:');
  console.log('   curl -X POST -F "file=@myfile.txt" -F "epochs=5" http://localhost:' + PORT + '/upload');
  console.log('   curl http://localhost:' + PORT + '/read/<blob-id>');
  console.log('');
  console.log('⚠️  Make sure Walrus CLI is installed and in PATH');
  console.log('');
});
