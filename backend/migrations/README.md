# Veritabanı Migration Rehberi

## Entitlements Tablosu Migration

`entitlements` tablosunu oluşturmak için migration SQL dosyası hazır.

### Durum
✅ Migration SQL dosyası hazır: `create_entitlements_table.sql`

### Veritabanı Bağlantı Sorunu

Şu anda Supabase veritabanına bağlantı kurulamıyor. Olası nedenler:

1. **Supabase Projesi Askıya Alınmış Olabilir**
   - Supabase dashboard'dan kontrol edin
   - Proje aktif mi?

2. **Ağ Bağlantısı Sorunu**
   - İnternet bağlantınızı kontrol edin
   - Firewall ayarları

3. **Kimlik Bilgileri Güncellenmiş Olabilir**
   - `.env` dosyasındaki `DATABASE_URL` ve `DIRECT_URL` güncel mi?

### Migration'ı Çalıştırma

Veritabanı bağlantısı sağlandıktan sonra:

#### Yöntem 1: Prisma Migration (Önerilen)
```bash
cd backend
npx prisma migrate dev --name add_entitlements
```

#### Yöntem 2: Manuel SQL (Supabase SQL Editor)
Supabase dashboard > SQL Editor'a gidin ve `migrations/create_entitlements_table.sql` dosyasının içeriğini çalıştırın.

#### Yöntem 3: psql ile
```bash
psql "postgresql://postgres:PASSWORD@db.snbraxxanpbvkyzidpai.supabase.co:5432/postgres?sslmode=require" -f migrations/create_entitlements_table.sql
```

### Tablo Oluşturulduktan Sonra

1. Prisma Client'ı yeniden oluşturun:
```bash
npx prisma generate
```

2. Backend sunucuyu yeniden başlatın

3. Test edin:
```bash
curl http://localhost:8006/api/health
```

### Kontrol

Tablonun oluşturulduğunu kontrol etmek için:
```sql
SELECT * FROM entitlements LIMIT 1;
```
