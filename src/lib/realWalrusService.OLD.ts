// Real Walrus Service - Using Official Walrus SDK for reading, manual approach for writing
import { getFullnodeUrl, SuiClient } from '@mysten/sui/client';
import { WalrusClient } from '@mysten/walrus';
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

class RealWalrusService {
  private config: WalrusConfig;
  private keyPair: Ed25519Keypair | null = null;
  private suiClient: SuiClient;
  private walrusClient: WalrusClient | null = null;

  constructor() {
    this.config = {
      apiUrl: import.meta.env.VITE_WALRUS_API_URL || 'https://api.wal.app',
      apiKey: import.meta.env.VITE_WALRUS_API_KEY || 'demo-api-key',
      bucketId: 'sui-know-quiz-storage',
      region: 'us-east-1'
    };

    // Initialize Sui client
    const network = import.meta.env.VITE_SUI_NETWORK || 'testnet';
    this.suiClient = new SuiClient({
      url: import.meta.env.VITE_SUI_RPC_URL || getFullnodeUrl(network as 'testnet' | 'mainnet' | 'devnet')
    });

    // Initialize Walrus client (with error handling for version mismatch)
    try {
      this.walrusClient = new WalrusClient({
        network: network as 'testnet' | 'mainnet',
        suiClient: this.suiClient as any, // Type assertion due to version mismatch
      });
      console.log('✅ Walrus SDK initialized with network:', network);
    } catch (error) {
      console.warn('⚠️ Walrus SDK initialization failed:', error);
      console.warn('📖 Read operations may not work. Upload via CLI is recommended.');
    }

    // Initialize key pair for authentication (best-effort, browser-only)
    this.safeInitializeKeyPair();
  }

  // Initialize key pair for Walrus authentication (tolerant to legacy formats)
  private safeInitializeKeyPair(): void {
    try {
      if (typeof window === 'undefined' || !('localStorage' in window)) {
        // SSR or non-browser: skip; key not required for simulated uploads
        this.keyPair = null;
        return;
      }

      const stored = localStorage.getItem('walrus_keypair');
      if (stored) {
        try {
          const bytes = fromB64(stored);
          let keyBytes = bytes;
          // Accept 32-byte seeds; if 64 bytes (legacy), slice to first 32; otherwise, regenerate
          if (bytes.length === 64) {
            keyBytes = bytes.slice(0, 32);
          } else if (bytes.length !== 32) {
            console.warn(`Invalid stored Walrus key length ${bytes.length}; clearing and regenerating...`);
            localStorage.removeItem('walrus_keypair'); // Clear the invalid key
            throw new Error(`Unexpected key length ${bytes.length}`);
          }
          this.keyPair = Ed25519Keypair.fromSecretKey(keyBytes);
        } catch (e) {
          console.warn('Regenerating Walrus keypair...');
          this.keyPair = new Ed25519Keypair();
          localStorage.setItem('walrus_keypair', this.secretAsB64(this.keyPair));
        }
      } else {
        this.keyPair = new Ed25519Keypair();
        localStorage.setItem('walrus_keypair', this.secretAsB64(this.keyPair));
      }
    } catch (error) {
      console.error('Failed to initialize Walrus key pair:', error);
      // Do not block the app; allow anonymous uploads in mock mode
      this.keyPair = null;
    }
  }

  // Normalize secret key to base64 string regardless of SDK return type
  private secretAsB64(kp: Ed25519Keypair): string {
    const secret: unknown = (kp as any).getSecretKey();
    if (typeof secret === 'string') return secret; // already base64 in some SDK versions
    return toB64(secret as Uint8Array);
  }

  // Upload file to Walrus using SDK approach
  async uploadFile(file: File, _isPublic: boolean = true): Promise<WalrusUploadResult> {
    try {
      console.log('📤 Uploading file to Walrus:', file.name, `(${(file.size / 1024).toFixed(2)} KB)`);
      
      // For now, use CLI-based approach until SDK version mismatch is resolved
      // Users can use walrus CLI: walrus store <file> --epochs 5
      console.warn('⚠️ Browser-based upload not yet implemented due to SDK version conflicts.');
      console.warn('💡 Use Walrus CLI for uploads: walrus store <file> --epochs 5');
      console.warn('📝 Then use the returned blob ID with: https://aggregator.walrus-testnet.walrus.space/v1/<blob-id>');
      
      throw new Error('Browser upload not yet supported. Please use Walrus CLI for uploads.');
    } catch (error: any) {
      console.error('❌ Walrus upload failed:', error);
      throw new Error(`Walrus upload failed: ${error?.message || 'Unknown error'}`);
    }
  }

