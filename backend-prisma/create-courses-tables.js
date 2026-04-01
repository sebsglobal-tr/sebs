#!/usr/bin/env node
/**
 * courses ve modules tablolarını oluşturur (yoksa)
 * Prisma schema ile uyumlu
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const statements = [
  `CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'beginner',
    thumbnail TEXT,
    is_published BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_courses_category_level ON public.courses(category, level)`,
  `CREATE INDEX IF NOT EXISTS idx_courses_is_published ON public.courses(is_published)`,
  `CREATE TABLE IF NOT EXISTS public.modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    level TEXT,
    sort_order INTEGER DEFAULT 0,
    type TEXT DEFAULT 'lesson',
    duration INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  )`,
  `CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id)`,
  `CREATE INDEX IF NOT EXISTS idx_modules_is_active ON public.modules(is_active)`,
];

async function main() {
  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
    console.log('OK:', sql.substring(0, 50) + '...');
  }
  console.log('✅ courses ve modules tabloları hazır');
}

main()
  .catch((e) => {
    console.error('Hata:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
