# Veritabanı Bağlantı Sorunları ve Çözümler

## Yapılan İyileştirmeler

### 1. Connection Pool Optimizasyonu
- **Max Connections**: 20 (eşzamanlı bağlantı sayısı)
- **Min Connections**: 2 (her zaman açık tutulacak bağlantı sayısı)
- **Idle Timeout**: 30 saniye (boşta kalan bağlantıların kapatılma süresi)
- **Connection Timeout**: 10 saniye (bağlantı kurma zaman aşımı)
- **Keep Alive**: Aktif (bağlantıların canlı tutulması)

### 2. Connection Retry Mekanizması
- Başlangıçta 3 deneme ile bağlantı kontrolü
- Exponential backoff (1s, 2s, 4s)
- Otomatik yeniden bağlanma

### 3. Periodic Health Check
- Her 5 dakikada bir otomatik bağlantı kontrolü
- Bağlantı koparsa otomatik yeniden bağlanma denemesi

### 4. Connection Pool Event Listeners
- `connect`: Yeni bağlantı kurulduğunda log
- `error`: Beklenmeyen hatalarda log (process'i durdurmaz)
- `remove`: Bağlantı kaldırıldığında log

### 5. Health Check Endpoint İyileştirmesi
- `/api/health` endpoint'i artık veritabanı bağlantısını da kontrol ediyor
- Pool durumu bilgisi (totalCount, idleCount, waitingCount)
- Veritabanı versiyonu ve sunucu zamanı bilgisi

## Kullanım

### Health Check
```bash
curl http://localhost:8006/api/health
```

### Veritabanı Bağlantı Durumu
Health check response'unda şu bilgiler yer alır:
- `database.status`: "connected" veya "error"
- `database.serverTime`: Veritabanı sunucu zamanı
- `database.version`: PostgreSQL versiyonu
- `pool.totalCount`: Toplam bağlantı sayısı
- `pool.idleCount`: Boşta bekleyen bağlantı sayısı
- `pool.waitingCount`: Bekleyen istek sayısı

## Sorun Giderme

### Bağlantı Hala Kopuyorsa

1. **Supabase Connection Pooler Limitleri**
   - Supabase ücretsiz planında connection limiti olabilir
   - `DATABASE_URL` yerine `DIRECT_URL` kullanmayı deneyin (migrations için)

2. **Connection String Kontrolü**
   ```bash
   # .env dosyasını kontrol edin
   cat .env | grep DATABASE_URL
   ```

3. **Log Kontrolü**
   ```bash
   # Sunucu loglarını kontrol edin
   tail -f /tmp/sebs-server.log
   ```

4. **Manuel Bağlantı Testi**
   ```bash
   node -e "const { Pool } = require('pg'); require('dotenv').config(); const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); pool.query('SELECT NOW()', (err, res) => { if (err) console.error('Error:', err); else console.log('Success:', res.rows[0]); pool.end(); });"
   ```

## Öneriler

1. **Production Ortamında**
   - Connection pool ayarlarını trafiğe göre ayarlayın
   - Monitoring ekleyin (Prometheus, Grafana)
   - Alerting kurun (bağlantı kopmalarında)

2. **Supabase Özel Ayarlar**
   - Pooler kullanırken `pgbouncer=true` parametresini ekleyin
   - Direct connection için port 5432 kullanın
   - SSL sertifikası için `rejectUnauthorized: false` kullanın

3. **Connection String Formatı**
   ```
   DATABASE_URL="postgresql://postgres.snbraxxanpbvkyzidpai:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.snbraxxanpbvkyzidpai:[PASSWORD]@aws-1-eu-north-1.pooler.supabase.com:5432/postgres"
   ```

## İzleme

Sunucu loglarında şu mesajları görebilirsiniz:
- `✅ Database connection successful` - Bağlantı başarılı
- `🔌 New database client connected` - Yeni bağlantı kuruldu
- `⚠️ Database health check failed` - Sağlık kontrolü başarısız
- `❌ Database connection error` - Bağlantı hatası

