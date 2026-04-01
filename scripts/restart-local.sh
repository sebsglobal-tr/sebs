#!/usr/bin/env bash
# Yerel API'yi (8006, 8010) durdurup yeniden başlatır; veritabanı .env içindeki DATABASE_URL ile bağlanır.
set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

for port in 8006 8010; do
  pids=$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "Port $port: $pids sonlandırılıyor..."
    kill $pids 2>/dev/null || true
    sleep 1
  fi
done

echo "Sunucu başlatılıyor: http://localhost:8006"
exec npm start
