/*
  # Merge redundant prospect triggers and standardize function settings

  ## 1. Merge prospect date trigger functions
  - `clean_prospect_dates` and `fix_empty_dates` were both on `prospects` table
  - Both did similar work: ensure created_at/updated_at are not null
  - `fix_empty_dates` also cleaned empty phone strings
  - Merged into a single `sanitize_prospect_data()` function
  - Both functions were missing search_path (security issue)

  ## 2. Standardize search_path on remaining functions
  - `generate_manual_market_reference` - already correct
  - `generate_market_slug` - already correct
  - `trigger_generate_market_slug` - already correct
  - `remove_accents` - already correct
  - Functions that need `extensions` schema keep it
*/

-- Merge the two prospect triggers into one
CREATE OR REPLACE FUNCTION sanitize_prospect_data()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NEW.created_at IS NULL OR NEW.created_at::text = '' THEN
    NEW.created_at := now();
  END IF;

  IF NEW.updated_at IS NULL OR NEW.updated_at::text = '' THEN
    NEW.updated_at := now();
  END IF;

  IF NEW.phone = '' THEN
    NEW.phone := NULL;
  END IF;

  RETURN NEW;
END;
$$;

-- Drop old triggers, create new unified one
DROP TRIGGER IF EXISTS tr_clean_prospect_dates ON prospects;
DROP TRIGGER IF EXISTS tr_fix_empty_dates ON prospects;

CREATE TRIGGER sanitize_prospect_data
  BEFORE INSERT OR UPDATE ON prospects
  FOR EACH ROW
  EXECUTE FUNCTION sanitize_prospect_data();

-- Drop the old functions
DROP FUNCTION IF EXISTS clean_prospect_dates();
DROP FUNCTION IF EXISTS fix_empty_dates();
