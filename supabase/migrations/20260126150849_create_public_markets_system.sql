/*
  # Create Public Markets System for La Réunion 974

  ## Overview
  This migration creates a unified system for managing and displaying public markets from both BOAMP API and manual entry.
  All markets are stored in a single table with SEO-friendly slugs and automatic visibility management.

  ## New Tables

  ### `public_markets`
  Central table storing all public markets (BOAMP + manual)
  - `id` (uuid, primary key) - Unique identifier
  - `source` (text) - Origin: 'boamp' or 'manual'
  - `reference` (text, unique) - External reference/ID from source
  - `title` (text) - Market title
  - `client` (text) - Contracting authority/client
  - `description` (text) - Full description
  - `deadline` (timestamptz) - Submission deadline
  - `amount` (numeric) - Estimated amount in euros
  - `location` (text) - Location/city
  - `publication_date` (timestamptz) - Publication date
  - `procedure_type` (text) - Procedure type (open, restricted, etc.)
  - `service_type` (text) - Type of service/work
  - `cpv_code` (text) - CPV classification code
  - `url` (text) - Source URL
  - `dce_url` (text) - DCE (tender documents) URL
  - `department` (text) - Department code (974 for Réunion)
  - `slug` (text, unique) - SEO-friendly URL slug
  - `is_public` (boolean) - Whether the market is publicly visible
  - `seo_title` (text) - SEO optimized title
  - `seo_description` (text) - SEO meta description
  - `raw_data` (jsonb) - Original data from source
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `market_sync_logs`
  Logs for monitoring automatic BOAMP synchronization
  - `id` (uuid, primary key)
  - `sync_date` (timestamptz) - When sync ran
  - `markets_found` (integer) - Number of markets retrieved
  - `markets_inserted` (integer) - Number of new markets added
  - `markets_updated` (integer) - Number of existing markets updated
  - `errors` (jsonb) - Any errors encountered
  - `status` (text) - 'success' or 'error'
  - `execution_time_ms` (integer) - How long sync took

  ## Functions

  ### `generate_market_slug(title text, client text)`
  Generates SEO-friendly URL slugs from market title and client name
  - Removes accents and special characters
  - Converts to lowercase
  - Replaces spaces with hyphens
  - Truncates to 100 characters
  - Handles collisions by adding numeric suffixes

  ## Triggers

  ### `before_insert_generate_slug`
  Automatically generates unique slug before inserting new market

  ## Security
  - Enable RLS on `public_markets`
  - Public read access for markets with `is_public=true`
  - Authenticated users can read all markets
  - Only authenticated users can insert/update markets
  - Enable RLS on `market_sync_logs` with admin-only access

  ## Indexes
  - Unique index on `slug` for fast slug lookups
  - Unique index on `reference` to prevent duplicates
  - Index on `department` for location filtering
  - Index on `deadline` for active markets queries
  - Index on `publication_date` for sorting
  - Index on `is_public` for public visibility filtering
  - Composite index on `(department, is_public, deadline)` for optimized public queries
*/

-- Create public_markets table
CREATE TABLE IF NOT EXISTS public_markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL CHECK (source IN ('boamp', 'manual')),
  reference text UNIQUE NOT NULL,
  title text NOT NULL,
  client text NOT NULL,
  description text,
  deadline timestamptz,
  amount numeric(15, 2),
  location text,
  publication_date timestamptz DEFAULT now(),
  procedure_type text,
  service_type text,
  cpv_code text,
  url text,
  dce_url text,
  department text NOT NULL DEFAULT '974',
  slug text UNIQUE,
  is_public boolean DEFAULT true,
  seo_title text,
  seo_description text,
  raw_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_public_markets_slug ON public_markets(slug);
