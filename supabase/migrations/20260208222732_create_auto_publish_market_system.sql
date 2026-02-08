/*
  # Auto-publish market social posts system

  1. New Tables
    - `market_social_posts` - tracks all auto-published social media posts
      - `id` (uuid, primary key)
      - `market_id` (uuid) - ID of the market
      - `market_table` (text) - source table name
      - `market_title` (text) - title of the market
      - `post_text` (text) - AI-generated post content
      - `facebook_result` (jsonb) - Facebook API response
      - `linkedin_result` (jsonb) - LinkedIn API response
      - `has_errors` (boolean) - error flag
      - `error_details` (text[]) - error messages
      - `created_at` (timestamptz)

  2. Triggers
    - `trigger_auto_publish_manual_market` on manual_markets INSERT
    - `trigger_auto_publish_public_market` on public_markets INSERT
    - Uses pg_net for async HTTP calls to auto-publish-market edge function

  3. Security
    - RLS enabled on market_social_posts
    - Only admins can read post logs

  4. Vault
    - Stores supabase_url and supabase_anon_key for trigger HTTP calls
*/

-- Create tracking table
CREATE TABLE IF NOT EXISTS market_social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid,
  market_table text NOT NULL DEFAULT '',
  market_title text NOT NULL DEFAULT '',
  post_text text NOT NULL DEFAULT '',
  facebook_result jsonb,
  linkedin_result jsonb,
  has_errors boolean DEFAULT false,
  error_details text[],
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read social post logs"
  ON market_social_posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert social post logs"
  ON market_social_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE INDEX IF NOT EXISTS idx_market_social_posts_market_id ON market_social_posts(market_id);
CREATE INDEX IF NOT EXISTS idx_market_social_posts_created_at ON market_social_posts(created_at DESC);

-- Store connection details in vault for trigger usage
SELECT vault.create_secret(
  'https://tciryfaaussfrfbvalhk.supabase.co',
  'supabase_url',
  'Supabase project URL for auto-publish triggers'
);

SELECT vault.create_secret(
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjaXJ5ZmFhdXNzZnJmYnZhbGhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5OTIyMDIsImV4cCI6MjA3OTU2ODIwMn0.UfZO7Ot5rB0UymahCn-EYDDYH7yCCmKezMX3Zr-dWWE',
  'supabase_anon_key',
  'Supabase anon key for auto-publish triggers'
);

-- Trigger function using pg_net
CREATE OR REPLACE FUNCTION notify_auto_publish_market()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault
AS $$
DECLARE
  edge_url text;
  anon_key text;
  payload jsonb;
  request_id bigint;
BEGIN
  SELECT decrypted_secret INTO edge_url
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_url'
  LIMIT 1;

  SELECT decrypted_secret INTO anon_key
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_anon_key'
  LIMIT 1;

  IF edge_url IS NULL OR anon_key IS NULL THEN
    RAISE WARNING '[auto-publish] Missing vault secrets supabase_url or supabase_anon_key';
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'type', 'INSERT',
    'table', TG_TABLE_NAME,
    'schema', TG_TABLE_SCHEMA,
    'record', to_jsonb(NEW)
  );

  SELECT net.http_post(
    url := edge_url || '/functions/v1/auto-publish-market',
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    timeout_milliseconds := 30000
  ) INTO request_id;

  RAISE LOG '[auto-publish] Triggered for market: % (table: %, request_id: %)', NEW.title, TG_TABLE_NAME, request_id;

  RETURN NEW;
END;
$$;

-- Trigger on manual_markets INSERT
DROP TRIGGER IF EXISTS trigger_auto_publish_manual_market ON manual_markets;
CREATE TRIGGER trigger_auto_publish_manual_market
  AFTER INSERT ON manual_markets
  FOR EACH ROW
  EXECUTE FUNCTION notify_auto_publish_market();

-- Trigger on public_markets INSERT
DROP TRIGGER IF EXISTS trigger_auto_publish_public_market ON public_markets;
CREATE TRIGGER trigger_auto_publish_public_market
  AFTER INSERT ON public_markets
  FOR EACH ROW
  EXECUTE FUNCTION notify_auto_publish_market();
