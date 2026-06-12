-- ============================================
-- Remove Unused Indexes Script
-- NOTE: Use this script with caution!
-- ============================================
-- 
-- This script removes indexes that have been flagged as unused by PostgreSQL
-- statistics. However, "unused" doesn't necessarily mean "not needed".
--
-- Reasons an index might show as unused:
-- 1. The database is new and hasn't received enough traffic
-- 2. The queries that use it haven't been executed yet
-- 3. PostgreSQL statistics haven't been updated
--
-- BEFORE RUNNING THIS SCRIPT:
-- 1. Review which indexes to remove based on your application's queries
-- 2. Keep indexes on foreign keys (important for JOINs)
-- 3. Keep indexes on columns frequently used in WHERE clauses
-- 4. Keep indexes on columns used in ORDER BY
-- 5. Update PostgreSQL statistics: ANALYZE;
-- 6. Monitor query performance after removal
--
-- TO UPDATE STATISTICS BEFORE RUNNING:
-- ANALYZE;
--
-- TO CHECK IF AN INDEX IS ACTUALLY USED:
-- SELECT schemaname, tablename, indexname, idx_scan 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public' 
-- AND indexname = 'your_index_name';
--
-- idx_scan = 0 means the index has never been used
-- But remember: even if idx_scan = 0, the index might be needed for future queries
-- ============================================

-- ============================================
-- SAFE INDEX REMOVAL (Low Risk)
-- These indexes are likely safe to remove if truly unused
-- ============================================

-- Purchases table - standalone boolean index (likely redundant)
DROP INDEX IF EXISTS idx_purchases_is_active_standalone;
DROP INDEX IF EXISTS idx_purchases_is_active;

-- Company recommendations - specific indexes that might be redundant
DROP INDEX IF EXISTS idx_company_recommendations_bootcamp_id;
DROP INDEX IF EXISTS idx_company_recommendations_intern_pool_id;

-- Job applications - status index (unless you frequently filter by status)
DROP INDEX IF EXISTS job_applications_status_idx;

-- Job postings - specific indexes
DROP INDEX IF EXISTS job_postings_company_id_idx;
DROP INDEX IF EXISTS job_postings_is_active_idx;

-- Subscriptions - status index
DROP INDEX IF EXISTS subscriptions_status_idx;

-- Payments - specific indexes (be careful if these are used in financial reports)
DROP INDEX IF EXISTS payments_subscription_id_idx;
DROP INDEX IF EXISTS payments_status_idx;
DROP INDEX IF EXISTS payments_transaction_id_idx;

-- Packages - level and active status indexes
DROP INDEX IF EXISTS packages_level_idx;
DROP INDEX IF EXISTS packages_is_active_idx;

-- User package purchases - specific indexes
DROP INDEX IF EXISTS user_package_purchases_user_id_idx;
DROP INDEX IF EXISTS user_package_purchases_package_id_idx;
DROP INDEX IF EXISTS user_package_purchases_status_idx;
DROP INDEX IF EXISTS user_package_purchases_expiry_date_idx;

-- Entitlements - category/level/active indexes
DROP INDEX IF EXISTS entitlements_category_idx;
DROP INDEX IF EXISTS entitlements_level_idx;
DROP INDEX IF EXISTS entitlements_is_active_idx;

-- AI Analysis - risk level and created_at indexes
DROP INDEX IF EXISTS ai_analysis_risk_level_idx;
DROP INDEX IF EXISTS ai_analysis_created_at_idx;

-- Behavior Data - created_at index
DROP INDEX IF EXISTS behavior_data_created_at_idx;

-- Skill Scores - skill_name index
DROP INDEX IF EXISTS skill_scores_skill_name_idx;

-- Bootcamp Applications - status and bootcamp_id indexes
DROP INDEX IF EXISTS bootcamp_applications_status_idx;
DROP INDEX IF EXISTS bootcamp_applications_bootcamp_id_idx;

-- Intern Pool - status and overall_score indexes
DROP INDEX IF EXISTS intern_pool_status_idx;
DROP INDEX IF EXISTS intern_pool_overall_score_idx;

-- Company Recommendations - other indexes
DROP INDEX IF EXISTS company_recommendations_company_id_idx;
DROP INDEX IF EXISTS company_recommendations_status_idx;
DROP INDEX IF EXISTS company_recommendations_match_score_idx;

-- Backup Metadata - status and type indexes
DROP INDEX IF EXISTS idx_backup_metadata_status;
DROP INDEX IF EXISTS idx_backup_metadata_type;

-- Maintenance Log - status index
DROP INDEX IF EXISTS idx_maintenance_log_status;

-- ============================================
-- MEDIUM RISK INDEX REMOVAL
-- Review carefully - these might be needed for common queries
-- ============================================

