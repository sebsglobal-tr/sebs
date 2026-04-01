import pg from 'pg';
const { Client } = pg;

const prisma = new PrismaClient();

async function removeDuplicateIndexes() {
  // DATABASE_URL'den connection bilgilerini al
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  // DIRECT_URL varsa onu kullan, yoksa DATABASE_URL'i kullan
  const directUrl = process.env.DIRECT_URL || databaseUrl;
  
  // PostgreSQL connection string'ini parse et
  const url = new URL(directUrl);
  const client = new Client({
    host: url.hostname,
    port: parseInt(url.port || '5432'),
    database: url.pathname.slice(1), // Remove leading /
    user: url.username,
    password: url.password,
    ssl: url.searchParams.get('sslmode') === 'require' ? { rejectUnauthorized: false } : false,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    const indexesToDrop = [
      'ai_analysis_user_id_idx',
      'behavior_data_user_id_idx',
      'entitlements_user_id_idx',
      'notifications_user_id_idx',
      'security_logs_admin_id_idx',
      'skill_scores_user_id_idx',
      'subscriptions_user_id_idx',
    ];

    console.log('\n📋 Checking existing duplicate indexes...');
    
    // Önce mevcut index'leri kontrol et
    for (const indexName of indexesToDrop) {
      const checkQuery = `
        SELECT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE schemaname = 'public' 
          AND indexname = $1
        ) as exists;
      `;
      
      const result = await client.query(checkQuery, [indexName]);
      if (result.rows[0].exists) {
        console.log(`  ✓ Found: ${indexName}`);
      } else {
        console.log(`  - Not found: ${indexName} (already removed or never existed)`);
      }
    }

    console.log('\n🗑️  Removing duplicate indexes...');

    // Her index'i sil
    for (const indexName of indexesToDrop) {
      try {
        const dropQuery = `DROP INDEX IF EXISTS public.${indexName}`;
        await client.query(dropQuery);
        console.log(`  ✅ Dropped: ${indexName}`);
      } catch (error) {
        console.error(`  ❌ Error dropping ${indexName}:`, error.message);
      }
    }

    // ANALYZE çalıştır
    console.log('\n📊 Updating statistics...');
    await client.query('ANALYZE');
    console.log('  ✅ Statistics updated');

    // Sonucu kontrol et
    console.log('\n🔍 Verifying removal...');
    let remainingCount = 0;
    for (const indexName of indexesToDrop) {
      const checkQuery = `
        SELECT EXISTS (
          SELECT 1 FROM pg_indexes 
          WHERE schemaname = 'public' 
          AND indexname = $1
        ) as exists;
      `;
      
      const result = await client.query(checkQuery, [indexName]);
      if (result.rows[0].exists) {
        console.log(`  ⚠️  Still exists: ${indexName}`);
        remainingCount++;
      } else {
        console.log(`  ✅ Removed: ${indexName}`);
      }
    }

    if (remainingCount === 0) {
      console.log('\n🎉 All duplicate indexes removed successfully!');
      console.log('   Please refresh Supabase Dashboard to see the changes.');
    } else {
      console.log(`\n⚠️  ${remainingCount} index(es) still remain. Please check manually.`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.end();
    await prisma.$disconnect();
    console.log('\n✅ Connection closed');
  }
}

removeDuplicateIndexes().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
