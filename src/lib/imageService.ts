// Simple Image Service for Quiz Images
import { realWalrusService } from './realWalrusService'

export interface ImageUploadResult {
  url: string
  fileId: string
  size: number
  type: string
}

export class ImageService {
  private static IMAGES_KEY = 'quiz_images'

  // Upload image (try Walrus first, fallback to base64)
  static async uploadImage(file: File): Promise<ImageUploadResult> {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File size must be less than 5MB')
    }

    try {
      // Try to upload to Walrus first
      const walrusResult = await realWalrusService.uploadFile(file, true)
      
      if (walrusResult.fileId) {
        console.log('✅ Image uploaded to Walrus:', walrusResult.fileId)
        
        // Store reference in localStorage
        const imageInfo = {
          fileId: walrusResult.fileId,
          url: walrusResult.url,
          size: file.size,
          type: file.type,
          name: file.name,
          uploadedAt: new Date().toISOString()
        }
        
        this.saveImageInfo(imageInfo)
        
        return {
          url: walrusResult.url,
          fileId: walrusResult.fileId,
          size: file.size,
          type: file.type
        }
      }
    } catch (error) {
      console.error('Walrus upload failed, falling back to base64:', error)
    }

    // Fallback to base64 storage
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = () => {
        const fileId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const url = reader.result as string
        
        // Store image info
        const imageInfo = {
          fileId,
          url,
          size: file.size,
          type: file.type,
          name: file.name,
          uploadedAt: new Date().toISOString()
        }
        
        this.saveImageInfo(imageInfo)
        
        console.log('⚠️ Image stored as base64 (Walrus unavailable)')
        
        resolve({
          url,
          fileId,
          size: file.size,
          type: file.type
        })
      }
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'))
      }
      
      reader.readAsDataURL(file)
    })
  }

  // Save image info to localStorage
  private static saveImageInfo(imageInfo: any): void {
    try {
      const images = this.getStoredImages()
      images.push(imageInfo)
      localStorage.setItem(this.IMAGES_KEY, JSON.stringify(images))
    } catch (error) {
      console.error('Error saving image info:', error)
    }
  }

  // Get stored images
  private static getStoredImages(): any[] {
    try {
      const stored = localStorage.getItem(this.IMAGES_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading images:', error)
      return []
    }
  }

  // Get image by ID
  static getImage(fileId: string): any | null {
    const images = this.getStoredImages()
    return images.find(img => img.fileId === fileId) || null
  }

  // Delete image
  static deleteImage(fileId: string): boolean {
    try {
      const images = this.getStoredImages()
      const filtered = images.filter(img => img.fileId !== fileId)
      localStorage.setItem(this.IMAGES_KEY, JSON.stringify(filtered))
      return true
    } catch (error) {
      console.error('Error deleting image:', error)
      return false
    }
  }

  // Get all images
  static getAllImages(): any[] {
    return this.getStoredImages()
  }

  // Get storage usage
  static getStorageUsage(): { used: number; count: number } {
    const images = this.getStoredImages()
    const used = images.reduce((total, img) => total + img.size, 0)
    return { used, count: images.length }
  }
}
