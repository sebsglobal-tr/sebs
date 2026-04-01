# SEBS Global — monorepo

Üç parça ayrı deploy edilebilir:

| Klasör | İçerik | Örnek barındırma |
|--------|--------|------------------|
| **`frontend/`** | Statik site (HTML, CSS, JS, görseller) | Vercel, Netlify, Cloudflare Pages, S3+CloudFront |
| **`backend/`** | Express API (`server.js`), JWT/Supabase, PostgreSQL | Render, Railway, Fly.io, Docker, VPS |
| **`database/`** | SQL migrasyonları + `supabase/` şema dosyaları | Supabase (Postgres), `psql`, CI pipeline |

Ek olarak **`backend-prisma/`** eski/alternatif Prisma tabanlı API’dir; ana üretim uçları **`backend/server.js`** ile çalışır.

## Hızlı başlangıç (yerel)

```bash
cd backend && npm install && npm run dev
# Tarayıcı: http://localhost:8006/  (PORT ortam değişkeniyle değişir)
```

**Site açılmıyorsa:**

1. **Port meşgul** — `8006` başka bir süreçte kullanılıyorsa sunucu başlamaz. Çözüm: `npm run start:alt` (kökte, port `8010`) veya `PORT=8010 npm start`.
2. **Yanlış adres** — HTML dosyasını çift tıklayıp `file://` ile açmayın; mutlaka `http://localhost:8006/` gibi sunucu adresini kullanın.
3. **`.env` içinde `NODE_ENV=production`** — eksik gizli anahtarlarla sunucu çıkabilir. Yerelde `NODE_ENV=development` kullanın veya `SKIP_ENV_VALIDATION=1` (yalnızca geliştirme).
4. **Monorepo kökü** — `npm start` kökten çalışır (`backend` içindeki `server.js`); `frontend/` ile aynı üst dizinde olmalısınız.

Kök dizinde `.env` veya `backend/.env` içinde `DATABASE_URL`, `SUPABASE_*`, `JWT_SECRET`, `SUPABASE_JWT_SECRET` tanımlayın.

## Veritabanı

```bash
npm install          # kök: setup script’leri için pg/dotenv
npm run setup-db       # veya: node setup-database-tables.js
```

Migrasyon dosyaları: **`database/migrations/`**. Supabase CLI kullanıyorsanız: **`database/supabase/`**.

## Docker (yalnızca API)

```bash
docker build -t sebs-api .
docker run -p 8006:8006 --env-file backend/.env sebs-api
```

## Ortam değişkenleri (frontend ayrı origin’de)

- **`CORS_ORIGIN`**: Frontend URL’leri (virgülle birden fazla), örn. `https://app.example.com`
- Frontend’de API tabanı genelde `window.location.origin` + `/api` veya `config` ile `https://api.example.com` olmalıdır.

## Eski yollar

- Birleşik tek süreç: kökte `server.js` + statik dosyalar **artık yok**; API `backend/`, site `frontend/`.
- Render: `render.yaml` içinde `rootDir: backend` kullanılır.
