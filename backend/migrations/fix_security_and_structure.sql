-- Comprehensive Database Security & Structure Fixes
-- Güvenlik ve yapısal iyileştirmeler

-- ============================================
-- 1. FOREIGN KEY İLİŞKİLERİ
-- ============================================

-- purchases.user_id → users.id foreign key ekle
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'purchases'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        -- Check if foreign key already exists
        IF NOT EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'purchases_user_id_fkey'
        ) THEN
            -- Try to add foreign key
            BEGIN
                ALTER TABLE purchases 
                ADD CONSTRAINT purchases_user_id_fkey 
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
                RAISE NOTICE 'Foreign key purchases_user_id_fkey added';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not add foreign key: %', SQLERRM;
            END;
        END IF;
    END IF;
END $$;

-- ============================================
-- 2. UNIQUE CONSTRAINT'LER
-- ============================================

-- users.email için UNIQUE constraint kontrolü
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        -- Check if unique constraint exists
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND constraint_type = 'UNIQUE'
            AND constraint_name LIKE '%email%'
        ) THEN
            -- Try to add unique constraint
            BEGIN
                ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);
                RAISE NOTICE 'Unique constraint on users.email added';
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not add unique constraint: %', SQLERRM;
            END;
        END IF;
    END IF;
END $$;

-- ============================================
-- 3. EKSİK INDEX'LER
-- ============================================

-- Critical indexes for performance
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_users_access_level ON users(access_level);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_purchases_user_active ON purchases(user_id, is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_module_progress_user_completed ON module_progress(user_id, is_completed);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_active ON enrollments(user_id, is_active);

-- ============================================
-- 4. GÜVENLİK İYİLEŞTİRMELERİ
-- ============================================

-- Add NOT NULL constraints where needed
DO $$
BEGIN
    -- users.email NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'email'
        AND is_nullable = 'YES'
    ) THEN
        -- First, set NULL values to a placeholder
        UPDATE users SET email = 'unknown_' || id WHERE email IS NULL;
        -- Then add NOT NULL constraint
        ALTER TABLE users ALTER COLUMN email SET NOT NULL;
        RAISE NOTICE 'users.email set to NOT NULL';
    END IF;
    
    -- users.password_hash NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'password_hash'
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
        RAISE NOTICE 'users.password_hash set to NOT NULL';
    END IF;
END $$;

-- ============================================
-- 5. VERİ BÜTÜNLÜĞÜ KONTROLLERİ
-- ============================================

-- Add CHECK constraints for data validation
DO $$
BEGIN
    -- purchases.level validation
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'purchases'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'purchases' 
            AND constraint_name = 'purchases_level_check'
        ) THEN
            ALTER TABLE purchases 
            ADD CONSTRAINT purchases_level_check 
            CHECK (level IN ('beginner', 'intermediate', 'advanced'));
            RAISE NOTICE 'purchases.level check constraint added';
        END IF;
        
        -- purchases.category validation
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'purchases' 
            AND constraint_name = 'purchases_category_check'
        ) THEN
            ALTER TABLE purchases 
            ADD CONSTRAINT purchases_category_check 
            CHECK (category IN ('cybersecurity', 'cloud', 'data-science'));
            RAISE NOTICE 'purchases.category check constraint added';
        END IF;
        
        -- purchases.price validation
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'purchases' 
            AND constraint_name = 'purchases_price_check'
        ) THEN
            ALTER TABLE purchases 
            ADD CONSTRAINT purchases_price_check 
            CHECK (price >= 0);
            RAISE NOTICE 'purchases.price check constraint added';
        END IF;
    END IF;
    
    -- users.access_level validation
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'users'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'users' 
            AND constraint_name = 'users_access_level_check'
        ) THEN
            ALTER TABLE users 
            ADD CONSTRAINT users_access_level_check 
            CHECK (access_level IN ('beginner', 'intermediate', 'advanced'));
            RAISE NOTICE 'users.access_level check constraint added';
        END IF;
    END IF;
    
    -- module_progress.percent_complete validation
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'module_progress'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_schema = 'public' 
            AND table_name = 'module_progress' 
            AND constraint_name = 'module_progress_percent_check'
        ) THEN
            ALTER TABLE module_progress 
            ADD CONSTRAINT module_progress_percent_check 
            CHECK (percent_complete >= 0 AND percent_complete <= 100);
            RAISE NOTICE 'module_progress.percent_complete check constraint added';
        END IF;
    END IF;
