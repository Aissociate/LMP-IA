/*
  # Add section_id column to memo_sections for reliable auto-save

  1. Modified Tables
    - `memo_sections`
      - Added `section_id` (text) - stable identifier for each section (e.g. 'page_garde', 'comprehension_besoin')
  
  2. New Indexes
    - Unique constraint on `(market_id, user_id, section_id)` to enable upsert by section key
  
  3. Important Notes
    - This enables auto-saving sections immediately after AI generation
    - The unique constraint allows upsert operations without needing to check existence first
    - Existing rows without section_id are unaffected (constraint only applies where section_id IS NOT NULL)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'memo_sections' AND column_name = 'section_id'
  ) THEN
    ALTER TABLE memo_sections ADD COLUMN section_id text;
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_memo_sections_market_user_section
  ON memo_sections (market_id, user_id, section_id)
  WHERE section_id IS NOT NULL;
