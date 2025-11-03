const API_KEY = '4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f';
const BASE_URL = 'https://api.teamflect.com';

const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
};

async function testEndpoint(name, url, method = 'GET', body = null) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing: ${name}`);
  console.log(`URL: ${url}`);
  console.log(`Method: ${method}`);

  try {
    const options = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const status = response.status;
    const statusText = response.statusText;

    console.log(`Status: ${status} ${statusText}`);

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`✅ SUCCESS`);
        console.log(`Response Type: ${Array.isArray(data) ? 'Array' : typeof data}`);
        console.log(`Data Length: ${Array.isArray(data) ? data.length : 'N/A'}`);

        if (Array.isArray(data) && data.length > 0) {
          console.log(`First Item Keys:`, Object.keys(data[0]));
          console.log(`Sample Data:`, JSON.stringify(data[0], null, 2).substring(0, 500));
        } else if (typeof data === 'object' && data !== null) {
          console.log(`Response Keys:`, Object.keys(data));
          console.log(`Sample Data:`, JSON.stringify(data, null, 2).substring(0, 500));
        }

        return { success: true, data, status };
      } else {
        const text = await response.text();
        console.log(`✅ SUCCESS (Text Response)`);
        console.log(`Response:`, text.substring(0, 200));
        return { success: true, data: text, status };
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ FAILED`);
      console.log(`Error:`, errorText);
      return { success: false, error: errorText, status };
    }
  } catch (error) {
    console.log(`❌ ERROR`);
    console.log(`Error Message:`, error.message);
    return { success: false, error: error.message, status: 'ERROR' };
  }
}

async function runE2ETests() {
  console.log('\n🚀 TEAMFLECT API E2E TEST SUITE');
  console.log('=' .repeat(60));
  console.log('Testing real API endpoints with actual credentials...\n');

  const results = {
    goals: null,
    tasks: null,
    feedback: null,
    recognitions: null,
    users: null,
    reviews: null,
  };

  // Test 1: Goals endpoint
  results.goals = await testEndpoint(
    'Goals - Get All',
    `${BASE_URL}/goal/getGoals`
  );

  // Test with filters
  await testEndpoint(
    'Goals - With Limit',
    `${BASE_URL}/goal/getGoals?limit=5`
  );

  // Test 2: Tasks endpoint
  results.tasks = await testEndpoint(
    'Tasks - Get All',
    `${BASE_URL}/task`
  );

  // Test 3: Feedback endpoint
  results.feedback = await testEndpoint(
    'Feedback - Get All',
    `${BASE_URL}/feedback`
  );

  // Test 4: Recognitions endpoint
  results.recognitions = await testEndpoint(
    'Recognitions - Get All',
    `${BASE_URL}/recognition`
  );

  // Test 5: Users endpoint
  results.users = await testEndpoint(
    'Users - Get All',
    `${BASE_URL}/user`
  );

  // Test 6: Reviews endpoint
  results.reviews = await testEndpoint(
    'Reviews - Get All',
    `${BASE_URL}/review`
  );

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const summary = Object.entries(results).map(([key, result]) => ({
    endpoint: key,
    status: result?.success ? '✅ PASS' : '❌ FAIL',
    dataCount: Array.isArray(result?.data) ? result.data.length : 'N/A',
  }));

  console.table(summary);

  // Detailed data analysis
  console.log('\n📈 DATA ANALYSIS');
  console.log('='.repeat(60));

  if (results.goals?.success && results.goals.data) {
    const goals = Array.isArray(results.goals.data) ? results.goals.data : [];
    console.log(`\n🎯 Goals Data:`);
    console.log(`  - Total Goals: ${goals.length}`);
    if (goals.length > 0) {
      const statuses = goals.map(g => g.status).filter(Boolean);
      const uniqueStatuses = [...new Set(statuses)];
      console.log(`  - Statuses Found: ${uniqueStatuses.join(', ') || 'None'}`);
      console.log(`  - Sample Goal Title: "${goals[0].title || 'N/A'}"`);
    }
  }

  if (results.tasks?.success && results.tasks.data) {
    const tasks = Array.isArray(results.tasks.data) ? results.tasks.data : [];
    console.log(`\n✅ Tasks Data:`);
    console.log(`  - Total Tasks: ${tasks.length}`);
    if (tasks.length > 0) {
      const statuses = tasks.map(t => t.status).filter(Boolean);
      const uniqueStatuses = [...new Set(statuses)];
      console.log(`  - Statuses Found: ${uniqueStatuses.join(', ') || 'None'}`);
    }
  }

  if (results.users?.success && results.users.data) {
    const users = Array.isArray(results.users.data) ? results.users.data : [];
    console.log(`\n👥 Users Data:`);
    console.log(`  - Total Users: ${users.length}`);
    if (users.length > 0) {
      console.log(`  - Sample User: ${users[0].displayName || 'N/A'}`);
    }
  }

  if (results.feedback?.success && results.feedback.data) {
    const feedback = Array.isArray(results.feedback.data) ? results.feedback.data : [];
    console.log(`\n💬 Feedback Data:`);
    console.log(`  - Total Feedback: ${feedback.length}`);
  }

  if (results.recognitions?.success && results.recognitions.data) {
    const recognitions = Array.isArray(results.recognitions.data) ? results.recognitions.data : [];
    console.log(`\n🏆 Recognitions Data:`);
    console.log(`  - Total Recognitions: ${recognitions.length}`);
  }

  // Final verdict
  console.log('\n' + '='.repeat(60));
  console.log('🎯 FINAL VERDICT');
  console.log('='.repeat(60));

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r?.success).length;
  const failedTests = totalTests - passedTests;

  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests} ✅`);
  console.log(`Failed: ${failedTests} ❌`);
  console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Dashboard is ready to use with real data.');
  } else if (passedTests > 0) {
    console.log('\n⚠️  PARTIAL SUCCESS - Some endpoints working, others need attention.');
  } else {
    console.log('\n❌ ALL TESTS FAILED - API credentials or endpoints may need verification.');
  }

  return results;
}

// Run the tests
runE2ETests().catch(console.error);
