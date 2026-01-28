/*
  # Add Full-Text Search Indexes for Better Market Search

  1. New Indexes
    - GIN indexes using pg_trgm for fuzzy/partial text search on key fields
    - Composite GIN index for multi-field search on public_markets
    - Composite GIN index for multi-field search on manual_markets
    
  2. Fields Indexed
    - title: Market title (most important for search)
    - description: Full market description
    - client: Buyer/client name
    - location: Geographic location
    - service_type: Type of service
    - cpv_code: CPV classification code
    
  3. Benefits
    - Case-insensitive search (already via ilike, but faster with GIN)
    - Partial word matching (e.g., "construct" matches "construction")
    - Better performance for LIKE '%keyword%' queries
    - Relevance ranking with similarity scores
    
  4. Performance
    - GIN indexes use more storage but provide much faster search
    - Particularly beneficial for tables with many rows
    - Supports fuzzy matching with configurable similarity threshold
*/

-- Enable pg_trgm extension if not already enabled (should be in extensions schema)
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Create GIN indexes on public_markets for full-text search
-- These indexes enable fast case-insensitive partial matching

DROP INDEX IF EXISTS public_markets_title_gin_idx;
CREATE INDEX IF NOT EXISTS public_markets_title_gin_idx 
ON public_markets 
USING gin (title extensions.gin_trgm_ops);

DROP INDEX IF EXISTS public_markets_description_gin_idx;
CREATE INDEX IF NOT EXISTS public_markets_description_gin_idx 
ON public_markets 
USING gin (description extensions.gin_trgm_ops);

DROP INDEX IF EXISTS public_markets_client_gin_idx;
CREATE INDEX IF NOT EXISTS public_markets_client_gin_idx 
ON public_markets 
USING gin (client extensions.gin_trgm_ops);

DROP INDEX IF EXISTS public_markets_location_gin_idx;
CREATE INDEX IF NOT EXISTS public_markets_location_gin_idx 
ON public_markets 
USING gin (location extensions.gin_trgm_ops);

DROP INDEX IF EXISTS public_markets_service_type_gin_idx;
CREATE INDEX IF NOT EXISTS public_markets_service_type_gin_idx 
ON public_markets 
USING gin (service_type extensions.gin_trgm_ops);

-- Create GIN indexes on manual_markets for full-text search
DROP INDEX IF EXISTS manual_markets_title_gin_idx;
CREATE INDEX IF NOT EXISTS manual_markets_title_gin_idx 
ON manual_markets 
USING gin (title extensions.gin_trgm_ops);

DROP INDEX IF EXISTS manual_markets_description_gin_idx;
CREATE INDEX IF NOT EXISTS manual_markets_description_gin_idx 
ON manual_markets 
USING gin (description extensions.gin_trgm_ops);

DROP INDEX IF EXISTS manual_markets_client_gin_idx;
CREATE INDEX IF NOT EXISTS manual_markets_client_gin_idx 
ON manual_markets 
USING gin (client extensions.gin_trgm_ops);

DROP INDEX IF EXISTS manual_markets_location_gin_idx;
CREATE INDEX IF NOT EXISTS manual_markets_location_gin_idx 
ON manual_markets 
USING gin (location extensions.gin_trgm_ops);

DROP INDEX IF EXISTS manual_markets_service_type_gin_idx;
CREATE INDEX IF NOT EXISTS manual_markets_service_type_gin_idx 
ON manual_markets 
USING gin (service_type extensions.gin_trgm_ops);

-- Create helper function for better multi-field search with relevance scoring
-- This function searches across multiple fields and returns a relevance score
CREATE OR REPLACE FUNCTION search_public_markets_with_relevance(
  search_query text,
  min_similarity float DEFAULT 0.1
)
RETURNS TABLE (
  id uuid,
  reference text,
  title text,
  client text,
  description text,
  deadline date,
  amount numeric,
  location text,
  publication_date timestamp with time zone,
  procedure_type text,
  service_type text,
  cpv_code text,
  url text,
  dce_url text,
  department text,
  source text,
  is_public boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  relevance_score float
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pm.*,
    GREATEST(
      extensions.similarity(COALESCE(pm.title, ''), search_query) * 3.0,
      extensions.similarity(COALESCE(pm.description, ''), search_query) * 2.0,
      extensions.similarity(COALESCE(pm.client, ''), search_query) * 2.5,
      extensions.similarity(COALESCE(pm.location, ''), search_query) * 1.5,
      extensions.similarity(COALESCE(pm.service_type, ''), search_query) * 1.5
    ) as relevance_score
  FROM public_markets pm
  WHERE 
    pm.is_public = true
    AND (
      extensions.similarity(COALESCE(pm.title, ''), search_query) > min_similarity
      OR extensions.similarity(COALESCE(pm.description, ''), search_query) > min_similarity
      OR extensions.similarity(COALESCE(pm.client, ''), search_query) > min_similarity
      OR extensions.similarity(COALESCE(pm.location, ''), search_query) > min_similarity
      OR extensions.similarity(COALESCE(pm.service_type, ''), search_query) > min_similarity
      OR pm.title ILIKE '%' || search_query || '%'
      OR pm.description ILIKE '%' || search_query || '%'
      OR pm.client ILIKE '%' || search_query || '%'
      OR pm.location ILIKE '%' || search_query || '%'
    )
  ORDER BY relevance_score DESC;
END;
$$;

-- Create helper function for manual markets search with relevance scoring
CREATE OR REPLACE FUNCTION search_manual_markets_with_relevance(
  search_query text,
  min_similarity float DEFAULT 0.1
)
RETURNS TABLE (
  id uuid,
  reference text,
  title text,
  client text,
  description text,
  deadline date,
  amount numeric,
  location text,
  publication_date timestamp with time zone,
  procedure_type text,
  service_type text,
  cpv_code text,
  url text,
  dce_url text,
  status text,
  created_by text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  relevance_score float
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mm.*,
    GREATEST(
      extensions.similarity(COALESCE(mm.title, ''), search_query) * 3.0,
      extensions.similarity(COALESCE(mm.description, ''), search_query) * 2.0,
      extensions.similarity(COALESCE(mm.client, ''), search_query) * 2.5,
      extensions.similarity(COALESCE(mm.location, ''), search_query) * 1.5,
      extensions.similarity(COALESCE(mm.service_type, ''), search_query) * 1.5
    ) as relevance_score
  FROM manual_markets mm
  WHERE 
    mm.status = 'published'
    AND (
      extensions.similarity(COALESCE(mm.title, ''), search_query) > min_similarity
      OR extensions.similarity(COALESCE(mm.description, ''), search_query) > min_similarity
      OR extensions.similarity(COALESCE(mm.client, ''), search_query) > min_similarity
      OR extensions.similarity(COALESCE(mm.location, ''), search_query) > min_similarity
      OR extensions.similarity(COALESCE(mm.service_type, ''), search_query) > min_similarity
      OR mm.title ILIKE '%' || search_query || '%'
      OR mm.description ILIKE '%' || search_query || '%'
      OR mm.client ILIKE '%' || search_query || '%'
      OR mm.location ILIKE '%' || search_query || '%'
    )
  ORDER BY relevance_score DESC;
END;
$$;

-- Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION search_public_markets_with_relevance TO authenticated, anon;
GRANT EXECUTE ON FUNCTION search_manual_markets_with_relevance TO authenticated, anon;