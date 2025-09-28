# Real Seal Key Server Startup Script
Write-Host "🚀 Starting Real Seal Key Server..." -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Set Rust PATH
$env:PATH += ";$env:USERPROFILE\.cargo\bin"

# Read environment variables
try {
    $envContent = Get-Content ".env" -Raw
    $envLines = $envContent -split "`n"
    
    $masterKey = ""
    $objectId = ""
    $serverName = ""
    
    foreach ($line in $envLines) {
        if ($line -match "VITE_SEAL_MASTER_KEY=(.+)") {
            $masterKey = $matches[1].Trim()
        } elseif ($line -match "VITE_SEAL_KEY_SERVER_OBJECT_ID=(.+)") {
            $objectId = $matches[1].Trim()
        } elseif ($line -match "VITE_SEAL_KEY_SERVER_NAME=(.+)") {
            $serverName = $matches[1].Trim()
        }
    }
    
    if (-not $masterKey) {
        throw "Master key not found. Run generate-real-seal-keys.ps1 first."
    }
    
    Write-Host "Server Name: $serverName" -ForegroundColor Green
    Write-Host "Master Key: $($masterKey.Substring(0, 20))..." -ForegroundColor Green
    Write-Host "Object ID: $objectId" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error reading environment: $_" -ForegroundColor Red
    exit 1
}

# Check if key-server binary exists
$keyServerPath = "seal-repo\target\debug\key-server.exe"
$keyServerPathRelease = "seal-repo\target\release\key-server.exe"

if (Test-Path $keyServerPathRelease) {
    $binaryPath = $keyServerPathRelease
    Write-Host "✅ Using release build" -ForegroundColor Green
} elseif (Test-Path $keyServerPath) {
    $binaryPath = $keyServerPath
    Write-Host "✅ Using debug build" -ForegroundColor Green
} else {
    Write-Host "❌ key-server binary not found. Building..." -ForegroundColor Red
    Write-Host "This may take a few minutes..." -ForegroundColor Yellow
    
    try {
        Set-Location seal-repo
        cargo build --bin key-server
        Set-Location ..
        
        if (Test-Path $keyServerPath) {
            $binaryPath = $keyServerPath
            Write-Host "✅ key-server built successfully" -ForegroundColor Green
        } else {
            throw "Build failed"
        }
    } catch {
        Write-Host "❌ Failed to build key-server: $_" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Using binary: $binaryPath" -ForegroundColor Cyan
Write-Host ""

# Set environment variables
$env:MASTER_KEY = $masterKey
$env:CONFIG_PATH = "seal-key-server-config.yaml"
$env:NODE_URL = "https://fullnode.testnet.sui.io:443"

# Start the key server
Write-Host "🔧 Starting Real Seal Key Server..." -ForegroundColor Yellow
Write-Host "Server will be available at: http://localhost:2024" -ForegroundColor Green
Write-Host "Health check: http://localhost:2024/health" -ForegroundColor Green
Write-Host "Metrics: http://localhost:2024/metrics" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

try {
    # Start the process
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $binaryPath
    $processInfo.WorkingDirectory = "seal-repo"
    $processInfo.UseShellExecute = $false
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo
    
    # Handle output
    $process.EnableRaisingEvents = $true
    Register-ObjectEvent -InputObject $process -EventName OutputDataReceived -Action {
        if ($Event.SourceEventArgs.Data) {
            Write-Host $Event.SourceEventArgs.Data -ForegroundColor White
        }
    } | Out-Null
    
    Register-ObjectEvent -InputObject $process -EventName ErrorDataReceived -Action {
        if ($Event.SourceEventArgs.Data) {
            Write-Host $Event.SourceEventArgs.Data -ForegroundColor Red
        }
    } | Out-Null
    
    $process.Start() | Out-Null
    $process.BeginOutputReadLine()
    $process.BeginErrorReadLine()
    
    # Wait for process
    $process.WaitForExit()
    
} catch {
    Write-Host "❌ Error starting key server: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "1. Make sure the binary is built: cargo build --bin key-server" -ForegroundColor White
    Write-Host "2. Check the configuration file" -ForegroundColor White
    Write-Host "3. Verify environment variables" -ForegroundColor White
    Write-Host "4. Make sure port 2024 is not in use" -ForegroundColor White
}


