# 3-40K Kullanıcı İçin Deployment Rehberi

## Hızlı Başlangıç

### 1. Connection Pool Artırma (HEMEN)

`.env` dosyasına ekleyin:
```bash
DB_POOL_MAX=200
DB_POOL_MIN=10
```

### 2. Cluster Mode ile Başlatma

```bash
# Production için cluster mode
npm run start:cluster

# Development için cluster mode
npm run dev:cluster
```

### 3. Redis Cache Kurulumu (Opsiyonel ama Önerilen)

#### Local Redis
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
```

#### .env dosyasına ekleyin:
```bash
REDIS_URL=redis://localhost:6379
```

### 4. Nginx Load Balancer Kurulumu

```bash
# Ubuntu/Debian
sudo apt-get install nginx

# macOS
brew install nginx
```

#### Configuration
```bash
# Config dosyasını kopyala
sudo cp nginx.conf.example /etc/nginx/sites-available/sebs

# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/sebs /etc/nginx/sites-enabled/

# Test et
sudo nginx -t

# Restart
sudo systemctl restart nginx  # Linux
sudo brew services restart nginx  # macOS
```

## Deployment Senaryoları

### Senaryo 1: 3,000 Kullanıcı (Faz 1)

#### Gereksinimler
- **Server**: 4 CPU, 8GB RAM
- **Database**: Supabase Pro (200 connections)
- **Redis**: Local veya küçük instance
- **Load Balancer**: Nginx (tek sunucu)

#### Adımlar
1. Connection pool'u 200'e çıkar ✅
2. Cluster mode ile başlat ✅
3. Redis cache ekle ✅
4. Nginx load balancer kur

#### Komutlar
```bash
# .env ayarları
DB_POOL_MAX=200
DB_POOL_MIN=10
REDIS_URL=redis://localhost:6379

# Cluster mode ile başlat
npm run start:cluster

# Nginx'i başlat
sudo systemctl start nginx
```

### Senaryo 2: 10,000 Kullanıcı (Faz 2)

#### Gereksinimler
- **Servers**: 3-5 sunucu (4 CPU, 8GB RAM each)
- **Database**: Supabase Pro + Read Replicas
- **Redis**: Cluster (3 nodes)
- **Load Balancer**: Nginx veya Cloud Load Balancer
- **CDN**: Cloudflare veya AWS CloudFront

#### Adımlar
1. Faz 1'i tamamla
2. 3-5 sunucu instance'ı kur
3. Nginx load balancer yapılandır
4. CDN ekle
5. Database read replicas ekle

### Senaryo 3: 40,000 Kullanıcı (Faz 3)

#### Gereksinimler
- **Servers**: 10-20 sunucu (Auto-scaling)
- **Database**: AWS RDS veya Google Cloud SQL (Multi-AZ)
- **Redis**: ElastiCache veya Cloud Memorystore
- **Load Balancer**: AWS ELB veya Google Cloud Load Balancer
- **CDN**: Global CDN
- **Monitoring**: Prometheus + Grafana
- **Orchestration**: Kubernetes (opsiyonel)

#### Adımlar
1. Faz 2'yi tamamla
2. Auto-scaling kur
3. Kubernetes'e migrate (opsiyonel)
4. Global CDN
5. Multi-region deployment

## Monitoring

### Health Check
```bash
curl http://localhost:8006/api/health
```

### Cluster Status
```bash
# Worker process'leri kontrol et
ps aux | grep "node.*server.js"

# Port'ları kontrol et
netstat -tulpn | grep 8006
```

### Redis Status
```bash
redis-cli ping
# Should return: PONG
```

### Nginx Status
```bash
sudo systemctl status nginx
```

## Performance Testing

### Load Test (k6)
```bash
# Install k6
brew install k6  # macOS
# or download from https://k6.io/

# Run test
k6 run load-test.js
```

### Load Test Script (load-test.js)
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    stages: [
        { duration: '2m', target: 1000 },  // Ramp up to 1000 users
        { duration: '5m', target: 1000 },  // Stay at 1000 users
        { duration: '2m', target: 3000 },  // Ramp up to 3000 users
        { duration: '5m', target: 3000 },  // Stay at 3000 users
        { duration: '2m', target: 0 },    // Ramp down
    ],
};

export default function () {
    const res = http.get('http://localhost:8006/api/health');
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
    });
    sleep(1);
}
```

## Troubleshooting

### Connection Pool Exhausted
```bash
# Check pool status
curl http://localhost:8006/api/health | jq .pool

# Increase pool size
DB_POOL_MAX=300  # If database allows
```

### High Memory Usage
```bash
# Check memory
free -h  # Linux
vm_stat  # macOS

# Restart cluster
pkill -f "node.*server.js"
npm run start:cluster
```

### Redis Connection Issues
```bash
# Check Redis
redis-cli ping

# Restart Redis
sudo systemctl restart redis  # Linux
brew services restart redis   # macOS
```

## Scaling Checklist

### Faz 1 (3K kullanıcı)
- [x] Connection pool artırıldı (200)
- [x] Cluster mode eklendi
- [x] Redis cache eklendi
- [ ] Nginx load balancer kuruldu
- [ ] Load testing yapıldı

### Faz 2 (10K kullanıcı)
- [ ] Multiple server instances
- [ ] Database read replicas
- [ ] CDN eklendi
- [ ] Monitoring kuruldu

### Faz 3 (40K kullanıcı)
- [ ] Auto-scaling kuruldu
- [ ] Kubernetes (opsiyonel)
- [ ] Global CDN
- [ ] Multi-region deployment

