// Check what tables exist in Supabase database
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://owzvwfikattbpktqnfxi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93enZ3ZmlrYXR0YnBrdHFuZnhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyMDM4NDksImV4cCI6MjA2NTc3OTg0OX0.Wtl8yH_AG3gGWUu2c8RyYL7WWUgD6LrcjUbY4HZL_rk';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTables() {
  console.log('🔍 Verificando tablas en Supabase...\n');
  
  const tablesToCheck = [
    'collections',
    'items', 
    'user_profiles',
    'collection_likes',
    'collection_comments',
    'user_follows',
    'sync_state'
  ];
  
  const existingTables = [];
  const missingTables = [];
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          missingTables.push(table);
          console.log(`❌ ${table}: No existe`);
        } else {
          console.log(`⚠️  ${table}: Error - ${error.message}`);
        }
      } else {
        existingTables.push(table);
        const count = data?.length || 0;
        console.log(`✅ ${table}: Existe (${count} registros)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Error inesperado - ${err.message}`);
      missingTables.push(table);
    }
  }
  
  console.log('\n📊 Resumen:');
  console.log(`✅ Tablas existentes: ${existingTables.length}/${tablesToCheck.length}`);
  if (existingTables.length > 0) {
    console.log(`   ${existingTables.join(', ')}`);
  }
  
  if (missingTables.length > 0) {
    console.log(`❌ Tablas faltantes: ${missingTables.length}`);
    console.log(`   ${missingTables.join(', ')}`);
    console.log('\n💡 Necesitas ejecutar las migraciones en Supabase SQL Editor');
  }
}

checkTables();
