// Test MCP Server connection to Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owzvwfikattbpktqnfxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93enZ3ZmlrYXR0YnBrdHFuZnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDM4NDksImV4cCI6MjA2NTc3OTg0OX0.Wtl8yH_AG3gGWUu2c8RyYL7WWUgD6LrcjUbY4HZL_rk';

// Create client with anon key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Test 1: List tables
    console.log('1. Fetching collections table structure...');
    const { data: collections, error: collectionsError } = await supabase
      .from('collections')
      .select('*')
      .limit(1);
    
    if (collectionsError) {
      console.error('❌ Error fetching collections:', collectionsError.message);
    } else {
      console.log('✅ Collections table accessible');
      console.log('   Sample data:', collections.length > 0 ? 'Found data' : 'Table empty');
    }
    
    // Test 2: Check items table
    console.log('\n2. Fetching items table structure...');
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .limit(1);
    
    if (itemsError) {
      console.error('❌ Error fetching items:', itemsError.message);
    } else {
      console.log('✅ Items table accessible');
      console.log('   Sample data:', items.length > 0 ? 'Found data' : 'Table empty');
    }
    
    // Test 3: Count total records
    console.log('\n3. Counting total records...');
    const { count: collectionsCount, error: countError1 } = await supabase
      .from('collections')
      .select('*', { count: 'exact', head: true });
    
    const { count: itemsCount, error: countError2 } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true });
    
    if (countError1 || countError2) {
      console.error('❌ Error counting records');
    } else {
      console.log('✅ Total collections:', collectionsCount || 0);
      console.log('✅ Total items:', itemsCount || 0);
    }
    
    console.log('\n✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
  }
}

testConnection();
