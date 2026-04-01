# SEBS Global — tek süreç Express (server.js) + statik site
# Render / Fly.io / VPS / k8s ile çalıştırılabilir
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev --no-audit --no-fund

COPY . .

ENV NODE_ENV=production

# Platform PORT'u inject eder (Render, Fly, Railway)
EXPOSE 8006

CMD ["node", "server.js"]
