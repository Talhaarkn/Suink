#!/bin/bash

# Enoki Sponsored Transactions Test Setup
# This script helps you test sponsored transactions

echo "🧪 Enoki Sponsored Transactions - Test Setup"
echo "==========================================="
echo ""

# Check if Enoki private key is set
if [ -z "$VITE_ENOKI_PRIVATE_KEY" ]; then
    echo "⚠️  VITE_ENOKI_PRIVATE_KEY not set in environment!"
    echo ""
    echo "To get your Enoki private key:"
    echo "1. Visit https://portal.enoki.mystenlabs.com"
    echo "2. Select your app"
    echo "3. Create a Private API Key"
    echo "4. Enable 'Sponsored Transactions'"
    echo "5. Select 'testnet' network"
    echo "6. Copy the key and add to .env:"
    echo "   VITE_ENOKI_PRIVATE_KEY=enoki_private_xxx..."
    echo ""
    read -p "Do you have your private key? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your Enoki private key: " ENOKI_KEY
        echo "VITE_ENOKI_PRIVATE_KEY=$ENOKI_KEY" >> .env
        echo "✅ Key added to .env"
        export VITE_ENOKI_PRIVATE_KEY=$ENOKI_KEY
    else
        echo "❌ Cannot proceed without Enoki private key"
        exit 1
    fi
fi

echo ""
echo "🚀 Starting services..."
echo ""

# Function to check if a port is in use
port_in_use() {
    lsof -i:$1 > /dev/null 2>&1
}

# Kill existing processes
echo "🧹 Cleaning up old processes..."
pkill -f "enoki-backend-server" 2>/dev/null
pkill -f "walrus-proxy-server" 2>/dev/null
sleep 1

# Start Enoki backend
echo "🔐 Starting Enoki backend (port 3004)..."
VITE_ENOKI_PRIVATE_KEY=$VITE_ENOKI_PRIVATE_KEY node enoki-backend-server.js > /tmp/enoki-backend.log 2>&1 &
ENOKI_PID=$!
echo "   PID: $ENOKI_PID"
sleep 2

# Check if Enoki backend is running
if ! port_in_use 3004; then
    echo "❌ Enoki backend failed to start!"
    echo "Check logs: tail -f /tmp/enoki-backend.log"
    exit 1
fi

# Start Walrus proxy
echo "📦 Starting Walrus proxy (port 3003)..."
node walrus-proxy-server.js > /tmp/walrus-proxy.log 2>&1 &
WALRUS_PID=$!
echo "   PID: $WALRUS_PID"
sleep 2

# Check if Walrus proxy is running
if ! port_in_use 3003; then
    echo "❌ Walrus proxy failed to start!"
    echo "Check logs: tail -f /tmp/walrus-proxy.log"
    exit 1
fi

echo ""
echo "✅ All services started successfully!"
echo ""
echo "📝 Service URLs:"
echo "   - Enoki Backend: http://localhost:3004"
echo "   - Walrus Proxy:  http://localhost:3003"
echo ""
echo "🧪 Test the services:"
echo ""
echo "   # Test Enoki health"
echo "   curl http://localhost:3004/health"
echo ""
echo "   # Test Walrus health"
echo "   curl http://localhost:3003/health"
echo ""
echo "🎯 Now you can:"
echo "   1. Start the frontend: npm run dev"
echo "   2. Connect your wallet"
echo "   3. Use SponsoredTransactionButton component"
echo "   4. Transactions will be sponsored automatically!"
echo ""
echo "📊 View logs:"
echo "   - Enoki: tail -f /tmp/enoki-backend.log"
echo "   - Walrus: tail -f /tmp/walrus-proxy.log"
echo ""
echo "🛑 To stop services:"
echo "   kill $ENOKI_PID $WALRUS_PID"
echo ""
echo "Press Ctrl+C to stop all services..."

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping services...'; kill $ENOKI_PID $WALRUS_PID 2>/dev/null; echo '✅ All services stopped'; exit 0" INT

# Keep script running
while true; do
    sleep 1
done
