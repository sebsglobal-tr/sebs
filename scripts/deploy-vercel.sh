#!/usr/bin/env bash
# Yerel production deploy — önce: npx vercel login && npx vercel link
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ Build doğrulama…"
VERCEL=1 npm run build

echo "→ Vercel production deploy…"
if [ -z "${VERCEL_TOKEN:-}" ]; then
  npx vercel@39 deploy --prod
else
  npx vercel@39 deploy --prod --yes --token "$VERCEL_TOKEN"
fi

echo "→ Bitti. https://www.sebsglobal.com kontrol edin."
