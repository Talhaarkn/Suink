#!/bin/bash

echo "🚀 SuiKnow Backend Quick Deploy Script"
echo "======================================"
echo ""

# Check if Railway CLI is installed
if command -v railway &> /dev/null; then
    echo "✅ Railway CLI found"
    USE_RAILWAY=true
else
    echo "❌ Railway CLI not found"
    echo "📦 Install with: npm install -g @railway/cli"
    USE_RAILWAY=false
fi

echo ""
echo "Select deployment option:"
echo "1) Railway (Automated)"
echo "2) Manual Instructions"
echo ""
read -p "Enter choice [1-2]: " choice

case $choice in
    1)
        if [ "$USE_RAILWAY" = false ]; then
            echo "❌ Railway CLI not installed. Please install first:"
            echo "npm install -g @railway/cli"
            exit 1
        fi
        
        echo ""
        echo "🚂 Deploying to Railway..."
        echo ""
        
        # Login check
        if ! railway whoami &> /dev/null; then
            echo "🔐 Please login to Railway:"
            railway login
        fi
        
        echo ""
        echo "📝 Creating Railway project..."
        railway init
        
        echo ""
        echo "🐋 Deploying Walrus Proxy..."
        railway up
        
        echo ""
        echo "💰 For Enoki Backend, create a new service in Railway dashboard:"
        echo "   1. Go to railway.app/dashboard"
        echo "   2. Select your project"
        echo "   3. Click '+ New Service'"
        echo "   4. Set environment variables:"
        echo "      - ENOKI_PRIVATE_KEY=enoki_private_8a522594a3f9138837481d121ccf6c13"
        echo "   5. Deploy"
        echo ""
        
        echo "✅ Walrus Proxy deployed!"
        echo "🔗 Get your URLs with: railway domain"
        ;;
        
    2)
        echo ""
        echo "📖 Manual Deployment Instructions"
        echo "================================="
        echo ""
        echo "🚂 Railway.app:"
        echo "   1. Install CLI: npm install -g @railway/cli"
        echo "   2. Login: railway login"
        echo "   3. Deploy: railway init && railway up"
        echo "   4. Set env vars in dashboard"
        echo ""
        echo "🎨 Render.com:"
        echo "   1. Go to render.com/dashboard"
        echo "   2. New → Blueprint"
        echo "   3. Connect GitHub repo"
        echo "   4. Render auto-detects render.yaml"
        echo "   5. Set ENOKI_PRIVATE_KEY in dashboard"
        echo ""
        echo "☁️ VPS:"
        echo "   1. SSH to server"
        echo "   2. Install Node.js 18+"
        echo "   3. npm install -g pm2"
        echo "   4. Upload files via scp"
        echo "   5. pm2 start walrus-proxy-server.js"
        echo "   6. pm2 start enoki-backend-server.js"
        echo ""
        echo "📚 Full guide: BACKEND_DEPLOYMENT.md"
        ;;
        
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "⚠️  Remember to update frontend .env after deployment!"
echo "    VITE_WALRUS_PROXY_URL=https://your-walrus-url"
echo "    VITE_BACKEND_URL=https://your-enoki-url"
echo ""
echo "📖 Full documentation: BACKEND_DEPLOYMENT.md"
