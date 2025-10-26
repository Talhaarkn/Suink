# SuiLinkTree - Walrus Sites Deployment

## 🎯 Deployment Ready!

Your SuiLinkTree is ready to be deployed to Walrus Sites.

### 📦 Package Contents
- **Location**: `walrus-site-package/`
- **Tarball**: `suilinktree-walrus-*.tar.gz`
- **Size**: ~1.2MB

### 🚀 Deployment Options

#### Option 1: CLI Deployment (When tools are ready)

```bash
# Once site-builder is installed:
site-builder publish --epochs 100 walrus-site-package/

# This will output:
# - Site Object ID: 0x...
# - Walrus URL: https://XXXX.walrus.site
```

#### Option 2: Web Portal Deployment

Since CLI tools take time to install, use the web interface:

1. **Visit**: https://walrus.site (or testnet portal)
2. **Upload**: Select all files from `walrus-site-package/` folder
3. **Configure**: 
   - Set storage epochs (100+ recommended)
   - Enable SPA routing (ws-resources.json is included)
4. **Deploy**: Get your Walrus Site URL

### 📋 Files Included

```
walrus-site-package/
├── index.html                   # Main entry point
├── logo.png                     # App logo
├── ws-resources.json           # SPA routing config
└── assets/
    ├── index-Dqri4GBW.js       # Main app bundle (810KB)
    ├── index-Dqri4GBW.js.map   # Source map
    └── index-CJ7iVfIX.css      # Styles (48KB)
```

### ⚙️ Routing Configuration

`ws-resources.json` configures SPA routing:
- `/` → `index.html`
- `/profile` → `index.html`
- `/view/*` → `index.html`

This ensures React Router works correctly on Walrus Sites.

### 🔗 After Deployment

Once deployed, you'll get a URL like:
```
https://XXXXXX.walrus.site
```

Test these routes:
- `https://XXXXXX.walrus.site/` - Homepage
- `https://XXXXXX.walrus.site/profile` - Profile page
- `https://XXXXXX.walrus.site/view/<profile-id>` - View profile

### 🌐 SuiNS Integration (Optional)

After deployment, you can point a `.sui` domain:

1. Register domain at https://suins.io
2. Get your Walrus Site Object ID
3. Follow: https://docs.wal.app/walrus-sites/tutorial-suins.html

Example:
```bash
# Point mylink.sui to Walrus Site
sui client call \
  --package <SUINS_PACKAGE> \
  --module site \
  --function add_record \
  --args <YOUR_DOMAIN> <WALRUS_SITE_OBJECT_ID>
```

### 📊 Current Status

✅ Move Contract Deployed
- Package ID: `0xa3e899191de3c7cfb334ec890d97f5c1fec7a189f4b525824c7f30fc9cdfebec`
- Registry ID: `0xea275751172d6e3e99dd33f8891c0ded3091306056d158f16435657dec881275`

✅ Frontend Built & Packaged
- Production build complete
- SPA routing configured
- Ready for Walrus deployment

✅ Features Implemented
- zkLogin authentication
- Profile creation
- Link management
- On-chain data storage
- Flatland pattern (each profile has unique URL)

### 🔧 Manual Upload Steps

If automated tools aren't available:

1. **Prepare wallet**: Ensure you have SUI testnet tokens
2. **Access Walrus**: Use web portal or wait for CLI
3. **Upload files**: Batch upload from `walrus-site-package/`
4. **Get Object ID**: Save the Walrus Site object ID
5. **Test URL**: Visit the generated walrus.site URL

### 📚 Resources

- Walrus Sites Docs: https://docs.wal.app/walrus-sites/intro.html
- Publisher Portal: https://walrus-sites-publisher.wal.app (if available)
- SuiNS Integration: https://docs.wal.app/walrus-sites/tutorial-suins.html
- Flatland Example: https://flatland.walrus.site

---

**Ready to deploy!** 🚀

Package location: `/home/hackathon/Desktop/SuiKnow/walrus-site-package/`
