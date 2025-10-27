# Windows PowerShell Walrus Deploy Script
# SuiNK - 10 Epoch Deployment

Write-Host "🚀 SuiNK Walrus Deployment (10 epochs)" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if dist folder exists
if (-Not (Test-Path "dist")) {
    Write-Host "❌ Error: dist folder not found!" -ForegroundColor Red
    Write-Host "Run 'npm run build' first." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Build folder found: dist/" -ForegroundColor Green
Write-Host ""

# Create deployment package
$DeployDir = "walrus-site-package"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"

Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow
if (Test-Path $DeployDir) {
    Remove-Item -Recurse -Force $DeployDir
}
New-Item -ItemType Directory -Path $DeployDir | Out-Null

# Copy dist files
Copy-Item -Path "dist\*" -Destination $DeployDir -Recurse

Write-Host "✅ Package created: $DeployDir/" -ForegroundColor Green
Write-Host ""

# Create tarball (optional, if 7zip or tar available)
$TarballName = "suilinktree-walrus-$Timestamp.zip"
if (Get-Command "Compress-Archive" -ErrorAction SilentlyContinue) {
    Compress-Archive -Path $DeployDir -DestinationPath $TarballName -Force
    $Size = (Get-Item $TarballName).Length / 1MB
    Write-Host "📦 Archive created: $TarballName" -ForegroundColor Green
    Write-Host "   Size: $([math]::Round($Size, 2)) MB" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "📋 DEPLOYMENT OPTIONS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Web Publisher (RECOMMENDED) ⭐" -ForegroundColor Yellow
Write-Host "  1. Visit: https://walrus-sites-publisher.wal.app" -ForegroundColor White
Write-Host "  2. Upload folder: $DeployDir\" -ForegroundColor White
Write-Host "  3. Set epochs: 10" -ForegroundColor White
Write-Host "  4. Click Publish" -ForegroundColor White
Write-Host ""

Write-Host "Option 2: Git Bash + site-builder" -ForegroundColor Yellow
Write-Host "  Open Git Bash and run:" -ForegroundColor White
Write-Host "  site-builder deploy ./dist --epochs 10" -ForegroundColor Gray
Write-Host ""

Write-Host "Option 3: WSL (Windows Subsystem for Linux)" -ForegroundColor Yellow
Write-Host "  wsl" -ForegroundColor Gray
Write-Host "  cd /mnt/c/Users/tati_/Masaüstü/Suink" -ForegroundColor Gray
Write-Host "  site-builder deploy ./dist --epochs 10" -ForegroundColor Gray
Write-Host ""

Write-Host "🌐 To test locally before deploying:" -ForegroundColor Cyan
Write-Host "  cd $DeployDir" -ForegroundColor Gray
Write-Host "  python -m http.server 8080" -ForegroundColor Gray
Write-Host "  Visit: http://localhost:8080" -ForegroundColor Gray
Write-Host ""

Write-Host "📄 Files ready for deployment:" -ForegroundColor Cyan
Get-ChildItem -Path $DeployDir -Recurse -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($DeployDir.Length)
    Write-Host "  $relativePath" -ForegroundColor Gray
}
Write-Host ""

Write-Host "✅ Deployment package ready!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 TIP: Use Option 1 (Web Publisher) for easiest deployment!" -ForegroundColor Yellow
Write-Host "After publishing, you'll get a URL like: https://xxx.trwal.app/" -ForegroundColor Cyan



