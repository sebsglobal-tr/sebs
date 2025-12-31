# Veritabanı Kurulum Rehberi

## 1. Migration Uygulama (Supabase)

Supabase Dashboard'dan SQL Editor'ü açın ve aşağıdaki SQL'i çalıştırın:

```sql
-- Add access_level column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS access_level VARCHAR(20) DEFAULT 'beginner';

-- Update existing users to have beginner access level
UPDATE users 
SET access_level = 'beginner' 
WHERE access_level IS NULL;

-- Add comment to column
COMMENT ON COLUMN users.access_level IS 'User access level: beginner, intermediate, advanced - determines which course levels user can access';
```

## 2. Modülleri Veritabanına Ekleme

Seed script'ini çalıştırmak için:

```bash
cd backend
node prisma/seed.js
```

Veya Supabase SQL Editor'den manuel olarak kursları ekleyebilirsiniz.

## 3. Seviye Kontrolü Nasıl Çalışır?

- **beginner**: Sadece başlangıç seviyesi kurslara erişebilir
- **intermediate**: Başlangıç ve orta seviye kurslara erişebilir  
- **advanced**: Tüm seviyelerdeki kurslara erişebilir

## 4. Kullanıcı Seviyesi Güncelleme

Bir kullanıcının seviyesini güncellemek için:

```sql
-- Kullanıcıyı orta seviyeye yükselt
UPDATE users 
SET access_level = 'intermediate' 
WHERE email = 'user@example.com';

-- Kullanıcıyı ileri seviyeye yükselt
UPDATE users 
SET access_level = 'advanced' 
WHERE email = 'user@example.com';
```

## 5. API Endpoint'leri

- `POST /api/enrollments/:courseId` - Kursa kayıt (seviye kontrolü yapılır)
- `POST /api/progress` - Modül ilerlemesi kaydet (seviye kontrolü yapılır)
- `GET /api/courses` - Tüm kursları listele
- `GET /api/enrollments` - Kullanıcının kayıt olduğu kurslar

## 6. Test

Bir kullanıcının seviyesini test etmek için:

1. Kullanıcı oluştur (varsayılan: beginner)
2. Başlangıç seviyesi kursa kayıt ol (başarılı olmalı)
3. Orta seviye kursa kayıt olmaya çalış (403 hatası almalı)
4. Kullanıcı seviyesini intermediate'a güncelle
5. Tekrar orta seviye kursa kayıt ol (başarılı olmalı)

