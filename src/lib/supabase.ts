// Supabase client configuration for EFB Dashboard
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface DashboardMetric {
  id: string;
  section: string;
  category: string;
  field: string;
  value: string;
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

export interface DashboardSchema {
  id: string;
  section_name: string;
  field_mappings: Record<string, any>;
  layout_config: Record<string, any>;
  display_order: number;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface DataChange {
  id: string;
  table_name: string;
  record_id: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  change_type: 'INSERT' | 'UPDATE' | 'DELETE';
  changed_by?: string;
  timestamp: string;
}

export interface CSVUpload {
  id: string;
  filename: string;
  file_size?: number;
  total_rows?: number;
  processed_rows?: number;
  failed_rows?: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error_details?: Record<string, any>;
  uploaded_by?: string;
  uploaded_at: string;
  completed_at?: string;
}

// API functions
export class SupabaseAPI {
  
  /**
   * Get all dashboard metrics
   */
  static async getAllMetrics(): Promise<DashboardMetric[]> {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .order('section', { ascending: true })
      .order('category', { ascending: true })
      .order('field', { ascending: true });

    if (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get metrics by section
   */
  static async getMetricsBySection(section: string): Promise<DashboardMetric[]> {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .eq('section', section)
      .order('category', { ascending: true })
      .order('field', { ascending: true });

    if (error) {
      console.error(`Error fetching metrics for section ${section}:`, error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get specific metric
   */
  static async getMetric(section: string, category: string, field: string): Promise<DashboardMetric | null> {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .eq('section', section)
      .eq('category', category)
      .eq('field', field)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null;
      }
      console.error('Error fetching metric:', error);
      throw error;
    }

    return data;
  }

  /**
   * Upsert metric (insert or update)
   */
  static async upsertMetric(metric: Omit<DashboardMetric, 'id' | 'created_at' | 'updated_at'>): Promise<DashboardMetric> {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .upsert(metric, {
        onConflict: 'section,category,field',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting metric:', error);
      throw error;
    }

    return data;
  }

  /**
   * Batch upsert metrics
   */
  static async batchUpsertMetrics(metrics: Omit<DashboardMetric, 'id' | 'created_at' | 'updated_at'>[]): Promise<DashboardMetric[]> {
    const { data, error } = await supabase
      .from('dashboard_metrics')
      .upsert(metrics, {
        onConflict: 'section,category,field',
        ignoreDuplicates: false
      })
      .select();

    if (error) {
      console.error('Error batch upserting metrics:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Delete metric
   */
  static async deleteMetric(section: string, category: string, field: string): Promise<void> {
    const { error } = await supabase
      .from('dashboard_metrics')
      .delete()
      .eq('section', section)
      .eq('category', category)
      .eq('field', field);

    if (error) {
      console.error('Error deleting metric:', error);
      throw error;
    }
  }

  /**
   * Get dashboard schema
   */
  static async getDashboardSchema(): Promise<DashboardSchema[]> {
    const { data, error } = await supabase
      .from('dashboard_schema')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching dashboard schema:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Update dashboard schema
   */
  static async updateDashboardSchema(schema: Partial<DashboardSchema> & { section_name: string }): Promise<DashboardSchema> {
    const { data, error } = await supabase
      .from('dashboard_schema')
      .upsert(schema, {
        onConflict: 'section_name',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating dashboard schema:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get data changes (audit log)
   */
  static async getDataChanges(limit: number = 100): Promise<DataChange[]> {
    const { data, error } = await supabase
      .from('data_changes')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching data changes:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create CSV upload record
   */
  static async createCSVUpload(upload: Omit<CSVUpload, 'id' | 'uploaded_at'>): Promise<CSVUpload> {
    const { data, error } = await supabase
      .from('csv_uploads')
      .insert(upload)
      .select()
      .single();

    if (error) {
      console.error('Error creating CSV upload record:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update CSV upload status
   */
  static async updateCSVUpload(id: string, updates: Partial<CSVUpload>): Promise<CSVUpload> {
    const { data, error } = await supabase
      .from('csv_uploads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating CSV upload:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get CSV upload history
   */
  static async getCSVUploads(limit: number = 50): Promise<CSVUpload[]> {
    const { data, error } = await supabase
      .from('csv_uploads')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching CSV uploads:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Subscribe to real-time changes
   */
  static subscribeToMetrics(callback: (payload: any) => void) {
    return supabase
      .channel('dashboard_metrics_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dashboard_metrics' }, 
        callback
      )
      .subscribe();
  }

  /**
   * Subscribe to schema changes
   */
  static subscribeToSchema(callback: (payload: any) => void) {
    return supabase
      .channel('dashboard_schema_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dashboard_schema' }, 
        callback
      )
      .subscribe();
  }
}

// Helper functions for data transformation
export class DataTransformer {
  
  /**
   * Transform database metrics to dashboard format
   */
  static toDashboardFormat(metrics: DashboardMetric[]): Record<string, any> {
    const result: Record<string, any> = {};
    
    metrics.forEach(metric => {
      if (!result[metric.section]) {
        result[metric.section] = {};
      }
      
      if (!result[metric.section][metric.category]) {
        result[metric.section][metric.category] = {};
      }
      
      result[metric.section][metric.category][metric.field] = {
        value: metric.value,
        description: metric.description,
        methodology: metric.methodology,
        dataSource: metric.data_source,
        interpretation: metric.interpretation,
        significance: metric.significance,
        benchmarks: metric.benchmarks,
        recommendations: metric.recommendations
      };
    });
    
    return result;
  }

  /**
   * Extract executive summary metrics
   */
  static getExecutiveMetrics(metrics: DashboardMetric[]) {
    const executiveMetrics = metrics.filter(m => m.section === 'Executive Summary');
    
    const findMetric = (field: string) => {
      const metric = executiveMetrics.find(m => m.field === field);
      return metric ? parseFloat(metric.value) || metric.value : 0;
    };

    return {
      mealsDelivered: findMetric('Meals Delivered'),
      peopleServed: findMetric('People Served'),
      costPerMeal: findMetric('Cost Per Meal'),
      programEfficiency: findMetric('Program Efficiency'),
      revenue: findMetric('Total Revenue'),
      expenses: findMetric('Total Expenses'),
      reserves: findMetric('Reserves'),
      cashPosition: findMetric('Cash Position')
    };
  }

  /**
   * Extract financial metrics
   */
  static getFinancialMetrics(metrics: DashboardMetric[]) {
    const financialMetrics = metrics.filter(m => m.section === 'Financial Analytics');
    
    const revenue = financialMetrics.filter(m => m.category === 'Revenue');
    const expenses = financialMetrics.filter(m => m.category === 'Expenses');
    const ratios = financialMetrics.filter(m => m.category === 'Ratios');
    
    return {
      revenue: revenue.reduce((acc, m) => {
        acc[m.field] = parseFloat(m.value) || 0;
        return acc;
      }, {} as Record<string, number>),
      expenses: expenses.reduce((acc, m) => {
        acc[m.field] = parseFloat(m.value) || 0;
        return acc;
      }, {} as Record<string, number>),
      ratios: ratios.reduce((acc, m) => {
        acc[m.field] = parseFloat(m.value) || 0;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}
