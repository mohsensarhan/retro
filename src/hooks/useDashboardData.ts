// React hooks for dashboard data management with Supabase integration
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SupabaseAPI, DashboardMetric, DataTransformer } from '@/lib/supabase';
import { parseCSVContent, ParsedMetric } from '@/lib/csvParser';

// Hook for fetching all dashboard metrics
export function useDashboardMetrics() {
  const { data: metrics = [], isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: SupabaseAPI.getAllMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Transform metrics to dashboard format
  const dashboardData = DataTransformer.toDashboardFormat(metrics);
  const executiveMetrics = DataTransformer.getExecutiveMetrics(metrics);
  const financialMetrics = DataTransformer.getFinancialMetrics(metrics);

  return {
    metrics,
    dashboardData,
    executiveMetrics,
    financialMetrics,
    isLoading,
    error,
    refetch
  };
}

// Hook for fetching metrics by section
export function useSectionMetrics(section: string) {
  return useQuery({
    queryKey: ['section-metrics', section],
    queryFn: () => SupabaseAPI.getMetricsBySection(section),
    enabled: !!section,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Hook for real-time metric updates
export function useRealtimeMetrics() {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const subscription = SupabaseAPI.subscribeToMetrics((payload) => {
      console.log('Real-time metric update:', payload);
      
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['section-metrics'] });
      
      // Update specific metric if we have the data
      if (payload.new) {
        const metric = payload.new as DashboardMetric;
        queryClient.setQueryData(['section-metrics', metric.section], (old: DashboardMetric[] | undefined) => {
          if (!old) return [metric];
          
          const index = old.findIndex(m => 
            m.section === metric.section && 
            m.category === metric.category && 
            m.field === metric.field
          );
          
          if (index >= 0) {
            const updated = [...old];
            updated[index] = metric;
            return updated;
          } else {
            return [...old, metric];
          }
        });
      }
    });

    setIsConnected(true);

    return () => {
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [queryClient]);

  return { isConnected };
}

// Hook for CSV upload and processing
export function useCSVUpload() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<{
    status: 'idle' | 'parsing' | 'uploading' | 'processing' | 'completed' | 'error';
    progress: number;
    message: string;
    errors: string[];
  }>({
    status: 'idle',
    progress: 0,
    message: '',
    errors: []
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setUploadProgress({
        status: 'parsing',
        progress: 10,
        message: 'Parsing CSV file...',
        errors: []
      });

      // Read file content
      const content = await file.text();
      
      // Parse CSV
      const parseResult = parseCSVContent(content);
      
      if (!parseResult.success) {
        throw new Error(`CSV parsing failed: ${parseResult.errors.join(', ')}`);
      }

      setUploadProgress({
        status: 'uploading',
        progress: 30,
        message: `Parsed ${parseResult.validRows} valid rows. Uploading to database...`,
        errors: parseResult.errors
      });

      // Create upload record
      const uploadRecord = await SupabaseAPI.createCSVUpload({
        filename: file.name,
        file_size: file.size,
        total_rows: parseResult.totalRows,
        processed_rows: 0,
        failed_rows: 0,
        status: 'PROCESSING'
      });

      setUploadProgress({
        status: 'processing',
        progress: 50,
        message: 'Processing metrics...',
        errors: parseResult.errors
      });

      // Convert parsed metrics to database format
      const metricsToUpload = parseResult.data.map(metric => ({
        section: metric.section,
        category: metric.category,
        field: metric.field,
        value: metric.value,
        description: metric.description,
        methodology: metric.methodology,
        data_source: metric.data_source,
        interpretation: metric.interpretation,
        significance: metric.significance,
        benchmarks: metric.benchmarks,
        recommendations: metric.recommendations
      }));

      // Batch upload metrics
      const uploadedMetrics = await SupabaseAPI.batchUpsertMetrics(metricsToUpload);

      setUploadProgress({
        status: 'completed',
        progress: 100,
        message: `Successfully uploaded ${uploadedMetrics.length} metrics`,
        errors: parseResult.errors
      });

      // Update upload record
      await SupabaseAPI.updateCSVUpload(uploadRecord.id, {
        status: 'COMPLETED',
        processed_rows: uploadedMetrics.length,
        failed_rows: parseResult.totalRows - parseResult.validRows,
        completed_at: new Date().toISOString()
      });

      return {
        uploadRecord,
        uploadedMetrics,
        parseResult
      };
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['section-metrics'] });
    },
    onError: (error) => {
      setUploadProgress({
        status: 'error',
        progress: 0,
        message: `Upload failed: ${error.message}`,
        errors: [error.message]
      });
    }
  });

  const resetUpload = useCallback(() => {
    setUploadProgress({
      status: 'idle',
      progress: 0,
      message: '',
      errors: []
    });
  }, []);

  return {
    uploadCSV: uploadMutation.mutate,
    uploadProgress,
    isUploading: uploadMutation.isPending,
    resetUpload
  };
}

// Hook for metric CRUD operations
export function useMetricOperations() {
  const queryClient = useQueryClient();

  const updateMetric = useMutation({
    mutationFn: SupabaseAPI.upsertMetric,
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData(['dashboard-metrics'], (old: DashboardMetric[] | undefined) => {
        if (!old) return [data];
        
        const index = old.findIndex(m => 
          m.section === data.section && 
          m.category === data.category && 
          m.field === data.field
        );
        
        if (index >= 0) {
          const updated = [...old];
          updated[index] = data;
          return updated;
        } else {
          return [...old, data];
        }
      });
      
      // Invalidate section queries
      queryClient.invalidateQueries({ queryKey: ['section-metrics', data.section] });
    }
  });

  const deleteMetric = useMutation({
    mutationFn: ({ section, category, field }: { section: string; category: string; field: string }) =>
      SupabaseAPI.deleteMetric(section, category, field),
    onSuccess: (_, variables) => {
      // Remove from cache
      queryClient.setQueryData(['dashboard-metrics'], (old: DashboardMetric[] | undefined) => {
        if (!old) return [];
        return old.filter(m => 
          !(m.section === variables.section && 
            m.category === variables.category && 
            m.field === variables.field)
        );
      });
      
      // Invalidate section queries
      queryClient.invalidateQueries({ queryKey: ['section-metrics', variables.section] });
    }
  });

  return {
    updateMetric: updateMetric.mutate,
    deleteMetric: deleteMetric.mutate,
    isUpdating: updateMetric.isPending,
    isDeleting: deleteMetric.isPending,
    updateError: updateMetric.error,
    deleteError: deleteMetric.error
  };
}

// Hook for dashboard schema management
export function useDashboardSchema() {
  const { data: schema = [], isLoading, error } = useQuery({
    queryKey: ['dashboard-schema'],
    queryFn: SupabaseAPI.getDashboardSchema,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const queryClient = useQueryClient();

  const updateSchema = useMutation({
    mutationFn: SupabaseAPI.updateDashboardSchema,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-schema'] });
    }
  });

  return {
    schema,
    isLoading,
    error,
    updateSchema: updateSchema.mutate,
    isUpdating: updateSchema.isPending
  };
}

// Hook for audit trail
export function useDataChanges(limit: number = 100) {
  return useQuery({
    queryKey: ['data-changes', limit],
    queryFn: () => SupabaseAPI.getDataChanges(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook for CSV upload history
export function useCSVUploadHistory(limit: number = 50) {
  return useQuery({
    queryKey: ['csv-uploads', limit],
    queryFn: () => SupabaseAPI.getCSVUploads(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
