# Veritabanı (database/)

Bu klasör **şema ve migrasyon** içindir; Postgres instance’ı ayrıdır (ör. Supabase).

- **`migrations/`** — Sıralı SQL dosyaları (`010_complete_schema_secure.sql`, `014_simulation_runs_extended.sql`, …). Yeni ortamda `psql` veya Supabase SQL Editor ile uygulayın.
- **`supabase/`** — Supabase proje migrasyonları (CLI: `supabase db push` / proje kökünden bağlantıya göre).

Üretimde değişiklikleri önce staging’de deneyin; RLS politikaları `011_enable_rls_all_tables.sql` ile ilişkilidir.
