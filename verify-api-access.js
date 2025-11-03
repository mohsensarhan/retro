#!/usr/bin/env node

/**
 * Direct API Test - Bypasses tRPC to test raw Teamflect API access
 * Run with: node verify-api-access.js
 */

const API_KEYS = [
  '4d73e4a8ce78:67cd7212-b035-4b25-a12b-26c840df469f',
  '4d73e4a8ce78:d830cfb1-8c29-4719-8096-a0e0fd2876ba'
];

const BASE_URL = 'https://api.teamflect.com/api/v1';

async function testWithKey(apiKey, keyIndex) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`Testing with API Key #${keyIndex + 1}: ${apiKey.substring(0, 12)}...`);
  console.log('='.repeat(70));

  const endpoints = [
    { name: 'Goals', path: '/goal/getGoals?limit=3' },
    { name: 'Tasks', path: '/task/getTasks?limit=3' },
    { name: 'Users', path: '/user/getUsers?limit=3' },
    { name: 'Feedback', path: '/feedback/getFeedbacks?limit=3' },
    { name: 'Recognitions', path: '/recognition/getRecognitions?limit=3' },
  ];

  for (const endpoint of endpoints) {
    const url = `${BASE_URL}${endpoint.path}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint.name}: SUCCESS (${response.status})`);

        if (Array.isArray(data)) {
          console.log(`   📊 Retrieved ${data.length} items`);
          if (data.length > 0) {
            console.log(`   📄 Sample: ${JSON.stringify(data[0]).substring(0, 100)}...`);
          }
        } else if (typeof data === 'object') {
          console.log(`   📊 Data keys: ${Object.keys(data).join(', ')}`);
        }
      } else {
        const errorText = await response.text();
        console.log(`❌ ${endpoint.name}: FAILED (${response.status})`);
        console.log(`   Error: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ERROR`);
      console.log(`   ${error.message}`);
    }
  }
}

async function main() {
  console.log('\n🧪 Teamflect API Direct Access Verification\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`Testing ${API_KEYS.length} API keys...\n`);

  for (let i = 0; i < API_KEYS.length; i++) {
    await testWithKey(API_KEYS[i], i);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✨ Test Complete\n');
}

main();
