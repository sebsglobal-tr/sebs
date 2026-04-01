// Test Supabase Database Connection
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
const { Client } = pg;

dotenv.config();

async function testConnection() {
  console.log('🔍 Testing Supabase Database Connection...\n');

  // Test 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  const hasDatabaseUrl = !!process.env.DATABASE_URL;
  const hasDirectUrl = !!process.env.DIRECT_URL;
  
  console.log(`   DATABASE_URL: ${hasDatabaseUrl ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   DIRECT_URL: ${hasDirectUrl ? '✅ SET' : '❌ NOT SET'}\n`);

  if (!hasDatabaseUrl || !hasDirectUrl) {
    console.log('❌ Environment variables not set. Please check .env file.');
    return;
  }

  // Test 2: Parse connection strings
  console.log('2️⃣ Parsing connection strings...');
  try {
    const directUrl = new URL(process.env.DIRECT_URL);
    console.log(`   DIRECT_URL Host: ${directUrl.hostname}`);
    console.log(`   DIRECT_URL Port: ${directUrl.port}`);
    console.log(`   DIRECT_URL User: ${directUrl.username}`);
    console.log(`   DIRECT_URL Database: ${directUrl.pathname.substring(1)}`);
    console.log(`   DIRECT_URL Password: ${directUrl.password ? '***SET***' : 'NOT SET'}\n`);
  } catch (e) {
    console.log(`   ❌ Error parsing DIRECT_URL: ${e.message}\n`);
  }

  // Test 3: Test direct connection with pg
  console.log('3️⃣ Testing direct connection with pg library...');
  const pgClient = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await pgClient.connect();
    console.log('   ✅ pg library connection successful!');
    
    const version = await pgClient.query('SELECT version()');
    console.log(`   PostgreSQL: ${version.rows[0].version.substring(0, 60)}...`);
    
    await pgClient.end();
  } catch (error) {
    console.log(`   ❌ pg library connection failed:`);
    console.log(`      Code: ${error.code || 'N/A'}`);
    console.log(`      Message: ${error.message}`);
    if (error.host) {
      console.log(`      Host: ${error.host}`);
    }
  }
  console.log('');

  // Test 4: Test Prisma connection
  console.log('4️⃣ Testing Prisma connection...');
  const prisma = new PrismaClient({
    log: ['error'],
  });

  try {
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log('   ✅ Prisma connection successful!');
    
    const userCount = await prisma.user.count();
    console.log(`   Users in database: ${userCount}`);
  } catch (error) {
    console.log(`   ❌ Prisma connection failed:`);
    console.log(`      Message: ${error.message}`);
    if (error.code) {
      console.log(`      Code: ${error.code}`);
    }
  } finally {
    await prisma.$disconnect();
  }
  console.log('');

  console.log('📝 Next Steps:');
  console.log('   1. If connection fails, check Supabase Dashboard → Settings → Database');
  console.log('   2. Copy the correct connection strings');
  console.log('   3. Update .env file with correct values');
  console.log('   4. Make sure password is URL-encoded if it contains special characters');
  console.log('   5. See SUPABASE_CONNECTION_GUIDE.md for detailed instructions');
}

testConnection().catch(console.error);

