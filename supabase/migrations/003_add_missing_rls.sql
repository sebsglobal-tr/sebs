-- ============================================
-- SEBS SUPABASE AUTH MIGRATION
-- Add Missing RLS Policies
-- ============================================

-- ============================================
-- PURCHASES TABLE RLS
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.purchases ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can update own purchases" ON public.purchases;

-- Users can only see their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own purchases (for webhook operations, service role will bypass)
CREATE POLICY "Users can insert own purchases"
  ON public.purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own purchases (for status updates)
CREATE POLICY "Users can update own purchases"
  ON public.purchases FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- ENTITLEMENTS TABLE RLS
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.entitlements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own entitlements" ON public.entitlements;
DROP POLICY IF EXISTS "Users can insert own entitlements" ON public.entitlements;
DROP POLICY IF EXISTS "Users can update own entitlements" ON public.entitlements;

-- Users can only see their own entitlements
CREATE POLICY "Users can view own entitlements"
  ON public.entitlements FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own entitlements (usually done by backend/webhook)
CREATE POLICY "Users can insert own entitlements"
  ON public.entitlements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own entitlements (usually done by backend)
CREATE POLICY "Users can update own entitlements"
  ON public.entitlements FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- SIMULATION_RUNS TABLE RLS
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.simulation_runs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own simulation runs" ON public.simulation_runs;
DROP POLICY IF EXISTS "Users can insert own simulation runs" ON public.simulation_runs;
DROP POLICY IF EXISTS "Users can update own simulation runs" ON public.simulation_runs;

-- Users can only see their own simulation runs
CREATE POLICY "Users can view own simulation runs"
  ON public.simulation_runs FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own simulation runs
CREATE POLICY "Users can insert own simulation runs"
  ON public.simulation_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own simulation runs
CREATE POLICY "Users can update own simulation runs"
  ON public.simulation_runs FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- CERTIFICATES TABLE RLS
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.certificates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own certificates" ON public.certificates;
DROP POLICY IF EXISTS "Users can insert own certificates" ON public.certificates;

-- Users can only see their own certificates
CREATE POLICY "Users can view own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own certificates (usually done by backend)
CREATE POLICY "Users can insert own certificates"
  ON public.certificates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- COURSES TABLE RLS
-- ============================================

-- Enable RLS if not already enabled
ALTER TABLE IF EXISTS public.courses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view published courses" ON public.courses;

-- Published courses are public for listing
CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  USING (is_published = true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check RLS policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename IN ('purchases', 'entitlements', 'simulation_runs', 'certificates', 'courses');
  
  RAISE NOTICE '✅ Oluşturulan RLS policy sayısı: %', policy_count;
END $$;
