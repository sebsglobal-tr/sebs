-- ============================================
-- Performance Optimization Migration
-- Fixes database linter issues:
-- 1. Adds missing index for foreign key
-- 2. Removes unused indexes (commented out by default for safety)
-- ============================================

-- ============================================
-- 1. FIX UNINDEXED FOREIGN KEY
-- ============================================
-- Add index for job_applications.job_posting_id foreign key
-- This improves query performance when joining with job_postings table
-- and when filtering by job_posting_id

DO $$
BEGIN
    -- Check if job_applications table exists
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'job_applications'
    ) THEN
        -- Check if the foreign key exists
        IF EXISTS (
            SELECT 1 FROM pg_constraint 
            WHERE conname = 'job_applications_job_posting_id_fkey'
        ) THEN
            -- Check if index already exists
            IF NOT EXISTS (
                SELECT 1 FROM pg_indexes 
                WHERE schemaname = 'public' 
                AND tablename = 'job_applications' 
                AND indexname = 'idx_job_applications_job_posting_id'
            ) THEN
                -- Create the index
                CREATE INDEX idx_job_applications_job_posting_id 
                ON public.job_applications(job_posting_id);
                
                RAISE NOTICE 'Index idx_job_applications_job_posting_id created successfully';
            ELSE
                RAISE NOTICE 'Index idx_job_applications_job_posting_id already exists';
            END IF;
        ELSE
            RAISE NOTICE 'Foreign key job_applications_job_posting_id_fkey not found';
        END IF;
    ELSE
        RAISE NOTICE 'Table job_applications not found, skipping index creation';
    END IF;
END $$;

-- ============================================
-- 2. REMOVE UNUSED INDEXES
-- ============================================
-- NOTE: Unused indexes according to PostgreSQL statistics may still be
-- useful for future queries or queries that haven't been executed yet.
-- Review each index carefully before removing.
--
-- The following indexes have been flagged as unused:
-- - Many indexes on purchases, module_progress, enrollments, etc.
--
-- To remove these indexes, uncomment the DROP INDEX statements below.
-- It's recommended to:
-- 1. Monitor your application for a few weeks after removing indexes
-- 2. Keep indexes on columns frequently used in WHERE clauses
-- 3. Keep indexes on foreign keys (we just added one above)
-- 4. Keep indexes on columns used in ORDER BY or JOIN conditions
--
-- For safety, we've grouped them by table and commented them out.

-- ============================================
-- PURCHASES TABLE - Unused Indexes
-- ============================================
-- Review these before removing:
-- DROP INDEX IF EXISTS idx_purchases_is_active;
-- DROP INDEX IF EXISTS idx_purchases_active_user;
-- DROP INDEX IF EXISTS idx_purchases_is_active_standalone;
-- DROP INDEX IF EXISTS idx_purchases_user_id;
-- DROP INDEX IF EXISTS idx_purchases_category;
-- DROP INDEX IF EXISTS idx_purchases_level;
-- DROP INDEX IF EXISTS idx_purchases_active;
-- DROP INDEX IF EXISTS idx_purchases_purchased_at;
-- DROP INDEX IF EXISTS idx_purchases_user_active;

-- ============================================
-- COMPANY_RECOMMENDATIONS TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS idx_company_recommendations_bootcamp_id;
-- DROP INDEX IF EXISTS idx_company_recommendations_intern_pool_id;
-- DROP INDEX IF EXISTS company_recommendations_company_id_idx;
-- DROP INDEX IF EXISTS company_recommendations_status_idx;
-- DROP INDEX IF EXISTS company_recommendations_match_score_idx;

-- ============================================
-- MODULE_PROGRESS TABLE - Unused Indexes
-- ============================================
-- NOTE: These indexes might be needed for progress queries
-- Review your progress-related queries before removing
-- DROP INDEX IF EXISTS idx_module_progress_active_user;
-- DROP INDEX IF EXISTS idx_module_progress_user_id;
-- DROP INDEX IF EXISTS idx_module_progress_module_id;
-- DROP INDEX IF EXISTS idx_module_progress_is_completed;
-- DROP INDEX IF EXISTS idx_module_progress_user_module;
-- DROP INDEX IF EXISTS idx_module_progress_user_completed;

-- ============================================
-- ENROLLMENTS TABLE - Unused Indexes
-- ============================================
-- NOTE: These indexes might be needed for enrollment queries
-- Review your enrollment-related queries before removing
-- DROP INDEX IF EXISTS idx_enrollments_active_user;
-- DROP INDEX IF EXISTS idx_enrollments_user_id;
-- DROP INDEX IF EXISTS idx_enrollments_course_id;
-- DROP INDEX IF EXISTS idx_enrollments_is_active;
-- DROP INDEX IF EXISTS idx_enrollments_user_active;

-- ============================================
-- AI_CACHE TABLE - Unused Indexes
-- ============================================
-- These are likely needed for cache lookups, be careful
-- DROP INDEX IF EXISTS ai_cache_cache_key_idx;
-- DROP INDEX IF EXISTS ai_cache_expires_at_idx;

-- ============================================
-- BOOTCAMP_APPLICATIONS TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS bootcamp_applications_status_idx;
-- DROP INDEX IF EXISTS bootcamp_applications_bootcamp_id_idx;

-- ============================================
-- INTERN_POOL TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS intern_pool_status_idx;
-- DROP INDEX IF EXISTS intern_pool_overall_score_idx;

-- ============================================
-- JOB_POSTINGS TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS job_postings_company_id_idx;
-- DROP INDEX IF EXISTS job_postings_is_active_idx;

