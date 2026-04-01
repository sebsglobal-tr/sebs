# Staging dağıtımı ve Supabase

Bu proje tek bir Node süreci (`server.js`) ile hem statik siteyi hem `/api` uçlarını sunar. **Vercel** tek başına bu yapı için uygun değildir (uzun süreli Express süreci); **Render**, **Railway**, **Fly.io** veya **VPS + Docker** önerilir.

## 1) Supabase hazırlığı

1. [Supabase Dashboard](https://supabase.com/dashboard) → projeniz.
2. **Settings → Database**
   - **Connection pooling** → *Transaction* modunda URI kopyalayın → `DATABASE_URL` olarak kullanın.
   - Veya sadece veritabanı şifresini `DB_PASSWORD` olarak verin; `server.js` pooler URI’sini kendisi kurar.
3. **Settings → API**
   - `JWT Secret` → `SUPABASE_JWT_SECRET`
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
4. SQL migrasyonlarınızı staging projesine uygulayın (repodaki `backend/migrations/*.sql` veya mevcut süreciniz).

## 2) Render ile staging (Blueprint)

1. [Render](https://render.com) → **New → Blueprint**.
2. Bu repoyu bağlayın; `render.yaml` algılanır.
3. **Environment** bölümünde şu gizli değişkenleri girin:

| Değişken | Açıklama |
|----------|----------|
| `DATABASE_URL` | Supabase pooler (transaction) URI |
| `JWT_SECRET` | Güçlü rast string (üretimden farklı olabilir) |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret (**canlıda zorunlu**, `server.js` kontrolü) |
| `CORS_ORIGIN` | Staging kök URL, örn. `https://sebs-staging.onrender.com` (virgülle çoklu origin) |
| `PUBLIC_SITE_URL` | (İsteğe bağlı) Log ve dokümantasyon için tam kök URL |
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Anon key |
| `TRUST_PROXY` | Render/nginx arkasında doğru IP için genelde varsayılan yeterli; kapatmak için `0` |

4. Deploy tamamlanınca verilen URL’i `CORS_ORIGIN` ile eşleştirin (gerekirse yeniden deploy).

**Not:** `NODE_ENV=production` iken `server.js` `JWT_SECRET` ve `DATABASE_URL` veya `DB_PASSWORD` olmadan başlamaz.

## 3) Docker (VPS veya Render Docker)

```bash
docker build -t sebs-staging .
docker run --rm -p 8006:8006 --env-file .env.staging sebs-staging
```

`.env.staging` dosyasında yukarıdaki değişkenler + `PORT=8006` (veya platformun verdiği `PORT`).

## 4) Staging’e yük testi

Yerel makineden (staging URL deploy olduktan sonra):

```bash
export STAGING_URL="https://your-service.onrender.com"
chmod +x scripts/load-test-staging.sh
./scripts/load-test-staging.sh
```

`ab` (Apache Bench) gerekir. Sonuçlar makine CPU’su, Render planı ve Supabase gecikmesine bağlıdır; üretim öncesi aynı testi hedef ortamda tekrarlayın.
