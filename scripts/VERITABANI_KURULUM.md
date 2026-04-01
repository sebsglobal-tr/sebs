# SEBS Veritabanı Bağlantı Kurulumu

## Pooler vs Direct (Prisma)

- **DATABASE_URL** → Pooler (port 6543) — Uygulama runtime için
- **DIRECT_URL** → Direct (port 5432) — Migrations için

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

## Sorun Giderme

| Hata | Çözüm |
|------|-------|
| `password authentication failed` | Şifre yanlış. Supabase Dashboard'dan doğru Database password'ü alın. |
| `self-signed certificate` | `server.js` otomatik olarak `NODE_TLS_REJECT_UNAUTHORIZED=0` ayarlar (Supabase için). |
| `ENOTFOUND` | İnternet bağlantınızı veya Supabase proje durumunu kontrol edin. |
