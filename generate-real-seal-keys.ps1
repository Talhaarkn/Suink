# Real Seal Key Generation Script
Write-Host "🔐 Generating Real Seal Master Keys..." -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Set Rust PATH
$env:PATH += ";$env:USERPROFILE\.cargo\bin"

# Check if seal-cli exists
$sealCliPath = "seal-repo\target\debug\seal-cli.exe"
$sealCliPathRelease = "seal-repo\target\release\seal-cli.exe"

if (Test-Path $sealCliPathRelease) {
    $sealCliPath = $sealCliPathRelease
    Write-Host "✅ Using release build" -ForegroundColor Green
} elseif (Test-Path $sealCliPath) {
    Write-Host "✅ Using debug build" -ForegroundColor Green
} else {
    Write-Host "❌ seal-cli not found. Building..." -ForegroundColor Red
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    
    try {
        Set-Location seal-repo
        cargo build --bin seal-cli
        Set-Location ..
        
        if (Test-Path $sealCliPath) {
            Write-Host "✅ seal-cli built successfully" -ForegroundColor Green
        } else {
            throw "Build failed"
        }
    } catch {
        Write-Host "❌ Failed to build seal-cli: $_" -ForegroundColor Red
        exit 1
    }
}

# Generate master key
Write-Host "🔑 Generating master key..." -ForegroundColor Yellow
try {
    $output = & $sealCliPath genkey 2>&1
    $outputString = $output -join "`n"
    
    Write-Host "Seal CLI Output:" -ForegroundColor Cyan
    Write-Host $outputString -ForegroundColor White
    
    # Extract keys from output
    $masterKey = ""
    $publicKey = ""
    
    foreach ($line in $output) {
        if ($line -match "Master key:\s*(.+)") {
            $masterKey = $matches[1].Trim()
        } elseif ($line -match "Public key:\s*(.+)") {
            $publicKey = $matches[1].Trim()
        }
    }
    
    if (-not $masterKey -or -not $publicKey) {
        throw "Could not extract keys from output"
    }
    
    Write-Host ""
    Write-Host "🔑 Generated Keys:" -ForegroundColor Cyan
    Write-Host "Master Key: $masterKey" -ForegroundColor White
    Write-Host "Public Key: $publicKey" -ForegroundColor White
    
    # Save to .env file
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $envContent = @"

# Real Seal Protocol Master Keys (GENERATED - KEEP SECURE!)
VITE_SEAL_MASTER_KEY=$masterKey
VITE_SEAL_PUBLIC_KEY=$publicKey
VITE_SEAL_KEY_SERVER_NAME=SuiKnow-Real-$timestamp
"@
    
    Add-Content -Path ".env" -Value $envContent
    Write-Host "✅ Keys saved to .env file" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🔐 IMPORTANT SECURITY NOTES:" -ForegroundColor Red
    Write-Host "1. Keep the master key SECRET and secure" -ForegroundColor Yellow
    Write-Host "2. Never commit the master key to version control" -ForegroundColor Yellow
    Write-Host "3. Use environment variables in production" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "1. Register key server on Sui testnet" -ForegroundColor White
    Write-Host "2. Update key_server_object_id in config" -ForegroundColor White
    Write-Host "3. Start the real key server" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error generating keys: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure Rust is installed: rustc --version" -ForegroundColor White
    Write-Host "2. Make sure you are in the correct directory" -ForegroundColor White
    Write-Host "3. Try building manually: cd seal-repo && cargo build --bin seal-cli" -ForegroundColor White
}