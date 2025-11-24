/*
  # Add market_url column to markets table

  1. Changes
    - Add `market_url` column to `markets` table to store the external consultation link
    - Column is optional (nullable) as existing markets may not have URLs
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'markets' AND column_name = 'market_url'
  ) THEN
    ALTER TABLE markets ADD COLUMN market_url text;
  END IF;
END $$;
