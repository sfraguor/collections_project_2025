-- Add missing columns to collections table
-- This ensures all columns used by the app exist in the database

-- Add cover column (for cover image URI)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='collections' AND column_name='cover') THEN
    ALTER TABLE collections ADD COLUMN cover TEXT;
  END IF;
END $$;

-- Add color column (for collection theme color)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='collections' AND column_name='color') THEN
    ALTER TABLE collections ADD COLUMN color TEXT;
  END IF;
END $$;

-- Add icon column (for collection icon)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='collections' AND column_name='icon') THEN
    ALTER TABLE collections ADD COLUMN icon TEXT;
  END IF;
END $$;

-- Add category column (for collection categorization)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='collections' AND column_name='category') THEN
    ALTER TABLE collections ADD COLUMN category VARCHAR(50) DEFAULT 'other';
  END IF;
END $$;

-- Add is_public column (for community features)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name='collections' AND column_name='is_public') THEN
    ALTER TABLE collections ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Create indexes for faster filtering
CREATE INDEX IF NOT EXISTS collections_category_idx ON collections(category);
CREATE INDEX IF NOT EXISTS collections_is_public_idx ON collections(is_public);

-- Add comments
COMMENT ON COLUMN collections.cover IS 'Cover image URI for the collection';
COMMENT ON COLUMN collections.color IS 'Theme color for the collection';
COMMENT ON COLUMN collections.icon IS 'Icon identifier for the collection';
COMMENT ON COLUMN collections.category IS 'Category type for the collection (e.g., comics, cards, figures, etc.)';
COMMENT ON COLUMN collections.is_public IS 'Whether the collection is publicly visible in the community';
