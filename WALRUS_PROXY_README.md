# Walrus CLI Proxy Server

Bu proxy server, browser'dan Walrus CLI kullanarak dosya upload/download işlemlerini sağlar.

## 🚀 Kurulum

Gerekli paketler zaten yüklü (`express`, `multer`, `cors`).

## 📝 Kullanım

### 1. Proxy Server'ı Başlat

```bash
npm run walrus:proxy
```

Veya:

```bash
node walrus-proxy-server.js
```

Server `http://localhost:3003` adresinde çalışacak.

### 2. Frontend'i Başlat

Başka bir terminalde:

```bash
npm run dev
```

### 3. Test Et

#### Health Check
```bash
curl http://localhost:3003/health
```

#### Dosya Upload
```bash
curl -X POST \
  -F "file=@/path/to/file.txt" \
  -F "epochs=5" \
  http://localhost:3003/upload
```

#### Dosya Read
```bash
curl http://localhost:3003/read/<blob-id>
```

## 🔧 API Endpoints

### POST /upload
Dosya upload eder.

**Request:**
- `file`: Multipart form data ile dosya
- `epochs`: (optional) Kaç epoch saklanacak (default: 5)

**Response:**
```json
{
  "success": true,
  "fileId": "8ML64OPaSGlUaOImQyucJcrlZYdaOFcuXyWJkDfT5Gk",
  "blobId": "8ML64OPaSGlUaOImQyucJcrlZYdaOFcuXyWJkDfT5Gk",
  "url": "https://aggregator.walrus-testnet.walrus.space/v1/8ML64OPaSGlUaOImQyucJcrlZYdaOFcuXyWJkDfT5Gk",
  "size": 1234,
  "uploadedAt": "2025-10-26T01:48:57.121Z",
  "originalName": "file.txt"
}
```

### GET /read/:blobId
Dosyayı okur ve döner.

**Response:**
Dosya içeriği (binary veya text)

### GET /health
Server sağlık durumunu kontrol eder.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "walrusCLI": "available"
}
```

## 📦 Frontend Entegrasyonu

Frontend otomatik olarak proxy'yi kullanacak:

```typescript
import { realWalrusService } from './lib/realWalrusService'

// Upload
const result = await realWalrusService.uploadFile(file, true)
console.log('Uploaded:', result.url)

// Read
const bytes = await realWalrusService.readFile(blobId)
const text = await realWalrusService.readFileAsText(blobId)
const json = await realWalrusService.readFileAsJson(blobId)
```

## ⚙️ Environment Variables

`.env` dosyasına ekleyin:

```env
VITE_WALRUS_PROXY_URL=http://localhost:3003
```

## 🔍 Sorun Giderme

### Proxy server çalışmıyor
```bash
# Walrus CLI kurulu mu kontrol et
walrus --version

# Port kullanımda mı kontrol et
lsof -i :3003
```

### Upload başarısız
- Walrus CLI'nin PATH'te olduğundan emin olun
- Sui cüzdanında yeterli SUI ve WAL token olduğundan emin olun
- Walrus config dosyasının doğru olduğundan emin olun

### CORS hatası
Proxy server CORS'u otomatik olarak aktif ediyor. Sorun devam ederse:
```javascript
// walrus-proxy-server.js içinde
app.use(cors({
  origin: 'http://localhost:3002', // Frontend URL'iniz
  credentials: true
}));
```

## 📊 Performans

- Max dosya boyutu: 10MB (ayarlanabilir)
- Upload hızı: Walrus CLI hızına bağlı (~16 saniye/dosya)
- Concurrent uploads: Sınırsız (her upload ayrı temporary file kullanır)

## 🛡️ Güvenlik

⚠️ **Production için:**
- Rate limiting ekleyin
- Authentication ekleyin
- File type validation ekleyin
- Virus scanning ekleyin
- HTTPS kullanın

## 📄 License

MIT
