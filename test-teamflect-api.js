const API_KEY = '4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f';
const BASE_URL = 'https://api.teamflect.com';

const headers = {
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
};

// Test different endpoints
const endpoints = [
  '/user',
  '/users',
  '/goal',
  '/goals',
  '/feedback',
  '/feedbacks',
  '/recognition',
  '/recognitions',
  '/task',
  '/tasks',
  '/review',
  '/reviews',
  '/team',
  '/teams',
  '/metric',
  '/metrics',
  '/api/v1/user',
  '/api/v1/users',
  '/api/v1/goals',
  '/api/user',
  '/api/users',
];

async function testEndpoint(endpoint) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: headers,
    });

    const status = response.status;
    const contentType = response.headers.get('content-type');

    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return { endpoint, status, success: response.ok, data };
  } catch (error) {
    return { endpoint, status: 'error', error: error.message };
  }
}

async function main() {
  console.log('Testing Teamflect API endpoints...\n');

  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    console.log(`\n========================================`);
    console.log(`Endpoint: ${result.endpoint}`);
    console.log(`Status: ${result.status}`);
    if (result.success) {
      console.log(`Data:`, JSON.stringify(result.data, null, 2).substring(0, 500));
    } else {
      console.log(`Error:`, JSON.stringify(result.error || result.data, null, 2));
    }
  }
}

main();
