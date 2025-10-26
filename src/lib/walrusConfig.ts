/**
 * Walrus Sites Configuration
 * 
 * This file contains the configuration for Walrus Sites linking.
 * Update the WALRUS_SITE_OBJECT_ID after deploying to Walrus Sites.
 */

/**
 * The Walrus Site object ID for portal-independent linking
 * This is the object ID of your deployed Walrus Site
 * 
 * Format for links: https://{WALRUS_SITE_OBJECT_ID}.suiobj/{path}
 * 
 * To get this ID:
 * 1. Deploy your site: site-builder publish --epochs 100 dist/
 * 2. Copy the "Site objectID" from the output
 * 3. Update this constant
 * 
 * IMPORTANT: This should match the object ID your SuiNS domain points to!
 */
export const WALRUS_SITE_OBJECT_ID = '0x3324eb481708d019009a63c9576bfdcac9c3da59df9413c70bb24d1e7eeb64d7'

/**
 * SuiNS name for the site (if registered)
 * Leave empty if not using SuiNS
 */
export const SUINS_NAME = 'suinks' // Your registered SuiNS name

/**
 * Portal to use for links
 * Common portals: 'trwal.app', 'wal.app', 'walrus.site'
 */
export const WALRUS_PORTAL = 'trwal.app'

/**
 * Whether to use .suiobj links (experimental, may not work on all portals)
 * Set to false to use standard portal URLs which are more reliable
 */
export const USE_SUIOBJ_LINKS = false

/**
 * Get the base URL for Walrus Sites links
 * Uses SuiNS name if available, otherwise falls back to object ID
 */
export function getWalrusSiteBaseUrl(): string {
  if (USE_SUIOBJ_LINKS) {
    // Portal-independent .suiobj format (may not work on all portals)
    if (SUINS_NAME) {
      return `https://${SUINS_NAME}.suiobj`
    }
    const cleanObjectId = WALRUS_SITE_OBJECT_ID.replace(/^0x/, '')
    return `https://${cleanObjectId}.suiobj`
  } else {
    // Standard portal URL format (more reliable).
    if (SUINS_NAME) {
      return `https://${SUINS_NAME}.${WALRUS_PORTAL}`
    }
    const cleanObjectId = WALRUS_SITE_OBJECT_ID.replace(/^0x/, '')
    return `https://${cleanObjectId}.${WALRUS_PORTAL}`
  }
}

/**
 * Generate a full Walrus Sites link for a given path
 * @param path - The path within the site (e.g., '/view/0x123...')
 */
export function getWalrusSiteLink(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.replace(/^\//, '')
  return `${getWalrusSiteBaseUrl()}/${cleanPath}`
}
