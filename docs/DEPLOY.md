# SEBS — Deploy rehberi

| Ortam | Nerede | Nasıl |
|--------|--------|--------|
| **www.sebsglobal.com** | Vercel | `frontend/` (repo kökünde `vercel.json`) |
| **API** (varsa) | Render | `render.yaml` + Docker |

---

## Deploy edemiyorum — hızlı teşhis

### 1) GitHub Actions kırmızı / “secret eksik”

`.github/workflows/deploy-vercel.yml` şu üç secret olmadan **bilerek fail** eder:

| Secret | Nereden |
|--------|---------|
| `VERCEL_TOKEN` | [Vercel → Account → Tokens](https://vercel.com/account/tokens) → Create |
| `VERCEL_ORG_ID` | Vercel → Team/Account **Settings → General → Team ID** (kişisel hesap: User ID) |
| `VERCEL_PROJECT_ID` | Proje → **Settings → General → Project ID** |

**GitHub:** `sebsglobal-tr/sebs` → **Settings → Secrets and variables → Actions** → her birini ekle.

Sonra: **Actions → Deploy frontend (Vercel) → Run workflow** veya `git push origin main`.

### 2) Actions yok / secret eklemeden deploy (en kolay)

Vercel’in Git bağlantısı çalışıyorsa push yeterli; çalışmıyorsa:

1. [vercel.com/dashboard](https://vercel.com/dashboard) → **sebs** (veya sebsglobal) projesi  
2. **Deployments** → son deployment → **⋯ → Redeploy** → **Production**  
3. **Settings → Git** → `sebsglobal-tr/sebs`, branch **`main`** bağlı mı kontrol et  
4. **Settings → General:**
   - Root Directory: *(boş)*
   - Output Directory: **`frontend`**
   - Framework: **Other**
   - Build Command: `VERCEL=1 npm run build` *(veya `vercel.json` ile aynı)*

### 3) Bilgisayardan deploy (`npx vercel` takılıyor / login yok)

```bash
cd /path/to/sebs
npx vercel@39 login          # tarayıcı açılır
npx vercel@39 link           # mevcut production projesini seç
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

Token ile (CI ile aynı):

```bash
export VERCEL_TOKEN="..."
export VERCEL_ORG_ID="..."
export VERCEL_PROJECT_ID="..."
npx vercel@39 deploy --prod --yes --token "$VERCEL_TOKEN"
```

---

## Push sonrası doğrulama

```bash
curl -sI https://www.sebsglobal.com/ | head -3
curl -s https://www.sebsglobal.com/ | grep -o 'sebs-home.css?v=[0-9]*' | head -1
curl -sI https://www.sebsglobal.com/images/career-mountain-bg.jpg | head -3
```

Güncel ana sayfada `career-mountain-bg.jpg` ve `sebs-home.js?v=19` (veya daha yeni) görünmeli.

---

## Render (API)

`render.yaml` → Docker, `healthCheckPath: /api/health`.

Log’da sık hatalar: `JWT_SECRET`, `DATABASE_URL`, `CORS_ORIGIN`, `SUPABASE_JWT_SECRET`, Supabase URL ile DB URL uyumsuzluğu.

Geçici (önerilmez): `SKIP_ENV_VALIDATION=1`

---

## Not

- `git push` yaptığınız halde site eskiyse: Vercel **Deployments** listesinde son commit SHA’nız var mı bakın. Yoksa Git bağlantısı veya Actions secret’ları sorunludur.  
- Yerel `git status` temiz ve `origin/main` ile aynıysa önce değişiklikleri commit + push edin.
