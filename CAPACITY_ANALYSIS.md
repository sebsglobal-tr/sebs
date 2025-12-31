# Sistem Kapasite Analizi

## Mevcut Durum

### 1. Veritabanı Bağlantı Limitleri

#### Connection Pool Ayarları
- **Max Pool Connections**: 20
- **Min Pool Connections**: 2
- **Idle Timeout**: 30 saniye
- **Connection Timeout**: 10 saniye

#### PostgreSQL Limitleri
- **Supabase Max Connections**: 60 (toplam)
- **Pooler Connections**: 20 (aktif pool)

### 2. Sunucu Kapasitesi

#### Express Server
- **Port**: 8006
- **Instance**: Tek instance (single process)
- **Rate Limiting**: 100 request/dakika (backend API için)

### 3. Eşzamanlı Kullanıcı Kapasitesi

#### Teorik Kapasite
- **Veritabanı Bağlantıları**: 20 eşzamanlı işlem
- **Gerçek Kullanıcı Kapasitesi**: ~50-100 kullanıcı

#### Neden Daha Fazla?
- Kullanıcılar sürekli veritabanı bağlantısı tutmaz
- Bağlantılar sadece işlem yapılırken kullanılır
- Connection pool paylaşımlı kullanılır
- İşlemler genellikle çok hızlıdır (<100ms)

#### Pratik Kapasite
- **Hafif Kullanım**: 50-100 eşzamanlı kullanıcı
- **Orta Kullanım**: 30-50 eşzamanlı kullanıcı
- **Yoğun Kullanım**: 20-30 eşzamanlı kullanıcı

## Kapasite Artırma Önerileri

### 1. Connection Pool Optimizasyonu

#### Mevcut Ayarlar
```javascript
max: 20,
min: 2,
idleTimeoutMillis: 30000
```

#### Önerilen Ayarlar (Daha Yüksek Trafik İçin)
```javascript
max: 50,  // Artırılabilir (Supabase limit: 60)
min: 5,   // Daha fazla hazır bağlantı
idleTimeoutMillis: 60000  // Daha uzun idle timeout
```

### 2. Sunucu Ölçeklendirme

#### Seçenek 1: Cluster Mode (Node.js)
```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
} else {
    // Server code
}
```
**Sonuç**: CPU sayısı kadar instance (genellikle 4-8x kapasite artışı)

#### Seçenek 2: Load Balancer
- Nginx veya AWS ELB kullanarak
- Birden fazla sunucu instance'ı
- **Sonuç**: Sınırsız ölçeklenebilirlik

### 3. Veritabanı Optimizasyonu

#### Supabase Plan Yükseltme
- **Free Plan**: 60 max connections
- **Pro Plan**: 200 max connections
- **Team Plan**: 400 max connections

#### Connection Pooler Ayarları
- Transaction mode (daha fazla eşzamanlı bağlantı)
- Session mode (daha az eşzamanlı bağlantı, daha fazla özellik)

### 4. Caching Stratejisi

#### Redis Cache Ekleme
- Sık kullanılan verileri cache'le
- Veritabanı yükünü azalt
- **Sonuç**: 2-3x kapasite artışı

## Önerilen Kapasite Artırma Adımları

### Kısa Vadeli (Hemen Uygulanabilir)

1. **Connection Pool Artırma**
   ```javascript
   max: 40,  // Supabase limit: 60
   min: 5
   ```

2. **Rate Limiting Ayarlama**
   - API rate limit'i artır
   - Kullanıcı bazlı rate limiting

3. **Query Optimizasyonu**
   - Yavaş sorguları optimize et
   - Index'leri kontrol et

### Orta Vadeli (1-2 Hafta)

1. **Cluster Mode Ekleme**
   - Node.js cluster modülü
   - CPU sayısı kadar instance

2. **Caching Ekleme**
   - Redis cache
   - Sık kullanılan verileri cache'le

3. **Database Indexing**
   - Yavaş sorguları analiz et
   - Gerekli index'leri ekle

### Uzun Vadeli (1+ Ay)

1. **Load Balancer**
   - Nginx veya cloud load balancer
   - Birden fazla sunucu instance'ı

2. **Database Scaling**
   - Supabase plan yükseltme
   - Read replicas (okuma için)

3. **CDN Ekleme**
   - Static dosyalar için CDN
   - Sunucu yükünü azalt

## Monitoring ve İzleme

### Önemli Metrikler

1. **Connection Pool Metrikleri**
   - `totalCount`: Toplam bağlantı sayısı
   - `idleCount`: Boşta bekleyen bağlantılar
   - `waitingCount`: Bekleyen istekler

2. **Sunucu Metrikleri**
   - CPU kullanımı
   - Memory kullanımı
   - Response time

3. **Veritabanı Metrikleri**
   - Query execution time
   - Connection count
   - Error rate

### Health Check Endpoint

```bash
curl http://localhost:8006/api/health
```

Response:
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "serverTime": "...",
    "version": "PostgreSQL 17.6"
  },
  "pool": {
    "totalCount": 5,
    "idleCount": 3,
    "waitingCount": 0
  }
}
```

## Sonuç

### Mevcut Kapasite
- **Eşzamanlı Kullanıcı**: ~50-100 (hafif kullanım)
- **Veritabanı Bağlantıları**: 20 eşzamanlı işlem
- **Bottleneck**: Connection pool (20)

### Önerilen İyileştirmeler
1. Connection pool'u 40'a çıkar (hemen)
2. Cluster mode ekle (orta vadeli)
3. Caching ekle (orta vadeli)
4. Load balancer ekle (uzun vadeli)

### Beklenen Sonuçlar
- **Pool Artırma**: 2x kapasite (~100-200 kullanıcı)
- **Cluster Mode**: 4-8x kapasite (~200-800 kullanıcı)
- **Caching + Cluster**: 8-16x kapasite (~400-1600 kullanıcı)
- **Load Balancer**: Sınırsız ölçeklenebilirlik

