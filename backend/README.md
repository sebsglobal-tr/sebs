# Backend (Express API)

Ana giriş: **`server.js`**. Ortam: **`backend/.env`** (veya monorepo kökünde `.env`).

## Komutlar

```bash
npm install
npm run dev          # nodemon
npm start            # üretim
npm run start:cluster
```

`npm run build` kökteki `scripts/verify-build.js` ile doğrulama yapar.

## Statik site

`../frontend` klasörü **yoksa** API yalnızca JSON döner; statik servis edilmez (ayrı frontend deploy senaryosu).

## Prisma

Ayrı stack için kökteki **`backend-prisma/`** klasörüne bakın; bu klasördeki `server.js` ondan bağımsızdır.
