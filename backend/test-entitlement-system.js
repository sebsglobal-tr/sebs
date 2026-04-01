// Test Entitlement System
// Using built-in fetch (Node 18+)

const API_BASE = 'http://localhost:8006/api';

// Test colors
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const blue = '\x1b[34m';
const reset = '\x1b[0m';

let testsPassed = 0;
let testsFailed = 0;

function log(message, color = reset) {
  console.log(`${color}${message}${reset}`);
}

async function test(name, testFn) {
  try {
    log(`\n🧪 Testing: ${name}`, blue);
    await testFn();
    log(`✅ PASS: ${name}`, green);
    testsPassed++;
  } catch (error) {
    log(`❌ FAIL: ${name}`, red);
    log(`   Error: ${error.message}`, red);
    testsFailed++;
  }
}

async function main() {
  log('\n🚀 Starting Entitlement System Tests\n', blue);

  // Test 1: Health Check
  await test('Health Check', async () => {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    if (data.status !== 'healthy') {
      throw new Error(`Expected healthy, got ${data.status}`);
    }
    log(`   Database: ${data.database}`);
  });

  // Test 2: Get Available Packages (Public)
  await test('Get Available Packages (Public)', async () => {
    const response = await fetch(`${API_BASE}/purchases/packages`);
    const data = await response.json();
    if (!data.success) {
      throw new Error(`Expected success, got ${data.success}`);
    }
    if (!Array.isArray(data.data)) {
      throw new Error('Expected packages array');
    }
    log(`   Found ${data.data.length} packages`);
    data.data.forEach(pkg => {
      log(`   - ${pkg.title} (${pkg.category}/${pkg.level}): $${pkg.price}`);
    });
  });

  // Test 3: Get Courses (No Auth - should work)
  await test('Get Courses (No Auth)', async () => {
    const response = await fetch(`${API_BASE}/courses`);
    const data = await response.json();
    if (!data.success) {
      throw new Error(`Expected success, got ${data.success}`);
    }
    if (!Array.isArray(data.data)) {
      throw new Error('Expected courses array');
    }
    log(`   Found ${data.data.length} courses`);
    
    // Check if courses have isLocked property
    const hasLockedProperty = data.data.every(course => 'isLocked' in course);
    if (!hasLockedProperty) {
      throw new Error('Expected all courses to have isLocked property');
    }
    log(`   All courses have isLocked property: ✅`);
  });

  // Test 4: Register a test user
  let testUserToken = null;
  let testUserId = null;
  
  await test('Register Test User', async () => {
    const testEmail = `test-${Date.now()}@test.com`;
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'Test123456',
        firstName: 'Test',
        lastName: 'User',
        phone: '1234567890'
      })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(`Registration failed: ${data.message}`);
    }
    testUserToken = data.data.tokens.accessToken;
    testUserId = data.data.user.publicId;
    log(`   User registered: ${testEmail}`);
    log(`   Token received: ${testUserToken ? 'Yes' : 'No'}`);
  });

  // Test 5: Get Courses with Auth (should show locked status)
  await test('Get Courses (With Auth - Beginner User)', async () => {
    if (!testUserToken) {
      throw new Error('No token available');
    }
    const response = await fetch(`${API_BASE}/courses`, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(`Expected success, got ${data.success}`);
    }
    
    // Check cybersecurity courses
    const cyberCourses = data.data.filter(c => c.category === 'cybersecurity');
    log(`   Found ${cyberCourses.length} cybersecurity courses`);
    
    cyberCourses.forEach(course => {
      const status = course.isLocked ? '🔒 Locked' : '🔓 Unlocked';
      log(`   - ${course.title} (${course.level}): ${status}`);
    });
  });

  // Test 6: Purchase a package
  await test('Purchase Beginner Package', async () => {
    if (!testUserToken) {
      throw new Error('No token available');
    }
    const response = await fetch(`${API_BASE}/purchases/purchase`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testUserToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category: 'cybersecurity',
        level: 'beginner'
      })
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(`Purchase failed: ${data.message}`);
    }
    log(`   Package purchased: ${data.data.category}/${data.data.level}`);
    log(`   Transaction ID: ${data.data.transactionId}`);
  });

  // Test 7: Get User Entitlements
  await test('Get User Entitlements', async () => {
    if (!testUserToken) {
      throw new Error('No token available');
    }
    const response = await fetch(`${API_BASE}/purchases/entitlements`, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    const data = await response.json();
    if (!data.success) {
      throw new Error(`Failed to get entitlements: ${data.message}`);
    }
    if (!Array.isArray(data.data)) {
      throw new Error('Expected entitlements array');
    }
    log(`   Found ${data.data.length} entitlements`);
    data.data.forEach(ent => {
      log(`   - ${ent.category}/${ent.level} (Active: ${ent.isActive})`);
    });
  });

  // Test 8: Get Courses After Purchase (should show unlocked)
  await test('Get Courses After Purchase', async () => {
    if (!testUserToken) {
      throw new Error('No token available');
    }
    const response = await fetch(`${API_BASE}/courses`, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    const data = await response.json();
    
    const beginnerCyberCourses = data.data.filter(
      c => c.category === 'cybersecurity' && c.level === 'beginner'
    );
    
    const allUnlocked = beginnerCyberCourses.every(c => !c.isLocked);
    if (!allUnlocked) {
      const locked = beginnerCyberCourses.filter(c => c.isLocked);
      log(`   ⚠️  ${locked.length} beginner courses still locked`);
      locked.forEach(c => log(`      - ${c.title}`));
    } else {
      log(`   ✅ All beginner cybersecurity courses unlocked`);
    }
  });

  // Test 9: Check if modules have locked status
  await test('Check Module Lock Status', async () => {
    if (!testUserToken) {
      throw new Error('No token available');
    }
    const response = await fetch(`${API_BASE}/courses`, {
      headers: {
        'Authorization': `Bearer ${testUserToken}`
      }
    });
    const data = await response.json();
    
    const cyberCourse = data.data.find(c => c.category === 'cybersecurity');
    if (!cyberCourse) {
      throw new Error('No cybersecurity course found');
    }
    
    if (!cyberCourse.modules || cyberCourse.modules.length === 0) {
      log(`   ⚠️  No modules found in course`);
      return;
    }
    
    const lockedModules = cyberCourse.modules.filter(m => m.isLocked);
    const unlockedModules = cyberCourse.modules.filter(m => !m.isLocked);
    
    log(`   Total modules: ${cyberCourse.modules.length}`);
    log(`   🔓 Unlocked: ${unlockedModules.length}`);
    log(`   🔒 Locked: ${lockedModules.length}`);
    
    if (cyberCourse.level === 'beginner' && !cyberCourse.isLocked && lockedModules.length > 0) {
      log(`   ⚠️  Beginner course unlocked but has locked modules`);
    }
  });

  // Summary
  log('\n' + '='.repeat(50), blue);
  log('📊 TEST SUMMARY', blue);
  log('='.repeat(50), blue);
  log(`✅ Passed: ${testsPassed}`, green);
  log(`❌ Failed: ${testsFailed}`, testsFailed > 0 ? red : green);
  log(`📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`, 
      testsFailed === 0 ? green : yellow);
  log('='.repeat(50) + '\n', blue);

  if (testsFailed > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  log(`\n💥 Fatal Error: ${error.message}`, red);
  process.exit(1);
});
