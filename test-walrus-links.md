# Walrus Sites Link Test Guide

## SuiNS Domain'iniz: `suinks`

### Test Edilecek Link Formatları

1. **SuiNS + Portal URL** (Önerilen - En Güvenilir)
   ```
   https://suinks.trwal.app/view/{profile-id}
   ```
   Örnek: https://suinks.trwal.app/view/0x7c61d0961448c31be55cca633e8ececf44224b33360d35dc22ee924e98c90e11

2. **Object ID + Portal URL**
   ```
   https://5cff825ae30471011b5f5e812fcf356a1c3156d7765395e2f06470df67ae2925.trwal.app/view/{profile-id}
   ```

3. **SuiNS + .suiobj** (Deneysel - Bazı portallarda çalışmayabilir)
   ```
   https://suinks.suiobj/view/{profile-id}
   ```

4. **Object ID + .suiobj** (Deneysel)
   ```
   https://5cff825ae30471011b5f5e812fcf356a1c3156d7765395e2f06470df67ae2925.suiobj/view/{profile-id}
   ```

## SuiNS Domain Kontrolü

Önce SuiNS domain'inizin düzgün çalışıp çalışmadığını test edin:

### 1. Browser'da Test
Ana sayfanızı açmayı deneyin:
- https://suinks.trwal.app
- https://suinks.wal.app

### 2. SuiNS Domain'in Site'a Bağlı Olduğunu Doğrulayın

SuiNS domain'inizin şu object ID'ye işaret ettiğinden emin olun:
```
0x5cff825ae30471011b5f5e812fcf356a1c3156d7765395e2f06470df67ae2925
```

Kontrol için:
1. https://suins.io adresine gidin
2. "suinks" domain'inizi bulun
3. "Walrus Site" olarak set edilmiş mi kontrol edin

## Önerilen Çözüm

`walrusConfig.ts` dosyasında şu ayarları kullanın:

```typescript
export const SUINS_NAME = 'suinks'
export const WALRUS_PORTAL = 'trwal.app'
export const USE_SUIOBJ_LINKS = false  // Standard portal URL'leri kullan
```

Bu şekilde linkler şöyle olacak:
```
https://suinks.trwal.app/view/0x123...
```

## Troubleshooting

### Problem: Link açılmıyor
**Çözüm 1**: SuiNS domain'inin doğru site object ID'ye işaret ettiğinden emin olun

**Çözüm 2**: Farklı portal deneyin:
- `trwal.app` çalışmıyorsa → `wal.app` deneyin
- `wal.app` çalışmıyorsa → `walrus.site` deneyin

**Çözüm 3**: `.suiobj` linklerini devre dışı bırakın (`USE_SUIOBJ_LINKS = false`)

### Problem: "Page Not Found" hatası
Bu genellikle şu sebeplerden olur:
1. SuiNS domain henüz site'a bağlanmamış
2. Site henüz Walrus'a deploy edilmemiş
3. Object ID yanlış

### Problem: Site açılıyor ama view sayfası açılmıyor
Routing sorunu olabilir. Site'ın tek sayfa uygulama (SPA) olarak düzgün deploy edildiğinden emin olun.

## Sonraki Adımlar

1. ✅ SuiNS domain'ini kontrol et
2. ✅ `walrusConfig.ts` ayarlarını düzenle
3. ✅ Dev server'ı yeniden başlat
4. ✅ Copy ve View butonlarını test et
5. ✅ Çalışan link formatını kullan
