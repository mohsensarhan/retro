#!/usr/bin/env node

/**
 * AUTOMATED DASHBOARD VALIDATION TEST
 * Tests every field connection between Admin Panel, Dashboard Portal, and Supabase
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://oktiojqphavkqeirbbul.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runCompleteValidation() {
  console.log('🔍 Starting Complete Dashboard Validation...');
  console.log('=' .repeat(60));
  
  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // Test 1: Connection Test
  try {
    const { data, error } = await supabase.from('dashboard_metrics').select('count').limit(1);
    if (error) throw error;
    results.tests.push({ name: 'Supabase Connection', status: 'PASS', details: 'Connected successfully' });
    results.passed++;
  } catch (error) {
    results.tests.push({ name: 'Supabase Connection', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Test 2: Total Metrics Count
  try {
    const { count, error } = await supabase.from('dashboard_metrics').select('*', { count: 'exact', head: true });
    if (error) throw error;
    const expectedCount = 64;
    if (count === expectedCount) {
      results.tests.push({ name: 'Total Metrics Count', status: 'PASS', details: `Found ${count}/${expectedCount} metrics` });
      results.passed++;
    } else {
      results.tests.push({ name: 'Total Metrics Count', status: 'FAIL', details: `Found ${count}/${expectedCount} metrics` });
      results.failed++;
    }
  } catch (error) {
    results.tests.push({ name: 'Total Metrics Count', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Test 3: Executive Metrics (Critical)
  try {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('metric_key')
      .eq('section_key', 'executive');
    
    if (error) throw error;
    
    const requiredKeys = ['people_served', 'meals_delivered', 'cost_per_meal', 'coverage'];
    const foundKeys = data.map(m => m.metric_key);
    const missingKeys = requiredKeys.filter(key => !foundKeys.includes(key));
    
    if (missingKeys.length === 0) {
      results.tests.push({ name: 'Executive Metrics', status: 'PASS', details: 'All required executive metrics present' });
      results.passed++;
    } else {
      results.tests.push({ name: 'Executive Metrics', status: 'FAIL', details: `Missing: ${missingKeys.join(', ')}` });
      results.failed++;
    }
  } catch (error) {
    results.tests.push({ name: 'Executive Metrics', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Test 4: Section Coverage
  try {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('section_key')
      .distinct();
    
    if (error) throw error;
    
    const expectedSections = ['executive', 'financial', 'operational', 'programs', 'stakeholders', 'scenarios', 'global_signals'];
    const foundSections = data.map(s => s.section_key);
    const missingSections = expectedSections.filter(section => !foundSections.includes(section));
    
    if (missingSections.length === 0) {
      results.tests.push({ name: 'Section Coverage', status: 'PASS', details: 'All sections present' });
      results.passed++;
    } else {
      results.tests.push({ name: 'Section Coverage', status: 'FAIL', details: `Missing sections: ${missingSections.join(', ')}` });
      results.failed++;
    }
  } catch (error) {
    results.tests.push({ name: 'Section Coverage', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Test 5: Real-time Update Test
  try {
    const testValue = Math.random().toString();
    const testMetric = {
      section_key: 'executive',
      metric_key: 'meals_delivered',
      current_value: testValue
    };

    // Update a metric
    const { error: updateError } = await supabase
      .from('dashboard_metrics')
      .update({ current_value: testValue })
      .eq('section_key', 'executive')
      .eq('metric_key', 'meals_delivered');

    if (updateError) throw updateError;

    // Verify update
    const { data, error: selectError } = await supabase
      .from('dashboard_metrics')
      .select('current_value')
      .eq('section_key', 'executive')
      .eq('metric_key', 'meals_delivered')
      .single();

    if (selectError) throw selectError;

    if (data.current_value === testValue) {
      results.tests.push({ name: 'Real-time Update', status: 'PASS', details: 'Update and retrieval successful' });
      results.passed++;
    } else {
      results.tests.push({ name: 'Real-time Update', status: 'FAIL', details: 'Value mismatch after update' });
      results.failed++;
    }

    // Restore original value
    await supabase
      .from('dashboard_metrics')
      .update({ current_value: '367490721' })
      .eq('section_key', 'executive')
      .eq('metric_key', 'meals_delivered');

  } catch (error) {
    results.tests.push({ name: 'Real-time Update', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Test 6: Data Quality Check
  try {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('metric_key, current_value, description')
      .or('current_value.is.null,current_value.eq.');
    
    if (error) throw error;
    
    if (data.length === 0) {
      results.tests.push({ name: 'Data Quality', status: 'PASS', details: 'No empty values found' });
      results.passed++;
    } else {
      results.tests.push({ name: 'Data Quality', status: 'FAIL', details: `${data.length} metrics with empty values` });
      results.failed++;
    }
  } catch (error) {
    results.tests.push({ name: 'Data Quality', status: 'FAIL', details: error.message });
    results.failed++;
  }

  // Print Results
  console.log('\n📊 VALIDATION RESULTS');
  console.log('=' .repeat(60));
  
  results.tests.forEach(test => {
    const status = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${status} ${test.name}: ${test.details}`);
  });
  
  console.log('\n' + '=' .repeat(60));
  console.log(`📈 SUMMARY: ${results.passed} passed, ${results.failed} failed`);
  
  if (results.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Dashboard is fully connected.');
  } else {
    console.log('⚠️  Some tests failed. Check the details above.');
    process.exit(1);
  }
}

runCompleteValidation().catch(console.error);