END $$;

-- ============================================
-- 6. PERFORMANS İYİLEŞTİRMELERİ
-- ============================================

-- Analyze tables for query optimizer
ANALYZE purchases;
ANALYZE module_progress;
ANALYZE users;
ANALYZE enrollments;
ANALYZE certificates;

-- ============================================
-- 7. GÜVENLİK: SENSITIVE DATA PROTECTION
-- ============================================

-- Create function to mask sensitive data in logs
CREATE OR REPLACE FUNCTION mask_sensitive_data(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    IF input_text IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Mask email addresses
    IF input_text ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$' THEN
        RETURN regexp_replace(input_text, '(.)(.*)(@)', '\1***\3', 'g');
    END IF;
    
    -- Mask tokens (long strings)
    IF length(input_text) > 20 THEN
        RETURN substring(input_text, 1, 4) || '***' || substring(input_text, length(input_text) - 3);
    END IF;
    
    RETURN input_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. AUDIT TRIGGERS (Security Logging)
-- ============================================

-- Create audit log function
CREATE OR REPLACE FUNCTION audit_purchases()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO security_logs (action, resource, resource_id, details, created_at)
        VALUES (
            'purchase_created',
            'purchases',
            NEW.id::TEXT,
            jsonb_build_object(
                'user_id', mask_sensitive_data(NEW.user_id::TEXT),
                'category', NEW.category,
                'level', NEW.level,
                'price', NEW.price
            ),
            CURRENT_TIMESTAMP
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO security_logs (action, resource, resource_id, details, created_at)
        VALUES (
            'purchase_updated',
            'purchases',
            NEW.id::TEXT,
            jsonb_build_object(
                'old_is_active', OLD.is_active,
                'new_is_active', NEW.is_active
            ),
            CURRENT_TIMESTAMP
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for purchases audit
DROP TRIGGER IF EXISTS audit_purchases_trigger ON purchases;
CREATE TRIGGER audit_purchases_trigger
    AFTER INSERT OR UPDATE ON purchases
    FOR EACH ROW
    EXECUTE FUNCTION audit_purchases();

-- ============================================
-- 9. DATA RETENTION POLICIES
-- ============================================

-- Create function to clean old inactive purchases (optional)
CREATE OR REPLACE FUNCTION cleanup_old_purchases()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete purchases older than 2 years that are inactive
    DELETE FROM purchases
    WHERE is_active = FALSE
    AND created_at < CURRENT_TIMESTAMP - INTERVAL '2 years';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 10. COMMENTS (Documentation)
-- ============================================

COMMENT ON TABLE purchases IS 'Kullanıcı paket satın alımları - Güvenlik: Foreign key ile users tablosuna bağlı, audit trigger ile loglanıyor';
COMMENT ON COLUMN purchases.user_id IS 'Kullanıcı ID (TEXT - Supabase users.id ile uyumlu)';
COMMENT ON COLUMN purchases.is_active IS 'Aktif satın alım mı? FALSE ise erişim yok';
COMMENT ON COLUMN purchases.expires_at IS 'NULL = ömür boyu erişim, TIMESTAMP = son kullanma tarihi';

COMMENT ON COLUMN users.access_level IS 'Kullanıcı erişim seviyesi: beginner, intermediate, advanced - CHECK constraint ile doğrulanıyor';
COMMENT ON COLUMN module_progress.percent_complete IS 'Tamamlanma yüzdesi: 0-100 arası - CHECK constraint ile doğrulanıyor';

