#!/bin/bash

# Docker-based Seal Key Server Setup
echo "🐳 Setting up Seal Key Server with Docker..."
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

echo "✅ Docker is running"

# Build Seal Docker image
echo "🔨 Building Seal Docker image..."
cd seal-repo
docker build -t seal-key-server . --build-arg GIT_REVISION="$(git describe --always --abbrev=12 --dirty --exclude '*')"

if [ $? -ne 0 ]; then
    echo "❌ Failed to build Docker image"
    exit 1
fi

echo "✅ Docker image built successfully"

# Generate master key using Docker
echo "🔐 Generating master key..."
MASTER_KEY_OUTPUT=$(docker run --rm seal-key-server cargo run --bin seal-cli genkey)

echo "Master Key Output:"
echo "$MASTER_KEY_OUTPUT"

# Extract keys from output
MASTER_KEY=$(echo "$MASTER_KEY_OUTPUT" | grep "Master key:" | cut -d: -f2 | tr -d ' ')
PUBLIC_KEY=$(echo "$MASTER_KEY_OUTPUT" | grep "Public key:" | cut -d: -f2 | tr -d ' ')

echo ""
echo "🔑 Generated Keys:"
echo "Master Key: $MASTER_KEY"
echo "Public Key: $PUBLIC_KEY"

# Save to .env file
echo "" >> ../.env
echo "# Seal Protocol Master Keys (Docker Generated)" >> ../.env
echo "VITE_SEAL_MASTER_KEY=$MASTER_KEY" >> ../.env
echo "VITE_SEAL_PUBLIC_KEY=$PUBLIC_KEY" >> ../.env
echo "VITE_SEAL_KEY_SERVER_NAME=SuiKnow-Docker-$(date +%s)" >> ../.env

echo "✅ Keys saved to .env file"

# Create Docker Compose file for Seal
cat > ../docker-compose-seal.yml << EOF
version: '3.8'

services:
  seal-key-server:
    image: seal-key-server
    ports:
      - "2024:2024"
      - "9184:9184"
    environment:
      - MASTER_KEY=$MASTER_KEY
      - CONFIG_PATH=/config/key-server-config.yaml
      - NODE_URL=https://fullnode.testnet.sui.io:443
    volumes:
      - ./seal-key-server-config.yaml:/config/key-server-config.yaml
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:2024/health"]
      interval: 30s
      timeout: 10s
      retries: 3
EOF

echo "✅ Docker Compose file created: docker-compose-seal.yml"
echo ""
echo "🚀 To start the Seal Key Server:"
echo "   docker-compose -f docker-compose-seal.yml up -d"
echo ""
echo "🔍 To check server status:"
echo "   curl http://localhost:2024/health"
echo ""
echo "📊 To view metrics:"
echo "   curl http://localhost:2024/metrics"