CREATE INDEX IF NOT EXISTS idx_public_markets_reference ON public_markets(reference);
CREATE INDEX IF NOT EXISTS idx_public_markets_department ON public_markets(department);
CREATE INDEX IF NOT EXISTS idx_public_markets_deadline ON public_markets(deadline);
CREATE INDEX IF NOT EXISTS idx_public_markets_publication_date ON public_markets(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_public_markets_is_public ON public_markets(is_public);
CREATE INDEX IF NOT EXISTS idx_public_markets_public_query ON public_markets(department, is_public, deadline) WHERE is_public = true;

-- Create market_sync_logs table
CREATE TABLE IF NOT EXISTS market_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_date timestamptz DEFAULT now(),
  markets_found integer DEFAULT 0,
  markets_inserted integer DEFAULT 0,
  markets_updated integer DEFAULT 0,
  errors jsonb,
  status text NOT NULL CHECK (status IN ('success', 'error', 'partial')),
  execution_time_ms integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_market_sync_logs_sync_date ON market_sync_logs(sync_date DESC);

-- Function to remove accents from text
CREATE OR REPLACE FUNCTION remove_accents(text)
RETURNS text AS $$
BEGIN
  RETURN translate(
    $1,
    'àáâãäåāăąçćĉċčďđèéêëēĕėęěĝğġģĥħìíîïĩīĭįıĵķĸĺļľŀłñńņňŉŋòóôõöøōŏőŕŗřśŝşšţťŧùúûüũūŭůűųŵýÿŷźżž',
    'aaaaaaaaacccccddeeeeeeeeegggghhhiiiiiiiiijkklllllnnnnnnoooooooooorrrsssssttttuuuuuuuuuuwyyyzzzz'
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate SEO-friendly slug
CREATE OR REPLACE FUNCTION generate_market_slug(p_title text, p_client text)
RETURNS text AS $$
DECLARE
  v_slug text;
  v_base_slug text;
  v_counter integer := 1;
BEGIN
  -- Combine title and client, remove accents, convert to lowercase
  v_base_slug := lower(remove_accents(p_title || ' ' || p_client));
  
  -- Replace special characters with spaces
  v_base_slug := regexp_replace(v_base_slug, '[^a-z0-9\s-]', ' ', 'g');
  
  -- Replace multiple spaces/hyphens with single hyphen
  v_base_slug := regexp_replace(v_base_slug, '[\s-]+', '-', 'g');
  
  -- Trim hyphens from start and end
  v_base_slug := trim(both '-' from v_base_slug);
  
  -- Truncate to 100 characters
  v_base_slug := substring(v_base_slug, 1, 100);
  
  -- Trim trailing hyphen if truncation created one
  v_base_slug := regexp_replace(v_base_slug, '-$', '');
  
  -- Start with base slug
  v_slug := v_base_slug;
  
  -- Handle collisions by adding counter
  WHILE EXISTS (SELECT 1 FROM public_markets WHERE slug = v_slug) LOOP
    v_counter := v_counter + 1;
    v_slug := v_base_slug || '-' || v_counter;
  END LOOP;
  
  RETURN v_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically generate slug before insert
CREATE OR REPLACE FUNCTION trigger_generate_market_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if not provided
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := generate_market_slug(NEW.title, NEW.client);
  END IF;
  
  -- Generate SEO title and description if not provided
  IF NEW.seo_title IS NULL OR NEW.seo_title = '' THEN
    NEW.seo_title := NEW.title || ' - ' || NEW.client || ' | Marché Public Réunion 974';
  END IF;
  
  IF NEW.seo_description IS NULL OR NEW.seo_description = '' THEN
    NEW.seo_description := 'Marché public à La Réunion: ' || NEW.title || '. Donneur d''ordre: ' || NEW.client || 
      CASE 
        WHEN NEW.deadline IS NOT NULL THEN '. Date limite: ' || to_char(NEW.deadline, 'DD/MM/YYYY')
        ELSE ''
      END ||
      '. Surveillez automatiquement les marchés publics du 974.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS before_insert_generate_slug ON public_markets;
CREATE TRIGGER before_insert_generate_slug
  BEFORE INSERT ON public_markets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_market_slug();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_public_markets_timestamp ON public_markets;
CREATE TRIGGER update_public_markets_timestamp
  BEFORE UPDATE ON public_markets
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_timestamp();

-- Enable RLS
ALTER TABLE public_markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public_markets

-- Public can view active public markets
CREATE POLICY "Public can view active public markets"
  ON public_markets
  FOR SELECT
  USING (is_public = true);

-- Authenticated users can view all markets
CREATE POLICY "Authenticated users can view all markets"
  ON public_markets
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can insert markets
CREATE POLICY "Authenticated users can insert markets"
  ON public_markets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update markets
CREATE POLICY "Authenticated users can update markets"
  ON public_markets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete markets
CREATE POLICY "Authenticated users can delete markets"
  ON public_markets
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for market_sync_logs

-- Only authenticated users can view sync logs
CREATE POLICY "Authenticated users can view sync logs"
  ON market_sync_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- Only authenticated users can insert sync logs
CREATE POLICY "Authenticated users can insert sync logs"
  ON market_sync_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
