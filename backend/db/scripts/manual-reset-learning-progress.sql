-- =============================================================================
-- MANUEL: Tüm kullanıcıların öğrenme / modül / simülasyon ilerlemesini sıfırlar
-- =============================================================================
-- Otomatik migration zincirine EKLEMEYİN. Yedek aldıktan sonra psql veya
-- Supabase SQL Editor’da tek sefer çalıştırın.
--
-- SİLİNMEZ: users, modules, lessons, purchases, enrollments
-- =============================================================================

BEGIN;

DELETE FROM public.user_lesson_progress;
DELETE FROM public.user_module_progress;
DELETE FROM public.module_progress;
DELETE FROM public.simulation_runs;

-- Aşağıdaki tablolar eski kurulumlarda yoksa ilgili satırı yorumlayın veya bloğu atlayın
DELETE FROM public.quiz_attempts;
DELETE FROM public.user_module_sessions;

-- İsteğe bağlı: giriş günlüğü
-- DELETE FROM public.user_login_logs;

COMMIT;

-- Doğrulama (satır sayıları 0 olmalı)
-- SELECT 'user_lesson_progress', COUNT(*) FROM public.user_lesson_progress
-- UNION ALL SELECT 'user_module_progress', COUNT(*) FROM public.user_module_progress
-- UNION ALL SELECT 'module_progress', COUNT(*) FROM public.module_progress
-- UNION ALL SELECT 'simulation_runs', COUNT(*) FROM public.simulation_runs;
