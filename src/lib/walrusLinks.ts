/**
 * Walrus Sites Link Utilities
 * 
 * Portal-independent linking for Walrus Sites
 * Docs: https://docs.wal.app/walrus-sites/linking.html
 */

/**
 * Convert a blob ID to a Walrus Sites link
 * Format: https://blobid.walrus/{blob-id}
 * 
 * Use this for images and other content where the browser can sniff the content type
 */
export function blobIdToWalrusLink(blobId: string): string {
  return `https://blobid.walrus/${blobId}`;
}

/**
 * Convert a SuiNS name and path to a Walrus Sites link
 * Format: https://{suins-name}.suiobj/{path}
 * 
 * Use this when you want to link to a specific resource in another Walrus Site
 */
export function suinsToWalrusLink(suinsName: string, path: string = ''): string {
  // Remove .sui extension if present
  const cleanName = suinsName.replace(/\.sui$/, '');
  // Remove leading slash from path if present
  const cleanPath = path.replace(/^\//, '');
  
  if (cleanPath) {
    return `https://${cleanName}.suiobj/${cleanPath}`;
  }
  return `https://${cleanName}.suiobj`;
}

/**
 * Convert an object ID and path to a Walrus Sites link
 * Format: https://{object-id}.suiobj/{path}
 * 
 * Use this when you want to link to a specific resource using the object ID
 * (more permanent than SuiNS which can change ownership)
 */
export function objectIdToWalrusLink(objectId: string, path: string = ''): string {
  // Remove 0x prefix if present
  const cleanObjectId = objectId.replace(/^0x/, '');
  // Remove leading slash from path if present
  const cleanPath = path.replace(/^\//, '');
  
  if (cleanPath) {
    return `https://${cleanObjectId}.suiobj/${cleanPath}`;
  }
  return `https://${cleanObjectId}.suiobj`;
}

/**
 * Check if a URL is a Walrus blob ID format
 */
export function isWalrusBlobId(url: string): boolean {
  // Walrus blob IDs are typically base64url encoded
  // They don't start with http:// or https://
  return !url.startsWith('http://') && 
         !url.startsWith('https://') && 
         url.length > 20;
}

/**
 * Convert an old-style aggregator URL to a Walrus Sites link
 * Old: https://aggregator.walrus-testnet.walrus.space/v1/{blobId}
 * New: https://blobid.walrus/{blobId}
 */
export function convertAggregatorToWalrusLink(url: string): string {
  const aggregatorPattern = /https?:\/\/aggregator\.walrus-[^\/]+\/v1\/([^\/\?]+)/;
  const match = url.match(aggregatorPattern);
  
  if (match && match[1]) {
    return blobIdToWalrusLink(match[1]);
  }
  
  return url; // Return unchanged if not an aggregator URL
}

/**
 * Get the appropriate Walrus link based on the input type
 */
export function getWalrusLink(input: string, type: 'blob' | 'suins' | 'objectid' = 'blob', path?: string): string {
  switch (type) {
    case 'blob':
      return blobIdToWalrusLink(input);
    case 'suins':
      return suinsToWalrusLink(input, path);
    case 'objectid':
      return objectIdToWalrusLink(input, path);
    default:
      return input;
  }
}
