import { walrusDatabaseService } from './walrusDatabaseService'

export interface UserProfile {
  walletAddress: string
  displayName: string
  bio: string
  avatar: string
  level: number
  xp: number
  totalQuizzes: number
  totalScore: number
  badges: string[]
  joinDate: string
  preferences: {
    theme: 'light' | 'dark' | 'auto'
    notifications: boolean
    language: string
  }
  stats: {
    quizzesCreated: number
    quizzesParticipated: number
    averageScore: number
    bestScore: number
    streak: number
    lastActive: string
  }
}

export class ProfileService {
  private static PROFILES_KEY = 'user_profiles'
  private static DEFAULT_AVATAR = ''

  // Get user profile by wallet address
  static async getProfile(walletAddress: string): Promise<UserProfile | null> {
    if (!walletAddress) return null
    
    try {
      // Try to get from Walrus database first
      const walrusProfile = await walrusDatabaseService.getUserProfile(walletAddress)
      if (walrusProfile) {
        console.log('✅ Profile loaded from Walrus database')
        return walrusProfile
      }
      
      // Fallback to localStorage
      const profiles = this.getAllProfiles()
      const profile = profiles[walletAddress.toLowerCase()]
      
      if (!profile) {
        // Create default profile for new user
        return this.createDefaultProfile(walletAddress)
      }
      
      console.log('⚠️ Profile loaded from localStorage (Walrus unavailable)')
      return profile
    } catch (error) {
      console.error('Error loading profile:', error)
      // Fallback to localStorage
      const profiles = this.getAllProfiles()
      const profile = profiles[walletAddress.toLowerCase()]
      
      if (!profile) {
        return this.createDefaultProfile(walletAddress)
      }
      
      return profile
    }
  }

