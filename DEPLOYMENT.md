# 🚀 Sui Kahoot Deployment Guide

## 🚀 Deployment Guide - SuiLinkTree

This guide provides step-by-step instructions for deploying SuiLinkTree to Sui blockchain and Walrus storage.

## Prerequisites

Ensure you have installed:
- Sui CLI (`sui --version`)
- Walrus CLI (`walrus --version`)
- Walrus Site Builder (`site-builder --version`)
- Node.js and npm

## Step 1: Deploy Smart Contract to Sui

### 1.1 Build the Contract

```bash
cd /path/to/sui-linktree
sui move build
```

Expected output:
```
BUILDING SuiLinkTree
Successfully verified dependencies on-chain against source.
```

### 1.2 Publish to Testnet

```bash
sui client publish --gas-budget 100000000
```

**Important**: Save these values from the output:

1. **Package ID**: Look for `"packageId": "0x..."`
2. **Registry Object ID**: Look for object with type `ProfileRegistry`

Example output:
```json
{
  "packageId": "0xabcd1234...",
  "objectChanges": [
    {
      "type": "created",
      "objectType": "0xabcd1234::linktree::ProfileRegistry",
      "objectId": "0xef567890..."
    }
  ]
}
```

### 1.3 Update Environment Variables

Update your `.env` file:

```env
VITE_LINKTREE_PACKAGE_ID=0xabcd1234...  # Your Package ID
VITE_REGISTRY_ID=0xef567890...          # Your Registry Object ID
```

## Step 2: Build Frontend

```bash
npm run build
```

This creates a production build in the `./dist` folder.

## Step 3: Deploy to Walrus Sites

### 3.1 Configure Walrus Sites

Ensure your `~/walrus/sites-config.yaml` is configured:

```yaml
contexts:
  testnet:
    portal: trwal.app
    package: 0xf99aee9f21493e1590e7e5a9aea6f343a1f381031a04a732724871fc294be799
    staking_object: 0xbe46180321c30aab2f8b3501e24048377287fa708018a5b7c2792b35fe339ee3
    general:
       wallet_env: testnet
       walrus_context: testnet
       walrus_package: 0xd84704c17fc870b8764832c535aa6b11f21a95cd6f5bb38a9b07d2cf42220c66

default_context: testnet
```

### 3.2 Deploy to Walrus

```bash
# 'publish' is the correct subcommand
site-builder publish ./dist --epochs 1
```

Expected output:
```
Uploading site to Walrus...
Creating Sui site object...
Site deployed successfully!

B36 URL: https://xyz123abc.trwal.app/
Object ID: 0x1234567890abcdef...
```

**Save both**:
- B36 URL for immediate access
- Object ID for SuiNS configuration

### 3.3 Update ws-resources.json

```json
{
  "site_name": "SuiLinkTree - On-Chain LinkTree",
  "object_id": "0x1234567890abcdef..."
}
```

## Step 4: Configure SuiNS (Optional but Recommended)

### 4.1 Register SuiNS Name

