# Veritabanı Tablo Durumu

## Mevcut Tablolar

Sistem için gerekli tüm tablolar veritabanında mevcut:

### ✅ Temel Tablolar
1. **users** - Kullanıcı bilgileri
   - `id` (TEXT) - Primary Key
   - `email` - E-posta adresi
   - `password_hash` - Şifre hash
   - `first_name`, `last_name` - İsim bilgileri
   - `role` - Kullanıcı rolü (user, admin, instructor)
   - `access_level` - Erişim seviyesi (beginner, intermediate, advanced)
   - `is_verified` - E-posta doğrulama durumu
   - `is_active` - Aktif kullanıcı mı?
   - `created_at`, `updated_at` - Zaman damgaları

2. **courses** - Kurslar
   - `id` (UUID) - Primary Key
   - `title` - Kurs başlığı
   - `description` - Kurs açıklaması
   - `category` - Kategori (cybersecurity, cloud, datascience)
   - `level` - Seviye (beginner, intermediate, advanced)
   - `is_active` - Aktif mi?

3. **modules** - Modüller
   - `id` (UUID) - Primary Key
   - `course_id` - Kurs ID (Foreign Key)
   - `title` - Modül başlığı
   - `description` - Modül açıklaması
   - `content` - Modül içeriği (JSON/HTML)
   - `order` - Sıralama
   - `type` - Tip (lesson, lab, quiz, exam)
   - `duration` - Süre (dakika)
   - `is_active` - Aktif mi?

### ✅ İlerleme ve Kayıt Tabloları
4. **enrollments** - Kurs kayıtları
   - `id` (UUID) - Primary Key
   - `user_id` - Kullanıcı ID (Foreign Key)
   - `course_id` - Kurs ID (Foreign Key)
   - `enrolled_at` - Kayıt tarihi
   - `completed_at` - Tamamlanma tarihi
   - `is_active` - Aktif kayıt mı?

5. **module_progress** - Modül ilerlemesi
   - `id` (UUID) - Primary Key
   - `user_id` - Kullanıcı ID (Foreign Key)
   - `module_id` - Modül ID (Foreign Key)
   - `percent_complete` - Tamamlanma yüzdesi (0-100)
   - `last_step` - Son adım (JSON)
   - `is_completed` - Tamamlandı mı?
   - `time_spent_minutes` - Harcanan süre (dakika)
   - `last_accessed_at` - Son erişim tarihi
   - `completed_at` - Tamamlanma tarihi
   - `created_at`, `updated_at` - Zaman damgaları

6. **simulation_runs** - Simülasyon sonuçları
   - `id` (UUID) - Primary Key
   - `user_id` - Kullanıcı ID (Foreign Key)
   - `module_id` - Modül ID (Foreign Key)
   - `simulation_id` - Simülasyon ID
   - `score` - Skor
   - `flags_found` - Bulunan flag'ler (array)
   - `time_spent` - Harcanan süre (saniye)
   - `attempts` - Deneme sayısı
   - `completion_time` - Tamamlanma süresi
   - `decision_count`, `error_count` - İstatistikler
   - `success_rate` - Başarı oranı
   - `completed_at` - Tamamlanma tarihi

### ✅ Satın Alma Tabloları
7. **purchases** - Satın alımlar (YENİ)
   - `id` (UUID) - Primary Key
   - `user_id` (TEXT) - Kullanıcı ID
   - `category` - Kategori (cybersecurity, cloud, data-science)
   - `level` - Seviye (beginner, intermediate, advanced)
   - `price` - Fiyat
   - `payment_status` - Ödeme durumu
   - `payment_method` - Ödeme yöntemi
   - `transaction_id` - İşlem ID
   - `purchased_at` - Satın alma tarihi
   - `expires_at` - Son kullanma tarihi (NULL = ömür boyu)
   - `is_active` - Aktif mi?
   - `created_at`, `updated_at` - Zaman damgaları
   - **Unique Constraint:** (user_id, category, level)

8. **user_package_purchases** - Eski satın alım tablosu (mevcut)
   - Farklı yapıda, mevcut sistemle uyumlu

### ✅ Diğer Tablolar
9. **certificates** - Sertifikalar
   - `id` (UUID) - Primary Key
   - `user_id` - Kullanıcı ID
   - `category` - Kategori
   - `title` - Sertifika başlığı
   - `description` - Açıklama
   - `completion_time` - Tamamlanma süresi
   - `earned_at` - Kazanılma tarihi
   - `certificate_url` - Sertifika URL'i
   - `metadata` - Ek bilgiler (JSON)

10. **refresh_tokens** - JWT refresh token'ları
    - `id` (UUID) - Primary Key
    - `user_id` - Kullanıcı ID
    - `token` - Token (unique)
    - `expires_at` - Son kullanma tarihi

11. **entitlements** - Kullanıcı yetkileri
    - `id` (UUID) - Primary Key
    - `user_id` - Kullanıcı ID
    - `category` - Kategori
    - `level` - Seviye
    - `purchased_at` - Satın alma tarihi
    - `expires_at` - Son kullanma tarihi
    - `is_active` - Aktif mi?

12. **behavior_data** - Kullanıcı davranış verileri
13. **skill_scores** - Yetenek skorları
14. **ai_analysis** - AI analiz sonuçları
15. **security_logs** - Güvenlik logları

## Tablo İlişkileri

```
users
  ├── enrollments (user_id)
  ├── module_progress (user_id)
  ├── simulation_runs (user_id)
  ├── certificates (user_id)
  ├── purchases (user_id)
  ├── entitlements (user_id)
  └── refresh_tokens (user_id)

courses
  ├── modules (course_id)
  └── enrollments (course_id)

modules
  ├── module_progress (module_id)
  └── simulation_runs (module_id)
```

## Indexler

Tüm tablolarda performans için gerekli indexler oluşturulmuştur:
- Foreign key kolonlarında indexler
- Sık sorgulanan kolonlarda indexler
- Unique constraint'ler

## Migration Dosyaları

- `backend/migrations/create_purchases_table_simple.sql` - Purchases tablosu
- `backend/migrations/create_all_tables.sql` - Tüm tablolar ve güncellemeler

## Setup Script

```bash
node setup-database-tables.js
```

Bu script:
- Tüm tabloları kontrol eder
- Eksik tabloları oluşturur
- Eksik kolonları ekler
- Indexleri oluşturur
- Tablo durumunu raporlar

## Notlar

- `users` tablosu Supabase tarafından yönetiliyor, `id` kolonu TEXT tipinde
- `purchases` tablosu `user_id` kolonu TEXT tipinde (users.id ile uyumlu)
- `user_package_purchases` tablosu mevcut sistemle uyumlu, farklı yapıda
- Tüm veriler veritabanında tutuluyor, localStorage kullanılmıyor

