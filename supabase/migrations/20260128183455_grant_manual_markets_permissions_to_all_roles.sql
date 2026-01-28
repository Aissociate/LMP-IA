/*
  # Grant permissions on manual_markets to all necessary roles

  1. Changes
    - Grant all permissions on manual_markets table to anon, authenticated, and service_role
    - This ensures the table is accessible through the Supabase client
*/

-- Grant permissions to anon role
GRANT ALL ON TABLE manual_markets TO anon;
GRANT ALL ON TABLE manual_markets TO authenticated;
GRANT ALL ON TABLE manual_markets TO service_role;

-- Grant usage on the schema
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
