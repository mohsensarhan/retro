const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTIyMTc5OSwiZXhwIjoyMDc0Nzk3Nzk5fQ.poQL_q2pDavh7unnpAYpFGV4qJg2UCOWYxkwqx1qJZU';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CSV parsing function
function parseCSV(csvContent) {
  const lines = csvContent.split('\n');
  const headers = lines[0].split(',');
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) {
      const values = line.split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : '';
      });
      data.push(row);
    }
  }
  
  return data;
}

// Function to parse benchmarks and recommendations from CSV
function parseArrayField(fieldValue) {
  if (!fieldValue) return null;
  
  // Split by common delimiters and clean up
  const items = fieldValue.split(/[,;]/)
    .map(item => item.trim())
    .filter(item => item.length > 0);
  
  return items.length > 0 ? JSON.stringify(items) : null;
}

async function setupDatabase() {
  console.log('Setting up Supabase database with new schema...');
  
  try {
    // Read and execute the SQL schema file
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Executing database schema...');
    
    // Split SQL into statements and execute them
    const sqlStatements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      console.log(`Executing statement ${i + 1}/${sqlStatements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec', { sql: statement });
        if (error) {
          console.error(`Error executing statement ${i + 1}:`, error);
          console.log('Statement:', statement.substring(0, 200) + '...');
        } else {
          console.log(`Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`Exception executing statement ${i + 1}:`, err);
      }
    }
    
    console.log('Database schema setup completed!');
    
    // Now import CSV data
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
    
    // Process each row and insert into database
    let successCount = 0;
    let errorCount = 0;
    
    for (const row of csvData) {
      try {
        const { data, error } = await supabase.rpc('smart_upsert_metric', {
          p_section: row.Section || '',
          p_category: row.Category || '',
          p_field: row.Field || '',
          p_value: row.Value || '',
          p_description: row.Description || null,
          p_methodology: row.Methodology || null,
          p_data_source: row.DataSource || null,
          p_interpretation: row.Interpretation || null,
          p_significance: row.Significance || null,
          p_benchmarks: parseArrayField(row.Benchmarks),
          p_recommendations: parseArrayField(row.Recommendations)
        });
        
        if (error) {
          console.error('Error inserting row:', error, row);
          errorCount++;
        } else {
          successCount++;
          if (successCount % 10 === 0) {
            console.log(`Processed ${successCount} rows...`);
          }
        }
      } catch (err) {
        console.error('Exception processing row:', err, row);
        errorCount++;
      }
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
      console.log('Sample imported data:', metrics);
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

// Alternative direct SQL approach for schema setup
async function setupDatabaseDirect() {
  console.log('Setting up database using direct SQL approach...');
  
  try {
    // Drop existing tables if they exist
    console.log('Cleaning up existing tables...');
    
    const cleanupSQL = `
      DROP TABLE IF EXISTS data_changes CASCADE;
      DROP TABLE IF EXISTS csv_uploads CASCADE;
      DROP TABLE IF EXISTS dashboard_metrics CASCADE;
      DROP TABLE IF EXISTS dashboard_schema CASCADE;
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
      DROP FUNCTION IF EXISTS log_data_changes() CASCADE;
      DROP FUNCTION IF EXISTS smart_upsert_metric(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB) CASCADE;
    `;
    
    const { error: cleanupError } = await supabase.rpc('exec', { sql: cleanupSQL });
    if (cleanupError) {
      console.log('Cleanup warnings (expected):', cleanupError);
    }
    
    // Create tables step by step
    console.log('Creating dashboard_metrics table...');
    const createMetricsTable = `
      CREATE TABLE dashboard_metrics (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          section TEXT NOT NULL,
          category TEXT NOT NULL,
          field TEXT NOT NULL,
          value TEXT NOT NULL,
          description TEXT,
          methodology TEXT,
          data_source TEXT,
          interpretation TEXT,
          significance TEXT,
          benchmarks JSONB,
          recommendations JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(section, category, field)
      );
    `;
    
    const { error: tableError } = await supabase.rpc('exec', { sql: createMetricsTable });
    if (tableError) {
      console.error('Error creating metrics table:', tableError);
    } else {
      console.log('Metrics table created successfully');
    }
    
    // Import CSV data directly
    await importCSVDataDirect();
    
  } catch (error) {
    console.error('Error in direct setup:', error);
  }
}

async function importCSVDataDirect() {
  console.log('Importing CSV data directly...');
  
  try {
    const csvPath = 'C:\\Users\\msarhan.PC-CEO-DI9\\Desktop\\Projects\\reload\\EFB_Dashboard_Data_Export_Updated.csv';
    
    if (!fs.existsSync(csvPath)) {
      console.error('CSV file not found at:', csvPath);
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const csvData = parseCSV(csvContent);
    
    console.log(`Processing ${csvData.length} CSV rows...`);
    
    // Insert data in batches
    const batchSize = 10;
    let successCount = 0;
    
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
      
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .upsert(insertData, { 
          onConflict: 'section,category,field',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error);
      } else {
        successCount += batch.length;
        console.log(`Inserted batch ${i / batchSize + 1}, total: ${successCount}`);
      }
    }
    
    console.log(`Import completed: ${successCount} records processed`);
    
  } catch (error) {
    console.error('Error in direct CSV import:', error);
  }
}

// Run the setup
console.log('Starting Supabase setup...');
setupDatabaseDirect().then(() => {
  console.log('Setup process completed');
  process.exit(0);
}).catch(error => {
  console.error('Setup process failed:', error);
  process.exit(1);
});