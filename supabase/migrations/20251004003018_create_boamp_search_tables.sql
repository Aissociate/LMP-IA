/*
  # Create BOAMP Search and Favorites Tables

  1. New Tables
    - `boamp_favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `boamp_reference` (text, unique per user) - Reference from BOAMP
      - `title` (text) - Title of the market
      - `client` (text) - Client/organization name
      - `description` (text) - Market description
      - `deadline` (timestamptz) - Deadline for submissions
      - `amount` (numeric) - Estimated amount
      - `location` (text) - Geographic location
      - `publication_date` (timestamptz) - Publication date
      - `procedure_type` (text) - Type of procedure
      - `service_type` (text) - Type of service (Travaux, Fournitures, Services)
      - `cpv_code` (text) - CPV classification code
      - `url` (text) - URL to original BOAMP consultation
      - `raw_data` (jsonb) - Complete raw data from BOAMP API
      - `is_imported_to_markets` (boolean) - Whether imported to markets table
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `saved_searches`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text) - Name given by user to the search
      - `search_params` (jsonb) - All search parameters
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `search_alerts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `saved_search_id` (uuid, foreign key to saved_searches, nullable)
      - `name` (text) - Alert name
      - `search_params` (jsonb) - Search criteria for alert
      - `frequency` (text) - Alert frequency: 'realtime', 'daily', 'weekly'
      - `is_active` (boolean) - Whether alert is active
      - `last_checked_at` (timestamptz) - Last time alert was checked
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create boamp_favorites table
CREATE TABLE IF NOT EXISTS boamp_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  boamp_reference text NOT NULL,
  title text NOT NULL,
  client text,
  description text,
  deadline timestamptz,
  amount numeric DEFAULT 0,
  location text,
  publication_date timestamptz,
  procedure_type text,
  service_type text,
  cpv_code text,
  url text,
  raw_data jsonb DEFAULT '{}'::jsonb,
  is_imported_to_markets boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, boamp_reference)
);

ALTER TABLE boamp_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own BOAMP favorites"
  ON boamp_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own BOAMP favorites"
  ON boamp_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own BOAMP favorites"
  ON boamp_favorites FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own BOAMP favorites"
  ON boamp_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create saved_searches table
CREATE TABLE IF NOT EXISTS saved_searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  search_params jsonb DEFAULT '{}'::jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own saved searches"
  ON saved_searches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved searches"
  ON saved_searches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches"
  ON saved_searches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches"
  ON saved_searches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create search_alerts table
CREATE TABLE IF NOT EXISTS search_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  saved_search_id uuid REFERENCES saved_searches(id) ON DELETE SET NULL,
  name text NOT NULL,
  search_params jsonb DEFAULT '{}'::jsonb NOT NULL,
  frequency text DEFAULT 'daily' CHECK (frequency IN ('realtime', 'daily', 'weekly')),
  is_active boolean DEFAULT true,
  last_checked_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search alerts"
  ON search_alerts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own search alerts"
  ON search_alerts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own search alerts"
  ON search_alerts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own search alerts"
  ON search_alerts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boamp_favorites_user_id ON boamp_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_boamp_favorites_boamp_reference ON boamp_favorites(boamp_reference);
CREATE INDEX IF NOT EXISTS idx_boamp_favorites_deadline ON boamp_favorites(deadline);
CREATE INDEX IF NOT EXISTS idx_boamp_favorites_publication_date ON boamp_favorites(publication_date);

CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id ON search_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_is_active ON search_alerts(is_active) WHERE is_active = true;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_boamp_favorites_updated_at
  BEFORE UPDATE ON boamp_favorites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_searches_updated_at
  BEFORE UPDATE ON saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_search_alerts_updated_at
  BEFORE UPDATE ON search_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();