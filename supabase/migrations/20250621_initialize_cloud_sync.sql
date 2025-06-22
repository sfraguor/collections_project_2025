-- Initialize tables and functions for cloud sync
-- Run this in the Supabase SQL editor

-- First, create all tables directly (not through functions)
-- This ensures they exist before we create any references

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image TEXT,
  cover TEXT,  -- Cover image URI
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  user_id_local TEXT -- Store the original userId from local storage
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS collections_user_id_idx ON collections(user_id);

-- Create index on updated_at for sync queries
CREATE INDEX IF NOT EXISTS collections_updated_at_idx ON collections(updated_at);

-- Enable Row Level Security
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own collections
DROP POLICY IF EXISTS collections_policy ON collections;
CREATE POLICY collections_policy ON collections
  USING (auth.uid() = user_id);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY, -- Using TEXT instead of UUID since local IDs are strings
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  images TEXT[],
  image TEXT, -- For backward compatibility
  price TEXT,
  purchase_date TEXT,
  condition TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  user_id_local TEXT -- Store the original userId from local storage
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);

-- Create index on collection_id for faster queries
CREATE INDEX IF NOT EXISTS items_collection_id_idx ON items(collection_id);

-- Create index on updated_at for sync queries
CREATE INDEX IF NOT EXISTS items_updated_at_idx ON items(updated_at);

-- Enable Row Level Security
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own items
DROP POLICY IF EXISTS items_policy ON items;
CREATE POLICY items_policy ON items
  USING (auth.uid() = user_id);

-- Create sync_state table to track last sync time for each user
CREATE TABLE IF NOT EXISTS sync_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_synced TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sync_state ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see their own sync state
DROP POLICY IF EXISTS sync_state_policy ON sync_state;
CREATE POLICY sync_state_policy ON sync_state
  USING (auth.uid() = user_id);

-- Now create the functions that will be called from the app
-- These functions will be used to ensure tables exist

CREATE OR REPLACE FUNCTION initialize_collections_table()
RETURNS void AS $$
BEGIN
  -- Table is already created above, so this is just a placeholder
  -- that returns successfully
  RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION initialize_items_table()
RETURNS void AS $$
BEGIN
  -- Table is already created above, so this is just a placeholder
  -- that returns successfully
  RETURN;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION initialize_sync_state_table()
RETURNS void AS $$
BEGIN
  -- Table is already created above, so this is just a placeholder
  -- that returns successfully
  RETURN;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp on collections
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to collections table
DROP TRIGGER IF EXISTS update_collections_modtime ON collections;
CREATE TRIGGER update_collections_modtime
BEFORE UPDATE ON collections
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Apply trigger to items table
DROP TRIGGER IF EXISTS update_items_modtime ON items;
CREATE TRIGGER update_items_modtime
BEFORE UPDATE ON items
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Add a test function to verify the setup is working
CREATE OR REPLACE FUNCTION test_cloud_sync_setup()
RETURNS TEXT AS $$
DECLARE
  collections_count INTEGER;
  items_count INTEGER;
  sync_state_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO collections_count FROM pg_tables WHERE tablename = 'collections';
  SELECT COUNT(*) INTO items_count FROM pg_tables WHERE tablename = 'items';
  SELECT COUNT(*) INTO sync_state_count FROM pg_tables WHERE tablename = 'sync_state';
  
  RETURN 'Setup complete: Collections table: ' || 
         CASE WHEN collections_count > 0 THEN 'OK' ELSE 'Missing' END ||
         ', Items table: ' || 
         CASE WHEN items_count > 0 THEN 'OK' ELSE 'Missing' END ||
         ', Sync state table: ' || 
         CASE WHEN sync_state_count > 0 THEN 'OK' ELSE 'Missing' END;
END;
$$ LANGUAGE plpgsql;

-- Run the test function to verify setup
SELECT test_cloud_sync_setup();
