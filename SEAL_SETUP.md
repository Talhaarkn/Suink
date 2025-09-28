# Seal Protocol Setup for SuiKnow

Bu doküman, SuiKnow uygulaması için Seal Protocol anahtar sunucusunun nasıl kurulacağını açıklar.

## Gereksinimler

1. **Rust** (Seal CLI için)
2. **Sui CLI** (anahtar sunucuyu zincire kaydetmek için)
3. **Docker** (opsiyonel, containerized deployment için)

## Kurulum Adımları

### 1. Seal CLI Kurulumu

```bash
# Seal repository'sini klonlayın
git clone https://github.com/MystenLabs/awesome-seal.git
cd awesome-seal

# Seal CLI'yi derleyin
cargo build --release --bin seal-cli
```

### 2. Ana Anahtar Oluşturma

```bash
# Ana anahtar çifti oluşturun
cargo run --bin seal-cli genkey

# Çıktı:
# Master key: <MASTER_KEY>
# Public key: <MASTER_PUBKEY>
```

### 3. Anahtar Sunucusunu Zincire Kaydetme

```bash
# Sui testnet'e geçin
sui client switch --env testnet

# Aktif adresi kontrol edin ve fonlayın
sui client active-address

# Anahtar sunucusunu kaydedin
sui client call \
  --function create_and_transfer_v1 \
  --module key_server \
  --package 0x927a54e9ae803f82ebf480136a9bcff45101ccbe28b13f433c89f5181069d682 \
  --args "SuiKnow-KeyServer" "https://your-server-url.com" 0 <MASTER_PUBKEY>

# Çıktı: <KEY_SERVER_OBJECT_ID>
```

### 4. Yapılandırma Dosyasını Güncelleme

`seal-config.yaml` dosyasında `key_server_object_id` alanını güncelleyin:

```yaml
key_server_object_id: "<KEY_SERVER_OBJECT_ID>"
```

### 5. Anahtar Sunucusunu Başlatma

#### Yerel Çalıştırma

```bash
# Ortam değişkenlerini ayarlayın
export MASTER_KEY="<MASTER_KEY>"
export CONFIG_PATH="seal-config.yaml"

# Anahtar sunucusunu başlatın
cargo run --bin key-server
```

#### Docker ile Çalıştırma

```bash
# Docker image'ı oluşturun
docker build -t seal-key-server . \
  --build-arg GIT_REVISION="$(git describe --always --abbrev=12 --dirty --exclude '*')"

# Container'ı çalıştırın
docker run -p 2024:2024 \
  -v $(pwd)/seal-config.yaml:/config/seal-config.yaml \
  -e CONFIG_PATH=/config/seal-config.yaml \
  -e MASTER_KEY="<MASTER_KEY>" \
  seal-key-server
```

### 6. SuiKnow Uygulamasını Güncelleme

`.env` dosyasında (veya environment variables'da) aşağıdaki değişkenleri ayarlayın:

```env
VITE_SEAL_KEY_SERVER_URL=http://localhost:2024
VITE_SEAL_PACKAGE_ID=0x927a54e9ae803f82ebf480136a9bcff45101ccbe28b13f433c89f5181069d682
```

## Test Etme

### 1. Anahtar Sunucusu Sağlık Kontrolü

```bash
curl http://localhost:2024/health
```

### 2. Metrikleri Kontrol Etme

```bash
curl http://localhost:9184/metrics
```

### 3. SuiKnow'da Seal Özelliklerini Test Etme

1. SuiKnow uygulamasını başlatın
2. Yeni bir quiz oluşturun
3. Seal özelliklerini etkinleştirin (Time Lock, Privacy, Whitelist)
4. Quiz'i kaydedin ve Seal ID'yi not edin
5. Quiz'e erişmeyi test edin

## Güvenlik Notları

1. **Ana Anahtar Güvenliği**: `MASTER_KEY`'i güvenli bir şekilde saklayın
2. **HTTPS**: Production'da anahtar sunucusunu HTTPS üzerinden çalıştırın
3. **API Gateway**: Production'da bir API gateway veya reverse proxy kullanın
4. **Rate Limiting**: Kötüye kullanımı önlemek için rate limiting uygulayın

## Sorun Giderme

### Anahtar Sunucusu Başlamıyor

- `MASTER_KEY`'in doğru ayarlandığından emin olun
- `CONFIG_PATH`'in doğru dosyayı işaret ettiğinden emin olun
- Port 2024'ün kullanılabilir olduğundan emin olun

### Zincir Kaydı Başarısız

- Sui CLI'nin testnet'e bağlı olduğundan emin olun
- Aktif adresin yeterli SUI'ye sahip olduğundan emin olun
- Package ID'nin doğru olduğundan emin olun

### CORS Hataları

- Tarayıcı konsolunda CORS hatalarını kontrol edin
- `seal-config.yaml`'daki CORS ayarlarını kontrol edin
- Anahtar sunucusunun doğru CORS başlıklarını gönderdiğinden emin olun

## Daha Fazla Bilgi

- [Seal Protocol Documentation](https://github.com/MystenLabs/awesome-seal)
- [Sui Documentation](https://docs.sui.io/)
- [Seal CLI Reference](https://github.com/MystenLabs/awesome-seal/blob/main/README.md)


