# SEBS Veritabanı Bağlantı Kurulumu

## Pooler vs Direct (Prisma)

- **DATABASE_URL** → Pooler (port 6543) — Uygulama runtime için
- **DIRECT_URL** → Session pooler (port **5432**, aynı `pooler.supabase.com` host) — `pg_dump`, Prisma migrate
- Eski `db.[ref].supabase.co` birçok ağda DNS çözülmez (`ENOTFOUND`); `npm run db:setup` doğru `DIRECT_URL` yazar

`npm run db:setup` her iki URL'yi de doğru şekilde ayarlar.

## Hızlı Kurulum

1. **Supabase şifrenizi** alın: Dashboard → Project → Settings → Database → **Database password**
2. Proje kökünde `.env` dosyasına ekleyin:
   ```
   DB_PASSWORD=supabase-veritabani-sifreniz
   ```
3. Bağlantıyı test edin ve .env güncelleyin:
   ```bash
   DB_PASSWORD="sifreniz" npm run db:setup
   ```
4. Sunucuyu başlatın:
   ```bash
   npm start
   ```

## Alternatif: Tam Connection String

Supabase Dashboard → Connect → **Connection pooling** → **Transaction mode** → URI'yi kopyalayın.
`[YOUR-PASSWORD]` yerine şifrenizi yazın, sonra:

```bash
node scripts/db-setup.js "postgresql://postgres.xxx:sifre@host:6543/postgres"
```

Bu komut hem root hem backend `.env` dosyalarını günceller.

## Yedek alma

```bash
# Önce DIRECT_URL düzelt (session pooler :5432)
DB_PASSWORD="sifreniz" SUPABASE_PROJECT_REF=proje-ref npm run db:setup

# pg_dump 17 gerekir (sunucu PG 17)
brew install postgresql@17
PG_DUMP=/opt/homebrew/opt/postgresql@17/bin/pg_dump npm run db:backup
```

Çıktı: `backups/sebs-*.sql`. `pg_dump` 14 ile sürüm uyumsuzluğu hatası alırsanız PostgreSQL 17 client kurun.

## Sorun Giderme

| Hata | Çözüm |
|------|-------|
| `password authentication failed` | Şifre yanlış. Supabase Dashboard'dan doğru Database password'ü alın. |
| `self-signed certificate` | `server.js` otomatik olarak `NODE_TLS_REJECT_UNAUTHORIZED=0` ayarlar (Supabase için). |
| `ENOTFOUND db.*.supabase.co` | `DIRECT_URL` yerine session pooler `:5432` kullanın (`npm run db:setup`). |
| `server version mismatch` | `brew install postgresql@17` veya `PG_DUMP=.../postgresql@17/bin/pg_dump`. |
