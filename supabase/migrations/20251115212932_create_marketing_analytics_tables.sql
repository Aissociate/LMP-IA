/*
  # Marketing Analytics Tables

  1. New Tables
    - `page_visits`
      - `id` (uuid, primary key)
      - `page` (text) - Page identifier (home, artisans, btp, pme)
      - `visitor_id` (text) - Unique visitor identifier (cookie/session based)
      - `session_id` (text) - Session identifier
      - `entry_time` (timestamptz) - When visitor entered the page
      - `exit_time` (timestamptz) - When visitor left the page
      - `time_spent` (integer) - Time spent in seconds
      - `device_type` (text) - mobile, tablet, desktop
      - `referrer` (text) - Source URL
      - `created_at` (timestamptz)
    
    - `page_clicks`
      - `id` (uuid, primary key)
      - `page` (text) - Page where click occurred
      - `visitor_id` (text) - Unique visitor identifier
      - `session_id` (text) - Session identifier
      - `click_type` (text) - Type of click (cta, demo, navigation)
      - `click_target` (text) - What was clicked
      - `created_at` (timestamptz)

  2. Indexes
    - Index on page and created_at for fast analytics queries
    - Index on visitor_id for unique visitor counting
    - Index on session_id for session analysis

  3. Security
    - Enable RLS on all tables
    - Allow anonymous inserts for tracking
    - Only authenticated users can read their own analytics data
*/

-- Create page_visits table
CREATE TABLE IF NOT EXISTS page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  entry_time timestamptz DEFAULT now(),
  exit_time timestamptz,
  time_spent integer DEFAULT 0,
  device_type text,
  referrer text,
  created_at timestamptz DEFAULT now()
);

-- Create page_clicks table
CREATE TABLE IF NOT EXISTS page_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  visitor_id text NOT NULL,
  session_id text NOT NULL,
  click_type text NOT NULL,
  click_target text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_page_visits_page_date ON page_visits(page, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_visits_visitor ON page_visits(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_visits_session ON page_visits(session_id);
CREATE INDEX IF NOT EXISTS idx_page_clicks_page_date ON page_clicks(page, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_clicks_visitor ON page_clicks(visitor_id);

-- Enable RLS
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_clicks ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for tracking
CREATE POLICY "Allow anonymous inserts on page_visits"
  ON page_visits
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts on page_clicks"
  ON page_clicks
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to read all analytics (admin check will be done in app)
CREATE POLICY "Allow authenticated users to read page_visits"
  ON page_visits
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to read page_clicks"
  ON page_clicks
  FOR SELECT
  TO authenticated
  USING (true);
