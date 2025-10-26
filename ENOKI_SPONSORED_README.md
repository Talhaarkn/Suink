# Enoki Sponsored Transactions

Bu doküman, Enoki SDK kullanarak sponsored transaction'ların nasıl çalıştığını açıklar.

## 🎯 Nasıl Çalışır?

### Akış

1. **Frontend:** Kullanıcı bir transaction başlatır
2. **Backend:** Transaction'ı sponsor eder (gas ücretini öder)
3. **Frontend:** Kullanıcı transaction'ı imzalar
4. **Backend:** İmzalı transaction'ı execute eder
5. **Blockchain:** Transaction gerçekleştirilir

## 🚀 Kurulum

### 1. Enoki API Key Oluştur

1. [Enoki Portal](https://portal.enoki.mystenlabs.com) 'a git
2. Bir app oluştur veya mevcut app'i seç
3. **Private API Key** oluştur:
   - Sponsored Transactions'ı aktif et
   - Network seç (testnet/mainnet)
   - Key'i kopyala

### 2. Environment Variables Ayarla

`.env` dosyasına ekle:

```env
VITE_ENOKI_PUBLIC_KEY=enoki_public_xxx...
VITE_ENOKI_PRIVATE_KEY=enoki_private_xxx...
VITE_BACKEND_URL=http://localhost:3004
```

⚠️ **Önemli:** Private key'i asla client-side'da kullanma!

### 3. Backend Server'ı Başlat

```bash
npm run enoki:backend
```

Server `http://localhost:3004` adresinde çalışacak.

## 📝 Kullanım

### Client-Side (Frontend)

```tsx
import { SponsoredTransactionButton } from './components/SponsoredTransactionButton'
import { Transaction } from '@mysten/sui/transactions'

function MyComponent() {
  const handleCreateProfile = async () => {
    // Transaction başarılı olduğunda çağrılır
  }

  return (
    <SponsoredTransactionButton
      transaction={(txb: Transaction) => {
        // Transaction komutlarını ekle
        txb.moveCall({
          target: `${packageId}::linktree::create_profile`,
          arguments: [
            txb.pure.string('username'),
            txb.pure.string('bio'),
            txb.object(registryId),
          ],
        })
      }}
      allowedMoveCallTargets={[
        `${packageId}::linktree::create_profile`
      ]}
      allowedAddresses={[]} // Opsiyonel: transfer edilebilecek adresler
      onSuccess={(digest) => {
        console.log('TX Success:', digest)
        handleCreateProfile()
      }}
      onError={(error) => {
        console.error('TX Error:', error)
      }}
    >
      Create Profile (Sponsored)
    </SponsoredTransactionButton>
  )
}
```

### Doğrudan API Kullanımı

```typescript
import { sponsorAndExecuteTransaction } from './lib/enokiSponsored'
import { useSignTransaction } from '@mysten/dapp-kit'

const { mutateAsync: signTransaction } = useSignTransaction()

const signFn = async (bytes: Uint8Array) => {
  const { signature } = await signTransaction({ transaction: bytes as any })
  return signature
}

const result = await sponsorAndExecuteTransaction(
  txb,
  senderAddress,
  signFn,
  ['0x2::kiosk::set_owner_custom'], // allowed move call targets
  [recipientAddress] // allowed addresses
)

console.log('TX Digest:', result.txDigest)
```

## 🔧 Backend API

### POST /api/sponsor-transaction

Transaction'ı sponsor eder.

**Request:**
```json
{
  "transactionKindBytes": "base64...",
  "sender": "0x123...",
  "allowedMoveCallTargets": ["0x2::package::function"],
  "allowedAddresses": ["0x456..."],
  "network": "testnet"
}
```

**Response:**
```json
{
  "success": true,
  "bytes": "base64...",
  "digest": "abc123..."
}
```

### POST /api/execute-sponsored-transaction

İmzalı transaction'ı execute eder.

**Request:**
```json
{
  "digest": "abc123...",
  "signature": "base64..."
}
```

**Response:**
```json
{
  "success": true,
  "txDigest": "xyz789...",
  "effects": {...}
}
```

## ⚙️ Configuration

### Allowed Move Call Targets

Hangi fonksiyonların çağrılabileceğini belirler:

```typescript
allowedMoveCallTargets: [
  '0x2::kiosk::set_owner_custom',
  `${packageId}::linktree::create_profile`,
  `${packageId}::linktree::add_link`,
]
```

### Allowed Addresses

Transfer edilebilecek adresleri belirler:

```typescript
allowedAddresses: [
  recipientAddress,
  adminAddress,
]
```

## 🎨 Component Props

### SponsoredTransactionButton

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `transaction` | `(txb: Transaction) => void` | ✅ | Transaction builder fonksiyonu |
| `allowedMoveCallTargets` | `string[]` | ❌ | İzin verilen move call'lar |
| `allowedAddresses` | `string[]` | ❌ | İzin verilen adresler |
| `onSuccess` | `(digest: string) => void` | ❌ | Başarı callback'i |
| `onError` | `(error: Error) => void` | ❌ | Hata callback'i |
| `children` | `React.ReactNode` | ✅ | Button içeriği |

## 🔍 Debugging

### Backend Logs

```bash
# Enoki backend'i verbose mode'da çalıştır
DEBUG=* node enoki-backend-server.js
```

### Frontend Logs

Console'da şu logları göreceksiniz:

```
📝 Creating sponsored transaction...
   Sender: 0x123...
   Allowed targets: [...]
✅ Transaction sponsored successfully
   Digest: abc123...
✍️  Requesting user signature...
✅ Signature received
🚀 Executing sponsored transaction...
✅ Transaction executed successfully
   TX Digest: xyz789...
```

## ⚠️ Güvenlik

1. **Private Key:** Asla client-side'da kullanma
2. **Allowed Targets:** Sadece güvenli fonksiyonları ekle
3. **Allowed Addresses:** Sadece güvenilir adresleri ekle
4. **Rate Limiting:** Production'da rate limiting ekle
5. **Authentication:** Production'da auth ekle

## 🚀 Production

Mainnet'e geçerken:

1. `.env` dosyasında `VITE_SUI_NETWORK=mainnet` yap
2. Enoki Portal'da mainnet için private key oluştur
3. `allowedMoveCallTargets` ve `allowedAddresses`'i kontrol et
4. Backend'i HTTPS ile deploy et
5. Rate limiting ve monitoring ekle

## 📊 Maliyet

- Sponsorluk maliyeti kullanılan gas'a bağlı
- Her transaction için sponsor account gas ödeyecek
- Enoki Portal'da budget limitleri ayarlayabilirsin

## 🎉 Örnek Kullanımlar

### Profile Oluşturma

```typescript
<SponsoredTransactionButton
  transaction={(txb) => {
    txb.moveCall({
      target: `${packageId}::linktree::create_profile`,
      arguments: [
        txb.pure.string(name),
        txb.pure.string(bio),
        txb.object(registryId),
      ],
    })
  }}
  allowedMoveCallTargets={[`${packageId}::linktree::create_profile`]}
  onSuccess={(digest) => router.push(`/profile/${digest}`)}
>
  Create Profile (Free - Sponsored)
</SponsoredTransactionButton>
```

### Link Ekleme

```typescript
<SponsoredTransactionButton
  transaction={(txb) => {
    txb.moveCall({
      target: `${packageId}::linktree::add_link`,
      arguments: [
        txb.object(profileId),
        txb.pure.string(label),
        txb.pure.string(url),
        txb.object(capId),
      ],
    })
  }}
  allowedMoveCallTargets={[`${packageId}::linktree::add_link`]}
>
  Add Link (Sponsored)
</SponsoredTransactionButton>
```

## 📄 License

MIT
