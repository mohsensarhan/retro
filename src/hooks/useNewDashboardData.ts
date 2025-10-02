// New hooks for the perfect dashboard schema
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// Types matching the new perfect schema
export interface DashboardMetric {
  id: string;
  section_key: string;
  category: string;
  metric_key: string;
  metric_name: string;
  display_order: number;
  current_value: string;
  previous_value?: string;
  target_value?: string;
  unit?: string;
  format_type: string;
  change_value?: string;
  change_direction?: string;
  color_theme: string;
  icon_name?: string;
  description?: string;
  methodology?: string;
  data_source?: string;
  interpretation?: string;
  significance?: string;
  benchmarks?: string[];
  recommendations?: string[];
  created_at: string;
  updated_at: string;
}

export interface DashboardSection {
  id: string;
  section_key: string;
  section_name: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

// Helpers to normalize keys/values across schemas and CSVs
function toCamelCase(input: string): string {
  if (!input) return '';
  return input
    .replace(/[^a-zA-Z0-9_ ]+/g, '')
    .replace(/[_\s]+(.)?/g, (_, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/^(.)/, (m) => m.toLowerCase());
}

function toSnakeCase(input: string): string {
  if (!input) return '';
  return input
    .replace(/[^a-zA-Z0-9 ]+/g, '')
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

function toSectionKey(value: string): string {
  const normalized = (value || '').toLowerCase().trim();
  const map: Record<string, string> = {
    'executive summary': 'executive',
    'financial analytics': 'financial',
    'operational analytics': 'operational',
    'programs analytics': 'programs',
    'stakeholder analytics': 'stakeholders',
    'scenario analysis': 'scenarios',
  };
  return map[normalized] || toSnakeCase(normalized).replace(/_/g, '-');
}

function normalizeExecutiveMetricKey(rawKey: string): string {
  const camel = toCamelCase(rawKey);
  const aliasMap: Record<string, string> = {
    livesImpacted: 'peopleServed',
    peopleServed: 'peopleServed',
    mealsDelivered: 'mealsDelivered',
    costPerMeal: 'costPerMeal',
    programEfficiency: 'programEfficiency',
    totalRevenue: 'revenue',
    totalExpenses: 'expenses',
    revenue: 'revenue',
    expenses: 'expenses',
    reserves: 'reserves',
    cashPosition: 'cashPosition',
    cash: 'cashPosition',
  };
  return aliasMap[camel] || camel;
}

// Hook for fetching all dashboard data with perfect structure
export function useNewDashboardData() {
  const queryClient = useQueryClient();

  // Fetch sections
  const { data: sections = [], isLoading: sectionsLoading } = useQuery({
    queryKey: ['dashboard-sections'],
    queryFn: async () => {
      // Try new schema first
      const { data, error } = await supabase
        .from('dashboard_sections')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        // Fallback: derive sections from metrics table (old schema)
        const { data: legacy, error: legacyError } = await supabase
          .from('dashboard_metrics')
          .select('section')
          .order('section', { ascending: true });
        if (legacyError) throw error; // propagate original error if fallback fails
        const uniqueSections = Array.from(new Set((legacy || []).map((r: any) => r.section))).filter(Boolean);
        const derived = uniqueSections.map((name: string, idx: number) => ({
          id: `${idx}`,
          section_key: toSectionKey(name),
          section_name: name,
          display_order: idx + 1,
          is_active: true,
          created_at: new Date().toISOString(),
        }));
        return derived as DashboardSection[];
      }
      return (data || []) as DashboardSection[];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch metrics
  const { data: metrics = [], isLoading: metricsLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      // Attempt new perfect schema selection
      try {
        const { data, error } = await supabase
          .from('dashboard_metrics')
          .select(
            [
              'id',
              'section_key',
              'category',
              'metric_key',
              'metric_name',
              'display_order',
              'current_value',
              'previous_value',
              'target_value',
              'unit',
              'format_type',
              'change_value',
              'change_direction',
              'color_theme',
              'icon_name',
              'description',
              'methodology',
              'data_source',
              'interpretation',
              'significance',
              'benchmarks',
              'recommendations',
              'created_at',
              'updated_at',
            ].join(',')
          )
          .order('section_key', { ascending: true })
          .order('display_order', { ascending: true });

        if (error) throw error;
        const rows: unknown = data || [];
        return rows as DashboardMetric[];
      } catch (_e) {
        // Fallback to legacy simple schema and alias columns to match new shape
        const { data, error: legacyError } = await supabase
          .from('dashboard_metrics')
          .select(
            [
              'id',
              'section_key:section',
              'category',
              'metric_key:field',
              'metric_name:field',
              'display_order',
              'current_value:value',
              'unit',
              'format_type',
              'change_value',
              'change_direction',
              'color_theme',
              'icon_name',
              'description',
              'methodology',
              'data_source',
              'interpretation',
              'significance',
              'benchmarks',
              'recommendations',
              'created_at',
              'updated_at',
            ].join(',')
          )
          .order('section', { ascending: true })
          .order('category', { ascending: true })
          .order('field', { ascending: true });
        if (legacyError) throw legacyError;
        return (data || []) as unknown as DashboardMetric[];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Update metric mutation
  const updateMetricMutation = useMutation({
    mutationFn: async (metric: DashboardMetric) => {
      // Try new schema update
      try {
        const { data, error } = await supabase
          .from('dashboard_metrics')
          .update({
            current_value: metric.current_value,
            previous_value: metric.previous_value,
            target_value: metric.target_value,
            unit: metric.unit,
            description: metric.description,
            methodology: metric.methodology,
            data_source: metric.data_source,
            interpretation: metric.interpretation,
            significance: metric.significance,
            benchmarks: metric.benchmarks,
            recommendations: metric.recommendations,
            change_value: metric.change_value,
            change_direction: metric.change_direction,
            color_theme: metric.color_theme,
          })
          .eq('id', metric.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (_e) {
        // Fallback to legacy schema (update value column)
        const { data, error } = await supabase
          .from('dashboard_metrics')
          .update({
            value: (metric as any).current_value ?? '',
            description: metric.description,
            methodology: metric.methodology,
            data_source: metric.data_source,
            interpretation: metric.interpretation,
            significance: metric.significance,
            benchmarks: metric.benchmarks,
            recommendations: metric.recommendations,
          })
          .eq('id', metric.id)
          .select()
          .single();
        if (error) throw error;
        return data as any;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    }
  });

  // Delete metric mutation
  const deleteMetricMutation = useMutation({
    mutationFn: async (metricId: string) => {
      const { error } = await supabase.from('dashboard_metrics').delete().eq('id', metricId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    }
  });

  // Real-time subscription
  useEffect(() => {
    const subscription = supabase
      .channel('dashboard_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dashboard_metrics' }, 
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  return {
    sections,
    metrics,
    isLoading: sectionsLoading || metricsLoading,
    error,
    refetch,
    updateMetric: updateMetricMutation.mutate,
    deleteMetric: deleteMetricMutation.mutate,
    isUpdating: updateMetricMutation.isPending,
    isDeleting: deleteMetricMutation.isPending
  };
}

// Hook for dashboard display (transforms data for dashboard components)
export function useDashboardDisplay() {
  const { metrics, sections, isLoading, error } = useNewDashboardData();

  // Transform metrics for dashboard consumption
  const dashboardData = sections.reduce((acc, section) => {
    const sectionMetrics = metrics.filter((m) => {
      const key = (m as any).section_key || (m as any).section || '';
      const normalized = toSectionKey(key || '');
      return normalized === section.section_key;
    });
    
    acc[section.section_key] = {
      section_name: section.section_name,
      categories: sectionMetrics.reduce((catAcc, metric) => {
        if (!catAcc[metric.category]) {
          catAcc[metric.category] = [];
        }
        catAcc[metric.category].push({
          key: metric.metric_key,
          name: metric.metric_name,
          value: metric.current_value,
          unit: metric.unit,
          format: metric.format_type,
          change: metric.change_value,
          direction: metric.change_direction,
          color: metric.color_theme,
          icon: metric.icon_name,
          description: metric.description,
          methodology: metric.methodology,
          dataSource: metric.data_source,
          interpretation: metric.interpretation,
          significance: metric.significance,
          benchmarks: metric.benchmarks,
          recommendations: metric.recommendations
        });
        return catAcc;
      }, {} as Record<string, any[]>)
    };
    
    return acc;
  }, {} as Record<string, any>);

  // Extract executive metrics for backward compatibility
  const executiveMetrics = metrics
    .filter((m) => {
      const key = (m as any).section_key || (m as any).section || '';
      const normalized = toSectionKey(key || '');
      return normalized === 'executive';
    })
    .reduce((acc, metric) => {
      const rawKey = metric.metric_key || metric.metric_name || '';
      const normalizedKey = normalizeExecutiveMetricKey(rawKey);
      const raw = metric.current_value;
      const numValue = typeof raw === 'string' ? parseFloat(raw) : (raw as unknown as number);
      acc[normalizedKey] = isNaN(numValue as number) ? raw : (numValue as number);
      return acc;
    }, {} as Record<string, any>);

  return {
    dashboardData,
    executiveMetrics,
    sections,
    metrics,
    isLoading,
    error
  };
}

// Hook for CSV operations
export function useNewCSVOperations() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState({
    status: 'idle' as 'idle' | 'parsing' | 'uploading' | 'completed' | 'error',
    progress: 0,
    message: '',
    errors: [] as string[]
  });

  const uploadCSV = async (file: File) => {
    setUploadProgress({
      status: 'parsing',
      progress: 10,
      message: 'Parsing CSV file...',
      errors: []
    });

    try {
      const content = await file.text();
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      const rawHeaders = lines[0].split(',').map(h => h.trim());
      const headerMap: Record<string, string> = {};
      rawHeaders.forEach((h, idx) => {
        const key = toSnakeCase(h);
        // normalize known variants
        if (key === 'section') headerMap[idx] = 'section_key';
        else if (key === 'field') headerMap[idx] = 'metric_name';
        else if (key === 'value') headerMap[idx] = 'current_value';
        else headerMap[idx] = key; // metric_key, metric_name, category, etc.
      });

      setUploadProgress({
        status: 'uploading',
        progress: 30,
        message: 'Processing CSV data...',
        errors: []
      });

      const metrics: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        rawHeaders.forEach((_, index) => {
          const norm = headerMap[index];
          row[norm] = values[index] || '';
        });

        // Derive keys for legacy CSVs missing new schema fields
        const sectionKey = row['section_key'] ? toSectionKey(row['section_key']) : toSectionKey(row['section_name'] || '');
        const metricName = row['metric_name'] || row['field'] || row['metric_key'] || '';
        const metricKey = row['metric_key'] || toSnakeCase(metricName);
        const currentValue = row['current_value'] || row['value'] || '';

        if (sectionKey && metricKey && currentValue) {
          metrics.push({
            section_key: sectionKey,
            category: row['category'] || 'General',
            metric_key: metricKey,
            metric_name: metricName || metricKey,
            display_order: parseInt(row['display_order']) || i,
            current_value: currentValue,
            unit: row['unit'] || '',
            format_type: row['format_type'] || 'number',
            color_theme: row['color_theme'] || 'neutral',
            description: row['description'] || '',
            methodology: row['methodology'] || '',
            data_source: row['data_source'] || '',
            interpretation: row['interpretation'] || '',
            significance: row['significance'] || ''
          });
        }
      }

      setUploadProgress({
        status: 'uploading',
        progress: 60,
        message: `Uploading ${metrics.length} metrics...`,
        errors: []
      });

      // Batch upsert metrics (new schema), fallback to legacy if needed
      try {
        const { error } = await supabase
          .from('dashboard_metrics')
          .upsert(metrics, {
            onConflict: 'section_key,metric_key',
            ignoreDuplicates: false,
          });
        if (error) throw error;
      } catch (_e) {
        // Legacy fallback shape
        const legacyMetrics = metrics.map((m) => ({
          section: m.section_key,
          category: m.category,
          field: m.metric_name,
          value: m.current_value,
          description: m.description,
          methodology: m.methodology,
          data_source: m.data_source,
          interpretation: m.interpretation,
          significance: m.significance,
          benchmarks: m.benchmarks,
          recommendations: m.recommendations,
        }));
        const { error } = await supabase
          .from('dashboard_metrics')
          .upsert(legacyMetrics, {
            onConflict: 'section,category,field',
            ignoreDuplicates: false,
          });
        if (error) throw error;
      }

      setUploadProgress({
        status: 'completed',
        progress: 100,
        message: `Successfully uploaded ${metrics.length} metrics`,
        errors: []
      });

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });

    } catch (error) {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: `Upload failed: ${error.message}`,
        errors: [error.message]
      });
    }
  };

  const exportCSV = async () => {
    try {
      const { data: metrics, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .order('section_key', { ascending: true })
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Create CSV content
      const headers = [
        'section_key', 'category', 'metric_key', 'metric_name', 'display_order',
        'current_value', 'unit', 'format_type', 'color_theme',
        'description', 'methodology', 'data_source', 'interpretation', 'significance'
      ];

      const csvContent = [
        headers.join(','),
        ...metrics.map(metric => 
          headers.map(header => {
            const value = metric[header] || '';
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          }).join(',')
        )
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `efb-dashboard-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  };

  return {
    uploadCSV,
    exportCSV,
    uploadProgress,
    isUploading: uploadProgress.status === 'uploading' || uploadProgress.status === 'parsing'
  };
}
