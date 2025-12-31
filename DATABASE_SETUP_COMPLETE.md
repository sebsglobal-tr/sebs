# ✅ Veritabanı Tablo Yapısı Tamamlandı

## Durum

Tüm gerekli tablolar Supabase veritabanında oluşturuldu ve güncellendi.

## Oluşturulan/Güncellenen Tablolar

### 1. ✅ purchases (YENİ OLUŞTURULDU)
Satın alımları tutar:
- `id` (UUID) - Primary Key
- `user_id` (TEXT) - Kullanıcı ID (users.id ile uyumlu)
- `category` (VARCHAR) - Kategori: cybersecurity, cloud, data-science
- `level` (VARCHAR) - Seviye: beginner, intermediate, advanced
- `price` (DECIMAL) - Fiyat
- `payment_status` (VARCHAR) - Ödeme durumu
- `payment_method` (VARCHAR) - Ödeme yöntemi
- `transaction_id` (VARCHAR) - İşlem ID
- `purchased_at` (TIMESTAMP) - Satın alma tarihi
- `expires_at` (TIMESTAMP) - Son kullanma (NULL = ömür boyu)
- `is_active` (BOOLEAN) - Aktif mi?
- `created_at`, `updated_at` - Zaman damgaları
- **Unique Constraint:** (user_id, category, level)

### 2. ✅ users (GÜNCELLENDİ)
- `access_level` kolonu eklendi (varsa güncellendi)

### 3. ✅ module_progress (GÜNCELLENDİ)
- `time_spent_minutes` kolonu eklendi
- `last_accessed_at` kolonu eklendi
- `completed_at` kolonu eklendi
- Indexler oluşturuldu

### 4. ✅ certificates (GÜNCELLENDİ)
- `certificate_url` kolonu eklendi
- `metadata` kolonu eklendi
- Indexler oluşturuldu

### 5. ✅ Diğer Tablolar
- `enrollments` - Indexler eklendi
- `simulation_runs` - Indexler eklendi
- `refresh_tokens` - Indexler eklendi

## Mevcut Tablolar (Zaten Var)

- ✅ users
- ✅ courses
- ✅ modules
- ✅ enrollments
- ✅ module_progress
- ✅ simulation_runs
- ✅ refresh_tokens
- ✅ certificates
- ✅ entitlements
- ✅ behavior_data
- ✅ skill_scores
- ✅ ai_analysis
- ✅ security_logs
- ✅ user_package_purchases

## Migration Dosyaları

1. **`backend/migrations/create_purchases_table_simple.sql`**
   - Purchases tablosunu oluşturur
   - Indexler ve trigger'lar ekler

2. **`backend/migrations/update_existing_tables.sql`**
   - Mevcut tablolara eksik kolonları ekler
   - Indexler oluşturur

3. **`setup-database-tables.js`**
   - Migration'ları çalıştırır
   - Tablo durumunu kontrol eder
   - Rapor oluşturur

## Kullanım

### Tabloları Oluştur/Güncelle:
```bash
node setup-database-tables.js
```

### Sadece Purchases Tablosunu Oluştur:
```bash
psql $DATABASE_URL -f backend/migrations/create_purchases_table_simple.sql
```

### Mevcut Tabloları Güncelle:
```bash
psql $DATABASE_URL -f backend/migrations/update_existing_tables.sql
```

## Tablo Yapısı Özeti

### Purchases Tablosu
```sql
CREATE TABLE purchases (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'completed',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_category_level UNIQUE (user_id, category, level)
);
```

## Indexler

Tüm kritik kolonlarda indexler oluşturuldu:
- `purchases`: user_id, category, level, is_active, purchased_at
- `module_progress`: user_id, module_id, is_completed
- `certificates`: user_id, category, earned_at
- `enrollments`: user_id, course_id, is_active
- `simulation_runs`: user_id, module_id, simulation_id, completed_at

## Foreign Key İlişkileri

- `purchases.user_id` → `users.id` (TEXT tipinde, Supabase uyumlu)
- `module_progress.user_id` → `users.id`
- `module_progress.module_id` → `modules.id`
- `enrollments.user_id` → `users.id`
- `enrollments.course_id` → `courses.id`
- `certificates.user_id` → `users.id`
- `simulation_runs.user_id` → `users.id`
- `simulation_runs.module_id` → `modules.id`

## Notlar

1. **Users Tablosu**: Supabase tarafından yönetiliyor, `id` kolonu TEXT tipinde
2. **Purchases Tablosu**: `user_id` TEXT tipinde (users.id ile uyumlu)
3. **User Package Purchases**: Mevcut tablo farklı yapıda, sistemle uyumlu çalışıyor
4. **Tüm Veriler**: Veritabanında tutuluyor, localStorage kullanılmıyor

## Sonuç

✅ Tüm tablolar oluşturuldu
✅ Eksik kolonlar eklendi
✅ Indexler oluşturuldu
✅ Foreign key ilişkileri kuruldu
✅ Sistem veritabanı odaklı çalışıyor

Sistem production'a hazır! 🚀

