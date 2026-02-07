/**
 * Script to fix collections with local file:// URIs
 * 
 * This script will clean up collections that have local file URIs
 * which are no longer valid after app reinstallation.
 * 
 * Run with: node scripts/fix-collection-images.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://owzvwfikattbpktqnfxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93enZ3ZmlrYXR0YnBrdHFuZnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDM4NDksImV4cCI6MjA2NTc3OTg0OX0.Wtl8yH_AG3gGWUu2c8RyYL7WWUgD6LrcjUbY4HZL_rk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixCollectionImages() {
  try {
    console.log('🔍 Fetching collections with local file URIs...');
    
    // Get all collections
    const { data: collections, error } = await supabase
      .from('collections')
      .select('id, name, image, cover');
    
    if (error) {
      console.error('❌ Error fetching collections:', error);
      return;
    }
    
    if (!collections || collections.length === 0) {
      console.log('✅ No collections found!');
      return;
    }
    
    console.log(`📋 Found ${collections.length} collections total`);
    
    let fixedCount = 0;
    
    // Fix each collection
    for (const collection of collections) {
      console.log(`\n🔧 Fixing collection: ${collection.name} (${collection.id})`);
      
      const updates = {};
      
      // Check if image field has local URI
      if (collection.image && collection.image.startsWith('file://')) {
        console.log(`  ❌ Image has local URI: ${collection.image}`);
        updates.image = null; // Clear the invalid URI
      }
      
      // Check if cover field has local URI
      if (collection.cover && collection.cover.startsWith('file://')) {
        console.log(`  ❌ Cover has local URI: ${collection.cover}`);
        updates.cover = null; // Clear the invalid URI
      }
      
      // Update the collection if needed
      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('collections')
          .update(updates)
          .eq('id', collection.id);
        
        if (updateError) {
          console.error(`  ❌ Error updating collection:`, updateError);
        } else {
          console.log(`  ✅ Collection fixed!`);
        }
      }
    }
    
    console.log('\n✅ All collections processed!');
    console.log('\n📝 NOTE: Users will need to re-upload their collection images.');
    
  } catch (error) {
    console.error('❌ Exception:', error);
  }
}

// Run the script
fixCollectionImages();
