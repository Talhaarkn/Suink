#!/bin/bash

# Walrus Sites Deployment Script
# This script will help deploy your SPA to Walrus

echo "🚀 SuiLinkTree Walrus Deployment"
echo "================================"
echo ""

# Check if dist folder exists
if [ ! -d "dist" ]; then
  echo "❌ Error: dist folder not found. Run 'npm run build' first."
  exit 1
fi

echo "✅ Build folder found: dist/"
echo ""

echo "📦 Next steps to deploy to Walrus:"
echo ""
echo "1. Install Walrus CLI from:"
echo "   https://docs.wal.app/usage/setup.html"
echo ""
echo "2. Install site-builder:"
echo "   cargo install --git https://github.com/MystenLabs/walrus-sites.git site-builder"
echo ""
echo "3. Publish your site:"
echo "   site-builder publish --epochs 100 dist/"
echo ""
echo "4. Get your Walrus Site URL from the output"
echo ""
echo "5. (Optional) Connect SuiNS domain:"
echo "   https://docs.wal.app/walrus-sites/tutorial-suins.html"
echo ""

# Check if site-builder is installed
if command -v site-builder &> /dev/null; then
    echo "✅ site-builder is installed!"
    echo ""
    read -p "Do you want to publish now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Publishing to Walrus..."
        site-builder --config .walrus/sites-config.yaml publish --epochs 100 dist/
    fi
else
    echo "⚠️  site-builder not found. Install it first:"
    echo "   Download: https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-ubuntu-x86_64"
    echo "   Or build: cargo install --git https://github.com/MystenLabs/walrus-sites.git site-builder"
fi
