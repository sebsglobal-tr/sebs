-- ============================================
-- Dynamic Fix for ALL Linter Issues
-- This script dynamically finds and removes all unused indexes
-- AND adds missing foreign key index
-- ============================================

-- First, update statistics to get accurate data
ANALYZE;

-- ============================================
-- 1. ADD MISSING FOREIGN KEY INDEX
-- ============================================
CREATE INDEX IF NOT EXISTS idx_job_applications_job_posting_id 
ON public.job_applications(job_posting_id);

-- ============================================
-- 2. REMOVE ALL UNUSED INDEXES (Dynamic approach)
-- ============================================
-- This will find and drop all indexes that have never been used (idx_scan = 0)
-- Excluding indexes on primary keys and unique constraints

DO $$
DECLARE
    r RECORD;
    index_count INTEGER := 0;
    skipped_count INTEGER := 0;
BEGIN
    -- Loop through all unused indexes
    FOR r IN 
        SELECT 
            schemaname,
            tablename,
            indexrelname as indexname,
            idx_scan
        FROM pg_stat_user_indexes
        WHERE schemaname = 'public'
        AND idx_scan = 0
        AND indexrelname NOT LIKE '%_pkey'  -- Don't drop primary keys
        AND indexrelname NOT LIKE '%_key'   -- Don't drop unique constraints
        AND indexrelname != 'idx_job_applications_job_posting_id'  -- Keep the one we just created
        ORDER BY tablename, indexrelname
    LOOP
        -- Check if it's a primary key or unique constraint index
        IF NOT EXISTS (
            SELECT 1 
            FROM pg_constraint c
            JOIN pg_index i ON i.indexrelid = (SELECT oid FROM pg_class WHERE relname = r.indexname)
            WHERE c.contype IN ('p', 'u')
            AND i.indexrelid = (SELECT oid FROM pg_class WHERE relname = r.indexname)
        ) THEN
            -- Drop the unused index
            BEGIN
                EXECUTE format('DROP INDEX IF EXISTS %I.%I', r.schemaname, r.indexname);
                index_count := index_count + 1;
                RAISE NOTICE 'Dropped unused index: %.%', r.tablename, r.indexname;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE 'Could not drop index %.%: %', r.tablename, r.indexname, SQLERRM;
                skipped_count := skipped_count + 1;
            END;
        ELSE
            RAISE NOTICE 'Skipped constraint index: %.%', r.tablename, r.indexname;
            skipped_count := skipped_count + 1;
        END IF;
    END LOOP;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  Indexes dropped: %', index_count;
    RAISE NOTICE '  Indexes skipped: %', skipped_count;
    RAISE NOTICE '========================================';
END $$;

-- ============================================
-- 3. VERIFICATION QUERIES
-- ============================================

-- Check foreign key index was created
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename = 'job_applications' 
        AND indexname = 'idx_job_applications_job_posting_id'
    ) THEN
        RAISE NOTICE '✅ Foreign key index created successfully';
    ELSE
        RAISE NOTICE '⚠️  Foreign key index might not exist (table or FK might not exist yet)';
    END IF;
END $$;

-- Show remaining unused indexes (should be fewer now)
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM pg_stat_user_indexes
    WHERE schemaname = 'public'
    AND idx_scan = 0
    AND indexrelname NOT LIKE '%_pkey'
    AND indexrelname NOT LIKE '%_key';
    
    RAISE NOTICE 'Remaining unused indexes: %', remaining_count;
    
    IF remaining_count = 0 THEN
        RAISE NOTICE '🎉 All unused indexes removed!';
    ELSE
        RAISE NOTICE '💡 There are still % unused indexes. Run ANALYZE and check again.', remaining_count;
    END IF;
END $$;

-- Update statistics again after dropping indexes
ANALYZE;

-- ============================================
-- FINAL MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ Performance fixes completed!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Check Supabase Database Linter again';
    RAISE NOTICE '2. Monitor application performance';
    RAISE NOTICE '3. If queries slow down, recreate specific indexes';
    RAISE NOTICE '';
END $$;
