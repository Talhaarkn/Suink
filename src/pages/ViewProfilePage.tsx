import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useSuiClient } from '@mysten/dapp-kit'
import { ExternalLink, Instagram, Twitter, Github, Linkedin, Globe, Mail } from 'lucide-react'

interface Link {
  label: string  // Changed from 'title' to match Move contract
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

const THEME_STYLES: Record<string, { bg: string; button: string; text: string }> = {
  ocean: {
    bg: 'from-blue-900 via-blue-800 to-cyan-900',
    button: 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
    text: 'text-blue-100'
  },
  sunset: {
    bg: 'from-orange-900 via-pink-900 to-purple-900',
    button: 'from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600',
    text: 'text-orange-100'
  },
  forest: {
    bg: 'from-green-900 via-emerald-900 to-teal-900',
    button: 'from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600',
    text: 'text-green-100'
  },
  purple: {
    bg: 'from-purple-900 via-pink-900 to-rose-900',
    button: 'from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    text: 'text-purple-100'
  },
  dark: {
    bg: 'from-gray-900 via-gray-800 to-gray-900',
    button: 'from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500',
    text: 'text-gray-100'
  }
}

const getLinkIcon = (url: string, label: string) => {
  const lowerUrl = url.toLowerCase()
  const lowerLabel = label.toLowerCase()
  
  if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com') || lowerLabel.includes('twitter')) {
    return <Twitter className="w-5 h-5" />
  }
  if (lowerUrl.includes('instagram.com') || lowerLabel.includes('instagram')) {
    return <Instagram className="w-5 h-5" />
  }
  if (lowerUrl.includes('github.com') || lowerLabel.includes('github')) {
    return <Github className="w-5 h-5" />
  }
  if (lowerUrl.includes('linkedin.com') || lowerLabel.includes('linkedin')) {
    return <Linkedin className="w-5 h-5" />
  }
  if (lowerLabel.includes('email') || lowerLabel.includes('mail')) {
    return <Mail className="w-5 h-5" />
  }
  return <Globe className="w-5 h-5" />
}

export function ViewProfilePage() {
  const { id, name, objectId } = useParams()
  const suiClient = useSuiClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, name, objectId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Determine which ID to use (support Flatland-style /0x{hexaddr})
      const profileId = objectId || id
      
      console.log('🔍 Loading profile with ID:', profileId, 'Name:', name)

      if (profileId) {
        // Load by object ID
        const object = await suiClient.getObject({
          id: profileId,
          options: {
            showContent: true,
            showType: true,
          }
        })

        console.log(object);
        
        console.log('📦 Profile object:', object)

        if (object.data?.content && 'fields' in object.data.content) {
          const fields = object.data.content.fields as any
          console.log('📊 Profile fields:', fields)
          console.log('🔗 Links data:', fields.links)
          setProfile({
            id: object.data.objectId,
            name: fields.name,
            bio: fields.bio,
            avatar_cid: fields.avatar_cid,
            links: fields.links || [],
            theme: fields.theme || 'ocean',
          })
        } else {
          setError('Profile not found')
        }
      } else if (name) {
        // Load by name (would need registry lookup)
        setError('Name lookup not yet implemented. Please use direct profile link.')
      } else {
        setError('No profile identifier provided')
      }
    } catch (err: any) {
      console.error('Error loading profile:', err)
      setError(err.message || 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="text-white/70 mb-6">{error || 'This profile does not exist or has been removed.'}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold rounded-lg transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    )
  }

  const themeStyle = THEME_STYLES[profile.theme] || THEME_STYLES.ocean

  return (
    <div className={`min-h-screen bg-gradient-to-br ${themeStyle.bg} py-12 px-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          {profile.avatar_cid ? (
            <img
              src={profile.avatar_cid}
              alt={profile.name}
              className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/20 shadow-2xl object-cover"
              onError={(e) => {
                // Fallback to first letter if image fails
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.className = 'w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/20 shadow-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold';
                fallback.textContent = profile.name.charAt(0).toUpperCase();
                target.parentElement?.appendChild(fallback);
              }}
            />
          ) : (
            <div className="w-32 h-32 rounded-full mx-auto mb-6 border-4 border-white/20 shadow-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className={`text-5xl font-bold ${themeStyle.text} mb-3`}>
            @{profile.name}
          </h1>
          {profile.bio && (
            <p className={`text-xl ${themeStyle.text} opacity-90 max-w-lg mx-auto`}>
              {profile.bio}
            </p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-4">
          {profile.links.length === 0 ? (
            <div className="text-center py-12 bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10">
              <p className={`${themeStyle.text} opacity-70 text-lg`}>
                No links added yet
              </p>
            </div>
          ) : (
            profile.links.map((link: any, index) => (
              <a
                key={index}
                href={link.fields?.url || link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full bg-gradient-to-r ${themeStyle.button} backdrop-blur-lg p-5 rounded-2xl border border-white/20 shadow-lg transition-all transform hover:scale-105 hover:shadow-2xl`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-white">
                      {getLinkIcon(link.fields?.url || link.url, link.fields?.label || link.label)}
                    </div>
                    <span className="text-white font-bold text-lg">
                      {link.fields?.label || link.label}
                    </span>
                  </div>
                  <ExternalLink className="w-5 h-5 text-white/80" />
                </div>
              </a>
            ))
          )}
        </div>

        {/* On-Chain Badge */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full border border-white/20">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className={`${themeStyle.text} text-sm opacity-80`}>
              Stored on Sui Blockchain
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
