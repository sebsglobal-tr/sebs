/**
 * Prisma Client Singleton
 * Connection leak önlemek için tek instance kullanılır.
 * Supabase pooler shutdown sonrası otomatik yeniden bağlanır.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
