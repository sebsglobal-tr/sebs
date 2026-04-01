-- ============================================
-- module_progress tablosuna last_step (JSONB) ekler
-- Değerlendirme raporu quiz sonuçlarını buradan okur
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'module_progress' AND column_name = 'last_step'
  ) THEN
    ALTER TABLE public.module_progress ADD COLUMN last_step JSONB;
  END IF;
END $$;
