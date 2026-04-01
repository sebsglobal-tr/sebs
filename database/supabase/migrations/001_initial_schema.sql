-- ============================================
-- SEBS SUPABASE AUTH MIGRATION
-- Initial Schema: Profiles + RLS + Functions
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- Links to auth.users (Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'instructor')),
  access_level TEXT DEFAULT 'beginner' CHECK (access_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_access_level ON public.profiles(access_level);

-- ============================================
-- PACKAGES TABLE
-- Available packages for purchase
-- ============================================
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- cybersecurity, cloud, datascience
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER, -- null = lifetime
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_packages_category_level ON public.packages(category, level);
CREATE INDEX IF NOT EXISTS idx_packages_is_active ON public.packages(is_active);

-- ============================================
-- PURCHASES TABLE
-- User package purchases
-- ============================================
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE RESTRICT,
  transaction_id TEXT, -- Payment provider transaction ID
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- null = lifetime
  metadata JSONB, -- Additional payment data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_status ON public.purchases(status);
CREATE INDEX IF NOT EXISTS idx_purchases_transaction_id ON public.purchases(transaction_id);

-- ============================================
-- ENTITLEMENTS TABLE
-- User access entitlements (derived from purchases)
-- ============================================
CREATE TABLE IF NOT EXISTS public.entitlements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- cybersecurity, cloud, datascience
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  purchased_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- null = lifetime
  is_active BOOLEAN DEFAULT true,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category, level)
);

CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON public.entitlements(user_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_category_level ON public.entitlements(category, level);
CREATE INDEX IF NOT EXISTS idx_entitlements_is_active ON public.entitlements(is_active);

-- ============================================
-- COURSES TABLE
-- Course catalog
-- ============================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- cybersecurity, cloud, datascience
  level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  thumbnail TEXT,
  is_published BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_category_level ON public.courses(category, level);
CREATE INDEX IF NOT EXISTS idx_courses_is_published ON public.courses(is_published);

-- ============================================
-- LESSONS TABLE
-- Lessons/Modules within courses
-- ============================================
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT, -- JSON or HTML
  "order" INTEGER DEFAULT 0,
  type TEXT DEFAULT 'lesson' CHECK (type IN ('lesson', 'lab', 'quiz', 'exam')),
  duration INTEGER, -- minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_type ON public.lessons(type);

-- ============================================
-- SIMULATIONS TABLE
-- Simulation catalog
-- ============================================
CREATE TABLE IF NOT EXISTS public.simulations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  simulation_id TEXT NOT NULL UNIQUE, -- e.g., "cafe-hack", "network-security"
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_simulations_lesson_id ON public.simulations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_simulations_category_level ON public.simulations(category, level);

-- ============================================
-- PROGRESS TABLE
-- User lesson progress
-- ============================================
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
  is_completed BOOLEAN DEFAULT false,
  time_spent_minutes INTEGER DEFAULT 0,
  last_step TEXT, -- JSON: last step data
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_lesson_id ON public.progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_progress_is_completed ON public.progress(is_completed);

-- ============================================
-- SIMULATION RUNS TABLE
-- User simulation attempts and results
-- ============================================
CREATE TABLE IF NOT EXISTS public.simulation_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  simulation_id TEXT NOT NULL,
  score INTEGER,
  flags_found TEXT[],
  time_spent INTEGER DEFAULT 0, -- seconds
  attempts INTEGER DEFAULT 0,
  completion_time INTEGER, -- seconds
  decision_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  success_rate DECIMAL(5, 2), -- 0-100
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_id ON public.simulation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_simulation_id ON public.simulation_runs(simulation_id);

-- ============================================
-- CERTIFICATES TABLE
-- User certificates
-- ============================================
CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  completion_time INTEGER, -- minutes
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  certificate_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_category ON public.certificates(category);

-- ============================================
-- HELPER FUNCTION: has_entitlement
-- Checks if user has access to category/level
-- ============================================
CREATE OR REPLACE FUNCTION public.has_entitlement(
  p_user_id UUID,
  p_category TEXT,
  p_level TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_access_level TEXT;
  v_has_entitlement BOOLEAN;
BEGIN
  -- Get user's access level from profile
  SELECT access_level INTO v_access_level
  FROM public.profiles
  WHERE id = p_user_id;

  -- Check if user has direct entitlement
  SELECT EXISTS(
    SELECT 1
    FROM public.entitlements
    WHERE user_id = p_user_id
      AND category = p_category
      AND level = p_level
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > NOW())
  ) INTO v_has_entitlement;

  -- If has direct entitlement, return true
  IF v_has_entitlement THEN
    RETURN true;
  END IF;

  -- Advanced users can access intermediate + beginner
  -- Intermediate users can access beginner
  IF p_level = 'beginner' THEN
    IF v_access_level IN ('intermediate', 'advanced') THEN
      RETURN true;
    END IF;
  ELSIF p_level = 'intermediate' THEN
    IF v_access_level = 'advanced' THEN
      RETURN true;
    END IF;
  END IF;

  -- User must have exact level match
  IF v_access_level = p_level THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- ============================================
-- HELPER FUNCTION: get_user_entitlements
-- Returns user's active entitlements
-- ============================================
CREATE OR REPLACE FUNCTION public.get_user_entitlements(p_user_id UUID)
RETURNS TABLE(
  category TEXT,
  level TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT e.category, e.level
  FROM public.entitlements e
  WHERE e.user_id = p_user_id
    AND e.is_active = true
    AND (e.expires_at IS NULL OR e.expires_at > NOW());
END;
$$;

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ((select auth.uid()) = id);

-- Purchases: Users can only see their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.purchases FOR SELECT
  USING (auth.uid() = user_id);

-- Entitlements: Users can only see their own entitlements
CREATE POLICY "Users can view own entitlements"
  ON public.entitlements FOR SELECT
  USING (auth.uid() = user_id);

-- Progress: Users can only see their own progress
CREATE POLICY "Users can view own progress"
  ON public.progress FOR SELECT
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.progress FOR INSERT
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own progress"
  ON public.progress FOR UPDATE
  USING ((select auth.uid()) = user_id);

-- Simulation Runs: Users can only see their own runs
CREATE POLICY "Users can view own simulation runs"
  ON public.simulation_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulation runs"
  ON public.simulation_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Certificates: Users can only see their own certificates
CREATE POLICY "Users can view own certificates"
  ON public.certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Courses: Published courses are public for listing, details require entitlement
CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  USING (is_published = true);

-- Lessons: Public listing, details require entitlement check (handled in API)
CREATE POLICY "Anyone can view active lessons"
  ON public.lessons FOR SELECT
  USING (is_active = true);

-- Simulations: Public listing, access requires entitlement (handled in API)
CREATE POLICY "Anyone can view active simulations"
  ON public.simulations FOR SELECT
  USING (is_active = true);

-- Packages: Public listing
CREATE POLICY "Anyone can view active packages"
  ON public.packages FOR SELECT
  USING (is_active = true);

-- ============================================
-- TRIGGER: Auto-create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: Update updated_at timestamp
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Apply to all tables with updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entitlements_updated_at BEFORE UPDATE ON public.entitlements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_simulations_updated_at BEFORE UPDATE ON public.simulations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
