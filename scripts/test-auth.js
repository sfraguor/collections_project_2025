// Script para probar el estado de autenticación
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://owzvwfikattbpktqnfxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93enZ3ZmlrYXR0YnBrdHFuZnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDM4NDksImV4cCI6MjA2NTc3OTg0OX0.Wtl8yH_AG3gGWUu2c8RyYL7WWUgD6LrcjUbY4HZL_rk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('\n=== Testing Supabase Authentication ===\n');

  // 1. Check current session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    console.error('Error getting session:', sessionError.message);
  } else if (session) {
    console.log('✓ Current session found:');
    console.log('  User ID:', session.user.id);
    console.log('  Email:', session.user.email);
    console.log('  Created:', new Date(session.user.created_at).toLocaleString());
  } else {
    console.log('✗ No active session');
  }

  // 2. Test collections access without auth
  console.log('\n--- Testing Collections Access ---');
  const { data: collections, error: collectionsError } = await supabase
    .from('collections')
    .select('*');
  
  if (collectionsError) {
    console.log('✗ Cannot access collections without auth (Expected)');
    console.log('  Error:', collectionsError.message);
  } else {
    console.log('✓ Collections accessible:', collections.length, 'found');
  }

  // 3. Test user_profiles table
  console.log('\n--- Testing User Profiles ---');
  const { data: profiles, error: profilesError } = await supabase
    .from('user_profiles')
    .select('*');
  
  if (profilesError) {
    console.log('✗ Error accessing user_profiles:', profilesError.message);
  } else {
    console.log('✓ User profiles found:', profiles.length);
  }

  // 4. If logged in, test with auth
  if (session) {
    console.log('\n--- Testing With Authentication ---');
    const { data: userCollections, error: userCollectionsError } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', session.user.id);
    
    if (userCollectionsError) {
      console.log('✗ Error accessing user collections:', userCollectionsError.message);
    } else {
      console.log('✓ User collections:', userCollections.length);
      if (userCollections.length > 0) {
        console.log('  First collection:', userCollections[0].name);
      }
    }
  }

  console.log('\n=== Test Complete ===\n');
}

testAuth().catch(console.error);
