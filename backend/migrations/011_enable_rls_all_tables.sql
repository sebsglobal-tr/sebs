-- ============================================
-- SEBS - RLS (Row Level Security) Etkinleştirme
-- Supabase Linter hatalarını giderir
-- Not: Node server postgres rolü ile bağlanır, RLS bypass eder
-- ============================================

BEGIN;

-- ============================================
-- 1. USERS - RLS + hassas kolon koruması (verification_code)
-- PostgREST ile erişim kapalı; Node API postgres rolü ile çalışır
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_select_own" ON public.users FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE
  USING (auth.uid() = id);
-- PostgREST ile doğrudan erişimi kapat (verification_code, password_hash koruması)
REVOKE ALL ON public.users FROM anon, authenticated;

-- ============================================
-- 2. MODULES - Herkese okuma (aktif modüller)
-- ============================================
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modules_select_active" ON public.modules FOR SELECT
  USING (is_active = true);

-- ============================================
-- 3. LESSONS - Herkese okuma (aktif dersler)
-- ============================================
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lessons_select_active" ON public.lessons FOR SELECT
  USING (is_active = true);

-- ============================================
-- 4. ENROLLMENTS - Kullanıcı kendi kayıtları
-- ============================================
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enrollments_all_own" ON public.enrollments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. USER_LESSON_PROGRESS - Kullanıcı kendi ilerlemesi
-- ============================================
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ulp_all_own" ON public.user_lesson_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. USER_MODULE_PROGRESS - Kullanıcı kendi ilerlemesi
-- ============================================
ALTER TABLE public.user_module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ump_all_own" ON public.user_module_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. MODULE_PROGRESS - Kullanıcı kendi ilerlemesi
-- ============================================
ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mp_all_own" ON public.module_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 8. PURCHASES - user_id TEXT, auth.uid()::text
-- ============================================
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "purchases_select_own" ON public.purchases FOR SELECT
  USING (auth.uid()::text = user_id);
CREATE POLICY "purchases_insert_own" ON public.purchases FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "purchases_update_own" ON public.purchases FOR UPDATE
  USING (auth.uid()::text = user_id);

-- ============================================
-- 9. USER_PACKAGE_PURCHASES
-- ============================================
ALTER TABLE public.user_package_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "upp_select_own" ON public.user_package_purchases FOR SELECT
  USING (auth.uid()::text = user_id);
CREATE POLICY "upp_insert_own" ON public.user_package_purchases FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "upp_update_own" ON public.user_package_purchases FOR UPDATE
  USING (auth.uid()::text = user_id);

-- ============================================
-- 10. SIMULATION_RUNS - user_id UUID
-- ============================================
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "simruns_select_own" ON public.simulation_runs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "simruns_insert_own" ON public.simulation_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "simruns_update_own" ON public.simulation_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 11. CERTIFICATES
-- ============================================
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certs_select_own" ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "certs_insert_own" ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 12. USER_ACTIVITIES
-- ============================================
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activities_all_own" ON public.user_activities FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 13. USER_ACHIEVEMENTS
-- ============================================
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_all_own" ON public.user_achievements FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 14. REFRESH_TOKENS - Hassas (token kolonu)
-- PostgREST erişimini kapat
-- ============================================
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "refresh_all_own" ON public.refresh_tokens FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
REVOKE ALL ON public.refresh_tokens FROM anon, authenticated;

COMMIT;