-- ============================================
-- JOB_APPLICATIONS TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS job_applications_status_idx;

-- ============================================
-- SUBSCRIPTIONS TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS subscriptions_status_idx;

-- ============================================
-- PAYMENTS TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS payments_subscription_id_idx;
-- DROP INDEX IF EXISTS payments_status_idx;
-- DROP INDEX IF EXISTS payments_transaction_id_idx;

-- ============================================
-- NOTIFICATIONS TABLE - Unused Indexes
-- ============================================
-- These might be needed for notification queries
-- DROP INDEX IF EXISTS notifications_is_read_idx;
-- DROP INDEX IF EXISTS notifications_created_at_idx;

-- ============================================
-- ANALYTICS TABLE - Unused Indexes
-- ============================================
-- These are likely needed for analytics queries
-- DROP INDEX IF EXISTS analytics_date_idx;
-- DROP INDEX IF EXISTS analytics_metric_idx;

-- ============================================
-- PACKAGES TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS packages_level_idx;
-- DROP INDEX IF EXISTS packages_is_active_idx;

-- ============================================
-- USER_PACKAGE_PURCHASES TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS user_package_purchases_user_id_idx;
-- DROP INDEX IF EXISTS user_package_purchases_package_id_idx;
-- DROP INDEX IF EXISTS user_package_purchases_status_idx;
-- DROP INDEX IF EXISTS user_package_purchases_expiry_date_idx;

-- ============================================
-- ENTITLEMENTS TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS entitlements_category_idx;
-- DROP INDEX IF EXISTS entitlements_level_idx;
-- DROP INDEX IF EXISTS entitlements_is_active_idx;

-- ============================================
-- AI_ANALYSIS TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS ai_analysis_risk_level_idx;
-- DROP INDEX IF EXISTS ai_analysis_created_at_idx;

-- ============================================
-- BEHAVIOR_DATA TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS behavior_data_created_at_idx;

-- ============================================
-- SKILL_SCORES TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS skill_scores_skill_name_idx;

-- ============================================
-- SECURITY_LOGS TABLE - Unused Indexes
-- ============================================
-- These might be needed for security auditing
-- DROP INDEX IF EXISTS security_logs_user_id_idx;
-- DROP INDEX IF EXISTS security_logs_action_idx;
-- DROP INDEX IF EXISTS security_logs_created_at_idx;

-- ============================================
-- CERTIFICATES TABLE - Unused Indexes
-- ============================================
-- These might be needed for certificate queries
-- DROP INDEX IF EXISTS idx_certificates_user_id;
-- DROP INDEX IF EXISTS idx_certificates_category;
-- DROP INDEX IF EXISTS idx_certificates_earned_at;

-- ============================================
-- SIMULATION_RUNS TABLE - Unused Indexes
-- ============================================
-- These might be needed for simulation queries
-- DROP INDEX IF EXISTS idx_simulation_runs_module_id;
-- DROP INDEX IF EXISTS idx_simulation_runs_simulation_id;
-- DROP INDEX IF EXISTS idx_simulation_runs_completed_at;

-- ============================================
-- REFRESH_TOKENS TABLE - Unused Indexes
-- ============================================
-- NOTE: These indexes are critical for authentication and token validation
-- DO NOT remove these unless you have confirmed they are truly unused
-- DROP INDEX IF EXISTS idx_refresh_tokens_user_id;
-- DROP INDEX IF EXISTS idx_refresh_tokens_expires_at;
-- DROP INDEX IF EXISTS idx_refresh_tokens_token;

-- ============================================
-- MODULES TABLE - Unused Indexes
-- ============================================
-- This is likely needed for module queries
-- DROP INDEX IF EXISTS idx_modules_course_id;

-- ============================================
-- USERS TABLE - Unused Indexes
-- ============================================
-- NOTE: These indexes are important for user lookups and access control
-- idx_users_access_level might be needed for access control queries
-- idx_users_email is redundant if email already has a UNIQUE constraint
-- Review your user lookup queries before removing
-- DROP INDEX IF EXISTS idx_users_access_level;
-- DROP INDEX IF EXISTS idx_users_email;  -- This should have a UNIQUE constraint anyway

-- ============================================
-- RATE_LIMITS TABLE - Unused Indexes
-- ============================================
-- These are likely needed for rate limiting
-- DROP INDEX IF EXISTS idx_rate_limits_identifier;
-- DROP INDEX IF EXISTS idx_rate_limits_window;

-- ============================================
-- BACKUP_METADATA TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS idx_backup_metadata_status;
-- DROP INDEX IF EXISTS idx_backup_metadata_type;

-- ============================================
-- CONNECTION_MONITOR TABLE - Unused Indexes
-- ============================================
-- These might be needed for monitoring
-- DROP INDEX IF EXISTS idx_connection_monitor_user;
-- DROP INDEX IF EXISTS idx_connection_monitor_ip;

-- ============================================
-- SLOW_QUERIES TABLE - Unused Indexes
-- ============================================
-- These might be needed for query analysis
-- DROP INDEX IF EXISTS idx_slow_queries_time;
-- DROP INDEX IF EXISTS idx_slow_queries_user;

-- ============================================
-- MAINTENANCE_LOG TABLE - Unused Indexes
-- ============================================
-- DROP INDEX IF EXISTS idx_maintenance_log_status;

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON INDEX idx_job_applications_job_posting_id IS 
'Index on foreign key to improve join performance with job_postings table';
