# Frontend (statik site)

HTML, `public/`, `js/`, `assets/`, `modules/`, `simulation/`, `utils/` (istemci) burada.

## Deploy

1. Bu klasörü **root** olarak seçin (Vercel/Netlify “Root directory: `frontend`”).
2. Build komutu genelde gerekmez (saf statik).
3. API ayrı bir origin’deyse `config/` veya ortamınızda API base URL’ini ayarlayın; `CORS_ORIGIN` backend’de frontend URL’si olmalı.

Yerel önizleme: dosyaları herhangi bir statik sunucu ile veya `backend` çalışırken ( `frontend/` klasörü varsa API statik dosyaları da sunar) açın.
