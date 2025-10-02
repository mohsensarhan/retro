#!/usr/bin/env node

// REST-BASED VALIDATOR: Verifies dashboard -> Supabase end-to-end without external deps
// Usage: node rest-validation.mjs

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://oktiojqphavkqeirbbul.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Accept': 'application/json',
  'Prefer': 'count=exact'
};

function printResult(name, passed, details = '') {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${name}${details ? `: ${details}` : ''}`);
}

async function fetchJson(path, params = '') {
  const url = `${SUPABASE_URL}/rest/v1${path}${params}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText} for ${path}: ${text}`);
  }
  const contentRange = res.headers.get('content-range') || '';
  const total = contentRange.split('/')[1] ? Number(contentRange.split('/')[1]) : undefined;
  const data = await res.json();
  return { data, total };
}

async function main() {
  const results = { passed: 0, failed: 0 };
  console.log('\n🔍 Running Supabase REST validation...');

  try {
    // 1) Total metrics
    const metricsResp = await fetchJson('/dashboard_metrics', '?select=section_key,metric_key,current_value,display_order');
    const totalMetrics = Array.isArray(metricsResp.data) ? metricsResp.data.length : 0;
    printResult('Total metrics present', totalMetrics === 64, `${totalMetrics}/64`);
    totalMetrics === 64 ? results.passed++ : results.failed++;

    // 2) Sections present
    const sectionsResp = await fetchJson('/dashboard_sections', '?select=section_key');
    const sectionKeys = new Set(sectionsResp.data.map(r => r.section_key));
    const expectedSections = ['executive','financial','operational','programs','stakeholders','scenarios','global_signals'];
    const missingSections = expectedSections.filter(s => !sectionKeys.has(s));
    printResult('All sections present', missingSections.length === 0, missingSections.length ? `missing: ${missingSections.join(', ')}` : '7/7');
    missingSections.length === 0 ? results.passed++ : results.failed++;

    // 3) Executive required metrics
    const execResp = await fetchJson('/dashboard_metrics', '?select=metric_key,current_value,display_order&section_key=eq.executive');
    const execKeys = new Set(execResp.data.map(r => r.metric_key));
    const requiredExec = ['people_served','meals_delivered','cost_per_meal','coverage'];
    const missingExec = requiredExec.filter(k => !execKeys.has(k));
    printResult('Executive metrics present', missingExec.length === 0, missingExec.length ? `missing: ${missingExec.join(', ')}` : 'ok');
    missingExec.length === 0 ? results.passed++ : results.failed++;

    // 4) Per-section counts (must be > 0)
    const perSectionCounts = expectedSections.map(s => ({
      section: s,
      count: metricsResp.data.filter(r => r.section_key === s).length
    }));
    const emptySections = perSectionCounts.filter(x => x.count === 0);
    printResult('Per-section metrics populated', emptySections.length === 0, emptySections.length ? `empty: ${emptySections.map(x=>x.section).join(', ')}` : 'all have data');
    emptySections.length === 0 ? results.passed++ : results.failed++;

    // 5) Sample values sanity
    const sample = metricsResp.data
      .slice()
      .sort((a, b) => (a.section_key.localeCompare(b.section_key)) || (a.display_order - b.display_order))
      .filter((_, idx) => idx < 10);
    printResult('Sample fetch', sample.length > 0, `first section: ${sample[0]?.section_key || 'n/a'}`);
    sample.length > 0 ? results.passed++ : results.failed++;

    console.log(`\n📈 Summary: ${results.passed} passed, ${results.failed} failed`);
    process.exit(results.failed === 0 ? 0 : 1);
  } catch (err) {
    printResult('Validator error', false, err.message);
    console.log('\n📈 Summary: 0 passed, 1 failed');
    process.exit(1);
  }
}

main();



