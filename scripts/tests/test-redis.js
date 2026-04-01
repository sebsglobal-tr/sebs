/**
 * Redis Connection Test Script
 * Tests Redis connection and caching functionality
 */

const cache = require('./utils/cache');

async function testRedis() {
    console.log('🧪 Redis Test Başlatılıyor...\n');

    try {
        // Initialize Redis
        console.log('1️⃣  Redis bağlantısı test ediliyor...');
        cache.initRedis();
        
        // Wait a bit for connection
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (!cache.isCacheEnabled()) {
            console.log('⚠️  Redis bağlantısı kurulamadı');
            console.log('💡 Redis kurulumu için:');
            console.log('   macOS: brew install redis && brew services start redis');
            console.log('   Ubuntu: sudo apt-get install redis-server && sudo systemctl start redis');
            return;
        }

        console.log('✅ Redis bağlantısı başarılı\n');

        // Test cache operations
        console.log('2️⃣  Cache işlemleri test ediliyor...');
        
        const testKey = 'test:connection';
        const testValue = { message: 'Redis çalışıyor!', timestamp: new Date().toISOString() };

        // Set cache
        const setResult = await cache.setCache(testKey, testValue, 60);
        if (setResult) {
            console.log('✅ Cache yazma başarılı');
        } else {
            console.log('❌ Cache yazma başarısız');
            return;
        }

        // Get cache
        const getResult = await cache.getCache(testKey);
        if (getResult && getResult.message === testValue.message) {
            console.log('✅ Cache okuma başarılı');
        } else {
            console.log('❌ Cache okuma başarısız');
            return;
        }

        // Delete cache
        const deleteResult = await cache.deleteCache(testKey);
        if (deleteResult) {
            console.log('✅ Cache silme başarılı');
        } else {
            console.log('❌ Cache silme başarısız');
        }

        console.log('\n🎉 Tüm Redis testleri başarılı!');
        console.log('\n📊 Redis Durumu:');
        console.log('   • Bağlantı: ✅ Aktif');
        console.log('   • Cache Yazma: ✅ Çalışıyor');
        console.log('   • Cache Okuma: ✅ Çalışıyor');
        console.log('   • Cache Silme: ✅ Çalışıyor');
        console.log('\n💡 Redis hazır! Sistem cache kullanabilir.');

    } catch (error) {
        console.error('❌ Redis test hatası:', error.message);
        console.log('\n💡 Redis kurulumu için:');
        console.log('   macOS: brew install redis && brew services start redis');
        console.log('   Ubuntu: sudo apt-get install redis-server && sudo systemctl start redis');
    }
}

testRedis();

