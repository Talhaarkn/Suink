import { useState, useEffect } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction, useSignTransaction, useSuiClient, useCurrentWallet } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { Plus, Trash2, ExternalLink, Copy, Check, Edit2, Save } from 'lucide-react'
import { getWalrusSiteLink } from '../lib/walrusConfig'
import { sponsorAndExecuteTransaction } from '../lib/enokiSponsored'

interface Link {
  label: string
  url: string
}

interface Profile {
  id: string
  name: string
  bio: string
  avatar_cid: string
  links: Link[]
  theme: string
}

// Fallback to Package ID if LINKTREE_PACKAGE_ID is not set
const PACKAGE_ID = import.meta.env.VITE_LINKTREE_PACKAGE_ID || import.meta.env.VITE_PACKAGE_ID
const REGISTRY_ID = import.meta.env.VITE_REGISTRY_ID || '0x0000000000000000000000000000000000000000000000000000000000000000'

const THEMES = [
  { name: 'Ocean', value: 'ocean', gradient: 'from-blue-500 to-cyan-500' },
  { name: 'Sunset', value: 'sunset', gradient: 'from-orange-500 to-pink-500' },
  { name: 'Forest', value: 'forest', gradient: 'from-green-500 to-emerald-500' },
  { name: 'Purple', value: 'purple', gradient: 'from-purple-500 to-pink-500' },
  { name: 'Dark', value: 'dark', gradient: 'from-gray-800 to-gray-900' },
]

