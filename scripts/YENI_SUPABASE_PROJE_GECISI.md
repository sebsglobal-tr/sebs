# Yeni Supabase Projesine Geçiş Rehberi

Bağlantı sorunları devam ederse yeni bir Supabase projesi oluşturup verilerinizi taşıyabilirsiniz.

## 1. Yeni Supabase Projesi Oluşturma

1. [supabase.com](https://supabase.com) → **New Project**
2. Proje adı, şifre (database password), region seçin
3. **Create project** ile oluşturun
4. Proje hazır olana kadar bekleyin (1-2 dk)

## 2. Connection String'leri Alma

**Settings** → **Database**:

- **Connection pooling** → **Transaction mode** (Port 6543) → URI kopyalayın → `DATABASE_URL`
- **Connection string** → **URI** (Port 5432) → kopyalayın → `DIRECT_URL`

`[YOUR-PASSWORD]` kısmını oluştururken verdiğiniz database şifresiyle değiştirin.

## 3. .env Güncellemesi

```bash
# Root .env ve backend/.env
DB_PASSWORD="yeni-proje-sifreniz"
DATABASE_URL="postgresql://postgres.[YENI-PROJECT-REF]:sifre@aws-0-xx.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YENI-PROJECT-REF]:sifre@db.[YENI-PROJECT-REF].supabase.co:5432/postgres"
```

Veya:

```bash
DB_PASSWORD="yeni-sifre" npm run db:setup
```

## 4. Veritabanı Şeması ve Migrasyonlar

### Prisma ile (Backend)

```bash
cd backend
npm run prisma:migrate:deploy
npm run prisma:seed
```

### Root server.js Tabloları

Mevcut `setup-database-tables.js` scripti tabloları oluşturur. Yeni projede:

```bash
npm run setup-db
```

## 5. Mevcut Verileri Taşıma (Opsiyonel)

Eski projeden yedek alıp yeniye aktarmak için:

```bash
# Eski projeden (DIRECT_URL ile)
pg_dump "postgresql://postgres.ESKI_REF:sifre@db.ESKI_REF.supabase.co:5432/postgres" > backup.sql

# Yeni projeye
psql "postgresql://postgres.YENI_REF:sifre@db.YENI_REF.supabase.co:5432/postgres" < backup.sql
```

## 6. Supabase Auth Ayarları

Yeni projede **Authentication** → **Providers** ve **Settings** bölümlerini eski projeyle uyumlu olacak şekilde ayarlayın. Auth kullanıcıları ayrı bir migration ile taşınabilir.

## 7. Sunucuyu Başlatma

```bash
npm start
curl http://localhost:8006/api/health
```

`status: "healthy"` dönerse bağlantı sorunsuzdur.
