// CSV Parser and Smart Update Engine
// Handles CSV parsing, validation, and smart updates to Supabase

export interface CSVRow {
  Section: string;
  Category: string;
  Field: string;
  Value: string;
  Description?: string;
  Methodology?: string;
  DataSource?: string;
  Interpretation?: string;
  Significance?: string;
  Benchmarks?: string;
  Recommendations?: string;
}

export interface ParsedMetric {
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
}

export interface ParseResult {
  success: boolean;
  data: ParsedMetric[];
  errors: string[];
  totalRows: number;
  validRows: number;
}

/**
 * Parse CSV content into structured data
 */
export function parseCSVContent(csvContent: string): ParseResult {
  const result: ParseResult = {
    success: false,
    data: [],
    errors: [],
    totalRows: 0,
    validRows: 0
  };

  try {
    const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) {
      result.errors.push('CSV file is empty');
      return result;
    }

    // Parse header
    const headerLine = lines[0];
    const headers = parseCSVLine(headerLine);
    
    // Validate required headers
    const requiredHeaders = ['Section', 'Category', 'Field', 'Value'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    
    if (missingHeaders.length > 0) {
      result.errors.push(`Missing required headers: ${missingHeaders.join(', ')}`);
      return result;
    }

    result.totalRows = lines.length - 1; // Exclude header

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        
        if (values.length === 0) continue; // Skip empty lines
        
        const row: CSVRow = {};
        headers.forEach((header, index) => {
          row[header as keyof CSVRow] = values[index] || '';
        });

        // Validate required fields
        if (!row.Section || !row.Category || !row.Field) {
          result.errors.push(`Row ${i}: Missing required fields (Section, Category, Field)`);
          continue;
        }

        // Convert to ParsedMetric
        const metric: ParsedMetric = {
          section: row.Section.trim(),
          category: row.Category.trim(),
          field: row.Field.trim(),
          value: row.Value?.trim() || '',
          description: row.Description?.trim() || undefined,
          methodology: row.Methodology?.trim() || undefined,
          data_source: row.DataSource?.trim() || undefined,
          interpretation: row.Interpretation?.trim() || undefined,
          significance: row.Significance?.trim() || undefined,
          benchmarks: parseArrayField(row.Benchmarks),
          recommendations: parseArrayField(row.Recommendations)
        };

        result.data.push(metric);
        result.validRows++;

      } catch (error) {
        result.errors.push(`Row ${i}: ${error instanceof Error ? error.message : 'Parse error'}`);
      }
    }

    result.success = result.validRows > 0;
    return result;

  } catch (error) {
    result.errors.push(`CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return result;
  }
}

/**
 * Parse a single CSV line, handling quoted values and commas
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i += 2;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
        i++;
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim());
      current = '';
      i++;
    } else {
      current += char;
      i++;
    }
  }

  // Add the last field
  result.push(current.trim());

  return result;
}

/**
 * Parse array fields (benchmarks, recommendations) from CSV
 */
function parseArrayField(fieldValue?: string): string[] | undefined {
  if (!fieldValue || fieldValue.trim() === '') return undefined;
  
  // Split by common delimiters and clean up
  const items = fieldValue
    .split(/[,;]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  return items.length > 0 ? items : undefined;
}

/**
 * Validate metric data before database insertion
 */
export function validateMetric(metric: ParsedMetric): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!metric.section) errors.push('Section is required');
  if (!metric.category) errors.push('Category is required');
  if (!metric.field) errors.push('Field is required');
  if (!metric.value) errors.push('Value is required');

  // Value validation based on field type
  if (metric.field.toLowerCase().includes('percentage') || 
      metric.field.toLowerCase().includes('rate') ||
      metric.field.toLowerCase().includes('efficiency')) {
    const numValue = parseFloat(metric.value);
    if (isNaN(numValue)) {
      errors.push(`${metric.field} should be a number`);
    } else if (numValue < 0 || numValue > 100) {
      errors.push(`${metric.field} should be between 0 and 100`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Compare two metrics to detect changes
 */
export function detectChanges(oldMetric: ParsedMetric, newMetric: ParsedMetric): string[] {
  const changes: string[] = [];

  if (oldMetric.value !== newMetric.value) {
    changes.push(`Value: "${oldMetric.value}" → "${newMetric.value}"`);
  }
  
  if (oldMetric.description !== newMetric.description) {
    changes.push(`Description changed`);
  }
  
  if (oldMetric.methodology !== newMetric.methodology) {
    changes.push(`Methodology changed`);
  }
  
  if (oldMetric.interpretation !== newMetric.interpretation) {
    changes.push(`Interpretation changed`);
  }
  
  if (JSON.stringify(oldMetric.benchmarks) !== JSON.stringify(newMetric.benchmarks)) {
    changes.push(`Benchmarks changed`);
  }
  
  if (JSON.stringify(oldMetric.recommendations) !== JSON.stringify(newMetric.recommendations)) {
    changes.push(`Recommendations changed`);
  }

  return changes;
}

/**
 * Group metrics by section for dashboard organization
 */
export function groupMetricsBySection(metrics: ParsedMetric[]): Record<string, Record<string, ParsedMetric[]>> {
  const grouped: Record<string, Record<string, ParsedMetric[]>> = {};

  metrics.forEach(metric => {
    if (!grouped[metric.section]) {
      grouped[metric.section] = {};
    }
    
    if (!grouped[metric.section][metric.category]) {
      grouped[metric.section][metric.category] = [];
    }
    
    grouped[metric.section][metric.category].push(metric);
  });

  return grouped;
}

/**
 * Extract numeric value from string (handles currency, percentages, etc.)
 */
export function extractNumericValue(value: string): number | null {
  if (!value) return null;
  
  // Remove common non-numeric characters
  const cleaned = value.replace(/[^\d.-]/g, '');
  const num = parseFloat(cleaned);
  
  return isNaN(num) ? null : num;
}

/**
 * Format value for display based on field type
 */
export function formatDisplayValue(field: string, value: string): string {
  const numValue = extractNumericValue(value);
  
  if (numValue === null) return value;
  
  const fieldLower = field.toLowerCase();
  
  if (fieldLower.includes('percentage') || fieldLower.includes('rate') || fieldLower.includes('efficiency')) {
    return `${numValue.toFixed(1)}%`;
  }
  
  if (fieldLower.includes('cost') || fieldLower.includes('revenue') || fieldLower.includes('expense')) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue);
  }
  
  if (fieldLower.includes('meals') || fieldLower.includes('people') || fieldLower.includes('served')) {
    return new Intl.NumberFormat('en-US').format(numValue);
  }
  
  return value;
}
