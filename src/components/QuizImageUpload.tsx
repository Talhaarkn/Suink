import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { ImageService } from '../lib/imageService'

interface QuizImageUploadProps {
  onImageUploaded: (imageUrl: string, imageId: string) => void
  onImageRemoved: () => void
  currentImageUrl?: string
  quizId?: string
}

export function QuizImageUpload({ 
  onImageUploaded, 
  onImageRemoved, 
  currentImageUrl,
  quizId 
}: QuizImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB')
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Upload image using simple service
      const result = await ImageService.uploadImage(file)
      
      // Call success callback
      onImageUploaded(result.url, result.fileId)
      
      console.log('Image uploaded successfully:', result)
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = () => {
    onImageRemoved()
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
    <div className="space-y-4">
      <label className="block text-white font-medium mb-2">
        Quiz Image (Optional)
      </label>
      
      {currentImageUrl ? (
        <div className="relative">
          <img 
            src={currentImageUrl} 
            alt="Quiz preview" 
            className="w-full h-48 object-cover rounded-xl border border-white/20"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className={`border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 hover:border-white/50 hover:bg-white/5 ${
            isUploading ? 'cursor-not-allowed opacity-50' : ''
          }`}
        >
          {isUploading ? (
            <div className="space-y-4">
              <Loader2 className="w-8 h-8 text-sui-blue mx-auto animate-spin" />
              <div className="text-white">
                <p className="mb-2">Uploading Image...</p>
                <p className="text-sm text-white/60">Processing your image...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <ImageIcon className="w-12 h-12 text-white/60 mx-auto" />
              <div>
                <p className="text-white font-medium">Upload Quiz Image</p>
                <p className="text-white/60 text-sm">
                  Click to select an image file (JPG, PNG, GIF)
                </p>
                <p className="text-white/40 text-xs mt-1">
                  Max size: 5MB • Stored locally
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading}
      />

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      {currentImageUrl && (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3">
          <p className="text-green-300 text-sm">
            ✅ Image uploaded successfully
          </p>
        </div>
      )}
    </div>
  )
}
