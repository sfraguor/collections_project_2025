-- Add category column to collections table
-- Migration: 20251222_add_category_to_collections

-- Add category column with default value 'other'
ALTER TABLE collections 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'other';

-- Add index for faster filtering by category
CREATE INDEX IF NOT EXISTS idx_collections_category ON collections(category);

-- Add comment to document the column
COMMENT ON COLUMN collections.category IS 'Category of the collection (art, books, music, cards, toys, etc.)';

-- Update existing rows to have 'other' category if NULL
UPDATE collections 
SET category = 'other' 
WHERE category IS NULL;
