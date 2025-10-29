@echo off
chcp 65001 >nul
echo.
echo ================================
echo Walrus Deployment - Epoch 10
echo ================================
echo.

if not exist "dist\" (
    echo Error: dist folder not found. Run 'npm run build' first.
    exit /b 1
)

echo Build folder found: dist/
echo.

if not exist "site-builder.exe" (
    echo Error: site-builder.exe not found.
    echo Download from: https://storage.googleapis.com/mysten-walrus-binaries/site-builder-testnet-latest-windows-x86_64.exe
    exit /b 1
)

echo Publishing to Walrus with epoch 10...
echo.

site-builder.exe --config site-builder-config.yaml publish --epochs 10 dist/

echo.
echo Deployment complete!
echo.
pause

