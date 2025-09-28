# Docker-based Seal Key Server Setup for Windows
Write-Host "🐳 Setting up Seal Key Server with Docker..." -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Build Seal Docker image
Write-Host "🔨 Building Seal Docker image..." -ForegroundColor Yellow
Set-Location seal-repo

try {
    $gitRevision = git describe --always --abbrev=12 --dirty --exclude '*' 2>$null
    if (-not $gitRevision) {
        $gitRevision = "unknown"
    }
    
    docker build -t seal-key-server . --build-arg GIT_REVISION=$gitRevision
    
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed"
    }
    
    Write-Host "✅ Docker image built successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to build Docker image: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Generate master key using Docker
Write-Host "🔐 Generating master key..." -ForegroundColor Yellow
try {
    $masterKeyOutput = docker run --rm seal-key-server cargo run --bin seal-cli genkey
    
    Write-Host "Master Key Output:" -ForegroundColor Cyan
    Write-Host $masterKeyOutput -ForegroundColor White
    
    # Extract keys from output
    $masterKey = ($masterKeyOutput | Select-String "Master key:").Line -replace "Master key:\s*", ""
    $publicKey = ($masterKeyOutput | Select-String "Public key:").Line -replace "Public key:\s*", ""
    
    Write-Host ""
    Write-Host "🔑 Generated Keys:" -ForegroundColor Cyan
    Write-Host "Master Key: $masterKey" -ForegroundColor White
    Write-Host "Public Key: $publicKey" -ForegroundColor White
    
    # Save to .env file
    $envContent = @"

# Seal Protocol Master Keys (Docker Generated)
VITE_SEAL_MASTER_KEY=$masterKey
VITE_SEAL_PUBLIC_KEY=$publicKey
VITE_SEAL_KEY_SERVER_NAME=SuiKnow-Docker-$(Get-Date -Format 'yyyyMMddHHmmss')
"@
    
    Add-Content -Path "../.env" -Value $envContent
    Write-Host "✅ Keys saved to .env file" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Failed to generate keys: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Create Docker Compose file for Seal
$dockerComposeContent = "version: '3.8'`n`nservices:`n  seal-key-server:`n    image: seal-key-server`n    ports:`n      - `"2024:2024`"`n      - `"9184:9184`"`n    environment:`n      - MASTER_KEY=$masterKey`n      - CONFIG_PATH=/config/key-server-config.yaml`n      - NODE_URL=https://fullnode.testnet.sui.io:443`n    volumes:`n      - ./seal-key-server-config.yaml:/config/key-server-config.yaml`n    restart: unless-stopped`n    healthcheck:`n      test: [`"CMD`", `"curl`", `"-f`", `"http://localhost:2024/health`"]`n      interval: 30s`n      timeout: 10s`n      retries: 3"

$dockerComposeContent | Out-File -FilePath "docker-compose-seal.yml" -Encoding UTF8

Write-Host "✅ Docker Compose file created: docker-compose-seal.yml" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 To start the Seal Key Server:" -ForegroundColor Cyan
Write-Host "   docker-compose -f docker-compose-seal.yml up -d" -ForegroundColor White
Write-Host ""
Write-Host "🔍 To check server status:" -ForegroundColor Cyan
Write-Host "   curl http://localhost:2024/health" -ForegroundColor White
Write-Host ""
Write-Host "📊 To view metrics:" -ForegroundColor Cyan
Write-Host "   curl http://localhost:2024/metrics" -ForegroundColor White