// Create or update admin user script
import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/utils/password.js';
import { generateULID } from './src/utils/ulid.js';

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    console.log('🚀 Creating/updating admin user...\n');
    
    const adminEmail = 'admin@sebs.com';
    const adminPassword = 'Admin123!';
    
    // Check if admin user exists
    let adminUser = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (adminUser) {
      console.log('ℹ️ Admin user already exists, updating password and role...');
      
      // Hash new password
      const passwordHash = await hashPassword(adminPassword);
      
      // Update user to admin
      adminUser = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          passwordHash: passwordHash,
          role: 'admin',
          isActive: true,
          isVerified: true
        }
      });
      
      console.log('✅ Admin user updated successfully!');
    } else {
      console.log('📝 Creating new admin user...');
      
      // Hash password
      const passwordHash = await hashPassword(adminPassword);
      const publicId = generateULID();
      
      // Create admin user
      adminUser = await prisma.user.create({
        data: {
          publicId: publicId,
          email: adminEmail,
          passwordHash: passwordHash,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isVerified: true,
          isActive: true,
          accessLevel: 'advanced'
        }
      });
      
      console.log('✅ Admin user created successfully!');
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 ADMIN LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role:     ${adminUser.role}`);
    console.log(`   PublicID: ${adminUser.publicId}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Also check for admin email from environment and make it admin if it exists
    const adminEmailFromEnv = process.env.ADMIN_EMAIL;
    if (adminEmailFromEnv) {
      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmailFromEnv }
      });
      
      if (existingUser) {
        console.log(`ℹ️ Found ${adminEmailFromEnv}, updating to admin...`);
        await prisma.user.update({
          where: { email: adminEmailFromEnv },
          data: { role: 'admin' }
        });
        console.log(`✅ ${adminEmailFromEnv} is now admin`);
        console.log('   (You need to know the password for this account)');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
