const API_KEY = '4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f';
const BASE_URL = 'https://api.teamflect.com/api/v1';

const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
};

async function testEndpoint(name, endpoint, params = '') {
  const url = `${BASE_URL}${endpoint}${params}`;
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url, { method: 'GET', headers });
    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ SUCCESS!`);
      console.log(`Data Type: ${Array.isArray(data) ? 'Array' : typeof data}`);
      console.log(`Items: ${Array.isArray(data) ? data.length : 'N/A'}`);

      if (Array.isArray(data) && data.length > 0) {
        console.log(`First Item Keys:`, Object.keys(data[0]).slice(0, 10).join(', '));
        console.log(`Sample:`, JSON.stringify(data[0], null, 2).substring(0, 300));
      }
      return { success: true, data };
    } else {
      const error = await response.text();
      console.log(`❌ FAILED: ${error}`);
      return { success: false, error };
    }
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('\n🚀 TEAMFLECT API - REAL DATA TEST');
  console.log('='.repeat(70));

  const results = {
    goals: await testEndpoint('Goals', '/goal/getGoals', '?limit=10'),
    tasks: await testEndpoint('Tasks', '/task/getTasks', '?limit=10'),
    feedback: await testEndpoint('Feedback', '/feedback/getFeedbacks', '?limit=10'),
    recognitions: await testEndpoint('Recognitions', '/recognition/getRecognitions', '?limit=10'),
    users: await testEndpoint('Users', '/user/getUsers', '?limit=10'),
  };

  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));

  const passed = Object.values(results).filter(r => r.success).length;
  const total = Object.keys(results).length;

  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${((passed/total)*100).toFixed(0)}%`);

  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! API is fully operational!');
  } else {
    console.log('\n⚠️ Some endpoints failed. Check details above.');
  }

  return results;
}

runTests().catch(console.error);
