# Walrus Sites Linking Guide

## Problem Solved ✅

Previously, the copy and view buttons were generating regular HTTP links like:
```
https://suinks.trwal.app/view/0x7c61d0961448c31be55cca633e8ececf44224b33360d35dc22ee924e98c90e11
```

This caused **"Page Not Found"** errors because these links were portal-specific and didn't work properly with Walrus Sites.

## Solution: Portal-Independent Links

We now use the **Walrus Sites special link format** that works across all portals:

### Link Format
```
https://{site-object-id}.suiobj/{path}
```

### Example
For your site with object ID `0x5cff825ae30471011b5f5e812fcf356a1c3156d7765395e2f06470df67ae2925`:

```
https://5cff825ae30471011b5f5e812fcf356a1c3156d7765395e2f06470df67ae2925.suiobj/view/0x123...
```

## How It Works

1. **Service Worker Portals** (like trwal.app, wal.app, etc.) recognize `.suiobj` links
2. They automatically redirect to the correct resource within their portal
3. The link works regardless of which portal the user is browsing from

## Implementation

### Configuration File
Created `/src/lib/walrusConfig.ts` with:
- `WALRUS_SITE_OBJECT_ID`: Your deployed site's object ID
- `SUINS_NAME`: Optional SuiNS name (if you register one)
- `getWalrusSiteLink()`: Helper function to generate portal-independent links

### Usage in ProfilePage
```typescript
import { getWalrusSiteLink } from '../lib/walrusConfig'

// Copy button
const copyProfileLink = () => {
  const walrusLink = getWalrusSiteLink(`view/${profile.id}`)
  navigator.clipboard.writeText(walrusLink)
}

// View button
<a href={getWalrusSiteLink(`view/${profile.id}`)}>View</a>
```

## Link Types Supported

### 1. Object ID Links (Current Implementation)
```
https://{object-id}.suiobj/{path}
```
- Most permanent option
- Object ID never changes
- Use this if you don't have a SuiNS name

### 2. SuiNS Links (Optional - Future Enhancement)
```
https://{suins-name}.suiobj/{path}
```
- Human-readable
- Requires SuiNS registration
- Update `SUINS_NAME` in walrusConfig.ts after registration

### 3. Blob ID Links (For Images/Media)
```
https://blobid.walrus/{blob-id}
```
- For direct blob access
- Browser sniffs content type
- Good for images, not for scripts/stylesheets

## Setting Up SuiNS (Optional)

1. Register a `.sui` domain at https://suins.io
2. Point it to your Walrus Site object ID
3. Update `SUINS_NAME` in `/src/lib/walrusConfig.ts`:
   ```typescript
   export const SUINS_NAME = 'suinks' // or your chosen name
   ```

## Verification

Test your links by:
1. Copying the profile link using the Copy button
2. Opening it in a new browser tab
3. It should redirect properly through any Walrus portal

## Reference Documentation

- [Walrus Sites Linking](https://docs.wal.app/walrus-sites/linking.html)
- [SuiNS Integration](https://docs.wal.app/walrus-sites/tutorial-suins.html)

## Important Notes

⚠️ **Portal Limitations**: This feature only works on service-worker based portals (like trwal.app). Server-side portals may not support Walrus Sites links yet.

✅ **Best Practice**: Always use portal-independent links (`suiobj` format) for sharing profiles and resources within your Walrus Site.
