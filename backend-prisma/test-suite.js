// Comprehensive Test Suite for SEBS Global
// Production Pre-Release Testing

import { PrismaClient } from '@prisma/client';
// Use global fetch if available (Node 18+), otherwise use node-fetch
const fetch = globalThis.fetch || (await import('node-fetch')).default;

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:8006/api';
const TEST_EMAIL = `test_${Date.now()}@test.com`;
const TEST_PASSWORD = 'Test1234!';

const results = {
  passed: [],
  failed: [],
  total: 0
};

// Test Helper Functions
async function test(name, testFn) {
  results.total++;
  try {
    await testFn();
    results.passed.push(name);
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    results.failed.push({ name, error: error.message });
    console.error(`❌ ${name}: ${error.message}`);
    return false;
  }
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// ============================================
// TEST SUITE
// ============================================

async function runTests() {
  console.log('🧪 SEBS Global - Production Test Suite');
  console.log('=====================================\n');

  // ============================================
  // 1. DATABASE TESTS
  // ============================================
  console.log('📊 1. DATABASE TESTS\n');

  await test('Database connection', async () => {
    await prisma.$queryRaw`SELECT 1`;
  });

  await test('Users table exists', async () => {
    const count = await prisma.user.count();
    expect(count >= 0, 'Users table should be accessible');
  });

  await test('Courses table exists', async () => {
    const count = await prisma.course.count();
    expect(count >= 0, 'Courses table should be accessible');
  });

  await test('Modules table exists', async () => {
    const count = await prisma.module.count();
    expect(count >= 0, 'Modules table should be accessible');
  });

  // ============================================
  // 2. AUTHENTICATION TESTS
  // ============================================
  console.log('\n🔐 2. AUTHENTICATION TESTS\n');

  let authToken = null;
  let userId = null;

  await test('User registration', async () => {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        firstName: 'Test',
        lastName: 'User'
      })
    });
    const data = await response.json();
    expect(data.success, `Registration failed: ${data.message}`);
  });

  await test('User login', async () => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      })
    });
    const data = await response.json();
    expect(data.success, `Login failed: ${data.message}`);
    expect(data.data.tokens?.accessToken || data.data.token, 'Token not received');
    authToken = data.data.tokens?.accessToken || data.data.token;
    userId = data.data.user?.publicId || data.data.user?.id;
  });

  await test('Invalid credentials rejection', async () => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: TEST_EMAIL,
        password: 'WrongPassword123!'
      })
    });
    const data = await response.json();
    expect(!data.success, 'Should reject invalid credentials');
  });

  await test('Get current user', async () => {
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const data = await response.json();
    expect(data.success, 'Should get user data');
    expect(data.data.email === TEST_EMAIL, 'Email should match');
  });

  // ============================================
  // 3. API ENDPOINT TESTS
  // ============================================
  console.log('\n🔌 3. API ENDPOINT TESTS\n');

  await test('Health check endpoint', async () => {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    expect(data.status === 'healthy', 'Health check should return healthy');
  });

  await test('Get courses', async () => {
    const response = await fetch(`${API_BASE}/courses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const data = await response.json();
    expect(data.success, 'Should get courses');
    expect(Array.isArray(data.data), 'Courses should be an array');
  });

  await test('Get progress overview', async () => {
    const response = await fetch(`${API_BASE}/progress/overview`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const data = await response.json();
    expect(data.success, 'Should get progress overview');
  });

  await test('Get simulations', async () => {
    const response = await fetch(`${API_BASE}/simulations`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    const data = await response.json();
    expect(data.success, 'Should get simulations');
  });

  await test('Get available packages', async () => {
    const response = await fetch(`${API_BASE}/purchases/packages`);
    const data = await response.json();
    expect(data.success, 'Should get packages');
  });

  // ============================================
  // 4. ADMIN PANEL TESTS
  // ============================================
  console.log('\n👑 4. ADMIN PANEL TESTS\n');

  // Create admin user first
  let adminToken = null;
  try {
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@sebs.com' }
    });
    
    if (adminUser) {
      const loginResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@sebs.com',
          password: 'Admin123!'
        })
      });
      const loginData = await loginResponse.json();
      if (loginData.success) {
        adminToken = loginData.data.tokens?.accessToken || loginData.data.token;
      }
    }
  } catch (error) {
    console.log('⚠️ Admin user not available for testing');
  }

  if (adminToken) {
    await test('Admin dashboard stats', async () => {
      const response = await fetch(`${API_BASE}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await response.json();
      expect(data.success, 'Should get admin dashboard stats');
      expect(data.data.kpis, 'Should have KPIs');
    });

    await test('Admin users list', async () => {
      const response = await fetch(`${API_BASE}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      const data = await response.json();
      expect(data.success, 'Should get admin users list');
    });
  } else {
    console.log('⚠️ Skipping admin tests - admin token not available');
  }

  // ============================================
  // 5. SECURITY TESTS
  // ============================================
  console.log('\n🔒 5. SECURITY TESTS\n');

  await test('Unauthorized access prevention', async () => {
    const response = await fetch(`${API_BASE}/users/me`);
    expect(response.status === 401, 'Should require authentication');
  });

  await test('Invalid token rejection', async () => {
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: {
        'Authorization': 'Bearer invalid_token_12345'
      }
    });
    expect(response.status === 401 || response.status === 403, 'Should reject invalid token');
  });

  // ============================================
  // 6. ERROR HANDLING TESTS
  // ============================================
  console.log('\n⚠️ 6. ERROR HANDLING TESTS\n');

  await test('404 for non-existent endpoint', async () => {
    const response = await fetch(`${API_BASE}/nonexistent/endpoint`);
    expect(response.status === 404, 'Should return 404 for non-existent endpoint');
  });

  await test('Malformed request handling', async () => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json{'
    });
    expect(response.status >= 400, 'Should handle malformed JSON');
  });

  // ============================================
  // TEST SUMMARY
  // ============================================
  console.log('\n=====================================');
  console.log('📊 TEST SUMMARY');
  console.log('=====================================');
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`Success Rate: ${((results.passed.length / results.total) * 100).toFixed(1)}%\n`);

  if (results.failed.length > 0) {
    console.log('FAILED TESTS:');
    results.failed.forEach(({ name, error }) => {
      console.log(`  ❌ ${name}: ${error}`);
    });
  }

  // Cleanup
  try {
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'test_' } }
    });
  } catch (error) {
    // Ignore cleanup errors
  }

  await prisma.$disconnect();
  
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
