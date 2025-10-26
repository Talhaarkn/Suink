#!/bin/bash

# Walrus Sites Deployment Helper
# Bu script deployment için gereken adımları gösterir

echo "🚀 Walrus Sites Deployment Rehberi"
echo "===================================="
echo ""

# Wallet address
WALLET_ADDRESS=$(sui client active-address 2>/dev/null)
echo "📋 Cüzdan Adresi: $WALLET_ADDRESS"
echo ""

echo "⚠️  HATA: WAL token bakiyesi yetersiz!"
echo ""

echo "🪙 WAL Token Almak İçin:"
echo "1. Walrus testnet faucet'e gidin:"
echo "   https://discord.gg/walrusprotocol"
echo ""
echo "2. Discord'da #walrus-testnet-faucet kanalına gidin"
echo ""
echo "3. Şu komutu kullanın:"
echo "   !faucet $WALLET_ADDRESS"
echo ""
echo "VEYA"
echo ""
echo "4. Walrus CLI ile token alın:"
echo "   walrus request-wal"
echo ""

echo "📝 Deployment Komutu (WAL token aldıktan sonra):"
echo "   cd /home/hackathon/Desktop/SuiKnow"
echo "   site-builder --config .walrus/sites-config.yaml publish --epochs 53 dist"
echo ""

echo "💡 Site Object ID güncellemek için:"
echo "   1. Deployment sonrası verilen 'Site objectID' değerini kopyalayın"
echo "   2. src/lib/walrusConfig.ts dosyasında WALRUS_SITE_OBJECT_ID'yi güncelleyin"
echo "   3. ws-resources.json dosyasında object_id'yi güncelleyin"
echo "   4. npx vite build ile yeniden build edin"
echo "   5. Site'ı tekrar publish edin"
echo ""

echo "🌐 SuiNS Domain Güncelleme:"
echo "   1. https://suins.io adresine gidin"
echo "   2. 'suinks' domain'inizi bulun"
echo "   3. Yeni Site Object ID'yi domain'e bağlayın"
echo ""

echo "✅ Test Etme:"
echo "   https://suinks.trwal.app"
echo "   https://suinks.trwal.app/view/{profile-id}"