export function ProfilePage() {
  const account = useCurrentAccount()
  const suiClient = useSuiClient()
  const { currentWallet } = useCurrentWallet()
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()
  const { mutateAsync: signTransaction } = useSignTransaction()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [walletAvatar, setWalletAvatar] = useState<string>('')
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    bio: '',
    theme: 'ocean',
    avatar: null as File | null,
  })
  
  // Link management
  const [newLink, setNewLink] = useState({ label: '', url: '' })
  const [showAddLink, setShowAddLink] = useState(false)

  useEffect(() => {
    if (account) {
      loadUserProfile()
      // Wallet'tan avatar çek
      getWalletAvatar()
    }
  }, [account])

  // Sui Wallet'tan profil resmini çek
  const getWalletAvatar = () => {
    if (!account) return
    
    // Sui Wallet bazı wallletlar için icon sağlar
    // Account bilgisinden avatar URL'i oluştur
    const walletIcon = currentWallet?.icon
    if (walletIcon) {
      console.log('📸 Wallet icon found:', walletIcon)
      setWalletAvatar(walletIcon)
    } else {
      // Fallback: Sui address'ten generative avatar oluştur
      const generatedAvatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${account.address}`
      console.log('📸 Using generated avatar for:', account.address)
      setWalletAvatar(generatedAvatar)
    }
  }

  const loadUserProfile = async () => {
    if (!account) return
    
    try {
      setLoading(true)
      // Check if PACKAGE_ID is properly set
      if (!PACKAGE_ID || PACKAGE_ID === '0x0') {
        console.warn('⚠️ PACKAGE_ID not set. Please deploy the contract first.')
        return
      }

      const ownedCaps = await suiClient.getOwnedObjects({
        owner: account.address,
        filter: {
          MatchAll: [
            {
              StructType: `${PACKAGE_ID}::linktree::ProfileCap`
            }
          ]
        },
        options: {
          showContent: true,
          showType: true,
        }
      })

      if (ownedCaps.data.length > 0) {
        const capObj = ownedCaps.data[0]
        if (capObj.data?.content && 'fields' in capObj.data.content) {
          const capFields = capObj.data.content.fields as any
          const profileId = capFields.profile_id
          
          const profileObj = await suiClient.getObject({
            id: profileId,
            options: {
              showContent: true,
              showType: true,
            }
          })
          
          if (profileObj.data?.content && 'fields' in profileObj.data.content) {
            const fields = profileObj.data.content.fields as any
            const profileData = {
              id: profileId,
              name: fields.name,
              bio: fields.bio,
              avatar_cid: fields.avatar_cid,
              links: fields.links || [],
              theme: fields.theme,
            }
            setProfile(profileData)
            setProfileForm({
              name: profileData.name,
              bio: profileData.bio,
              theme: profileData.theme,
              avatar: null,
            })
          }
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProfile = () => {
    if (!account || !profileForm.name) {
      alert('Please fill in profile name')
      return
    }

    setLoading(true)
    
    try {
      
      // Wallet avatar kullan - Walrus yüklemesi yok artık!
      const avatarCid = walletAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${account.address}`
      console.log('📸 Using wallet avatar:', avatarCid)

      const tx = new Transaction()
      
      // Check if REGISTRY_ID is valid
      if (!REGISTRY_ID || REGISTRY_ID === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        alert('⚠️ Contract not deployed yet. Please deploy the LinkTree contract first.')
        return
      }

      tx.moveCall({
        target: `${PACKAGE_ID}::linktree::create_profile`,
        arguments: [
          tx.object(REGISTRY_ID),
          tx.pure.string(profileForm.name),
          tx.pure.string(avatarCid),
          tx.pure.string(profileForm.bio),
          tx.pure.string(profileForm.theme),
        ],
      })

      // NORMAL TRANSACTION (User pays gas)
      console.log('💰 Creating profile with normal transaction...')
      
      signAndExecute(
        { transaction: tx as any },
        {
          onSuccess: (result) => {
            console.log('✅ Profile created:', result)
            alert('🎉 Profile NFT created successfully!')
            setProfileForm({ name: '', bio: '', theme: 'ocean', avatar: null })
            loadUserProfile()
          },
          onError: (error) => {
            console.error('❌ Transaction failed:', error)
            alert('Failed to create profile: ' + (error.message || error))
          },
        }
      )
      
      /* 
      // SPONSORED TRANSACTION (Enoki pays gas fees!)
      // Uncomment this section if you have a valid Enoki private key
      
      console.log('💰 Creating profile with sponsored transaction...')
      
      const signTxCallback = async (bytes: Uint8Array) => {
        const txToSign = Transaction.from(bytes)
        const result = await signTransaction({
          transaction: txToSign as any,
          chain: `sui:${import.meta.env.VITE_SUI_NETWORK || 'testnet'}`,
        })
        return result.signature
      }
      
      const result = await sponsorAndExecuteTransaction(
        tx,
        account.address,
        signTxCallback,
        [`${PACKAGE_ID}::linktree::create_profile`],
        []
      )

      console.log('✅ Profile created:', result)
      alert('🎉 Profile NFT created successfully (no gas fees)!')
      setProfileForm({ name: '', bio: '', theme: 'ocean', avatar: null })
      loadUserProfile()
      */
    } catch (error: any) {
      console.error('Error creating profile:', error)
      alert('Failed to create profile: ' + (error.message || error))
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!account || !profile) return

    try {
      setLoading(true)
      
      // Wallet avatar kullan - artık yükleme yok!
      const avatarCid = walletAvatar || profile.avatar_cid
      console.log('📸 Using wallet avatar for update:', avatarCid)

      const tx = new Transaction()
      tx.setSender(account.address)
      
      tx.moveCall({
        target: `${PACKAGE_ID}::linktree::update_profile`,
        arguments: [
          tx.object(profile.id),
          tx.pure.string(avatarCid),
          tx.pure.string(profileForm.bio),
          tx.pure.string(profileForm.theme),
        ],
      })

      signAndExecute(
        { transaction: tx as any },
        {
          onSuccess: () => {
            alert('✅ Profile updated successfully!')
            setIsEditing(false)
            setProfileForm({ ...profileForm, avatar: null })
            loadUserProfile()
          },
          onError: (error) => {
            console.error('Error updating profile:', error)
            alert('❌ Failed to update profile: ' + (error.message || 'Unknown error'))
          },
        }
      )
    } catch (error: any) {
      console.error('Error:', error)
      alert('❌ Update failed: ' + (error?.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const handleAddLink = async () => {
    if (!newLink.label || !newLink.url || !profile) return

    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::linktree::add_link`,
        arguments: [
          tx.object(profile.id),
          tx.pure.string(newLink.label),
          tx.pure.string(newLink.url),
        ],
      })

      signAndExecute(
        { transaction: tx as any },
        {
          onSuccess: () => {
            alert('Link added!')
            setNewLink({ label: '', url: '' })
            setShowAddLink(false)
            loadUserProfile()
          },
          onError: (error) => {
            console.error('Error:', error)
            alert('Failed to add link')
          },
        }
      )
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleRemoveLink = async (index: number) => {
    if (!profile || !confirm('Remove this link?')) return

    try {
      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::linktree::remove_link`,
        arguments: [
          tx.object(profile.id),
          tx.pure.u64(index),
        ],
      })

      signAndExecute(
        { transaction: tx as any },
        {
          onSuccess: () => {
            alert('Link removed!')
            loadUserProfile()
          },
          onError: (error) => {
            console.error('Error:', error)
            alert('Failed to remove link')
          },
        }
      )
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const copyProfileLink = () => {
    if (!profile) return
    // Use Walrus Sites portal-independent linking format
    const walrusLink = getWalrusSiteLink(`view/${profile.id}`)
    console.log('Generated Walrus link:', walrusLink)
    console.log('Profile ID:', profile.id)
    navigator.clipboard.writeText(walrusLink)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-white/70">Connect your Sui wallet to create your profile NFT</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white/60">Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-lg border border-gray-700/50 rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🆕</div>
            <h2 className="text-3xl font-bold text-white mb-2">Create Your Profile</h2>
            <p className="text-white/60">Receive a ProfileCap NFT</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-white/80 mb-2 font-medium">Profile Name *</label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                placeholder="your-username"
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2 font-medium">Bio</label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
                placeholder="About you..."
                rows={3}
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-white/80 mb-2 font-medium">Avatar</label>
              <div className="flex items-center gap-4">
                <img 
                  src={walletAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${account?.address || 'default'}`} 
                  alt="Wallet Avatar" 
                  className="w-16 h-16 rounded-full border-2 border-blue-500"
                />
                <div>
                  <p className="text-white font-medium">Wallet Avatar</p>
                  <p className="text-white/60 text-sm">Automatically from your Sui wallet</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-white/80 mb-3 font-medium">Theme</label>
              <div className="grid grid-cols-5 gap-3">
                {THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setProfileForm({ ...profileForm, theme: theme.value })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      profileForm.theme === theme.value ? 'border-white scale-105' : 'border-gray-600'
                    }`}
                  >
                    <div className={`w-full h-8 rounded bg-gradient-to-r ${theme.gradient} mb-2`} />
                    <p className="text-white/80 text-xs font-medium">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateProfile}
              disabled={!profileForm.name || loading}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg text-lg"
            >
              {loading ? '⏳ Creating...' : '🎉 Create Profile NFT'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            My Profile
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-sm rounded-full">🎫 NFT</span>
          </h1>
          <p className="text-white/60">Manage your profile</p>
        </div>
        <div className="flex gap-3">
          {!isEditing && (
            <>
              <button onClick={copyProfileLink} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-2">
                {copiedLink ? <><Check className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy</>}
              </button>
              <a 
                href={getWalrusSiteLink(`view/${profile.id}`)} 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />View
              </a>
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg flex items-center gap-2">
                <Edit2 className="w-4 h-4" />Edit
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 rounded-2xl p-6">
        {isEditing ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img 
                src={walletAvatar || `https://api.dicebear.com/7.x/identicon/svg?seed=${account?.address || 'default'}`} 
                alt={profile.name} 
                className="w-20 h-20 rounded-full border-2 border-blue-500" 
              />
              <div>
                <h3 className="text-2xl font-bold text-white">{profile.name}</h3>
                <p className="text-white/60 text-sm">Editing Profile (Avatar from wallet)</p>
              </div>
            </div>
            <div>
              <label className="block text-white/80 mb-2 font-medium">Bio</label>
              <textarea 
                value={profileForm.bio} 
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} 
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white placeholder-white/40" 
                rows={3} 
                maxLength={200} 
                placeholder="Tell us about yourself..."
              />
              <p className="text-white/40 text-xs mt-1">{profileForm.bio.length}/200 characters</p>
            </div>
            <div>
              <label className="block text-white/80 mb-2 font-medium">Theme</label>
              <div className="grid grid-cols-5 gap-3">
                {THEMES.map((theme) => (
                  <button key={theme.value} onClick={() => setProfileForm({ ...profileForm, theme: theme.value })} className={`p-3 rounded-lg border-2 transition-all ${profileForm.theme === theme.value ? 'border-white scale-105' : 'border-gray-600 hover:border-gray-500'}`}>
                    <div className={`w-full h-6 rounded bg-gradient-to-r ${theme.gradient} mb-1`} />
                    <p className="text-white/80 text-xs">{theme.name}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleUpdateProfile} 
                disabled={loading} 
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? '⏳ Saving Changes...' : '💾 Save Changes'}
              </button>
              <button 
                onClick={() => { 
                  setIsEditing(false)
                  setProfileForm({ 
                    name: profile.name, 
                    bio: profile.bio, 
                    theme: profile.theme, 
                    avatar: null 
                  }) 
                }} 
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-6">
              {profile.avatar_cid && !profile.avatar_cid.startsWith('walrus_') ? (
                <img 
                  src={
                    profile.avatar_cid.startsWith('data:') 
                      ? profile.avatar_cid 
                      : profile.avatar_cid.startsWith('http') 
                        ? profile.avatar_cid
                        : `https://aggregator.walrus-testnet.walrus.space/v1/${profile.avatar_cid}`
                  } 
                  alt={profile.name} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-600">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-3xl font-bold text-white">{profile.name}</h3>
                <p className="text-white/70 mt-1">{profile.bio}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs bg-gradient-to-r ${THEMES.find(t => t.value === profile.theme)?.gradient} text-white`}>{THEMES.find(t => t.value === profile.theme)?.name}</span>
                  <span className="px-3 py-1 rounded-full text-xs bg-gray-700 text-white">{profile.links.length} Links</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isEditing && (
          <div className="border-t border-gray-700 pt-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold text-lg">Links ({profile.links.length})</h4>
              <button onClick={() => setShowAddLink(true)} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center gap-2">
                <Plus className="w-4 h-4" />Add
              </button>
            </div>

            {profile.links.length === 0 ? (
              <div className="text-center py-8 bg-gray-900/30 rounded-lg border border-gray-700/50">
                <p className="text-white/40 mb-3">No links</p>
                <button onClick={() => setShowAddLink(true)} className="text-blue-400">+ Add first link</button>
              </div>
            ) : (
              <div className="space-y-3">
                {profile.links.map((link: any, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <div className="flex-1">
                      <p className="text-white font-medium">{link.fields?.label || link.label}</p>
                      <a href={link.fields?.url || link.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 text-sm hover:underline flex items-center gap-1">
                        {link.fields?.url || link.url}<ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <button onClick={() => handleRemoveLink(index)} className="p-2 text-red-400 hover:bg-red-900/20 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showAddLink && (
              <div className="mt-4 p-5 bg-gray-900/70 border border-gray-600 rounded-lg">
                <h5 className="text-white font-medium mb-4">Add Link</h5>
                <div className="space-y-3">
                  <input type="text" value={newLink.label} onChange={(e) => setNewLink({ ...newLink, label: e.target.value })} placeholder="Title" className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />
                  <input type="url" value={newLink.url} onChange={(e) => setNewLink({ ...newLink, url: e.target.value })} placeholder="https://..." className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white" />
                  <div className="flex gap-3">
                    <button onClick={handleAddLink} disabled={!newLink.label || !newLink.url} className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white rounded-lg">Add</button>
                    <button onClick={() => { setShowAddLink(false); setNewLink({ label: '', url: '' }) }} className="px-4 py-3 bg-gray-700 text-white rounded-lg">Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-4">
        <p className="text-white/80 text-sm flex items-center gap-2">
          <span className="text-2xl">🎫</span>
          <span><strong>ProfileCap NFT</strong> - Connected: <strong>{account.address.slice(0, 6)}...{account.address.slice(-4)}</strong></span>
        </p>
      </div>
    </div>
  )
}
