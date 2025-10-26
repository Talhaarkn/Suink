# Walrus Sites Deployment Guide - SuiLinkTree

## Current Status
✅ Built production files in `dist/` folder
⏳ Installing required tools (Sui CLI and site-builder)

## Requirements Met
- [x] On-chain LinkTree page (Move contract deployed)
- [x] React frontend built
- [x] zkLogin integration
- [ ] Published to Walrus Sites
- [ ] SuiNS integration

## Installation in Progress

### 1. Sui CLI
Installing from: https://github.com/MystenLabs/sui.git (branch: testnet)
This may take 10-30 minutes...

### 2. Walrus site-builder  
Installing from: https://github.com/MystenLabs/walrus-sites.git
This may take 10-20 minutes...

## Next Steps (After Installation)

### Step 1: Configure Walrus
```bash
# Initialize Walrus configuration
walrus init

# Select testnet
# Follow prompts to set up wallet
```

### Step 2: Publish to Walrus Sites
```bash
# Navigate to project
cd /home/hackathon/Desktop/SuiKnow

# Publish site (100 epochs = ~100 days storage)
site-builder publish --epochs 100 dist/
```

### Step 3: Get Your Walrus Site URL
The publish command will output:
```
Site objectID: 0x...
Walrus URL: https://XXXX.walrus.site
```

### Step 4: SuiNS Integration (Optional)
1. Register a `.sui` domain at https://suins.io
2. Point domain to your Walrus Site object:
```bash
# Follow tutorial: https://docs.wal.app/walrus-sites/tutorial-suins.html
```

## Flatland Approach
Your LinkTree follows the Flatland pattern:
- Each profile has unique ID
- View page: `/view/:id`
- Each user gets their own page
- Example: https://yoursite.walrus.site/view/0x123...

## Resources
- Walrus Sites Docs: https://docs.wal.app/walrus-sites/intro.html
- SuiNS Integration: https://docs.wal.app/walrus-sites/tutorial-suins.html
- Flatland Example: https://github.com/MystenLabs/example-walrus-sites/tree/main/flatland

## Manual Publish (If Tools Take Too Long)

If installation is taking too long, you can:
1. Download pre-built binaries
2. Use Docker image
3. Or wait for cargo install to complete

---

**Current command running:**
- Terminal 1: Installing Sui CLI (cargo install sui)
- Terminal 2: site-builder installation can be retried after Sui CLI completes
