// .env dosyasındaki DATABASE_URL'i düzeltme script'i
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
    console.error('❌ .env dosyası bulunamadı!');
    process.exit(1);
}

let envContent = fs.readFileSync(envPath, 'utf8');

console.log('🔍 .env dosyası kontrol ediliyor...\n');

// aws-1- kontrolü
if (envContent.includes('aws-1-eu-north-1')) {
    console.log('⚠️  Host adresi düzeltiliyor: aws-1 → aws-0');
    envContent = envContent.replace(/aws-1-eu-north-1/g, 'aws-0-eu-north-1');
    
    // Yedek oluştur
    const backupPath = envPath + '.backup.' + Date.now();
    fs.writeFileSync(backupPath, fs.readFileSync(envPath));
    console.log('💾 Yedek oluşturuldu:', backupPath);
    
    // Güncelle
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env dosyası güncellendi!\n');
    console.log('🔄 Lütfen şunları kontrol edin:');
    console.log('   1. Supabase Dashboard\'dan doğru connection string\'i alın');
    console.log('   2. .env dosyasındaki DATABASE_URL\'i kontrol edin');
    console.log('   3. node fix-database-connection.js ile test edin\n');
} else {
    console.log('✅ Host adresi zaten düzgün görünüyor');
    console.log('⚠️  Sorun başka bir yerde olabilir\n');
    console.log('📝 Supabase Dashboard\'dan yeni connection string alın:');
    console.log('   1. https://supabase.com/dashboard');
    console.log('   2. Settings → Database → Connection string');
    console.log('   3. Connection pooling → Transaction modu');
    console.log('   4. URI formatını kopyalayın');
    console.log('   5. .env dosyasına yapıştırın\n');
}

console.log('💡 Test için: node fix-database-connection.js');
