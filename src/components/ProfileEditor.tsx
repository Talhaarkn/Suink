import { useEffect, useState } from 'react'
import { User, Save, X, Upload, Image as ImageIcon } from 'lucide-react'
import { ProfileService, UserProfile } from '../lib/profileService'
import { ImageService } from '../lib/imageService'
import { useCurrentAccount } from '@mysten/dapp-kit'

interface ProfileEditorProps {
  profile?: UserProfile
  onSave: (updated: UserProfile) => void
  onCancel: () => void
}

export function ProfileEditor({ profile, onSave, onCancel }: ProfileEditorProps) {
  const currentAccount = useCurrentAccount()
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isPrefilling, setIsPrefilling] = useState(true)

  useEffect(() => {
    const prefill = async () => {
      try {
        // Önce gelen prop ile prefill
        if (profile) {
          setDisplayName(profile.displayName || '')
          setBio(profile.bio || '')
          setAvatarUrl(profile.avatar || '')
          return
        }
        // Yoksa servisten yükle
        if (currentAccount?.address) {
          const loaded = await ProfileService.getProfile(currentAccount.address)
          if (loaded) {
            setDisplayName(loaded.displayName || '')
            setBio(loaded.bio || '')
            setAvatarUrl(loaded.avatar || '')
          }
        }
      } catch (e) {
        console.error('Profil yüklenemedi:', e)
      } finally {
        setIsPrefilling(false)
      }
    }
    prefill()
  }, [currentAccount?.address, profile])

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError('Display name is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (!currentAccount?.address) {
        throw new Error('Wallet not connected')
      }
      const updated = await ProfileService.updateProfile(currentAccount.address, {
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatar: avatarUrl.trim()
      })
      onSave(updated)
    } catch (err) {
      setError('Failed to save profile')
      console.error('Profile save error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError('')

    try {
      // Önce önizleme için base64 üret
      await new Promise<void>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => { setAvatarUrl(reader.result as string); resolve() }
        reader.onerror = () => reject(new Error('Failed to read image'))
        reader.readAsDataURL(file)
      })
      // Ardından Walrus'a yükle (URL loglamak için)
      const res = await ImageService.uploadImage(file)
      console.log('Profile image uploaded. Walrus URL:', (res as any)?.url || res)
    } catch (err) {
      setError('Failed to upload image')
      console.error('Image upload error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {isPrefilling && (
          <div className="text-sm text-gray-500 mb-4">Profil yükleniyor...</div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              placeholder="Enter your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
              placeholder="Tell us about yourself"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="avatar-upload"
              />
              <label
                htmlFor="avatar-upload"
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <Upload size={16} />
                <span>Upload Image</span>
              </label>
              {avatarUrl && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <ImageIcon size={16} />
                  <span>Image uploaded</span>
                </div>
              )}
            </div>
            {avatarUrl && (
              <div className="mt-2">
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isLoading || isPrefilling || !currentAccount?.address}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Save size={16} />
            <span>{isLoading ? 'Saving...' : 'Save'}</span>
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
