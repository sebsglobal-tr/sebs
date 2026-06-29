#!/usr/bin/env bash
# Staging / canlı URL'e Apache Bench ile yük testi.
# Kullanım:
#   export STAGING_URL="https://sebs-staging.onrender.com"
#   ./scripts/load-test-staging.sh
#
# Not: /api/* için IP başına rate limit (varsayılan 15 dk'da 100) vardır;
# agresif testler 429 döndürebilir. /api/health limit dışıdır (server.js).

set -euo pipefail

URL="${STAGING_URL:-}"
if [[ -z "$URL" ]]; then
  echo "STAGING_URL tanımlı değil. Örnek:"
  echo "  export STAGING_URL=https://your-service.onrender.com"
  exit 1
fi

# Sondaki / kaldır
URL="${URL%/}"

if ! command -v ab >/dev/null 2>&1; then
  echo "Apache Bench (ab) bulunamadı. macOS: Xcode Command Line Tools ile gelir."
  exit 1
fi

echo "=========================================="
echo "Hedef: $URL"
echo "=========================================="

echo ""
echo "=== 1) GET / (statik) — 800 istek, eşzamanlı 40 ==="
ab -n 800 -c 40 -q "$URL/" | tail -20

echo ""
echo "=== 2) GET /api/health (DB ping) — 400 istek, eşzamanlı 25, -l ==="
ab -n 400 -c 25 -l -q "$URL/api/health" | tail -22

echo ""
echo "=== 3) Örnek korumalı uç (rate limit gözlem) — 30 istek ==="
ab -n 30 -c 3 -q "$URL/api/progress/overview" | grep -E "Complete|Failed|Non-2xx|Document Length|Requests per second" || true

echo ""
echo "Bitti. 429 görürseniz bu beklenen (global API rate limit)."
