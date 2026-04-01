-- ============================================
-- SEBS SUPABASE AUTH MIGRATION
-- Fix Foreign Keys: users.id -> profiles.id
-- ============================================

-- ============================================
-- ADIM 1: Foreign Key Constraint'leri Kaldır
-- ============================================

-- AI Analysis
ALTER TABLE IF EXISTS public.ai_analysis 
  DROP CONSTRAINT IF EXISTS ai_analysis_user_id_fkey;

-- Behavior Data
ALTER TABLE IF EXISTS public.behavior_data 
  DROP CONSTRAINT IF EXISTS behavior_data_user_id_fkey;

-- Bootcamp Applications
ALTER TABLE IF EXISTS public.bootcamp_applications 
  DROP CONSTRAINT IF EXISTS bootcamp_applications_user_id_fkey;

-- Certificates
ALTER TABLE IF EXISTS public.certificates 
  DROP CONSTRAINT IF EXISTS certificates_user_id_fkey;

-- Enrollments
ALTER TABLE IF EXISTS public.enrollments 
  DROP CONSTRAINT IF EXISTS enrollments_user_id_fkey;

-- Entitlements
ALTER TABLE IF EXISTS public.entitlements 
  DROP CONSTRAINT IF EXISTS entitlements_user_id_fkey;

-- Intern Pool
ALTER TABLE IF EXISTS public.intern_pool 
  DROP CONSTRAINT IF EXISTS intern_pool_user_id_fkey;

-- Job Applications
ALTER TABLE IF EXISTS public.job_applications 
  DROP CONSTRAINT IF EXISTS job_applications_user_id_fkey;

-- Module Progress
ALTER TABLE IF EXISTS public.module_progress 
  DROP CONSTRAINT IF EXISTS module_progress_user_id_fkey;

-- Notifications
ALTER TABLE IF EXISTS public.notifications 
  DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Purchases
ALTER TABLE IF EXISTS public.purchases 
  DROP CONSTRAINT IF EXISTS purchases_user_id_fkey;

-- Refresh Tokens
ALTER TABLE IF EXISTS public.refresh_tokens 
  DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_fkey;

-- Security Logs
ALTER TABLE IF EXISTS public.security_logs 
  DROP CONSTRAINT IF EXISTS security_logs_admin_id_fkey;

-- Simulation Runs
ALTER TABLE IF EXISTS public.simulation_runs 
  DROP CONSTRAINT IF EXISTS simulation_runs_user_id_fkey;

-- Skill Scores
ALTER TABLE IF EXISTS public.skill_scores 
  DROP CONSTRAINT IF EXISTS skill_scores_user_id_fkey;

-- Subscriptions
ALTER TABLE IF EXISTS public.subscriptions 
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;

-- User Package Purchases
ALTER TABLE IF EXISTS public.user_package_purchases 
  DROP CONSTRAINT IF EXISTS user_package_purchases_user_id_fkey;

-- ============================================
-- ADIM 2: Yeni Foreign Key'leri profiles.id'ye Ekle
-- ============================================

-- AI Analysis
ALTER TABLE IF EXISTS public.ai_analysis 
  ADD CONSTRAINT ai_analysis_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Behavior Data
ALTER TABLE IF EXISTS public.behavior_data 
  ADD CONSTRAINT behavior_data_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Bootcamp Applications
ALTER TABLE IF EXISTS public.bootcamp_applications 
  ADD CONSTRAINT bootcamp_applications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Certificates
ALTER TABLE IF EXISTS public.certificates 
  ADD CONSTRAINT certificates_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enrollments
ALTER TABLE IF EXISTS public.enrollments 
  ADD CONSTRAINT enrollments_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Entitlements
ALTER TABLE IF EXISTS public.entitlements 
  ADD CONSTRAINT entitlements_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Intern Pool
ALTER TABLE IF EXISTS public.intern_pool 
  ADD CONSTRAINT intern_pool_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Job Applications
ALTER TABLE IF EXISTS public.job_applications 
  ADD CONSTRAINT job_applications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Module Progress
ALTER TABLE IF EXISTS public.module_progress 
  ADD CONSTRAINT module_progress_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Notifications
ALTER TABLE IF EXISTS public.notifications 
  ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Purchases
ALTER TABLE IF EXISTS public.purchases 
  ADD CONSTRAINT purchases_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Refresh Tokens (opsiyonel, Supabase Auth kullanıyor ama referans tutulabilir)
ALTER TABLE IF EXISTS public.refresh_tokens 
  ADD CONSTRAINT refresh_tokens_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Security Logs (admin_id için)
ALTER TABLE IF EXISTS public.security_logs 
  ADD CONSTRAINT security_logs_admin_id_fkey 
  FOREIGN KEY (admin_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Simulation Runs
ALTER TABLE IF EXISTS public.simulation_runs 
  ADD CONSTRAINT simulation_runs_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Skill Scores
ALTER TABLE IF EXISTS public.skill_scores 
  ADD CONSTRAINT skill_scores_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Subscriptions
ALTER TABLE IF EXISTS public.subscriptions 
  ADD CONSTRAINT subscriptions_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- User Package Purchases
ALTER TABLE IF EXISTS public.user_package_purchases 
  ADD CONSTRAINT user_package_purchases_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ============================================
-- ADIM 3: Verification
-- ============================================

-- Foreign key'lerin doğru yönlendirildiğini kontrol et
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
    AND ccu.table_name = 'profiles'
    AND kcu.column_name IN ('user_id', 'admin_id');
  
  RAISE NOTICE '✅ Profiles tablosuna yönlendirilen foreign key sayısı: %', fk_count;
END $$;
