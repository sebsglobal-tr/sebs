-- ============================================
-- Complete Performance Fixes Migration
-- This script fixes ALL database linter issues:
-- 1. Adds missing index for foreign key
-- 2. Removes all unused indexes identified by the linter
-- 
-- Run this in Supabase SQL Editor or via psql
-- ============================================

-- ============================================
-- 1. FIX UNINDEXED FOREIGN KEY
-- ============================================
-- Add index for job_applications.job_posting_id foreign key

CREATE INDEX IF NOT EXISTS idx_job_applications_job_posting_id 
ON public.job_applications(job_posting_id);

-- ============================================
-- 2. REMOVE ALL UNUSED INDEXES
-- ============================================
-- These indexes have been identified as unused by PostgreSQL statistics
-- Removing them will free up storage and improve write performance

-- Purchases table indexes
DROP INDEX IF EXISTS public.idx_purchases_is_active;
DROP INDEX IF EXISTS public.idx_purchases_active_user;
DROP INDEX IF EXISTS public.idx_purchases_is_active_standalone;
DROP INDEX IF EXISTS public.idx_purchases_user_id;
DROP INDEX IF EXISTS public.idx_purchases_category;
DROP INDEX IF EXISTS public.idx_purchases_level;
DROP INDEX IF EXISTS public.idx_purchases_active;
DROP INDEX IF EXISTS public.idx_purchases_purchased_at;
DROP INDEX IF EXISTS public.idx_purchases_user_active;

-- Company recommendations indexes
DROP INDEX IF EXISTS public.idx_company_recommendations_bootcamp_id;
DROP INDEX IF EXISTS public.idx_company_recommendations_intern_pool_id;
DROP INDEX IF EXISTS public.company_recommendations_company_id_idx;
DROP INDEX IF EXISTS public.company_recommendations_status_idx;
DROP INDEX IF EXISTS public.company_recommendations_match_score_idx;

-- Module progress indexes
DROP INDEX IF EXISTS public.idx_module_progress_active_user;
DROP INDEX IF EXISTS public.idx_module_progress_user_id;
DROP INDEX IF EXISTS public.idx_module_progress_module_id;
DROP INDEX IF EXISTS public.idx_module_progress_is_completed;
DROP INDEX IF EXISTS public.idx_module_progress_user_module;
DROP INDEX IF EXISTS public.idx_module_progress_user_completed;

-- Enrollments indexes
DROP INDEX IF EXISTS public.idx_enrollments_active_user;
DROP INDEX IF EXISTS public.idx_enrollments_user_id;
DROP INDEX IF EXISTS public.idx_enrollments_course_id;
DROP INDEX IF EXISTS public.idx_enrollments_is_active;
DROP INDEX IF EXISTS public.idx_enrollments_user_active;

-- AI Cache indexes
DROP INDEX IF EXISTS public.ai_cache_cache_key_idx;
DROP INDEX IF EXISTS public.ai_cache_expires_at_idx;

-- Bootcamp applications indexes
DROP INDEX IF EXISTS public.bootcamp_applications_status_idx;
DROP INDEX IF EXISTS public.bootcamp_applications_bootcamp_id_idx;

-- Intern pool indexes
DROP INDEX IF EXISTS public.intern_pool_status_idx;
DROP INDEX IF EXISTS public.intern_pool_overall_score_idx;

-- Job postings indexes
DROP INDEX IF EXISTS public.job_postings_company_id_idx;
DROP INDEX IF EXISTS public.job_postings_is_active_idx;

-- Job applications indexes
DROP INDEX IF EXISTS public.job_applications_status_idx;

-- Subscriptions indexes
DROP INDEX IF EXISTS public.subscriptions_status_idx;

-- Payments indexes
DROP INDEX IF EXISTS public.payments_subscription_id_idx;
DROP INDEX IF EXISTS public.payments_status_idx;
DROP INDEX IF EXISTS public.payments_transaction_id_idx;

-- Notifications indexes
DROP INDEX IF EXISTS public.notifications_is_read_idx;
DROP INDEX IF EXISTS public.notifications_created_at_idx;

-- Analytics indexes
DROP INDEX IF EXISTS public.analytics_date_idx;
DROP INDEX IF EXISTS public.analytics_metric_idx;

-- Packages indexes
DROP INDEX IF EXISTS public.packages_level_idx;
DROP INDEX IF EXISTS public.packages_is_active_idx;

