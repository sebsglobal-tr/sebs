-- ============================================
-- FIX: relation "supabase_migrations.schema_migrations" does not exist
-- ============================================
--
-- NASIL UYGULANIR:
-- 1. Supabase Dashboard → SQL Editor
-- 2. Bu dosyanın içeriğini yapıştırın
-- 3. "Run" ile çalıştırın
--
-- Bu script güvenlidir: IF NOT EXISTS kullandığı için
-- tablo zaten varsa hata vermez.
-- ============================================

CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version BIGINT NOT NULL PRIMARY KEY,
    dirty BOOLEAN NOT NULL DEFAULT false
);

GRANT USAGE ON SCHEMA supabase_migrations TO postgres, supabase_admin;
GRANT ALL ON TABLE supabase_migrations.schema_migrations TO postgres, supabase_admin;
