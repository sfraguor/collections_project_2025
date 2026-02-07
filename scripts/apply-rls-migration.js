// Apply RLS Migration to Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://owzvwfikattbpktqnfxi.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY environment variable is required');
  console.log('\nTo run this script, you need the service role key from Supabase.');
  console.log('Get it from: https://supabase.com/dashboard/project/owzvwfikattbpktqnfxi/settings/api');
  console.log('\nThen run:');
  console.log('SUPABASE_SERVICE_KEY=your_service_key node apply-rls-migration.js');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('=== Applying RLS Policies Migration ===\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase', 'migrations', '20251228_fix_rls_policies.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('📊 Executing SQL statements...\n');

    // Execute the migration
    // Note: Supabase JS client doesn't support raw SQL execution
    // You need to either:
    // 1. Use Supabase CLI: supabase db push
    // 2. Or copy-paste this SQL into the Supabase SQL Editor
    // 3. Or use a PostgreSQL client directly

    console.log('⚠️  This script requires manual execution.');
    console.log('\nTo apply these policies, you have 3 options:\n');
    console.log('Option 1 - Supabase Dashboard (Recommended):');
    console.log('  1. Go to: https://supabase.com/dashboard/project/owzvwfikattbpktqnfxi/editor');
    console.log('  2. Click on "SQL Editor"');
    console.log('  3. Copy the contents of: supabase/migrations/20251228_fix_rls_policies.sql');
    console.log('  4. Paste and run\n');
    
    console.log('Option 2 - Supabase CLI:');
    console.log('  1. Install Supabase CLI: npm install -g supabase');
    console.log('  2. Link your project: supabase link --project-ref owzvwfikattbpktqnfxi');
    console.log('  3. Push migration: supabase db push\n');
    
    console.log('Option 3 - Direct PostgreSQL Connection:');
    console.log('  Use psql or any PostgreSQL client with your database connection string\n');

    console.log('📋 Migration SQL has been saved to:');
    console.log('   ' + migrationPath);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigration();
