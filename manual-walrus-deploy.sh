#!/bin/bash

# Manual Walrus Deployment Script
# This creates the necessary structure for Walrus Sites

echo "🚀 Manual Walrus Sites Deployment"
echo "===================================="
echo ""

# Create deployment package
DEPLOY_DIR="walrus-site-package"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "📦 Creating deployment package..."
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# Copy dist files
cp -r dist/* $DEPLOY_DIR/

echo "✅ Package created in: $DEPLOY_DIR/"
echo ""

# Create a tarball
TARBALL="suilinktree-walrus-${TIMESTAMP}.tar.gz"
tar -czf $TARBALL $DEPLOY_DIR

echo "📦 Tarball created: $TARBALL"
echo "   Size: $(du -h $TARBALL | cut -f1)"
echo ""

echo "📋 Next Steps:"
echo ""
echo "Option 1: Use Walrus Sites Publisher (Recommended)"
echo "  Visit: https://walrus-sites-publisher.wal.app"
echo "  Upload the folder: $DEPLOY_DIR/"
echo ""
echo "Option 2: Use site-builder command (if available)"
echo "  site-builder publish --epochs 100 $DEPLOY_DIR/"
echo ""
echo "Option 3: Use Walrus testnet portal"
echo "  Visit: https://testnet.wal.app"
echo "  Upload files from: $DEPLOY_DIR/"
echo ""

# Create a simple HTTP server to test locally
echo "🌐 To test locally before deploying:"
echo "  cd $DEPLOY_DIR && python3 -m http.server 8080"
echo "  Then visit: http://localhost:8080"
echo ""

# List files to be deployed
echo "📄 Files to be deployed:"
tree $DEPLOY_DIR 2>/dev/null || find $DEPLOY_DIR -type f
echo ""

echo "✅ Deployment package ready!"
