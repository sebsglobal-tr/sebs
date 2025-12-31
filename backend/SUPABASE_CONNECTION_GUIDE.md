# Supabase Bağlantı Rehberi

## Connection String Formatı

Supabase'den doğru connection string'i almak için:

### 1. Supabase Dashboard'a Giriş
1. https://supabase.com adresine gidin
2. Projenize giriş yapın
3. **Settings** → **Database** bölümüne gidin

### 2. Connection String'leri Bulma

#### Direct Connection (Migration ve Prisma için)
- **Connection string** bölümünde **URI** formatını seçin
- Format: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- **Örnek**: `postgresql://postgres:yourpassword@db.abcdefghijklmnop.supabase.co:5432/postgres`

#### Connection Pooling (Runtime için)
- **Connection pooling** bölümünde **Transaction** modunu seçin
- Format: `postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
- **Örnek**: `postgresql://postgres.abcdefghijklmnop:yourpassword@aws-0-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

### 3. Şifre Özel Karakterler İçeriyorsa

Eğer şifrenizde özel karakterler varsa (`#`, `/`, `*`, vb.), URL encode edilmelidir:

```javascript
// JavaScript'te encode etme
encodeURIComponent('a5h3H7/#tQmeJYr.*')
// Sonuç: a5h3H7%2F%23tQmeJYr.%2A
```

### 4. .env Dosyasına Ekleme

```env
# Runtime – connection pooling (production)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[ENCODED-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require"

# Prisma migrate / db execute için direct connection
DIRECT_URL="postgresql://postgres:[ENCODED-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"
```

### 5. Bağlantıyı Test Etme

```bash
cd backend
node -e "require('dotenv').config(); const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$queryRaw\`SELECT 1\`.then(() => console.log('✅ OK')).catch(e => console.log('❌', e.message)).finally(() => prisma.\$disconnect());"
```

## Sorun Giderme

### "Tenant or user not found" Hatası
- Şifrenin doğru olduğundan emin olun
- Connection string'deki project reference'ı kontrol edin
- Şifreyi URL encode etmeyi unutmayın

### "ENOTFOUND" Hatası
- Hostname'in doğru olduğundan emin olun
- Supabase dashboard'dan connection string'i kopyalayın
- Project reference'ın doğru olduğunu kontrol edin

### SSL Bağlantı Hatası
- `sslmode=require` parametresini ekleyin
- Prisma'da SSL ayarlarını kontrol edin

