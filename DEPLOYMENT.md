# 🚀 Sui Kahoot Deployment Guide

## Walrus Sites Deployment

### Prerequisites
- Rust installed
- Sui CLI installed
- SUI tokens for deployment costs
- WAL tokens for storage

### Method 1: Using Site Builder (Recommended)

1. **Install Site Builder**
   ```bash
   cargo install --git https://github.com/MystenLabs/walrus --branch mainnet site-builder --locked
   ```

2. **Build the Project**
   ```bash
   npm run build
   ```

3. **Deploy to Walrus**
   ```bash
   site-builder deploy --epochs 10 ./dist
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
