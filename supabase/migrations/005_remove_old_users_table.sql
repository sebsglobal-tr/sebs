-- ============================================
-- SEBS SUPABASE AUTH MIGRATION
-- Remove Old Users Table (After Migration)
-- ============================================

-- ============================================
-- UYARI: Bu migration sadece tüm foreign key'ler
-- profiles.id'ye yönlendirildikten SONRA çalıştırılmalı
-- ============================================

-- ============================================
-- ADIM 1: Önce users tablosundaki verilerin
-- profiles'a migrate edildiğini kontrol et
-- ============================================

DO $$
DECLARE
  users_count INTEGER;
  profiles_count INTEGER;
  missing_profiles INTEGER;
BEGIN
  -- Users tablosundaki kayıt sayısı
  SELECT COUNT(*) INTO users_count FROM public.users;
  
  -- Profiles tablosundaki kayıt sayısı
  SELECT COUNT(*) INTO profiles_count FROM public.profiles;
  
  -- Users'da olup profiles'da olmayan kayıt sayısı
  SELECT COUNT(*) INTO missing_profiles
  FROM public.users u
  WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  );
  
  RAISE NOTICE '📊 Users tablosu kayıt sayısı: %', users_count;
  RAISE NOTICE '📊 Profiles tablosu kayıt sayısı: %', profiles_count;
  RAISE NOTICE '⚠️  Profiles''da olmayan users kayıt sayısı: %', missing_profiles;
  
  IF missing_profiles > 0 THEN
    RAISE WARNING '⚠️  % kayıt profiles tablosunda yok! Önce migrate edin.', missing_profiles;
  END IF;
END $$;

-- ============================================
-- ADIM 2: Foreign key referanslarını kontrol et
-- ============================================

DO $$
DECLARE
  fk_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO fk_count
  FROM information_schema.table_constraints AS tc
  JOIN information_schema.key_column_usage AS kcu 
    ON tc.constraint_name = kcu.constraint_name
  JOIN information_schema.constraint_column_usage AS ccu 
    ON ccu.constraint_name = tc.constraint_name
  WHERE tc.table_schema = 'public' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND ccu.table_name = 'users';
  
  IF fk_count > 0 THEN
    RAISE WARNING '⚠️  Hala % foreign key users tablosuna referans veriyor! Önce düzeltin.', fk_count;
  ELSE
    RAISE NOTICE '✅ Tüm foreign key''ler profiles tablosuna yönlendirilmiş';
  END IF;
END $$;

-- ============================================
-- ADIM 3: Users tablosunu kaldır
-- (Sadece yukarıdaki kontroller başarılıysa)
-- ============================================

-- ÖNEMLİ: Bu işlem geri alınamaz!
-- Önce yedek alın: pg_dump veya Supabase Dashboard'dan export

-- Users tablosunu kaldır (CASCADE ile tüm bağımlılıkları da kaldırır)
-- DİKKAT: Bu komut şu an yorum satırında, güvenlik için
-- Tüm kontroller başarılı olduktan sonra manuel olarak çalıştırın

-- DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- ADIM 4: Verification
-- ============================================

DO $$
DECLARE
  table_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  ) INTO table_exists;
  
  IF table_exists THEN
    RAISE NOTICE 'ℹ️  Users tablosu hala mevcut (güvenlik için yorum satırında bırakıldı)';
    RAISE NOTICE 'ℹ️  Manuel olarak kaldırmak için: DROP TABLE IF EXISTS public.users CASCADE;';
  ELSE
    RAISE NOTICE '✅ Users tablosu kaldırıldı';
  END IF;
END $$;
