// Walrus Service - Decentralized Storage Integration
import { SuiClient } from '@mysten/sui/client';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { fromB64, toB64 } from '@mysten/sui/utils';

export interface WalrusFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  hash: string;
  uploadedAt: string;
  uploadedBy: string;
  isPublic: boolean;
  metadata?: any;
}

export interface WalrusUploadResult {
  fileId: string;
  url: string;
  hash: string;
  size: number;
  uploadedAt: string;
}

export interface WalrusConfig {
  apiUrl: string;
  apiKey: string;
  bucketId: string;
  region: string;
}

class WalrusService {
  private suiClient: SuiClient;
  private config: WalrusConfig;
  private keyPair: Ed25519Keypair;

  constructor() {
    this.suiClient = new SuiClient({
      url: import.meta.env.VITE_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443'
    });

    this.config = {
      apiUrl: import.meta.env.VITE_WALRUS_API_URL || 'https://api.wal.app',
      apiKey: import.meta.env.VITE_WALRUS_API_KEY || 'demo-api-key',
      bucketId: 'sui-know-quiz-storage',
      region: 'us-east-1'
    };

    // Initialize key pair for authentication
    this.initializeKeyPair();
  }

  // Initialize key pair for Walrus authentication
  private initializeKeyPair(): void {
    try {
      // In a real implementation, this would be stored securely
      // For demo purposes, create a deterministic key pair
      this.keyPair = Ed25519Keypair.deriveKeypair('walrus_demo_key_pair_seed_phrase');
      console.log('✅ Walrus service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Walrus key pair:', error);
    }
  }

  // Upload file to Walrus
  async uploadFile(file: File, isPublic: boolean = true): Promise<WalrusUploadResult> {
    try {
      console.log('📤 Uploading file to Walrus:', file.name);
      
      // Generate file hash
      const hash = await this.generateFileHash(file);
      
      // Create file metadata
      const metadata = {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: this.keyPair.getPublicKey().toSuiAddress(),
        isPublic,
        hash
      };

      // Upload to Walrus
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));
      formData.append('bucketId', this.config.bucketId);
      formData.append('isPublic', isPublic.toString());

