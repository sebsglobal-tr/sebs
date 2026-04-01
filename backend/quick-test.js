// Quick test of key endpoints
const API_BASE = 'http://localhost:8006/api';

async function test() {
  console.log('🧪 Quick API Test\n');

  // Test 1: Health
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    console.log('✅ Health:', data.status);
  } catch (e) {
    console.log('❌ Health:', e.message);
  }

  // Test 2: Packages
  try {
    const res = await fetch(`${API_BASE}/purchases/packages`);
    const data = await res.json();
    console.log('✅ Packages:', data.success ? `${data.data?.length || 0} packages` : data.message);
  } catch (e) {
    console.log('❌ Packages:', e.message);
  }

  // Test 3: Courses
  try {
    const res = await fetch(`${API_BASE}/courses`);
    const data = await res.json();
    console.log('✅ Courses:', data.success ? `${data.data?.length || 0} courses` : data.message);
  } catch (e) {
    console.log('❌ Courses:', e.message);
  }

  console.log('\n✅ Test completed!');
}

test();