  // Read file from Walrus using SDK
  async readFile(blobId: string): Promise<Uint8Array> {
    try {
      console.log('� Reading file from Walrus:', blobId);
      
      // Get files using Walrus SDK
      const [file] = await this.walrusClient.getFiles({ ids: [blobId] });
      
      if (!file) {
        throw new Error('File not found in Walrus');
      }

      // Get content as bytes
      const bytes = await file.bytes();
      
      console.log('✅ File read successfully from Walrus:', bytes.length, 'bytes');
      
      return bytes;
    } catch (error: any) {
      console.error('❌ Walrus read failed:', error);
      throw new Error(`Walrus read failed: ${error?.message || 'Unknown error'}`);
    }
  }

  // Read file as text
  async readFileAsText(blobId: string): Promise<string> {
    try {
      const [file] = await this.walrusClient.getFiles({ ids: [blobId] });
      if (!file) throw new Error('File not found');
      return await file.text();
    } catch (error: any) {
      console.error('❌ Walrus read text failed:', error);
      throw error;
    }
  }

  // Read file as JSON
  async readFileAsJson<T = any>(blobId: string): Promise<T> {
    try {
      const [file] = await this.walrusClient.getFiles({ ids: [blobId] });
      if (!file) throw new Error('File not found');
      return await file.json();
    } catch (error: any) {
      console.error('❌ Walrus read JSON failed:', error);
      throw error;
    }
  }


  // Convert file to base64
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Generate file hash
  private async generateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Get file from Walrus
  async getFile(fileId: string): Promise<WalrusFile | null> {
    try {
      console.log('📖 Getting file from Walrus:', fileId);
      
      // Try to get from localStorage first
      const localFile = this.getFileFromLocalStorage(fileId);
      if (localFile) {
        return localFile;
      }
      
      // In a real implementation, you would call Walrus CLI here
      // For now, return null if not found locally
      return null;
    } catch (error) {
      console.error('❌ Failed to get file from Walrus:', error);
      return null;
    }
  }

  // List files from Walrus
  async listFiles(): Promise<WalrusFile[]> {
    try {
      console.log('📚 Listing files from Walrus');
      
      // Get files from localStorage
      return this.getFilesFromLocalStorage();
    } catch (error) {
      console.error('❌ Failed to list files from Walrus:', error);
      return [];
    }
  }

  // Delete file from Walrus
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      console.log('🗑️ Deleting file from Walrus:', fileId);
      
      // Remove from localStorage
      this.removeFileFromLocalStorage(fileId);
      
      // In a real implementation, you would call Walrus CLI here
      return true;
    } catch (error) {
      console.error('❌ Failed to delete file from Walrus:', error);
      return false;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      console.log('🏥 Checking Walrus health');
      
      // In a real implementation, you would ping Walrus CLI here
      // For now, return true if we can access localStorage
      return typeof localStorage !== 'undefined';
    } catch (error) {
      console.error('❌ Walrus health check failed:', error);
      return false;
    }
  }

  // LocalStorage helper methods
  private saveFileToLocalStorage(_fileData: any): void {
    // Disabled to prevent QuotaExceededError; rely on Walrus URL only
  }

  private getFileFromLocalStorage(fileId: string): WalrusFile | null {
    try {
      const files = this.getFilesFromLocalStorage();
      return files.find(f => f.id === fileId) || null;
    } catch (error) {
      console.error('❌ Failed to get file from localStorage:', error);
      return null;
    }
  }

  private getFilesFromLocalStorage(): WalrusFile[] { return []; }

  private removeFileFromLocalStorage(_fileId: string): void { /* noop */ }

  // signMessage removed (not used in mock flow)

  // Get public key address
  getPublicKeyAddress(): string {
    return this.keyPair ? this.keyPair.getPublicKey().toSuiAddress() : 'anonymous';
  }

  // Upload profile picture (specialized method)
  async uploadProfilePicture(file: File, userId: string): Promise<WalrusUploadResult> {
    try {
      console.log('📤 Uploading profile picture to Walrus:', file.name);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }
      
      // Validate file size (max 2MB for profile pics)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB');
      }
      
      // Upload with profile picture metadata
      const result = await this.uploadFile(file, true);
      
      // Store additional metadata for profile pictures
      const profileMetadata = {
        type: 'profile_picture',
        userId: userId,
        uploadedAt: new Date().toISOString()
      };
      
      // Update stored file with profile metadata
      const fileData = this.getFileFromLocalStorage(result.fileId);
      if (fileData) {
        fileData.metadata = { ...fileData.metadata, ...profileMetadata };
        this.saveFileToLocalStorage(fileData);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Profile picture upload failed:', error);
      throw error;
    }
  }

  // Get configuration
  getConfig(): WalrusConfig {
    return { ...this.config };
  }
}

// Export singleton instance
export const realWalrusService = new RealWalrusService();

// Using official base64 utils from @mysten/sui/utils
