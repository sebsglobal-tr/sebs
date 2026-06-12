-- ============================================
-- SEBS SUPABASE AUTH MIGRATION
-- Cleanup Old Auth-Related Functions
-- ============================================

-- ============================================
-- ADIM 1: Gereksiz Functions'ları Kaldır
-- ============================================

-- Password hash functions (Supabase Auth kullanıyor)
DROP FUNCTION IF EXISTS public.check_password_hash CASCADE;
DROP FUNCTION IF EXISTS public.validate_password_strength CASCADE;

-- Email validation (Supabase Auth kullanıyor)
DROP FUNCTION IF EXISTS public.validate_user_email CASCADE;
DROP FUNCTION IF EXISTS public.is_valid_email CASCADE;

-- Encryption functions (kullanılmıyor)
DROP FUNCTION IF EXISTS public.encrypt_sensitive_data CASCADE;
DROP FUNCTION IF EXISTS public.mask_sensitive_data CASCADE;

-- Audit functions (kullanılmıyor)
DROP FUNCTION IF EXISTS public.audit_purchases CASCADE;

-- Cleanup functions (kullanılmıyor)
DROP FUNCTION IF EXISTS public.cleanup_old_purchases CASCADE;
DROP FUNCTION IF EXISTS public.cleanup_rate_limits CASCADE;

-- Trigger function (update_updated_at_column zaten var)
DROP FUNCTION IF EXISTS public.update_purchases_updated_at CASCADE;

-- ============================================
-- ADIM 2: Verification
-- ============================================

-- Kalan functions'ları kontrol et
DO $$
DECLARE
  func_count INTEGER;
  func_list TEXT;
BEGIN
  SELECT COUNT(*), string_agg(routine_name, ', ')
  INTO func_count, func_list
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name IN (
      'check_password_hash',
      'validate_password_strength',
      'validate_user_email',
      'is_valid_email',
      'encrypt_sensitive_data',
      'mask_sensitive_data',
      'audit_purchases',
      'cleanup_old_purchases',
      'cleanup_rate_limits',
      'update_purchases_updated_at'
    );
  
  IF func_count > 0 THEN
    RAISE WARNING '⚠️  Hala mevcut gereksiz functions: %', func_list;
  ELSE
    RAISE NOTICE '✅ Tüm gereksiz functions temizlendi';
  END IF;
  
  -- Gerekli functions'ları listele
  SELECT COUNT(*), string_agg(routine_name, ', ')
  INTO func_count, func_list
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name IN ('has_entitlement', 'get_user_entitlements', 'handle_new_user', 'update_updated_at_column');
  
  RAISE NOTICE '✅ Gerekli functions mevcut: %', func_list;
END $$;
