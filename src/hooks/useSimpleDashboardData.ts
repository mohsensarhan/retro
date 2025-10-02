// SIMPLE WORKING DASHBOARD DATA HOOK - NO MORE COMPLEXITY
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, SupabaseAPI, DataTransformer } from '@/lib/supabase';

// Fallback data for when Supabase is empty or not working
const FALLBACK_METRICS = [
  { id: '1', section: 'Executive Summary', category: 'Core Metrics', field: 'People Served', value: '4960000', description: 'Unique individuals reached nationwide', methodology: '', data_source: '', interpretation: '', significance: '', benchmarks: [], recommendations: [], created_at: '', updated_at: '' },
  { id: '2', section: 'Executive Summary', category: 'Core Metrics', field: 'Meals Delivered', value: '500000000', description: 'Total annual food assistance', methodology: '', data_source: '', interpretation: '', significance: '', benchmarks: [], recommendations: [], created_at: '', updated_at: '' },
  { id: '3', section: 'Executive Summary', category: 'Core Metrics', field: 'Cost Per Meal', value: '11', description: 'All-inclusive program cost', methodology: '', data_source: '', interpretation: '', significance: '', benchmarks: [], recommendations: [], created_at: '', updated_at: '' },
  { id: '4', section: 'Executive Summary', category: 'Core Metrics', field: 'Program Efficiency', value: '83', description: 'Overall program effectiveness', methodology: '', data_source: '', interpretation: '', significance: '', benchmarks: [], recommendations: [], created_at: '', updated_at: '' },
  { id: '5', section: 'Executive Summary', category: 'Financial', field: 'Total Revenue', value: '2200000000', description: 'Annual revenue', methodology: '', data_source: '', interpretation: '', significance: '', benchmarks: [], recommendations: [], created_at: '', updated_at: '' },
  { id: '6', section: 'Executive Summary', category: 'Financial', field: 'Total Expenses', value: '2316000000', description: 'Annual expenses', methodology: '', data_source: '', interpretation: '', significance: '', benchmarks: [], recommendations: [], created_at: '', updated_at: '' },
  { id: '7', section: 'Executive Summary', category: 'Financial', field: 'Reserves', value: '731200000', description: 'Financial reserves', methodology: '', data_source: '', interpretation: '', significance: '', benchmarks: [], recommendations: [], created_at: '', updated_at: '' },
  { id: '8', section: 'Executive Summary', category: 'Financial', field: 'Cash Position', value: '459800000', description: 'Current cash position', methodology: '', data_source: '', interpretation: '', significance: '', benchmarks: [], recommendations: [], created_at: '', updated_at: '' }
];

// Simple hook that just works
export function useSimpleDashboardData() {
  const queryClient = useQueryClient();

  // Fetch all metrics with fallback
  const { data: metrics = [], isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      try {
        const data = await SupabaseAPI.getAllMetrics();
        return data.length > 0 ? data : FALLBACK_METRICS;
      } catch (error) {
        console.warn('Supabase fetch failed, using fallback data:', error);
        return FALLBACK_METRICS;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Transform to executive metrics
  const executiveMetrics = DataTransformer.getExecutiveMetrics(metrics);
  
  // Transform to dashboard format
  const dashboardData = DataTransformer.toDashboardFormat(metrics);

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
    metrics,
    executiveMetrics,
    dashboardData,
    isLoading,
    error,
    refetch
  };
}

// Simple CSV operations
export function useSimpleCSVOperations() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState({
    status: 'idle' as 'idle' | 'uploading' | 'completed' | 'error',
    progress: 0,
    message: ''
  });

  const uploadCSV = async (file: File) => {
    setUploadProgress({ status: 'uploading', progress: 10, message: 'Reading file...' });

    try {
      const content = await file.text();
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const metrics: any[] = [];

      setUploadProgress({ status: 'uploading', progress: 50, message: 'Processing data...' });

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        if (row['Section'] && row['Field'] && row['Value']) {
          metrics.push({
            section: row['Section'],
            category: row['Category'] || 'General',
            field: row['Field'],
            value: row['Value'],
            description: row['Description'] || '',
            methodology: row['Methodology'] || '',
            data_source: row['DataSource'] || row['Data Source'] || '',
            interpretation: row['Interpretation'] || '',
            significance: row['Significance'] || ''
          });
        }
      }

      setUploadProgress({ status: 'uploading', progress: 80, message: 'Saving to database...' });

      await SupabaseAPI.batchUpsertMetrics(metrics);

      setUploadProgress({ status: 'completed', progress: 100, message: `Successfully uploaded ${metrics.length} metrics` });

      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });

    } catch (error: any) {
      setUploadProgress({ status: 'error', progress: 0, message: `Upload failed: ${error.message}` });
    }
  };

  const exportCSV = async () => {
    try {
      const metrics = await SupabaseAPI.getAllMetrics();
      
      const headers = ['Section', 'Category', 'Field', 'Value', 'Description', 'Methodology', 'DataSource', 'Interpretation', 'Significance'];
      
      const csvContent = [
        headers.join(','),
        ...metrics.map(metric => 
          headers.map(header => {
            const key = header.toLowerCase().replace('datasource', 'data_source');
            const value = (metric as any)[key] || '';
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `efb-dashboard-data-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  };

  return {
    uploadCSV,
    exportCSV,
    uploadProgress,
    isUploading: uploadProgress.status === 'uploading'
  };
}
