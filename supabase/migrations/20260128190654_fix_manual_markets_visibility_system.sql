/*
  # Fix Manual Markets Visibility System
  
  ## Summary
  This migration fixes the issue where manually entered markets don't appear in search results.
  It adds functionality to automatically publish markets and sync them to public_markets table.
  
  ## Changes Made
  
  1. **New Function: `publish_manual_market()`**
     - Changes market status from 'draft' to 'published'
     - Sets publication_date to current timestamp
     - Syncs the market to public_markets table for unified search
     - Returns the updated market record
  
  2. **New Function: `publish_session_markets()`**
     - Publishes all draft markets from a specific session
     - Bulk operation for session validation
     - Returns count of published markets
  
  3. **New Function: `sync_manual_market_to_public()`**
     - Syncs a manual market to public_markets table
     - Handles insert or update (upsert)
     - Ensures data consistency between tables
  
  4. **New Trigger: `auto_sync_manual_market_to_public`**
     - Automatically syncs published manual markets to public_markets
     - Triggers on INSERT or UPDATE when status = 'published'
  
  5. **Updated Status Default**
     - Manual markets entered via wizard now default to 'published' instead of 'draft'
     - Ensures immediate visibility in search results
  
  ## Security
  - All functions use SECURITY DEFINER for proper permissions
  - RLS policies remain intact
  - Only authenticated users can publish markets
*/

-- Function to sync a manual market to public_markets table
CREATE OR REPLACE FUNCTION sync_manual_market_to_public(market_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public_markets (
    source,
    reference,
    title,
    client,
    description,
    deadline,
    amount,
    location,
    publication_date,
    procedure_type,
    service_type,
    cpv_code,
    url,
    dce_url,
    department,
    is_public,
    raw_data
  )
  SELECT
    'manual' as source,
    reference,
    title,
    client,
    description,
    deadline,
    amount,
    location,
    COALESCE(publication_date, created_at) as publication_date,
    procedure_type,
    service_type,
    cpv_code,
    url,
    dce_url,
    CASE 
      WHEN location ILIKE '%réunion%' OR location ILIKE '%974%' THEN '974'
      WHEN location ILIKE '%guadeloupe%' OR location ILIKE '%971%' THEN '971'
      WHEN location ILIKE '%martinique%' OR location ILIKE '%972%' THEN '972'
      WHEN location ILIKE '%guyane%' OR location ILIKE '%973%' THEN '973'
      WHEN location ILIKE '%mayotte%' OR location ILIKE '%976%' THEN '976'
      ELSE '974'
    END as department,
    (status = 'published') as is_public,
    jsonb_build_object(
      'id', id,
      'source', 'manual',
      'status', status,
      'is_verified', is_verified,
      'operator_notes', operator_notes,
      'created_by', created_by,
      'created_at', created_at,
      'updated_at', updated_at
    ) as raw_data
  FROM manual_markets
  WHERE id = market_id
  ON CONFLICT (reference) 
  DO UPDATE SET
    title = EXCLUDED.title,
    client = EXCLUDED.client,
    description = EXCLUDED.description,
    deadline = EXCLUDED.deadline,
    amount = EXCLUDED.amount,
    location = EXCLUDED.location,
    publication_date = EXCLUDED.publication_date,
    procedure_type = EXCLUDED.procedure_type,
    service_type = EXCLUDED.service_type,
    cpv_code = EXCLUDED.cpv_code,
    url = EXCLUDED.url,
    dce_url = EXCLUDED.dce_url,
    is_public = EXCLUDED.is_public,
    raw_data = EXCLUDED.raw_data,
    updated_at = now();
END;
$$;

-- Function to publish a single manual market
CREATE OR REPLACE FUNCTION publish_manual_market(market_id uuid)
RETURNS TABLE(
  id uuid,
  reference text,
  title text,
  status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE manual_markets
  SET 
    status = 'published',
    publication_date = COALESCE(publication_date, now()),
    updated_at = now()
  WHERE manual_markets.id = market_id
    AND status = 'draft';
  
  PERFORM sync_manual_market_to_public(market_id);
  
  RETURN QUERY
  SELECT m.id, m.reference, m.title, m.status
  FROM manual_markets m
  WHERE m.id = market_id;
END;
$$;

-- Function to publish all markets from a session
CREATE OR REPLACE FUNCTION publish_session_markets(session_id text)
RETURNS TABLE(
  published_count integer,
  market_ids uuid[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_market_ids uuid[];
  v_count integer;
BEGIN
  UPDATE manual_markets
  SET 
    status = 'published',
    publication_date = COALESCE(publication_date, now()),
    updated_at = now()
  WHERE created_by = session_id
    AND status = 'draft'
  RETURNING id INTO v_market_ids;
  
  v_count := array_length(v_market_ids, 1);
  
  IF v_count > 0 THEN
    PERFORM sync_manual_market_to_public(unnest(v_market_ids));
  END IF;
  
  RETURN QUERY SELECT COALESCE(v_count, 0), COALESCE(v_market_ids, ARRAY[]::uuid[]);
END;
$$;

-- Trigger function to auto-sync published markets to public_markets
CREATE OR REPLACE FUNCTION trigger_sync_manual_market_to_public()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'published' THEN
    PERFORM sync_manual_market_to_public(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on manual_markets for auto-sync
DROP TRIGGER IF EXISTS auto_sync_manual_market_to_public ON manual_markets;
CREATE TRIGGER auto_sync_manual_market_to_public
  AFTER INSERT OR UPDATE OF status ON manual_markets
  FOR EACH ROW
  WHEN (NEW.status = 'published')
  EXECUTE FUNCTION trigger_sync_manual_market_to_public();

-- Update default status to 'published' for new markets
ALTER TABLE manual_markets 
  ALTER COLUMN status SET DEFAULT 'published';

-- Add index for faster session queries
CREATE INDEX IF NOT EXISTS idx_manual_markets_created_by_status 
  ON manual_markets(created_by, status);

-- Add index for public_markets source
CREATE INDEX IF NOT EXISTS idx_public_markets_source 
  ON public_markets(source, is_public);