1. Visit [testnet.suins.io](https://testnet.suins.io/)
2. Connect your Sui wallet
3. Search for your desired name (e.g., `mylinktree.sui`)
4. Purchase the domain (testnet SUI required)

### 4.2 Point SuiNS to Walrus Site

After registration:
1. Go to your SuiNS dashboard
2. Find your registered name
3. Add a redirect/pointer to your Walrus site Object ID
4. Wait for propagation (usually instant)

### 4.3 Access Your Site

Your site is now accessible at:
- `https://mylinktree.trwal.app/`

## Step 5: Testing

### 5.1 Test Smart Contract Functions

```bash
# Create a test profile
sui client call \
  --package $PACKAGE_ID \
  --module linktree \
  --function create_profile \
  --args $REGISTRY_ID \"testuser\" \"\" \"Test bio\" \"dark\" \
  --gas-budget 10000000
```

### 5.2 Test Frontend

1. Visit your deployed site (B36 or SuiNS URL)
2. Connect wallet
3. Create a profile
4. Add links
5. View profile at `/view/<object-id>`

## Deployment Checklist

- [ ] Smart contract built successfully
- [ ] Smart contract deployed to Sui testnet
- [ ] Package ID and Registry ID saved
- [ ] Environment variables updated
- [ ] Frontend built (`npm run build`)
- [ ] Site deployed to Walrus
- [ ] B36 URL tested and working
- [ ] SuiNS name registered (optional)
- [ ] SuiNS pointing to site object (optional)
- [ ] Profile creation tested
- [ ] Link management tested
- [ ] Profile viewing tested

## Troubleshooting

### Contract Build Fails

```bash
# Clean and rebuild
sui move clean
sui move build
```

### Deployment to Walrus Fails

```bash
# Check Walrus configuration
walrus info

# Check wallet balance
sui client gas

# Try with more epochs
site-builder publish ./dist --epochs 5
```

### SuiNS Not Resolving

- Check if domain is properly registered
- Verify object ID is correct
- Wait a few minutes for DNS propagation
- Check portal configuration in sites-config.yaml

### Profile Creation Fails

- Ensure Package ID and Registry ID are correct in .env
- Check wallet has enough SUI for gas
- Verify smart contract is deployed correctly

## Production Deployment

For mainnet deployment:

1. Update `sites-config.yaml` to use mainnet context
2. Switch Sui CLI to mainnet: `sui client switch --env mainnet`
3. Deploy contract to mainnet
4. Register SuiNS on mainnet ([app.suins.io](https://app.suins.io))
5. Deploy to Walrus mainnet with more epochs (e.g., 100)

```bash
site-builder publish ./dist --epochs 100 --context mainnet
```

## Resources

- [Sui Documentation](https://docs.sui.io/)
- [Walrus Documentation](https://docs.wal.app/)
- [Walrus Sites Tutorial](https://docs.wal.app/walrus-sites/tutorial.html)
- [SuiNS Documentation](https://docs.suins.io/)

---

Need help? Check the [README](./README.md) or contact the team!


### Prerequisites
- Rust installed
- Sui CLI installed
- SUI tokens for deployment costs
- WAL tokens for storage

### Method 1: Using Site Builder (Recommended)

1. **Install Site Builder**
   ```bash
   # Option A: Download prebuilt binary (recommended in docs)
   # See https://docs.wal.app/walrus-sites/tutorial-install.html for latest URLs
   # Option B: Build from source (slower)
   cargo install --git https://github.com/MystenLabs/walrus-sites.git site-builder --locked
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Deploy to Walrus**
   ```bash
   site-builder publish --epochs 10 ./dist
   ```

### Method 2: Alternative Deployment Options

#### Vercel Deployment
```bash
npm install -g vercel
npm run build
vercel --prod
```

#### GitHub Pages
```bash
npm install -g gh-pages
npm run build
npm run deploy:github
```

#### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`

## Configuration

### Environment Variables
Create a `.env` file with:
```
VITE_SUI_NETWORK=mainnet
VITE_PACKAGE_ID=your_package_id
VITE_WALRUS_RPC=https://mainnet.wal.app
```

### Network Configuration
- **Mainnet**: Full production deployment
- **Testnet**: Testing and development
- **Devnet**: Local development

## Post-Deployment

1. **Verify Deployment**
   - Check site accessibility
   - Test quiz creation
   - Verify blockchain interactions

2. **Update DNS** (if using custom domain)
   - Point domain to Walrus portal
   - Configure SuiNS name

3. **Monitor Performance**
   - Check transaction success rates
   - Monitor gas usage
   - Track user engagement

## Troubleshooting

### Common Issues
- **Build Failures**: Check Node.js version compatibility
- **Deployment Errors**: Verify SUI/WAL token balance
- **Runtime Errors**: Check network configuration

### Support
- [Walrus Documentation](https://docs.wal.app/)
- [Sui Documentation](https://docs.sui.io/)
- [GitHub Issues](https://github.com/your-repo/issues)
