#!/bin/bash

echo "🌐 Opening Walrus deployment resources..."
echo ""

# Try to open browser
if command -v xdg-open &> /dev/null; then
    echo "Opening Walrus Sites resources in browser..."
    xdg-open "https://docs.wal.app/walrus-sites/intro.html" 2>/dev/null &
    sleep 2
    xdg-open "https://testnet.wal.app" 2>/dev/null &
elif command -v google-chrome &> /dev/null; then
    google-chrome "https://docs.wal.app/walrus-sites/intro.html" &
    sleep 2
    google-chrome "https://testnet.wal.app" &
fi

echo ""
echo "📋 Deployment Info:"
echo "==================="
echo ""
echo "📁 Package Location:"
echo "   /home/hackathon/Desktop/SuiKnow/walrus-site-package/"
echo ""
echo "📦 Files to Upload:"
echo "   - index.html"
echo "   - logo.png" 
echo "   - ws-resources.json (SPA routing)"
echo "   - assets/index-Dqri4GBW.js"
echo "   - assets/index-CJ7iVfIX.css"
echo ""
echo "🔗 Walrus Sites Portal:"
echo "   https://testnet.wal.app"
echo ""
echo "📚 Documentation:"
echo "   https://docs.wal.app/walrus-sites/intro.html"
echo ""
echo "⚙️ Configuration:"
echo "   - Epochs: 100+ (recommended)"
echo "   - Enable SPA routing"
echo "   - ws-resources.json included"
echo ""
echo "✅ After deployment, you'll get:"
echo "   - Walrus Site Object ID: 0x..."
echo "   - Public URL: https://XXXX.walrus.site"
echo ""
