const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Supabase configuration
const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTc5OSwiZXhwIjoyMDc0Nzk3Nzk5fQ.poQL_q2pDavh7unnpAYpFGV4qJg2UCOWYxkwqx1qJZU';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CSV parsing function
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      // Handle CSV parsing with quotes
      const values = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : '';
      });
      data.push(row);
    }
  }
  
  return data;
}

// Function to parse array fields
function parseArrayField(fieldValue) {
  if (!fieldValue) return null;
  
  const items = fieldValue.split(/[,;]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  return items.length > 0 ? items : null;
}

async function setupSimpleDatabase() {
  console.log('Setting up Supabase database (simple approach)...');
  
  try {
    // First, let's check if we can connect to Supabase
    console.log('Testing Supabase connection...');
    
    // Try to query existing tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (tablesError) {
      console.log('Connection test result:', tablesError);
    } else {
      console.log('Connected successfully. Existing tables:', tables?.map(t => t.table_name) || []);
    }
    
    // Check if dashboard_metrics table exists
    const { data: metricsTest, error: metricsError } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .limit(1);
    
    if (metricsError) {
      console.log('dashboard_metrics table does not exist or is not accessible:', metricsError.message);
      console.log('Please create the table manually in Supabase SQL editor using the schema from supabase-schema.sql');
      return;
    } else {
      console.log('dashboard_metrics table exists and is accessible');
    }
    
    // Import CSV data
    await importCSVData();
    
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}

async function importCSVData() {
  console.log('Importing CSV data...');
  
  try {
    // Read the CSV file
    const csvPath = 'C:\\Users\\msarhan.PC-CEO-DI9\\Desktop\\Projects\\reload\\EFB_Dashboard_Data_Export_Updated.csv';
    
    if (!fs.existsSync(csvPath)) {
      console.error('CSV file not found at:', csvPath);
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const csvData = parseCSV(csvContent);
    
    console.log(`Found ${csvData.length} rows in CSV`);
    console.log('Sample row:', csvData[0]);
    
    // Process each row and insert into database
    let successCount = 0;
    let errorCount = 0;
    
    // Insert data in smaller batches
    const batchSize = 5;
    
    for (let i = 0; i < csvData.length; i += batchSize) {
      const batch = csvData.slice(i, i + batchSize);
      const insertData = batch.map(row => ({
        section: row.Section || '',
        category: row.Category || '',
        field: row.Field || '',
        value: row.Value || '',
        description: row.Description || null,
        methodology: row.Methodology || null,
        data_source: row.DataSource || null,
        interpretation: row.Interpretation || null,
        significance: row.Significance || null,
        benchmarks: parseArrayField(row.Benchmarks),
        recommendations: parseArrayField(row.Recommendations)
      }));
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}...`);
      
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .upsert(insertData, { 
          onConflict: 'section,category,field',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error);
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(`Batch ${Math.floor(i / batchSize) + 1} inserted successfully`);
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`CSV import completed: ${successCount} successful, ${errorCount} errors`);
    
    // Verify the import
    const { data: metrics, error: metricsError } = await supabase
      .from('dashboard_metrics')
      .select('*')
      .limit(5);
    
    if (metricsError) {
      console.error('Error verifying import:', metricsError);
    } else {
      console.log('Sample imported data:');
      metrics.forEach(metric => {
        console.log(`- ${metric.section} > ${metric.category} > ${metric.field}: ${metric.value}`);
      });
    }
    
    // Check total count
    const { count, error: countError } = await supabase
      .from('dashboard_metrics')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error counting records:', countError);
    } else {
      console.log(`Total records in database: ${count}`);
    }
    
  } catch (error) {
    console.error('Error importing CSV data:', error);
  }
}

// Run the setup
console.log('Starting simple Supabase setup...');
setupSimpleDatabase().then(() => {
  console.log('Setup process completed');
  process.exit(0);
}).catch(error => {
  console.error('Setup process failed:', error);
  process.exit(1);
});

