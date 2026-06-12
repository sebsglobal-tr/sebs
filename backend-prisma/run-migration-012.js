#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const parts = [
  `DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'modules') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'modules' AND column_name = 'course_id') THEN
      ALTER TABLE public.modules ADD COLUMN course_id UUID;
      CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id);
    END IF;
  END IF;
END $$;`,
  `DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'module_progress') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'module_progress' AND column_name = 'last_step') THEN
      ALTER TABLE public.module_progress ADD COLUMN last_step JSONB;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'module_progress' AND column_name = 'updated_at') THEN
      ALTER TABLE public.module_progress ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
  END IF;
END $$;`,
];

async function main() {
  for (let i = 0; i < parts.length; i++) {
    await prisma.$executeRawUnsafe(parts[i]);
    console.log(`✅ Part ${i + 1} OK`);
  }
  console.log('✅ Migration 012 tamamlandı');
}

main()
  .catch((e) => {
    console.error('Migration hatası:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
