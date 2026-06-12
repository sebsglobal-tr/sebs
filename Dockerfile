# API sunucusu (backend/) + öğrenci ML (Python/XGBoost)
# Railway / Render (runtime: docker): PORT otomatik; STUDENT_ML_PYTHON=python3
FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 python3-pip libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY backend/ml/requirements.txt /tmp/ml-requirements.txt
RUN pip3 install --break-system-packages --no-cache-dir -r /tmp/ml-requirements.txt

COPY backend/package.json backend/package-lock.json* ./
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev --no-audit --no-fund

COPY backend/ .

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV STUDENT_ML_PYTHON=python3

EXPOSE 8080

CMD ["sh", "-c", "echo \"[boot] PORT=${PORT} HOST=${HOST:-0.0.0.0} ML=${STUDENT_ML_PYTHON}\" && exec node server.js"]
