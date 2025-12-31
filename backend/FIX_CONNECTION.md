# Veritabanı Bağlantı Sorunu Çözümü

## Sorun
- ❌ ENOTFOUND: Hostname bulunamıyor
- ❌ "Tenant or user not found" hatası

## Çözüm Adımları

### 1. Supabase Dashboard'dan Connection String'leri Alın

1. https://supabase.com adresine gidin
2. Projenize giriş yapın
3. **Settings** → **Database** bölümüne gidin

### 2. Connection String'leri Kopyalayın

#### DATABASE_URL (Connection Pooling - Runtime için)
- **Connection pooling** bölümüne gidin
- **Transaction** modunu seçin
- Connection string'i kopyalayın
- Format: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`

#### DIRECT_URL (Direct Connection - Migration için)
- **Connection string** bölümüne gidin
- **URI** formatını seçin
- Connection string'i kopyalayın
- Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 3. .env Dosyasını Güncelleyin

#### Yöntem 1: Otomatik Script (Önerilen)
```bash
cd backend
node update-connection.js
```
Script size connection string'leri soracak, yapıştırın ve otomatik olarak güncellenecek.

#### Yöntem 2: Manuel Güncelleme
`backend/.env` dosyasını açın ve şu satırları güncelleyin:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

**Önemli:** Şifrenizde özel karakterler varsa (`#`, `/`, `*`, vb.), URL encode edilmelidir:
```javascript
encodeURIComponent('your-password')
```

### 4. Bağlantıyı Test Edin

```bash
cd backend
node test-connection.js
```

Başarılı olursa şu çıktıyı göreceksiniz:
```
✅ pg library connection successful!
✅ Prisma connection successful!
```

### 5. Migration ve Seed Çalıştırın

Bağlantı başarılı olduktan sonra:

```bash
# Migration SQL'i Supabase Dashboard'dan çalıştırın
# veya
npx prisma migrate deploy

# Modülleri ekleyin
node prisma/seed.js
```

## Hala Sorun Varsa

1. **Şifreyi kontrol edin**: Supabase Dashboard → Settings → Database → Database password
2. **Project Reference'ı kontrol edin**: Connection string'deki project reference doğru mu?
3. **Network'i kontrol edin**: İnternet bağlantınız çalışıyor mu?
4. **Supabase projesini kontrol edin**: Proje aktif mi? Pause edilmiş olabilir mi?

## Yardım

Daha fazla bilgi için:
- `SUPABASE_CONNECTION_GUIDE.md` dosyasına bakın
- Supabase dokümantasyonu: https://supabase.com/docs/guides/database/connecting-to-postgres

