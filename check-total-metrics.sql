-- Check total metrics and breakdown by section
SELECT 'TOTAL METRICS COUNT' as check_type, count(*) as total_metrics FROM dashboard_metrics;

SELECT 'METRICS BY SECTION' as check_type, section_key, count(*) as count 
FROM dashboard_metrics 
GROUP BY section_key 
ORDER BY section_key;

-- Show sample from each section
SELECT 'SAMPLE FROM EACH SECTION' as check_type, section_key, metric_key, metric_name, current_value
FROM (
  SELECT section_key, metric_key, metric_name, current_value,
         ROW_NUMBER() OVER (PARTITION BY section_key ORDER BY display_order) as rn
  FROM dashboard_metrics
) t 
WHERE rn <= 2
ORDER BY section_key, rn;

