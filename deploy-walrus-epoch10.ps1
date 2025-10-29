# Walrus Deployment Script with Epoch 10
# Run this script from your project directory

Write-Host "🚀 SuiLinkTree Walrus Deployment - Epoch 10" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if dist folder exists
if (-Not (Test-Path "dist")) {
    Write-Host "❌ Error: dist folder not found. Run 'npm run build' first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build folder found: dist/" -ForegroundColor Green
Write-Host ""

# Check if site-builder.exe exists
if (-Not (Test-Path "site-builder.exe")) {
    Write-Host "❌ Error: site-builder.exe not found in current directory." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download site-builder from:" -ForegroundColor Yellow
    Write-Host "  https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-windows-x86_64.exe" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "And rename it to site-builder.exe in this directory." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ site-builder.exe found" -ForegroundColor Green
Write-Host ""

# Run deployment
Write-Host "🚀 Publishing to Walrus with epoch 10..." -ForegroundColor Cyan
Write-Host ""

.\site-builder.exe --config site-builder-config.yaml publish --epochs 10 dist/

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Check the output above for your Walrus site URL" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Deployment failed. Check the error messages above." -ForegroundColor Red
    Write-Host ""
}