-- Purchases table - be careful with these
-- DROP INDEX IF EXISTS idx_purchases_active_user;
-- DROP INDEX IF EXISTS idx_purchases_user_active;
-- DROP INDEX IF EXISTS idx_purchases_user_id;
-- DROP INDEX IF EXISTS idx_purchases_category;
-- DROP INDEX IF EXISTS idx_purchases_level;
-- DROP INDEX IF EXISTS idx_purchases_active;
-- DROP INDEX IF EXISTS idx_purchases_purchased_at;

-- Module Progress - these are likely needed for progress queries
-- DROP INDEX IF EXISTS idx_module_progress_active_user;
-- DROP INDEX IF EXISTS idx_module_progress_user_id;
-- DROP INDEX IF EXISTS idx_module_progress_module_id;
-- DROP INDEX IF EXISTS idx_module_progress_is_completed;
-- DROP INDEX IF EXISTS idx_module_progress_user_module;
-- DROP INDEX IF EXISTS idx_module_progress_user_completed;

-- Enrollments - these are likely needed for enrollment queries
-- DROP INDEX IF EXISTS idx_enrollments_active_user;
-- DROP INDEX IF EXISTS idx_enrollments_user_id;
-- DROP INDEX IF EXISTS idx_enrollments_course_id;
-- DROP INDEX IF EXISTS idx_enrollments_is_active;
-- DROP INDEX IF EXISTS idx_enrollments_user_active;

-- Certificates - might be needed for certificate queries
-- DROP INDEX IF EXISTS idx_certificates_user_id;
-- DROP INDEX IF EXISTS idx_certificates_category;
-- DROP INDEX IF EXISTS idx_certificates_earned_at;

-- Simulation Runs - might be needed for simulation queries
-- DROP INDEX IF EXISTS idx_simulation_runs_module_id;
-- DROP INDEX IF EXISTS idx_simulation_runs_simulation_id;
-- DROP INDEX IF EXISTS idx_simulation_runs_completed_at;

-- Modules - likely needed for module queries
-- DROP INDEX IF EXISTS idx_modules_course_id;

-- Notifications - might be needed for notification queries
-- DROP INDEX IF EXISTS notifications_is_read_idx;
-- DROP INDEX IF EXISTS notifications_created_at_idx;

-- Analytics - likely needed for analytics queries
-- DROP INDEX IF EXISTS analytics_date_idx;
-- DROP INDEX IF EXISTS analytics_metric_idx;

-- Connection Monitor - might be needed for monitoring
-- DROP INDEX IF EXISTS idx_connection_monitor_user;
-- DROP INDEX IF EXISTS idx_connection_monitor_ip;

-- Slow Queries - might be needed for query analysis
-- DROP INDEX IF EXISTS idx_slow_queries_time;
-- DROP INDEX IF EXISTS idx_slow_queries_user;

-- ============================================
-- HIGH RISK - DO NOT REMOVE
-- These indexes are critical for performance and should NOT be removed
-- ============================================

-- AI Cache - needed for cache lookups (commented out for safety)
-- DROP INDEX IF EXISTS ai_cache_cache_key_idx;
-- DROP INDEX IF EXISTS ai_cache_expires_at_idx;

-- Refresh Tokens - CRITICAL for authentication (commented out for safety)
-- DROP INDEX IF EXISTS idx_refresh_tokens_user_id;
-- DROP INDEX IF EXISTS idx_refresh_tokens_expires_at;
-- DROP INDEX IF EXISTS idx_refresh_tokens_token;

-- Users - CRITICAL for user lookups (commented out for safety)
-- DROP INDEX IF EXISTS idx_users_access_level;
-- DROP INDEX IF EXISTS idx_users_email;  -- This should have a UNIQUE constraint anyway

-- Security Logs - might be needed for security auditing (commented out for safety)
-- DROP INDEX IF EXISTS security_logs_user_id_idx;
-- DROP INDEX IF EXISTS security_logs_action_idx;
-- DROP INDEX IF EXISTS security_logs_created_at_idx;

-- Rate Limits - likely needed for rate limiting (commented out for safety)
-- DROP INDEX IF EXISTS idx_rate_limits_identifier;
-- DROP INDEX IF EXISTS idx_rate_limits_window;

-- ============================================
-- VERIFICATION QUERIES
-- Run these after removing indexes to verify they're gone
-- ============================================

-- List all indexes on a specific table
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE schemaname = 'public' 
-- AND tablename = 'your_table_name'
-- ORDER BY indexname;

-- Check index sizes (to see space savings)
-- SELECT 
--     schemaname,
--     tablename,
--     indexname,
--     pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY pg_relation_size(indexrelid) DESC;
