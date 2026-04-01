-- ============================================
-- SEBS Global - Server.js İçin Gerekli Tüm Tablolar
-- CREATE TABLE IF NOT EXISTS ile güvenli kurulum (mevcut veri silinmez)
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS (Legacy - server.js JWT auth kullanıyorsa)
-- Supabase kullanıyorsanız bu tablo olmayabilir; profiles + auth.users kullanılır
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "publicId" TEXT UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    verification_code VARCHAR(10),
    verification_code_expires TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT false,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'instructor')),
    is_active BOOLEAN DEFAULT true,
    access_level VARCHAR(20) DEFAULT 'beginner' CHECK (access_level IN ('beginner', 'intermediate', 'advanced')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_access_level ON public.users(access_level);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- ============================================
-- 2. MODULES (Modül kataloğu - /api/modules)
-- ============================================
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    category VARCHAR(50),
    level VARCHAR(20) CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_modules_is_active ON public.modules(is_active);
CREATE INDEX IF NOT EXISTS idx_modules_category_level ON public.modules(category, level);

-- ============================================
-- 3. LESSONS (Dersler - module_id ile modüle bağlı)
-- ============================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    duration INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON public.lessons(module_id);

-- ============================================
-- 4. ENROLLMENTS (Kurs kayıtları - reset-progress’te siliniyor)
-- ============================================
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    course_id UUID,
    is_active BOOLEAN DEFAULT true,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_is_active ON public.enrollments(is_active);

-- ============================================
-- 5. USER_LESSON_PROGRESS (Ders bazlı ilerleme - ON CONFLICT (user_id, lesson_id))
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    last_position_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_ulp_user_id ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ulp_lesson_id ON public.user_lesson_progress(lesson_id);

-- ============================================
-- 6. USER_MODULE_PROGRESS (Modül bazlı özet ilerleme)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
    completed_lessons INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);
CREATE INDEX IF NOT EXISTS idx_ump_user_id ON public.user_module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ump_module_id ON public.user_module_progress(module_id);

-- ============================================
-- 7. MODULE_PROGRESS (Dashboard overview’da kullanılıyor)
-- ============================================
CREATE TABLE IF NOT EXISTS public.module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    module_id UUID NOT NULL,
    percent_complete INTEGER DEFAULT 0 CHECK (percent_complete >= 0 AND percent_complete <= 100),
    is_completed BOOLEAN DEFAULT false,
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);
CREATE INDEX IF NOT EXISTS idx_module_progress_user_id ON public.module_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_module_id ON public.module_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_module_progress_is_completed ON public.module_progress(is_completed);

-- ============================================
-- 8. PURCHASES (server.js: category, level, user_id, price, payment_status, purchased_at, is_active)
-- ============================================
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    price DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'completed',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_category_level UNIQUE (user_id, category, level)
);
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_category ON public.purchases(category);
CREATE INDEX IF NOT EXISTS idx_purchases_level ON public.purchases(level);
CREATE INDEX IF NOT EXISTS idx_purchases_active ON public.purchases(is_active, expires_at);

-- ============================================
-- 9. USER_PACKAGE_PURCHASES
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_package_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'completed',
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    purchased_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_upp_user_category_level UNIQUE (user_id, category, level)
);
CREATE INDEX IF NOT EXISTS idx_upp_user_id ON public.user_package_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_upp_category_level ON public.user_package_purchases(category, level);

-- ============================================
-- 10. SIMULATION_RUNS
-- ============================================
CREATE TABLE IF NOT EXISTS public.simulation_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    module_id UUID,
    simulation_id TEXT,
    score INTEGER,
    time_spent INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_id ON public.simulation_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_simulation_id ON public.simulation_runs(simulation_id);

-- ============================================
-- 11. CERTIFICATES
-- ============================================
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    completion_time INTEGER,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    certificate_url TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_category ON public.certificates(category);

-- ============================================
-- 12. USER_ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    activity_type VARCHAR(50),
    entity_type VARCHAR(50),
    entity_id UUID,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON public.user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON public.user_activities(created_at DESC);

-- ============================================
-- 13. USER_ACHIEVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    achievement_id VARCHAR(100) NOT NULL,
    title TEXT,
    description TEXT,
    achieved_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achieved_at ON public.user_achievements(achieved_at DESC);

-- ============================================
-- 14. REFRESH_TOKENS (opsiyonel - server.js’te adı geçiyor)
-- ============================================
CREATE TABLE IF NOT EXISTS public.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON public.refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON public.refresh_tokens(token);

-- ============================================
-- Kolon eklemeleri (eksik kolonlar varsa – hata vermemek için DO $$)
-- ============================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'access_level') THEN
            ALTER TABLE public.users ADD COLUMN access_level VARCHAR(20) DEFAULT 'beginner';
        END IF;
    END IF;
END $$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'module_progress') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'module_progress' AND column_name = 'time_spent_minutes') THEN
            ALTER TABLE public.module_progress ADD COLUMN time_spent_minutes INTEGER DEFAULT 0;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'module_progress' AND column_name = 'last_accessed_at') THEN
            ALTER TABLE public.module_progress ADD COLUMN last_accessed_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'module_progress' AND column_name = 'completed_at') THEN
            ALTER TABLE public.module_progress ADD COLUMN completed_at TIMESTAMPTZ;
        END IF;
    END IF;
END $$;
