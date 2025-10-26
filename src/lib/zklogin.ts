import { 
  generateNonce, 
  generateRandomness, 
  getExtendedEphemeralPublicKey,
  getZkLoginSignature,
  jwtToAddress,
  type ZkLoginSignatureInputs
} from '@mysten/sui/zklogin'
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { Transaction } from '@mysten/sui/transactions'
import { SuiClient } from '@mysten/sui/client'
import { useState, useEffect } from 'react'

// zkLogin configuration
export const ZKLOGIN_CONFIG = {
  // Google OAuth configuration
  GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
  GOOGLE_REDIRECT_URI: process.env.REACT_APP_GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback',
  
  // Sui network configuration
  SUI_NETWORK: 'testnet', // Change to 'mainnet' for production
  
  // JWT configuration
  JWT_ISSUER: 'https://accounts.google.com',
  JWT_AUDIENCE: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
}

// zkLogin authentication flow
export class ZkLoginAuth {
  private ephemeralKeyPair: Ed25519Keypair | null = null
  private nonce: string | null = null
  private randomness: string | null = null
  private maxEpoch: number | null = null
  private jwt: string | null = null
  private userSalt: string | null = null

  // Step 1: Generate nonce and ephemeral key pair
  generateAuthParams() {
    this.ephemeralKeyPair = new Ed25519Keypair()
    this.nonce = generateNonce(
      this.ephemeralKeyPair.getPublicKey(),
      ZKLOGIN_CONFIG.MAX_EPOCH,
      ZKLOGIN_CONFIG.JWT_ISSUER
    )
    this.randomness = generateRandomness()
    this.maxEpoch = ZKLOGIN_CONFIG.MAX_EPOCH

    return {
      nonce: this.nonce,
      ephemeralPublicKey: this.ephemeralKeyPair.getPublicKey().toBase64(),
      maxEpoch: this.maxEpoch,
      randomness: this.randomness,
    }
  }

  // Step 2: Get Google OAuth URL
  getGoogleAuthUrl() {
    const authParams = this.generateAuthParams()
    
    const params = new URLSearchParams({
      client_id: ZKLOGIN_CONFIG.GOOGLE_CLIENT_ID,
      redirect_uri: ZKLOGIN_CONFIG.GOOGLE_REDIRECT_URI,
      response_type: 'code',
      scope: 'openid email profile',
      nonce: authParams.nonce,
      state: JSON.stringify({
        ephemeralPublicKey: authParams.ephemeralPublicKey,
        maxEpoch: authParams.maxEpoch,
        randomness: authParams.randomness,
      }),
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  // Step 3: Handle OAuth callback and get JWT
  async handleOAuthCallback(code: string, state: string) {
    try {
      // Parse state to get auth parameters
      const authState = JSON.parse(state)
      this.ephemeralKeyPair = Ed25519Keypair.fromSecretKey(
        fromB64(authState.ephemeralPublicKey)
      )
      this.maxEpoch = authState.maxEpoch
      this.randomness = authState.randomness

      // Exchange code for JWT token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: ZKLOGIN_CONFIG.GOOGLE_CLIENT_ID,
          client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET || '',
          code,
          grant_type: 'authorization_code',
          redirect_uri: ZKLOGIN_CONFIG.GOOGLE_REDIRECT_URI,
        }),
      })

      const tokens = await tokenResponse.json()
      this.jwt = tokens.id_token

      // Get user info from JWT
      const userInfo = this.parseJWT(this.jwt)
      this.userSalt = userInfo.sub // Use Google user ID as salt

      return {
        jwt: this.jwt,
        userInfo,
        userAddress: jwtToAddress(this.jwt, this.userSalt),
      }
    } catch (error) {
      console.error('Error handling OAuth callback:', error)
      throw error
    }
  }

  // Step 4: Create zkLogin signature for transactions
  async createZkLoginSignature(transactionBlock: Transaction) {
    if (!this.jwt || !this.ephemeralKeyPair || !this.randomness || !this.userSalt) {
      throw new Error('zkLogin not properly initialized')
    }

    // Get the transaction bytes
    const txBytes = await transactionBlock.build({ client: suiClient })
    
    // Create zkLogin signature inputs
    const signatureInputs: ZkLoginSignatureInputs = {
      jwt: this.jwt,
      extendedEphemeralPublicKey: getExtendedEphemeralPublicKey(
        this.ephemeralKeyPair.getPublicKey()
      ),
      jwtRandomness: this.randomness,
      keyClaimName: 'sub',
      keyClaimValue: this.userSalt,
      maxEpoch: this.maxEpoch!,
    }

    // Generate zkLogin signature
    const signature = await getZkLoginSignature(signatureInputs)

    return {
      signature,
      txBytes,
    }
  }

  // Helper method to parse JWT
  private parseJWT(token: string) {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload)
  }

  // Get current user address
  getUserAddress(): string | null {
    if (!this.jwt || !this.userSalt) return null
    return jwtToAddress(this.jwt, this.userSalt)
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.jwt && this.ephemeralKeyPair && this.userSalt)
  }

  // Logout
  logout() {
    this.ephemeralKeyPair = null
    this.nonce = null
    this.randomness = null
    this.maxEpoch = null
    this.jwt = null
    this.userSalt = null
  }
}

// Global zkLogin instance
export const zkLoginAuth = new ZkLoginAuth()

// React hook for zkLogin
export function useZkLogin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userAddress, setUserAddress] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const authenticated = zkLoginAuth.isAuthenticated()
    setIsAuthenticated(authenticated)
    if (authenticated) {
      setUserAddress(zkLoginAuth.getUserAddress())
    }
  }, [])

  const login = async () => {
    setLoading(true)
    try {
      const authUrl = zkLoginAuth.getGoogleAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error('Login error:', error)
      setLoading(false)
    }
  }

  const logout = () => {
    zkLoginAuth.logout()
    setIsAuthenticated(false)
    setUserAddress(null)
    setUserInfo(null)
  }

  const signTransaction = async (transactionBlock: Transaction) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated')
    }

    try {
      const { signature, txBytes } = await zkLoginAuth.createZkLoginSignature(transactionBlock)
      return { signature, txBytes }
    } catch (error) {
      console.error('Error signing transaction:', error)
      throw error
    }
  }

  return {
    isAuthenticated,
    userAddress,
    userInfo,
    loading,
    login,
    logout,
    signTransaction,
  }
}
