#!/bin/bash

# Railway deployment script for SuiKnow backends
# This script starts both Walrus proxy and Enoki backend services

echo "🚀 Starting SuiKnow Backend Services..."

# Check if SERVICE environment variable is set
if [ -z "$SERVICE" ]; then
  echo "❌ SERVICE environment variable not set!"
  echo "Set SERVICE=walrus or SERVICE=enoki in Railway dashboard"
  exit 1
fi

# Start the appropriate service
if [ "$SERVICE" = "walrus" ]; then
  echo "🐋 Starting Walrus Proxy Server on port $PORT..."
  export WALRUS_PROXY_PORT=$PORT
  node walrus-proxy-server.js
elif [ "$SERVICE" = "enoki" ]; then
  echo "💰 Starting Enoki Backend Server on port $PORT..."
  node enoki-backend-server.js
else
  echo "❌ Invalid SERVICE value: $SERVICE"
  echo "Use SERVICE=walrus or SERVICE=enoki"
  exit 1
fi
