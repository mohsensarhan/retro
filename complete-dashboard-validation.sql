-- COMPLETE VALIDATION SCRIPT
-- Tests every single field connection between Admin Panel, Dashboard, and Supabase

-- 1. Count verification
SELECT 'TOTAL METRICS CHECK' as test_name, 
       count(*) as actual_count, 
       64 as expected_count,
       CASE WHEN count(*) = 64 THEN 'PASS' ELSE 'FAIL' END as result
FROM dashboard_metrics;

-- 2. Section coverage verification
WITH expected_sections AS (
  SELECT unnest(ARRAY['executive', 'financial', 'operational', 'programs', 'stakeholders', 'scenarios', 'global_signals']) as section_key
),
actual_sections AS (
  SELECT DISTINCT section_key FROM dashboard_metrics
)
SELECT 'SECTION COVERAGE CHECK' as test_name,
       e.section_key,
       CASE WHEN a.section_key IS NOT NULL THEN 'PRESENT' ELSE 'MISSING' END as status
FROM expected_sections e
LEFT JOIN actual_sections a ON e.section_key = a.section_key
ORDER BY e.section_key;

-- 3. Required fields check
SELECT 'REQUIRED FIELDS CHECK' as test_name,
       count(*) as records_with_all_required,
       (SELECT count(*) FROM dashboard_metrics) as total_records,
       CASE WHEN count(*) = (SELECT count(*) FROM dashboard_metrics) THEN 'PASS' ELSE 'FAIL' END as result
FROM dashboard_metrics 
WHERE section_key IS NOT NULL 
  AND metric_key IS NOT NULL 
  AND metric_name IS NOT NULL 
  AND current_value IS NOT NULL;

-- 4. Executive metrics specific check (critical for dashboard)
WITH required_executive AS (
  SELECT unnest(ARRAY['people_served', 'meals_delivered', 'cost_per_meal', 'coverage']) as metric_key
),
actual_executive AS (
  SELECT metric_key FROM dashboard_metrics WHERE section_key = 'executive'
)
SELECT 'EXECUTIVE METRICS CHECK' as test_name,
       r.metric_key,
       CASE WHEN a.metric_key IS NOT NULL THEN 'PRESENT' ELSE 'MISSING' END as status
FROM required_executive r
LEFT JOIN actual_executive a ON r.metric_key = a.metric_key
ORDER BY r.metric_key;

-- 5. Financial metrics check
SELECT 'FINANCIAL METRICS CHECK' as test_name,
       count(*) as financial_metrics_count,
       CASE WHEN count(*) >= 10 THEN 'PASS' ELSE 'FAIL' END as result
FROM dashboard_metrics 
WHERE section_key = 'financial';

-- 6. Data quality check
SELECT 'DATA QUALITY CHECK' as test_name,
       'Empty values' as issue_type,
       count(*) as issue_count
FROM dashboard_metrics 
WHERE current_value = '' OR current_value IS NULL
UNION ALL
SELECT 'DATA QUALITY CHECK' as test_name,
       'Missing descriptions' as issue_type,
       count(*) as issue_count
FROM dashboard_metrics 
WHERE description IS NULL OR description = ''
UNION ALL
SELECT 'DATA QUALITY CHECK' as test_name,
       'Invalid format_type' as issue_type,
       count(*) as issue_count
FROM dashboard_metrics 
WHERE format_type NOT IN ('number', 'currency', 'percentage', 'text', 'simple');

-- 7. Real-time update test setup
INSERT INTO dashboard_metrics (
  section_key, category, metric_key, metric_name, display_order,
  current_value, format_type, color_theme, description
) VALUES (
  'test', 'Test Category', 'test_metric', 'Test Metric', 999,
  '12345', 'number', 'neutral', 'Test metric for validation'
) ON CONFLICT (section_key, metric_key) DO UPDATE SET
  current_value = EXCLUDED.current_value,
  updated_at = NOW();

-- Verify test record was created/updated
SELECT 'REAL-TIME UPDATE TEST' as test_name,
       metric_key,
       current_value,
       updated_at,
       CASE WHEN updated_at > NOW() - INTERVAL '10 seconds' THEN 'PASS' ELSE 'FAIL' END as result
FROM dashboard_metrics 
WHERE section_key = 'test' AND metric_key = 'test_metric';

-- Clean up test record
DELETE FROM dashboard_metrics WHERE section_key = 'test' AND metric_key = 'test_metric';

-- 8. Summary report
SELECT 'VALIDATION SUMMARY' as report_type,
       (SELECT count(*) FROM dashboard_metrics) as total_metrics,
       (SELECT count(DISTINCT section_key) FROM dashboard_metrics) as total_sections,
       (SELECT count(*) FROM dashboard_metrics WHERE current_value IS NOT NULL AND current_value != '') as metrics_with_values,
       (SELECT count(*) FROM dashboard_metrics WHERE description IS NOT NULL AND description != '') as metrics_with_descriptions,
       NOW() as validation_timestamp;
