const { createClient } = require('@supabase/supabase-js');

// Supabase configuration with your real credentials
const supabaseUrl = 'https://oktiojqphavkqeirbbul.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rdGlvanFwaGF2a3FlaXJiYnVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjE3OTksImV4cCI6MjA3NDc5Nzc5OX0.3GUfIRtpx5yMKOxAte25IG3O5FlmYxjG21SEjPMFggc';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Check if we can connect
    console.log('1. Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase
      .from('dashboard_metrics')
      .select('count', { count: 'exact', head: true });
    
    if (connectionError) {
      console.log('❌ Connection failed:', connectionError.message);
      return;
    }
    
    console.log('✅ Connection successful!');
    console.log(`📊 Total records in database: ${connectionTest || 0}`);
    
    // Test 2: Get sample data
    console.log('\n2. Fetching sample data...');
    const { data: sampleData, error: dataError } = await supabase
      .from('dashboard_metrics')
      .select('section, category, field, value')
      .limit(5);
    
    if (dataError) {
      console.log('❌ Data fetch failed:', dataError.message);
      return;
    }
    
    console.log('✅ Sample data retrieved:');
    sampleData.forEach(row => {
      console.log(`   ${row.section} > ${row.category} > ${row.field}: ${row.value}`);
    });
    
    // Test 3: Check if dashboard should show Supabase data
    console.log('\n3. Checking dashboard data source...');
    const executiveMetrics = sampleData.filter(row => row.section === 'Executive Summary');
    
    if (executiveMetrics.length > 0) {
      console.log('✅ Dashboard should show Supabase data:');
      executiveMetrics.forEach(metric => {
        console.log(`   ${metric.field}: ${metric.value}`);
      });
      
      console.log('\n🎯 RESULT: Your dashboard should now display these values from Supabase!');
      console.log('   If you see different numbers, the dashboard is still using hardcoded values.');
    } else {
      console.log('⚠️  No Executive Summary data found. Dashboard will use fallback values.');
    }
    
    // Test 4: Real-time connection test
    console.log('\n4. Testing real-time connection...');
    const channel = supabase
      .channel('test-channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'dashboard_metrics' }, 
        (payload) => console.log('Real-time update received:', payload)
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time connection established!');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Real-time connection failed');
        }
      });
    
    // Clean up after 2 seconds
    setTimeout(() => {
      channel.unsubscribe();
      console.log('\n🏁 Connection test completed successfully!');
      process.exit(0);
    }, 2000);
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    process.exit(1);
  }
}

testConnection();