  // Create or update user profile
  static async updateProfile(walletAddress: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    if (!walletAddress) throw new Error('Wallet address is required')
    
    const profiles = this.getAllProfiles()
    const existingProfile = profiles[walletAddress.toLowerCase()]

    const defaultProfile: UserProfile = existingProfile || {
      walletAddress: walletAddress.toLowerCase(),
      displayName: this.generateDisplayName(walletAddress),
      bio: 'Quiz enthusiast on SuiKnow!',
      avatar: this.DEFAULT_AVATAR,
      level: 1,
      xp: 0,
      totalQuizzes: 0,
      totalScore: 0,
      badges: ['newcomer'],
      joinDate: new Date().toISOString(),
      preferences: {
        theme: 'auto',
        notifications: true,
        language: 'en'
      },
      stats: {
        quizzesCreated: 0,
        quizzesParticipated: 0,
        averageScore: 0,
        bestScore: 0,
        streak: 0,
        lastActive: new Date().toISOString()
      }
    }
    
    const updatedProfile: UserProfile = {
      ...defaultProfile,
      ...updates,
      walletAddress: walletAddress.toLowerCase(),
      // stats.lastActive güncellemesi
      stats: {
        ...defaultProfile.stats,
        ...(updates as any)?.stats,
        lastActive: new Date().toISOString()
      }
    }
    
    try {
      // Try to save to Walrus database first
      const saved = await walrusDatabaseService.saveUserProfile(updatedProfile)
      if (saved) {
        console.log('✅ Profile saved to Walrus database')
      } else {
        console.log('⚠️ Profile saved to localStorage (Walrus unavailable)')
      }
    } catch (error) {
      console.error('Error saving profile to Walrus:', error)
    }
    
    // Avoid localStorage quota issues; keep only minimal cache
    try {
      profiles[walletAddress.toLowerCase()] = {
        ...updatedProfile,
        // Strip large fields if needed (none large now, placeholder)
      }
      localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles))
    } catch (e) {
      // If quota exceeded, skip caching
      console.warn('Skipping localStorage profile cache due to quota:', e as any)
    }
    
    return updatedProfile
  }

  // Create default profile for new user
  private static createDefaultProfile(walletAddress: string): UserProfile {
    const defaultProfile: UserProfile = {
      walletAddress: walletAddress.toLowerCase(),
      displayName: this.generateDisplayName(walletAddress),
      bio: 'Quiz enthusiast on SuiKnow!',
      avatar: this.DEFAULT_AVATAR,
      level: 1,
      xp: 0,
      totalQuizzes: 0,
      totalScore: 0,
      badges: ['newcomer'],
      joinDate: new Date().toISOString(),
      preferences: {
        theme: 'auto',
        notifications: true,
        language: 'en'
      },
      stats: {
        quizzesCreated: 0,
        quizzesParticipated: 0,
        averageScore: 0,
        bestScore: 0,
        streak: 0,
        lastActive: new Date().toISOString()
      }
    }
    
    // Save the new profile
    this.updateProfile(walletAddress, defaultProfile)
    return defaultProfile
  }

  // Generate display name from wallet address
  private static generateDisplayName(walletAddress: string): string {
    const shortAddress = walletAddress.slice(0, 6) + '...' + walletAddress.slice(-4)
    return `User_${shortAddress}`
  }

  // Get all profiles
  private static getAllProfiles(): Record<string, UserProfile> {
    try {
      const profiles = localStorage.getItem(this.PROFILES_KEY)
      return profiles ? JSON.parse(profiles) : {}
    } catch (error) {
      console.error('Error loading profiles:', error)
      return {}
    }
  }

  // Update user stats after quiz completion
  static updateStatsAfterQuiz(walletAddress: string, score: number, isCreator: boolean = false): void {
    const profile = this.getProfile(walletAddress)
    if (!profile) return

    const newStats = {
      ...profile.stats,
      quizzesParticipated: profile.stats.quizzesParticipated + 1,
      totalScore: profile.totalScore + score,
      averageScore: Math.round((profile.totalScore + score) / (profile.stats.quizzesParticipated + 1)),
      bestScore: Math.max(profile.stats.bestScore, score),
      streak: profile.stats.streak + 1,
      lastActive: new Date().toISOString()
    }

    const newProfile = {
      ...profile,
      totalQuizzes: profile.totalQuizzes + 1,
      xp: profile.xp + score * 10, // 10 XP per point
      level: this.calculateLevel(profile.xp + score * 10),
      stats: newStats
    }

    if (isCreator) {
      newProfile.stats.quizzesCreated = profile.stats.quizzesCreated + 1
    }

    this.updateProfile(walletAddress, newProfile)
  }

  // Calculate user level based on XP
  private static calculateLevel(xp: number): number {
    return Math.floor(xp / 1000) + 1
  }

  // Add badge to user
  static addBadge(walletAddress: string, badge: string): void {
    const profile = this.getProfile(walletAddress)
    if (!profile) return

    if (!profile.badges.includes(badge)) {
      const updatedProfile = {
        ...profile,
        badges: [...profile.badges, badge]
      }
      this.updateProfile(walletAddress, updatedProfile)
    }
  }

  // Get leaderboard data
  static getLeaderboard(limit: number = 10): UserProfile[] {
    const profiles = Object.values(this.getAllProfiles())
    return profiles
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
  }

  // Search users by display name
  static searchUsers(query: string): UserProfile[] {
    const profiles = Object.values(this.getAllProfiles())
    return profiles.filter(profile => 
      profile.displayName.toLowerCase().includes(query.toLowerCase())
    )
  }

  // Get user's quiz history
  static getUserQuizHistory(walletAddress: string): any[] {
    // This would integrate with quiz tracking service
    const participations = JSON.parse(localStorage.getItem('quiz_participations') || '[]')
    return participations.filter((p: any) => p.userId === walletAddress.toLowerCase())
  }

  // Update user preferences
  static updatePreferences(walletAddress: string, preferences: Partial<UserProfile['preferences']>): void {
    const profile = this.getProfile(walletAddress)
    if (!profile) return

    const updatedProfile = {
      ...profile,
      preferences: {
        ...profile.preferences,
        ...preferences
      }
    }

    this.updateProfile(walletAddress, updatedProfile)
  }

  // Delete user profile
  static deleteProfile(walletAddress: string): void {
    const profiles = this.getAllProfiles()
    delete profiles[walletAddress.toLowerCase()]
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles))
  }
}
