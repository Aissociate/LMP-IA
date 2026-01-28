/*
  # Test: Open anon insert policy for debugging

  1. Changes
    - Temporarily allow all anon inserts to test
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Anon users can insert draft manual markets" ON manual_markets;

-- Create very permissive policy for testing
CREATE POLICY "Anon users can insert draft manual markets"
  ON manual_markets
  FOR INSERT
  TO anon
  WITH CHECK (true);