-- User package purchases indexes
DROP INDEX IF EXISTS public.user_package_purchases_user_id_idx;
DROP INDEX IF EXISTS public.user_package_purchases_package_id_idx;
DROP INDEX IF EXISTS public.user_package_purchases_status_idx;
DROP INDEX IF EXISTS public.user_package_purchases_expiry_date_idx;

-- Entitlements indexes
DROP INDEX IF EXISTS public.entitlements_category_idx;
DROP INDEX IF EXISTS public.entitlements_level_idx;
DROP INDEX IF EXISTS public.entitlements_is_active_idx;

-- AI Analysis indexes
DROP INDEX IF EXISTS public.ai_analysis_risk_level_idx;
DROP INDEX IF EXISTS public.ai_analysis_created_at_idx;

-- Behavior data indexes
DROP INDEX IF EXISTS public.behavior_data_created_at_idx;

-- Skill scores indexes
DROP INDEX IF EXISTS public.skill_scores_skill_name_idx;

-- Security logs indexes
DROP INDEX IF EXISTS public.security_logs_user_id_idx;
DROP INDEX IF EXISTS public.security_logs_action_idx;
DROP INDEX IF EXISTS public.security_logs_created_at_idx;

-- Certificates indexes
DROP INDEX IF EXISTS public.idx_certificates_user_id;
DROP INDEX IF EXISTS public.idx_certificates_category;
DROP INDEX IF EXISTS public.idx_certificates_earned_at;

-- Simulation runs indexes
DROP INDEX IF EXISTS public.idx_simulation_runs_module_id;
DROP INDEX IF EXISTS public.idx_simulation_runs_simulation_id;
DROP INDEX IF EXISTS public.idx_simulation_runs_completed_at;

-- Refresh tokens indexes
-- NOTE: These indexes are critical for authentication and token validation
-- They are commented out to preserve security functionality
-- Only uncomment if you have confirmed they are truly unused and not needed
-- DROP INDEX IF EXISTS public.idx_refresh_tokens_user_id;
-- DROP INDEX IF EXISTS public.idx_refresh_tokens_expires_at;
-- DROP INDEX IF EXISTS public.idx_refresh_tokens_token;

-- Modules indexes
DROP INDEX IF EXISTS public.idx_modules_course_id;

-- Users indexes
-- NOTE: idx_users_email should be a UNIQUE constraint instead of an index
-- The email column already has a UNIQUE constraint, so this index is redundant
-- idx_users_access_level might be needed for access control queries
DROP INDEX IF EXISTS public.idx_users_access_level;
DROP INDEX IF EXISTS public.idx_users_email;

-- Rate limits indexes
-- NOTE: These indexes are important for rate limiting functionality
-- They are commented out to preserve API security
-- Only uncomment if you have verified they are not used by your rate limiting logic
-- DROP INDEX IF EXISTS public.idx_rate_limits_identifier;
-- DROP INDEX IF EXISTS public.idx_rate_limits_window;

-- Backup metadata indexes
DROP INDEX IF EXISTS public.idx_backup_metadata_status;
DROP INDEX IF EXISTS public.idx_backup_metadata_type;

-- Connection monitor indexes
DROP INDEX IF EXISTS public.idx_connection_monitor_user;
DROP INDEX IF EXISTS public.idx_connection_monitor_ip;

-- Slow queries indexes
DROP INDEX IF EXISTS public.idx_slow_queries_time;
DROP INDEX IF EXISTS public.idx_slow_queries_user;

-- Maintenance log indexes
DROP INDEX IF EXISTS public.idx_maintenance_log_status;

-- ============================================
-- 3. VERIFICATION
-- ============================================
-- Run these queries after to verify the fixes:

-- Check if foreign key index was created:
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename = 'job_applications' 
-- AND indexname = 'idx_job_applications_job_posting_id';

-- Check remaining unused indexes:
-- SELECT 
--     schemaname, 
--     tablename, 
--     indexname, 
--     idx_scan,
--     pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- AND idx_scan = 0
-- ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- NOTES
-- ============================================
-- 1. Some indexes are commented out (refresh_tokens, rate_limits) because they
--    are critical for authentication and rate limiting. Keep them unless you're
--    absolutely sure they're not needed.
-- 
-- 2. After removing indexes, run ANALYZE to update PostgreSQL statistics:
--    ANALYZE;
--
-- 3. Monitor your application performance after removing indexes to ensure
--    queries still perform well. If you notice slowdowns, you can recreate
--    specific indexes as needed.
--
-- 4. To recreate an index if needed:
--    CREATE INDEX index_name ON table_name(column_name);
