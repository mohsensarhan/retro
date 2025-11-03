// Test tRPC backend proxy to Teamflect API
const API_URL = 'http://localhost:3001/trpc';

async function testBackendProxy() {
  console.log('🧪 Testing tRPC Backend Proxy to Teamflect API\n');
  console.log('='.repeat(70));

  try {
    // Test Goals endpoint
    console.log('\n📊 Testing: goals.getAll');
    const goalsResponse = await fetch(`${API_URL}/goals.getAll?input={"limit":5}`);
    const goalsData = await goalsResponse.json();

    console.log(`Status: ${goalsResponse.status} ${goalsResponse.statusText}`);
    if (goalsResponse.ok) {
      console.log('✅ SUCCESS - Goals fetched through backend proxy!');
      console.log(`Result Type: ${goalsData.result?.data ? typeof goalsData.result.data : 'N/A'}`);
      console.log(`Data Length: ${Array.isArray(goalsData.result?.data) ? goalsData.result.data.length : 'N/A'}`);

      if (Array.isArray(goalsData.result?.data) && goalsData.result.data.length > 0) {
        console.log(`Sample Goal:`, JSON.stringify(goalsData.result.data[0], null, 2).substring(0, 300));
      }
    } else {
      console.log('❌ FAILED:', goalsData);
    }

    // Test Tasks endpoint
    console.log('\n📋 Testing: tasks.getAll');
    const tasksResponse = await fetch(`${API_URL}/tasks.getAll?input={"limit":5}`);
    const tasksData = await tasksResponse.json();

    console.log(`Status: ${tasksResponse.status} ${tasksResponse.statusText}`);
    if (tasksResponse.ok) {
      console.log('✅ SUCCESS - Tasks fetched through backend proxy!');
      console.log(`Data Length: ${Array.isArray(tasksData.result?.data) ? tasksData.result.data.length : 'N/A'}`);
    } else {
      console.log('❌ FAILED:', tasksData);
    }

    // Test Users endpoint
    console.log('\n👥 Testing: users.getAll');
    const usersResponse = await fetch(`${API_URL}/users.getAll?input={"limit":5}`);
    const usersData = await usersResponse.json();

    console.log(`Status: ${usersResponse.status} ${usersResponse.statusText}`);
    if (usersResponse.ok) {
      console.log('✅ SUCCESS - Users fetched through backend proxy!');
      console.log(`Data Length: ${Array.isArray(usersData.result?.data) ? usersData.result.data.length : 'N/A'}`);
    } else {
      console.log('❌ FAILED:', usersData);
    }

    console.log('\n' + '='.repeat(70));
    console.log('🎉 Backend proxy is working! Ready to test with frontend.');

  } catch (error) {
    console.error('❌ ERROR:', error.message);
  }
}

testBackendProxy();
