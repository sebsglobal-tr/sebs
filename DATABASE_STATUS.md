# Veritabanı Durum Raporu

## Kontrol Tarihi
$(date)

## Bağlantı Bilgileri
- **Provider**: Supabase
- **Host**: aws-1-eu-north-1.pooler.supabase.com
- **Port**: 6543 (Pooler) / 5432 (Direct)
- **Type**: Connection Pooler

## Veritabanı Özellikleri
- **PostgreSQL Versiyonu**: 17.6
- **Max Connections**: 60 (Free Plan) / 200 (Pro Plan)
- **Aktif Bağlantılar**: Kontrol ediliyor...

## Connection Pool Ayarları
- **Max Pool Size**: 200 (environment variable ile ayarlanabilir)
- **Min Pool Size**: 10
- **Idle Timeout**: 60 saniye
- **Connection Timeout**: 10 saniye

## Öneriler

### Supabase Plan Durumu
- **Mevcut**: Free Plan (60 connections)
- **Önerilen**: Pro Plan (200 connections) - Faz 1 için gerekli
- **Maliyet**: $25/ay

### Connection Pool
- Pool ayarları 200'e çıkarılmış (kod hazır)
- Supabase Pro plan'a geçiş yapılmalı
- Environment variable: `DB_POOL_MAX=200`

### Monitoring
- Health check endpoint: `/api/health`
- Pool durumu: `totalCount`, `idleCount`, `waitingCount`

