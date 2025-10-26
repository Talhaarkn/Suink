#!/bin/bash

# Walrus Sites Link Test Script
# Bu script'i çalıştırarak linklerinizi test edebilirsiniz

echo "🔍 Walrus Sites Link Testi"
echo "=========================="
echo ""

# Değişkenler
SUINS_NAME="suinks"
PORTAL="trwal.app"
SITE_OBJECT_ID="0x5cff825ae30471011b5f5e812fcf356a1c3156d7765395e2f06470df67ae2925"
CLEAN_OBJECT_ID="${SITE_OBJECT_ID#0x}"

echo "📋 Site Bilgileri:"
echo "  SuiNS Name: $SUINS_NAME"
echo "  Portal: $PORTAL"
echo "  Site Object ID: $SITE_OBJECT_ID"
echo ""

# Test URL'leri
BASE_URL_SUINS="https://$SUINS_NAME.$PORTAL"
BASE_URL_OBJECT="https://$CLEAN_OBJECT_ID.$PORTAL"

echo "🌐 Test Edilecek URL'ler:"
echo ""
echo "1. Ana Sayfa (SuiNS):"
echo "   $BASE_URL_SUINS"
echo ""
echo "2. Ana Sayfa (Object ID):"
echo "   $BASE_URL_OBJECT"
echo ""

# Test profil ID'si (örnek)
PROFILE_ID="0x7c61d0961448c31be55cca633e8ececf44224b33360d35dc22ee924e98c90e11"

echo "3. Profil Sayfası (SuiNS):"
echo "   $BASE_URL_SUINS/view/$PROFILE_ID"
echo ""
echo "4. Profil Sayfası (Object ID):"
echo "   $BASE_URL_OBJECT/view/$PROFILE_ID"
echo ""

echo "📝 Test Adımları:"
echo "1. Browser'da yukarıdaki URL'leri test edin"
echo "2. Console'da (F12) 'Generated Walrus link' mesajını kontrol edin"
echo "3. Copy butonuna tıklayıp kopyalanan linki test edin"
echo "4. View butonuna tıklayıp açılan sayfayı kontrol edin"
echo ""

echo "❓ Sorun Çözme:"
echo "Eğer linkler açılmıyorsa:"
echo "  - SuiNS domain'i kontrol edin: https://suins.io"
echo "  - Site'ın deploy edildiğinden emin olun"
echo "  - Farklı portal deneyin (wal.app, walrus.site)"
echo "  - Browser console'da hata mesajlarını kontrol edin"
echo ""

echo "✅ Browser'da test etmek için bu komutu çalıştırın:"
echo "   xdg-open '$BASE_URL_SUINS'"
