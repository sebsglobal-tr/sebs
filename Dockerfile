# API sunucusu (backend/); statik site ayrı deploy edilir (frontend/)
# Railway: $PORT otomatik verilir; server.js process.env.PORT ile dinler (0.0.0.0).
# .dockerignore .env dışlar — DATABASE_URL, JWT*, SUPABASE_*, CORS_ORIGIN vb. Railway → Variables’da olmalı.
FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev --no-audit --no-fund

COPY backend/ .

ENV NODE_ENV=production
# Yerel docker run için; Railway runtime’da PORT’u override eder
ENV PORT=8080
ENV HOST=0.0.0.0

EXPOSE 8080

# PORT’u logla (healthcheck “service unavailable” = süreç dinlemiyor veya env eksik)
CMD ["sh", "-c", "echo \"[boot] PORT=${PORT} HOST=${HOST:-0.0.0.0} NODE_ENV=${NODE_ENV}\" && exec node server.js"]
