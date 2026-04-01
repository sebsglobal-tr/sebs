// Test User Registration Flow
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const API_BASE = 'http://localhost:8006/api';
const prisma = new PrismaClient();

async function testRegistration() {
  console.log('🧪 Kullanıcı Kayıt Testi\n');
  
  const testEmail = `test-reg-${Date.now()}@test.com`;
  const testData = {
    email: testEmail,
    password: 'Test123456',
    firstName: 'Test',
    lastName: 'Kullanıcı',
    phone: '5551234567'
  };

  try {
    // 1. Kayıt öncesi kullanıcı sayısı
    const beforeCount = await prisma.user.count();
    console.log(`📊 Kayıt öncesi kullanıcı sayısı: ${beforeCount}`);

    // 2. API'ye kayıt isteği
    console.log(`\n📝 API'ye kayıt isteği gönderiliyor...`);
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Kayıt başarısız: ${result.message}`);
    }

    console.log(`✅ API Yanıtı: ${result.message}`);
    console.log(`   Kullanıcı ID: ${result.data.user.publicId}`);
    console.log(`   Email: ${result.data.user.email}`);
    console.log(`   Verification Code: ${result.data.verificationCode} (test için)`);

    // 3. Veritabanında kontrol
    console.log(`\n🔍 Veritabanında kontrol ediliyor...`);
    const afterCount = await prisma.user.count();
    console.log(`📊 Kayıt sonrası kullanıcı sayısı: ${afterCount}`);

    // 4. Kullanıcıyı veritabanından bul
    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
      select: {
        id: true,
        publicId: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        isVerified: true,
        isActive: true,
        role: true,
        accessLevel: true,
        createdAt: true,
        verificationCode: true
      }
    });

    if (!dbUser) {
      throw new Error('❌ Kullanıcı veritabanında bulunamadı!');
    }

    console.log(`\n✅ Veritabanında kullanıcı bulundu:`);
    console.log(`   ID: ${dbUser.id}`);
    console.log(`   Public ID: ${dbUser.publicId}`);
    console.log(`   Email: ${dbUser.email}`);
    console.log(`   İsim: ${dbUser.firstName} ${dbUser.lastName}`);
    console.log(`   Telefon: ${dbUser.phone}`);
    console.log(`   Doğrulanmış: ${dbUser.isVerified ? 'Evet' : 'Hayır'}`);
    console.log(`   Aktif: ${dbUser.isActive ? 'Evet' : 'Hayır'}`);
    console.log(`   Rol: ${dbUser.role}`);
    console.log(`   Access Level: ${dbUser.accessLevel}`);
    console.log(`   Kayıt Tarihi: ${dbUser.createdAt.toLocaleString('tr-TR')}`);
    console.log(`   Doğrulama Kodu: ${dbUser.verificationCode ? 'Var' : 'Yok'}`);

    // 5. Veri doğrulama
    console.log(`\n🔍 Veri Doğrulama:`);
    
    const checks = [
      { name: 'Email eşleşiyor', pass: dbUser.email === testData.email },
      { name: 'İsim eşleşiyor', pass: dbUser.firstName === testData.firstName },
      { name: 'Soyisim eşleşiyor', pass: dbUser.lastName === testData.lastName },
      { name: 'Telefon eşleşiyor', pass: dbUser.phone === testData.phone },
      { name: 'isVerified false', pass: dbUser.isVerified === false },
      { name: 'isActive true', pass: dbUser.isActive === true },
      { name: 'Role user', pass: dbUser.role === 'user' },
      { name: 'AccessLevel beginner', pass: dbUser.accessLevel === 'beginner' },
      { name: 'Verification code var', pass: dbUser.verificationCode !== null },
      { name: 'Kullanıcı sayısı arttı', pass: afterCount === beforeCount + 1 }
    ];

    let allPassed = true;
    checks.forEach(check => {
      const status = check.pass ? '✅' : '❌';
      console.log(`   ${status} ${check.name}`);
      if (!check.pass) allPassed = false;
    });

    // 6. Refresh token kontrolü
    const refreshToken = await prisma.refreshToken.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: 'desc' }
    });

    if (refreshToken) {
      console.log(`\n✅ Refresh Token oluşturuldu:`);
      console.log(`   Token ID: ${refreshToken.id}`);
      console.log(`   Expires At: ${refreshToken.expiresAt.toLocaleString('tr-TR')}`);
    } else {
      console.log(`\n⚠️  Refresh Token bulunamadı`);
    }

    console.log(`\n${'='.repeat(50)}`);
    if (allPassed) {
      console.log(`✅ TÜM KONTROLLER BAŞARILI!`);
      console.log(`✅ Kullanıcı başarıyla veritabanına kaydedildi.`);
    } else {
      console.log(`❌ Bazı kontroller başarısız!`);
    }
    console.log(`${'='.repeat(50)}\n`);

    // Temizlik
    console.log('🧹 Test kullanıcısı temizleniyor...');
    await prisma.refreshToken.deleteMany({ where: { userId: dbUser.id } });
    await prisma.user.delete({ where: { id: dbUser.id } });
    console.log('✅ Test kullanıcısı silindi\n');

  } catch (error) {
    console.error(`\n❌ Hata: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testRegistration();
