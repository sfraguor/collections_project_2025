-- Add missing columns to items table
ALTER TABLE items 
  ADD COLUMN IF NOT EXISTS card_number TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS purchase_price TEXT,
  ADD COLUMN IF NOT EXISTS purchase_currency TEXT DEFAULT 'EUR',
  ADD COLUMN IF NOT EXISTS current_market_price NUMERIC,
  ADD COLUMN IF NOT EXISTS current_market_currency TEXT,
  ADD COLUMN IF NOT EXISTS ebay_search_terms TEXT,
  ADD COLUMN IF NOT EXISTS price_history JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS last_price_update TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS high_value BOOLEAN DEFAULT FALSE;

-- Create index on card_number for faster queries
CREATE INDEX IF NOT EXISTS items_card_number_idx ON items(card_number) WHERE card_number IS NOT NULL;

-- Create index on ebay_search_terms for faster queries
CREATE INDEX IF NOT EXISTS items_ebay_search_terms_idx ON items(ebay_search_terms) WHERE ebay_search_terms IS NOT NULL;

-- Update timestamp trigger still works for updated_at column
