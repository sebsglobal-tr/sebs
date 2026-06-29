# SEBS Global

SEBS Global eğitim platformu — Express API + statik frontend.

## Proje Yapısı

```
/
├── index.html              # Ana sayfa
├── css/                    # Stil dosyaları
├── js/                     # İstemci JS
├── modules/                # Modül HTML sayfaları
├── simulation/             # Simülasyon sayfaları
├── dashboard.html          # Kullanıcı paneli
├── login.html / signup.html
├── ...
├── backend/
│   ├── server.js           # Express API sunucusu
│   ├── package.json
│   ├── routes/             # API route'ları
│   ├── lib/                # Yardımcı kütüphaneler
│   ├── middleware/          # Express middleware
│   ├── utils/              # Logger vb.
│   └── db/                 # SQL migrasyonları + Supabase şeması
├── api/
│   └── index.js            # Vercel serverless entry
├── Dockerfile              # Docker deploy
├── render.yaml             # Render Blueprint
├── vercel.json             # Vercel yapılandırması
└── .github/workflows/      # GitHub Actions
```

## Hızlı Başlangıç

```bash
cd backend && npm install && npm run dev
# Tarayıcı: http://localhost:8006
```

## Deploy

- **Frontend** (statik dosyalar): Vercel, Netlify, Cloudflare Pages
- **Backend** (Express API): Render, Railway, Fly.io, Docker, VPS
- **Veritabanı**: Supabase PostgreSQL

### Render (Docker)

```yaml
# render.yaml ile otomatik deploy
# Start: node backend/server.js
```

### Vercel

```bash
npm run deploy:vercel
```
