-- Add custom_fields column to items for category-specific fields
ALTER TABLE items 
  ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;

-- Create index on custom_fields for faster queries
CREATE INDEX IF NOT EXISTS items_custom_fields_idx ON items USING GIN (custom_fields);

-- Examples of custom_fields structure:
-- For kokeshi: {"author": "Artist Name", "style": "Naruko"}
-- For other categories: can add their own fields as needed
