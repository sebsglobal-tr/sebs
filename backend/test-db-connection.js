// Test database connection
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔄 Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Configured' : '❌ Not configured');
    console.log('DIRECT_URL:', process.env.DIRECT_URL ? '✅ Configured' : '❌ Not configured');
    
    const result = await prisma.$queryRaw`SELECT version() as version`;
    console.log('\n✅ Database connection successful!');
    console.log('PostgreSQL version:', result[0]?.version || 'Unknown');
    
    // Check if entitlements table exists
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'entitlements'
    `;
    
    if (tables.length > 0) {
      console.log('\n✅ Entitlements table exists');
    } else {
      console.log('\n⚠️  Entitlements table does NOT exist');
      console.log('Run migration: npx prisma migrate dev --name add_entitlements');
      console.log('Or execute SQL: migrations/create_entitlements_table.sql');
    }
    
  } catch (error) {
    console.error('\n❌ Database connection failed!');
    console.error('Error:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Check if Supabase project is active');
    console.error('2. Verify DIRECT_URL in .env file');
    console.error('3. Check network/firewall settings');
    console.error('4. Verify password in connection string');
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
