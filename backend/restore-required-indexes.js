/**
 * Restore Required Indexes from Prisma Schema
 * Prisma schema'da tanımlı gerekli index'leri geri yükle
 */

import 'dotenv/config';
import dotenv from 'dotenv';
import pg from 'pg';
const { Client } = pg;

dotenv.config();

const client = new Client({
  connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function restoreIndexes() {
  try {
    await client.connect();
    console.log('✅ Veritabanı bağlantısı kuruldu\n');
    console.log('='.repeat(70));
    console.log('🔄 PRISMA SCHEMA INDEX\'LERİNİ GERİ YÜKLÜYOR');
    console.log('='.repeat(70));
    console.log('');

    // Prisma schema'da tanımlı index'ler
    const requiredIndexes = [
      // BehaviorData - schema'da @@index([userId]), @@index([createdAt])
      { name: 'idx_behavior_data_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_behavior_data_user_id ON public.behavior_data(user_id)' },
      { name: 'idx_behavior_data_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_behavior_data_created_at ON public.behavior_data(created_at)' },
      
      // SkillScore - schema'da @@index([userId]), @@index([skillName])
      { name: 'idx_skill_scores_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_skill_scores_user_id ON public.skill_scores(user_id)' },
      { name: 'idx_skill_scores_skill_name', sql: 'CREATE INDEX IF NOT EXISTS idx_skill_scores_skill_name ON public.skill_scores(skill_name)' },
      
      // AIAnalysis - schema'da @@index([userId]), @@index([riskLevel]), @@index([createdAt])
      { name: 'idx_ai_analysis_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_ai_analysis_user_id ON public.ai_analysis(user_id)' },
      { name: 'idx_ai_analysis_risk_level', sql: 'CREATE INDEX IF NOT EXISTS idx_ai_analysis_risk_level ON public.ai_analysis(risk_level)' },
      { name: 'idx_ai_analysis_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_ai_analysis_created_at ON public.ai_analysis(created_at)' },
      
      // SecurityLog - schema'da @@index([adminId]), @@index([userId]), @@index([action]), @@index([createdAt])
      { name: 'idx_security_logs_admin_id', sql: 'CREATE INDEX IF NOT EXISTS idx_security_logs_admin_id ON public.security_logs(admin_id)' },
      { name: 'idx_security_logs_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON public.security_logs(user_id)' },
      { name: 'idx_security_logs_action', sql: 'CREATE INDEX IF NOT EXISTS idx_security_logs_action ON public.security_logs(action)' },
      { name: 'idx_security_logs_created_at', sql: 'CREATE INDEX IF NOT EXISTS idx_security_logs_created_at ON public.security_logs(created_at)' },

      // ModuleProgress - unique constraint var ama index gerekli olabilir
      // Prisma unique constraint otomatik index oluşturur, ama manuel index de gerekebilir
      { name: 'idx_module_progress_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_module_progress_user_id ON public.module_progress(user_id)' },
      { name: 'idx_module_progress_module_id', sql: 'CREATE INDEX IF NOT EXISTS idx_module_progress_module_id ON public.module_progress(module_id)' },
      
      // Enrollments - unique constraint var
      { name: 'idx_enrollments_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.enrollments(user_id)' },
      { name: 'idx_enrollments_course_id', sql: 'CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.enrollments(course_id)' },
      
      // SimulationRuns - foreign key index'leri
      { name: 'idx_simulation_runs_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_id ON public.simulation_runs(user_id)' },
      { name: 'idx_simulation_runs_module_id', sql: 'CREATE INDEX IF NOT EXISTS idx_simulation_runs_module_id ON public.simulation_runs(module_id)' },
      
      // Certificates - foreign key index
      { name: 'idx_certificates_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.certificates(user_id)' },
      
      // RefreshTokens - auth için kritik
      { name: 'idx_refresh_tokens_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON public.refresh_tokens(user_id)' },
      
      // Entitlements - Prisma unique constraint var ama foreign key için index gerekli
      { name: 'idx_entitlements_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON public.entitlements(user_id)' },
      
      // Purchases - foreign key index
      { name: 'idx_purchases_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id)' },
      
      // Modules - foreign key index (JOIN performansı için kritik)
      { name: 'idx_modules_course_id', sql: 'CREATE INDEX IF NOT EXISTS idx_modules_course_id ON public.modules(course_id)' },
      
      // UserPackagePurchases - foreign key index'leri
      { name: 'idx_user_package_purchases_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_user_package_purchases_user_id ON public.user_package_purchases(user_id)' },
      { name: 'idx_user_package_purchases_package_id', sql: 'CREATE INDEX IF NOT EXISTS idx_user_package_purchases_package_id ON public.user_package_purchases(package_id)' },
      
      // Notifications - foreign key index
      { name: 'idx_notifications_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id)' },
      
      // Subscriptions - foreign key index
      { name: 'idx_subscriptions_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id)' },
      
      // Payments - foreign key index
      { name: 'idx_payments_subscription_id', sql: 'CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON public.payments(subscription_id)' },
      
      // JobApplications - foreign key index'leri
      { name: 'idx_job_applications_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_job_applications_user_id ON public.job_applications(user_id)' },
      { name: 'idx_job_applications_job_posting_id', sql: 'CREATE INDEX IF NOT EXISTS idx_job_applications_job_posting_id ON public.job_applications(job_posting_id)' },
      
      // BootcampApplications - foreign key index'leri
      { name: 'idx_bootcamp_applications_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_bootcamp_applications_user_id ON public.bootcamp_applications(user_id)' },
      { name: 'idx_bootcamp_applications_bootcamp_id', sql: 'CREATE INDEX IF NOT EXISTS idx_bootcamp_applications_bootcamp_id ON public.bootcamp_applications(bootcamp_id)' },
      
      // InternPool - foreign key index
      { name: 'idx_intern_pool_user_id', sql: 'CREATE INDEX IF NOT EXISTS idx_intern_pool_user_id ON public.intern_pool(user_id)' },
      
      // CompanyRecommendations - foreign key index'leri
      { name: 'idx_company_recommendations_company_id', sql: 'CREATE INDEX IF NOT EXISTS idx_company_recommendations_company_id ON public.company_recommendations(company_id)' },
      { name: 'idx_company_recommendations_bootcamp_id', sql: 'CREATE INDEX IF NOT EXISTS idx_company_recommendations_bootcamp_id ON public.company_recommendations(bootcamp_id)' },
      { name: 'idx_company_recommendations_intern_pool_id', sql: 'CREATE INDEX IF NOT EXISTS idx_company_recommendations_intern_pool_id ON public.company_recommendations(intern_pool_id)' },
      
      // JobPostings - foreign key index
      { name: 'idx_job_postings_company_id', sql: 'CREATE INDEX IF NOT EXISTS idx_job_postings_company_id ON public.job_postings(company_id)' }
    ];

    console.log(`📋 Toplam ${requiredIndexes.length} index geri yüklenecek\n`);

    let restoredCount = 0;
    let skippedCount = 0;

    for (const idx of requiredIndexes) {
      try {
        await client.query(idx.sql);
        console.log(`   ✅ Geri yüklendi: ${idx.name}`);
        restoredCount++;
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`   ℹ️  Zaten mevcut: ${idx.name}`);
          skippedCount++;
        } else {
          console.log(`   ❌ Hata (${idx.name}): ${error.message}`);
        }
      }
    }

    // Query performans index'lerini tekrar ekle
    console.log('\n📊 QUERY PERFORMANS İNDEX\'LERİNİ EKLE\n');
    
    const perfIndexes = [
      'CREATE INDEX IF NOT EXISTS idx_module_progress_user_last_accessed ON public.module_progress(user_id, last_accessed_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_enrollments_is_active ON public.enrollments(is_active) WHERE is_active = true',
      'CREATE INDEX IF NOT EXISTS idx_module_progress_module_completed ON public.module_progress(module_id, is_completed)',
      'CREATE INDEX IF NOT EXISTS idx_simulation_runs_user_created ON public.simulation_runs(user_id, created_at DESC)'
    ];

    for (const sql of perfIndexes) {
      try {
        await client.query(sql);
        const indexName = sql.match(/idx_\w+/)?.[0] || 'bilinmeyen';
        console.log(`   ✅ ${indexName}`);
        restoredCount++;
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.log(`   ⚠️  Hata: ${error.message}`);
        }
      }
    }

    // ANALYZE çalıştır
    console.log('\n📈 İSTATİSTİKLERİ GÜNCELLE\n');
    await client.query('ANALYZE');
    console.log('   ✅ ANALYZE tamamlandı');

    console.log('\n' + '='.repeat(70));
    console.log('📊 ÖZET');
    console.log('='.repeat(70));
    console.log(`✅ Geri yüklenen index: ${restoredCount}`);
    console.log(`ℹ️  Zaten mevcut: ${skippedCount}`);
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n❌ Hata:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

restoreIndexes();
