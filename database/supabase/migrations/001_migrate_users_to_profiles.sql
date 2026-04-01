-- ============================================
-- SEBS SUPABASE AUTH MIGRATION
-- Migrate users table data to profiles table
-- ============================================

-- ============================================
-- ADIM 1: users tablosundaki verileri profiles'a migrate et
-- ============================================

-- Eğer users tablosunda veri varsa ve profiles'da yoksa migrate et
-- Not: auth.users boşsa, users tablosundaki ID'ler direkt profiles'a eklenir
-- (Supabase Auth kullanılmadan önce oluşturulmuş kayıtlar için)
INSERT INTO public.profiles (id, full_name, phone, role, access_level, created_at)
SELECT 
  CASE 
    WHEN pg_typeof(u.id)::text = 'uuid' THEN u.id::uuid
    ELSE u.id::text::uuid
  END as id,
  COALESCE(
    TRIM(CONCAT(COALESCE(u.first_name, ''), ' ', COALESCE(u.last_name, ''))),
    u.email
  ) as full_name,
  u.phone,
  COALESCE(u.role, 'user') as role,
  COALESCE(u.access_level, 'beginner') as access_level,
  COALESCE(u.created_at, NOW()) as created_at
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.id = CASE 
    WHEN pg_typeof(u.id)::text = 'uuid' THEN u.id::uuid
    ELSE u.id::text::uuid
  END
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ADIM 2: Verification
-- ============================================

DO $$
DECLARE
  migrated_count INTEGER;
  total_users INTEGER;
BEGIN
  SELECT COUNT(*) INTO migrated_count
  FROM public.profiles;
  
  SELECT COUNT(*) INTO total_users
  FROM public.users;
  
  RAISE NOTICE '✅ Migrate edilen profile sayısı: %', migrated_count;
  RAISE NOTICE '📊 Toplam users kayıt sayısı: %', total_users;
  
  IF migrated_count > 0 THEN
    RAISE NOTICE '✅ Users verileri profiles tablosuna migrate edildi';
  ELSE
    RAISE WARNING '⚠️  Hiç veri migrate edilmedi. Users tablosunda auth.users ile eşleşen kayıt yok olabilir.';
  END IF;
END $$;
