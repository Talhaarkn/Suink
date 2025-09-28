import React, { useState, useRef } from 'react'
import { Camera, X, Loader2, User } from 'lucide-react'
import { realWalrusService } from '../lib/realWalrusService'

interface ProfilePictureUploadProps {
  onPictureUploaded: (imageUrl: string, imageId: string) => void
  onPictureRemoved: () => void
  currentImageUrl?: string
  userId?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ProfilePictureUpload({ 
  onPictureUploaded, 
  onPictureRemoved, 
  currentImageUrl,
  userId,
  size = 'md'
}: ProfilePictureUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 2MB for profile pics)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Upload to Walrus
      const result = await realWalrusService.uploadProfilePicture(file, userId || 'temp')
      
      // Call success callback
      onPictureUploaded(result.url, result.fileId)
      
      console.log('Profile picture uploaded successfully:', result)
      
    } catch (error) {
      console.error('Upload error:', error)
      setError('Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemovePicture = () => {
    onPictureRemoved()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        {currentImageUrl ? (
          <div className="relative">
            <img 
              src={currentImageUrl} 
              alt="Profile" 
              className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white/20`}
            />
            <button
              onClick={handleRemovePicture}
              className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 rounded-full text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className={`${sizeClasses[size]} rounded-full border-2 border-dashed border-white/30 flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-white/50 hover:bg-white/5 ${
              isUploading ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-sui-blue animate-spin" />
            ) : (
              <User className="w-8 h-8 text-white/60" />
            )}
          </div>
        )}
        
        {!currentImageUrl && !isUploading && (
          <button
            onClick={handleClick}
            className="absolute -bottom-1 -right-1 p-2 bg-sui-blue hover:bg-sui-blue/80 rounded-full text-white transition-colors"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-2 max-w-xs">
          <p className="text-red-300 text-xs text-center">{error}</p>
        </div>
      )}

      {currentImageUrl && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-2 max-w-xs">
          <p className="text-green-300 text-xs text-center">
            ✅ Stored on Walrus
          </p>
        </div>
      )}

      {!currentImageUrl && (
        <p className="text-white/60 text-xs text-center max-w-xs">
          Click to upload profile picture
        </p>
      )}
    </div>
  )
}

