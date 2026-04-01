# API sunucusu (backend/); statik site ayrı deploy edilir (frontend/)
FROM node:20-alpine

WORKDIR /app

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev --no-audit --no-fund

COPY backend/ .

ENV NODE_ENV=production

EXPOSE 8006

CMD ["node", "server.js"]
