// Script para actualizar las políticas RLS en Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://owzvwfikattbpktqnfxi.supabase.co';
// Necesitamos la service key para modificar políticas RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'sbp_4be9f521c6a1b9a4379ae333a1af7170ad997d0b';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateRLSPolicies() {
  console.log('\n=== Updating RLS Policies ===\n');

  // Read the SQL file
  const sqlFile = path.join(__dirname, 'supabase', 'fix-rls-policies.sql');
  
  try {
    // Para ejecutar SQL directamente necesitamos usar la API REST de Supabase o el CLI
    console.log('⚠️  Cannot execute SQL directly from JavaScript client.');
    console.log('\nPlease run the following SQL in your Supabase SQL Editor:');
    console.log('Dashboard: https://supabase.com/dashboard/project/owzvwfikattbpktqnfxi/sql');
    console.log('\nSQL to execute:');
    console.log('--------------------------------------------------------------------------------');
    
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log(sql);
    console.log('--------------------------------------------------------------------------------\n');
    
    console.log('After executing the SQL, the following RLS policies will be in place:\n');
    console.log('COLLECTIONS:');
    console.log('  ✓ Users can only see their own collections OR public collections');
    console.log('  ✓ Users can only create/update/delete their own collections');
    console.log('\nITEMS:');
    console.log('  ✓ Users can only see their own items OR items in public collections');
    console.log('  ✓ Users can only create/update/delete their own items');
    console.log('\nUSER_PROFILES:');
    console.log('  ✓ Everyone can view all profiles');
    console.log('  ✓ Users can only modify their own profile');
    
  } catch (error) {
    console.error('Error reading SQL file:', error.message);
  }
}

updateRLSPolicies().catch(console.error);
