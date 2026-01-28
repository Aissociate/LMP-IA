/*
  # Fix duplicate detection functions search_path
  
  1. Changes
    - Update search_path to include 'extensions' schema for pg_trgm functions
    - This allows similarity() function to be found
    
  2. Security
    - Maintain SECURITY DEFINER
*/

-- Update check_boamp_market_duplicates search_path
DROP FUNCTION IF EXISTS check_boamp_market_duplicates(text, text, timestamptz, text);

CREATE FUNCTION check_boamp_market_duplicates(
  p_reference text,
  p_title text,
  p_deadline timestamptz,
  p_url text
)
RETURNS TABLE(
  id text,
  reference text,
  title text,
  deadline timestamptz,
  url text,
  match_type text,
  match_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.id::text,
    pm.reference,
    pm.title,
    pm.deadline,
    pm.url,
    CASE 
      WHEN pm.reference = p_reference THEN 'exact_reference'
      WHEN pm.url = p_url AND p_url IS NOT NULL THEN 'same_url'
      WHEN pm.title = p_title AND ABS(EXTRACT(EPOCH FROM (pm.deadline - p_deadline))) < 86400 THEN 'same_title_date'
      ELSE 'similar'
    END as match_type,
    CASE 
      WHEN pm.reference = p_reference THEN 100
      WHEN pm.url = p_url AND p_url IS NOT NULL THEN 95
      WHEN pm.title = p_title AND ABS(EXTRACT(EPOCH FROM (pm.deadline - p_deadline))) < 86400 THEN 90
      WHEN similarity(pm.title, p_title) > 0.8 AND ABS(EXTRACT(EPOCH FROM (pm.deadline - p_deadline))) < 172800 THEN 80
      ELSE 50
    END as match_score
  FROM public_markets pm
  WHERE 
    pm.source != 'manual'  -- Only check BOAMP/Reunion markets, not manual ones
    AND (
      pm.reference = p_reference
      OR (pm.url = p_url AND p_url IS NOT NULL)
      OR (pm.title = p_title AND ABS(EXTRACT(EPOCH FROM (pm.deadline - p_deadline))) < 86400)
      OR (similarity(pm.title, p_title) > 0.7 AND ABS(EXTRACT(EPOCH FROM (pm.deadline - p_deadline))) < 172800)
    )
  ORDER BY match_score DESC
  LIMIT 10;
END;
$$;

-- Update check_manual_market_duplicates search_path
DROP FUNCTION IF EXISTS check_manual_market_duplicates(text, text, text, timestamptz, text, uuid);

CREATE FUNCTION check_manual_market_duplicates(
  p_reference text,
  p_title text,
  p_client text,
  p_deadline timestamptz,
  p_url text,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS TABLE(
  id uuid,
  reference text,
  title text,
  client text,
  deadline timestamptz,
  url text,
  match_type text,
  match_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mm.id,
    mm.reference,
    mm.title,
    mm.client,
    mm.deadline,
    mm.url,
    CASE 
      WHEN mm.reference = p_reference THEN 'exact_reference'
      WHEN mm.url = p_url AND p_url IS NOT NULL THEN 'same_url'
      WHEN mm.title = p_title AND mm.client = p_client AND ABS(EXTRACT(EPOCH FROM (mm.deadline - p_deadline))) < 86400 THEN 'same_title_client_date'
      ELSE 'similar'
    END as match_type,
    CASE 
      WHEN mm.reference = p_reference THEN 100
      WHEN mm.url = p_url AND p_url IS NOT NULL THEN 95
      WHEN mm.title = p_title AND mm.client = p_client AND ABS(EXTRACT(EPOCH FROM (mm.deadline - p_deadline))) < 86400 THEN 90
      WHEN similarity(mm.title, p_title) > 0.7 AND similarity(mm.client, p_client) > 0.7 THEN 75
      ELSE 50
    END as match_score
  FROM manual_markets mm
  WHERE 
    (p_exclude_id IS NULL OR mm.id != p_exclude_id)
    AND (
      mm.reference = p_reference
      OR (mm.url = p_url AND p_url IS NOT NULL)
      OR (mm.title = p_title AND mm.client = p_client AND ABS(EXTRACT(EPOCH FROM (mm.deadline - p_deadline))) < 86400)
      OR (similarity(mm.title, p_title) > 0.6 AND similarity(mm.client, p_client) > 0.6)
    )
  ORDER BY match_score DESC
  LIMIT 10;
END;
$$;

-- Update check_all_market_duplicates search_path
DROP FUNCTION IF EXISTS check_all_market_duplicates(text, text, text, timestamptz, text, uuid);

CREATE FUNCTION check_all_market_duplicates(
  p_reference text,
  p_title text,
  p_client text,
  p_deadline timestamptz,
  p_url text,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS TABLE(
  source_type text,
  id text,
  reference text,
  title text,
  organisme text,
  deadline timestamptz,
  url text,
  match_type text,
  match_score integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  RETURN QUERY
  -- Retourner d'abord les doublons BOAMP (priorité plus haute)
  SELECT 
    'boamp'::text as source_type,
    b.id,
    b.reference,
    b.title,
    ''::text as organisme,
    b.deadline,
    b.url,
    b.match_type,
    b.match_score + 1000 as match_score -- Bonus pour les marchés BOAMP
  FROM check_boamp_market_duplicates(p_reference, p_title, p_deadline, p_url) b

  UNION ALL

  -- Puis les doublons manuels
  SELECT 
    'manual'::text as source_type,
    m.id::text,
    m.reference,
    m.title,
    m.client as organisme,
    m.deadline,
    m.url,
    m.match_type,
    m.match_score
  FROM check_manual_market_duplicates(p_reference, p_title, p_client, p_deadline, p_url, p_exclude_id) m

  ORDER BY match_score DESC
  LIMIT 20;
END;
$$;