      const response = await fetch(`${this.config.apiUrl}/v1/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Walrus-Address': this.keyPair.getPublicKey().toSuiAddress(),
          'X-Walrus-Signature': await this.signMessage(JSON.stringify(metadata))
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log('✅ File uploaded successfully:', result.fileId);
      
      return {
        fileId: result.fileId,
        url: result.url,
        hash: result.hash,
        size: file.size,
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ File upload failed:', error);
      // Real Walrus upload failed, throw error
      throw new Error('Walrus upload failed. Please check your configuration and try again.');
    }
  }


  // Download file from Walrus
  async downloadFile(fileId: string): Promise<Blob> {
    try {
      console.log('📥 Downloading file from Walrus:', fileId);
      
      const response = await fetch(`${this.config.apiUrl}/v1/files/${fileId}/download`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Walrus-Address': this.keyPair.getPublicKey().toSuiAddress()
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('❌ File download failed:', error);
      // Real Walrus download failed, throw error
      throw new Error('Walrus download failed. Please check your configuration and try again.');
    }
  }


  // Get file info
  async getFileInfo(fileId: string): Promise<WalrusFile | null> {
    try {
      const response = await fetch(`${this.config.apiUrl}/v1/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Walrus-Address': this.keyPair.getPublicKey().toSuiAddress()
        }
      });

      if (!response.ok) {
        throw new Error(`Get file info failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Get file info failed:', error);
      // Fallback to localStorage
      return this.getFileFromLocalStorage(fileId);
    }
  }

  // List user's files
  async listUserFiles(): Promise<WalrusFile[]> {
    try {
      const response = await fetch(`${this.config.apiUrl}/v1/files`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Walrus-Address': this.keyPair.getPublicKey().toSuiAddress()
        }
      });

      if (!response.ok) {
        throw new Error(`List files failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ List files failed:', error);
      // Fallback to localStorage
      return this.getFilesFromLocalStorage();
    }
  }

  // Delete file
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/v1/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'X-Walrus-Address': this.keyPair.getPublicKey().toSuiAddress(),
          'X-Walrus-Signature': await this.signMessage(`delete:${fileId}`)
        }
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.statusText}`);
      }

      // Remove from localStorage
      this.removeFileFromLocalStorage(fileId);
      
      return true;
    } catch (error) {
      console.error('❌ File deletion failed:', error);
      return false;
    }
  }

  // Generate file hash
  private async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Sign message with key pair
  private async signMessage(message: string): Promise<string> {
    const messageBytes = new TextEncoder().encode(message);
    const signature = this.keyPair.signPersonalMessage(messageBytes);
    return toB64(signature);
  }

  // Save file to localStorage (for demo)
  private saveFileToLocalStorage(file: WalrusFile): void {
    try {
      const files = this.getFilesFromLocalStorage();
      files.push(file);
      localStorage.setItem('walrus_files', JSON.stringify(files));
    } catch (error) {
      console.error('❌ Failed to save file to localStorage:', error);
    }
  }

  // Get file from localStorage (for demo)
  private getFileFromLocalStorage(fileId: string): WalrusFile | null {
    try {
      const files = this.getFilesFromLocalStorage();
      return files.find(f => f.id === fileId) || null;
    } catch (error) {
      console.error('❌ Failed to get file from localStorage:', error);
      return null;
    }
  }

  // Get files from localStorage (for demo)
  private getFilesFromLocalStorage(): WalrusFile[] {
    try {
      const stored = localStorage.getItem('walrus_files');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ Failed to get files from localStorage:', error);
      return [];
    }
  }

  // Remove file from localStorage (for demo)
  private removeFileFromLocalStorage(fileId: string): void {
    try {
      const files = this.getFilesFromLocalStorage();
      const filtered = files.filter(f => f.id !== fileId);
      localStorage.setItem('walrus_files', JSON.stringify(filtered));
    } catch (error) {
      console.error('❌ Failed to remove file from localStorage:', error);
    }
  }

  // Upload quiz data to Walrus
  async uploadQuizData(quizData: any): Promise<WalrusUploadResult> {
    try {
      console.log('📤 Uploading quiz data to Walrus...');
      
      const jsonData = JSON.stringify(quizData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const file = new File([blob], `quiz_${quizData.id}.json`, { type: 'application/json' });
      
      return await this.uploadFile(file, false); // Private by default
    } catch (error) {
      console.error('❌ Quiz data upload failed:', error);
      throw error;
    }
  }

  // Upload quiz image to Walrus
  async uploadQuizImage(imageFile: File, quizId?: string): Promise<WalrusUploadResult> {
    try {
      console.log('📤 Uploading quiz image to Walrus...');
      
      // Validate image file
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      // Compress image if too large
      const compressedFile = await this.compressImage(imageFile);
      
      return await this.uploadFile(compressedFile, true); // Public for images
    } catch (error) {
      console.error('❌ Quiz image upload failed:', error);
      throw error;
    }
  }

  // Compress image
  private async compressImage(file: File, maxSize: number = 1024 * 1024): Promise<File> {
    if (file.size <= maxSize) {
      return file;
    }

    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.sqrt(maxSize / file.size);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            resolve(file);
          }
        }, file.type, 0.8);
      };

      img.src = URL.createObjectURL(file);
    });
  }

  // Get storage usage
  async getStorageUsage(): Promise<{ used: number; total: number; files: number }> {
    try {
      const files = await this.listUserFiles();
      const used = files.reduce((total, file) => total + file.size, 0);
      
      return {
        used,
        total: 100 * 1024 * 1024 * 1024, // 100GB limit
        files: files.length
      };
    } catch (error) {
      console.error('❌ Failed to get storage usage:', error);
      return { used: 0, total: 0, files: 0 };
    }
  }
}

export const walrusService = new WalrusService();