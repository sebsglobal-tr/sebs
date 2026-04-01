import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkRoleColumn() {
  try {
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@sebs.com' },
      select: { id: true, email: true, role: true }
    });
    
    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log('   Email:', adminUser.email);
      console.log('   Role:', adminUser.role || 'NOT SET');
      
      if (!adminUser.role || adminUser.role !== 'admin') {
        console.log('\n⚠️ Role is not admin, updating...');
        await prisma.user.update({
          where: { email: 'admin@sebs.com' },
          data: { role: 'admin' }
        });
        console.log('✅ Role updated to admin');
      }
    } else {
      console.log('❌ Admin user not found');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRoleColumn();
