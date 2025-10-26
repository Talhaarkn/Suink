#!/bin/bash

# SuiLinkTree Deployment Script
# This script automates the deployment process

set -e  # Exit on error

echo "🚀 SuiLinkTree Deployment Script"
echo "================================"
echo ""

# Check if required tools are installed
echo "📋 Checking prerequisites..."

if ! command -v sui &> /dev/null; then
    echo "❌ Sui CLI not found. Please install: https://docs.sui.io/guides/developer/getting-started/sui-install"
    exit 1
fi

if ! command -v walrus &> /dev/null; then
    echo "⚠️  Walrus CLI not found. Skipping Walrus checks."
fi

if ! command -v site-builder &> /dev/null; then
    echo "⚠️  Walrus Site Builder not found. You won't be able to deploy to Walrus Sites."
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Please install Node.js."
    exit 1
fi

echo "✅ Prerequisites check complete"
echo ""

# Step 1: Build Move contract
echo "📦 Step 1: Building Move contract..."
sui move build
echo "✅ Move contract built successfully"
echo ""

# Step 2: Ask if user wants to publish
read -p "Do you want to publish the contract to Sui testnet? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Publishing contract to Sui testnet..."
    sui client publish --gas-budget 100000000
    echo ""
    echo "⚠️  IMPORTANT: Please update your .env file with:"
    echo "   - VITE_LINKTREE_PACKAGE_ID (Package ID from above)"
    echo "   - VITE_REGISTRY_ID (ProfileRegistry Object ID from above)"
    echo ""
    read -p "Press enter to continue after updating .env..."
fi

# Step 3: Install dependencies
echo "📦 Step 2: Installing npm dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 4: Build frontend
echo "🏗️  Step 3: Building frontend..."
npm run build
echo "✅ Frontend built successfully"
echo ""

# Step 5: Ask if user wants to deploy to Walrus
if command -v site-builder &> /dev/null; then
    read -p "Do you want to deploy to Walrus Sites? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter number of epochs (default: 1): " epochs
        epochs=${epochs:-1}
        
    echo "🌊 Deploying to Walrus Sites..."
    # Use local Walrus Sites config to ensure correct portal/package
    site-builder --config .walrus/sites-config.yaml publish ./dist --epochs $epochs
        
        echo ""
        echo "✅ Deployment complete!"
        echo "📝 Next steps:"
        echo "   1. Note the B36 URL from above"
        echo "   2. Update ws-resources.json with the Object ID"
        echo "   3. (Optional) Configure SuiNS: https://testnet.suins.io/"
    fi
else
    echo "⚠️  Site builder not found, skipping Walrus deployment"
fi

echo ""
echo "🎉 Deployment process complete!"
echo ""
echo "📚 Resources:"
echo "   - README: ./README.md"
echo "   - Deployment Guide: ./DEPLOYMENT.md"
echo "   - Sui Explorer: https://suiscan.xyz/testnet"
echo "   - Walrus Explorer: https://walruscan.com/testnet"
