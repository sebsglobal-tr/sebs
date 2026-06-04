# SEBS — Deploy rehberi

Canlı site **www.sebsglobal.com** → **Vercel** (statik `frontend/`).  
API ayrıysa → **Render** (`render.yaml`, Docker).

## Sorun: Git push sonrası site güncellenmiyor

GitHub `main` güncel olsa bile Vercel bağlantısı kopmuş olabilir. Kontrol:

1. [Vercel Dashboard](https://vercel.com/dashboard) → proje → **Deployments**
2. Son commit `82d6407…` (veya güncel SHA) listede yoksa otomatik deploy çalışmıyor.

### Hızlı çözüm (panel)

1. Vercel → proje → **Deployments** → **Redeploy** → Production
2. Veya **Settings → Git** → repoyu yeniden bağla (`sebsglobal-tr/sebs`, branch `main`)
3. **Settings → General**:
   - Root Directory: *(boş — repo kökü)*
   - Output Directory: `frontend` *(vercel.json ile aynı)*
   - Framework Preset: Other

### Kalıcı çözüm (GitHub Actions)

Repo kökünde `.github/workflows/deploy-vercel.yml` var. Şu secret’ları ekleyin:

**GitHub** → repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Nereden alınır |
|--------|----------------|
| `VERCEL_TOKEN` | Vercel → Account Settings → Tokens → Create |
| `VERCEL_ORG_ID` | Vercel → Project → Settings → General → **Project ID** yanında veya `vercel link` çıktısı |
| `VERCEL_PROJECT_ID` | Aynı sayfadaki **Project ID** |

`VERCEL_ORG_ID` için: Vercel → Team/Account Settings → General → **Team ID** (kişisel hesapta User ID).

Secret’lar eklendikten sonra:

```bash
git push origin main
```

veya GitHub → **Actions** → **Deploy frontend (Vercel)** → **Run workflow**.

### Yerelden tek seferlik deploy

```bash
npx vercel login
npx vercel link    # mevcut sebsglobal projesini seçin
npx vercel deploy --prod
```

## Render (API)

`render.yaml` → Docker, `healthCheckPath: /api/health`.

Deploy başarısızsa **Logs** içinde şunlara bakın:

- `CRITICAL: JWT_SECRET` / `DATABASE_URL` / `CORS_ORIGIN` / `SUPABASE_JWT_SECRET`
- `SUPABASE_URL` ile `DATABASE_URL` farklı projelere işaret ediyor mu

Geçici (önerilmez): `SKIP_ENV_VALIDATION=1`

## Doğrulama

Deploy sonrası:

```bash
curl -sI https://www.sebsglobal.com/ | head -3
curl -sI https://www.sebsglobal.com/images/career-mountain-path.png | head -3
```

Ana sayfa HTML içinde `career-mountain-path.png` ve güncel `sebs-home.css?v=…` görünmeli.
