# DIRECT_URL Güncelleme Rehberi

## Mevcut Durum

DIRECT_URL formatı güncellendi ama bağlantı kurulamıyor. Bu genellikle şu nedenlerden kaynaklanır:

1. **Supabase Projesi Kapalı/Askıya Alınmış**
2. **Şifre Değiştirilmiş**
3. **Ağ/Firewall Sorunu**

## DIRECT_URL Formatı

Doğru format:
```
postgresql://postgres:[ŞIFRE]@db.snbraxxanpbvkyzidpai.supabase.co:5432/postgres?sslmode=require
```

### Şifreyi URL Encode Etme

Şifrenizde özel karakterler varsa (/, #, *, vb.) URL encode edilmelidir:

- `/` → `%2F`
- `#` → `%23`
- `*` → `%2A`
- `@` → `%40`
- vb.

Örnek: `a5h3H7/#tQmeJYr.*` → `a5h3H7%2F%23tQmeJYr.%2A`

## Güncelleme Adımları

### 1. Supabase Dashboard'dan Şifreyi Alın

1. Supabase Dashboard > Settings > Database
2. Connection string'i kopyalayın
3. `[YOUR-PASSWORD]` kısmını gerçek şifrenizle değiştirin

### 2. .env Dosyasını Güncelleyin

```bash
cd backend
nano .env
```

DIRECT_URL satırını bulun ve güncelleyin:
```env
DIRECT_URL="postgresql://postgres:GERÇEK_ŞİFRE_BURAYA@db.snbraxxanpbvkyzidpai.supabase.co:5432/postgres?sslmode=require"
```

### 3. Bağlantıyı Test Edin

```bash
cd backend
node test-db-connection.js
```

### 4. Migration'ı Çalıştırın

Bağlantı başarılı olursa:

```bash
npx prisma migrate dev --name add_entitlements
```

Veya Supabase SQL Editor'dan:
- `migrations/create_entitlements_table.sql` dosyasını açın
- İçeriğini Supabase Dashboard > SQL Editor'a yapıştırın
- Çalıştırın

## Alternatif: Supabase SQL Editor

Bağlantı sorunu devam ederse:

1. Supabase Dashboard > SQL Editor'a gidin
2. `migrations/create_entitlements_table.sql` dosyasını açın
3. SQL'i kopyalayıp yapıştırın
4. "Run" butonuna tıklayın

Bu yöntem her zaman çalışır çünkü doğrudan Supabase üzerinden çalıştırırsınız.
