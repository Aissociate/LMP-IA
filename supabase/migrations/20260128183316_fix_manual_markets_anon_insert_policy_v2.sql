/*
  # Fix manual_markets RLS policy for anonymous inserts (v2)

  1. Changes
    - Drop existing anon insert policy
    - Create simpler policy that allows draft inserts without additional checks
    
  2. Security
    - Only allows INSERT of draft status markets
*/

-- Reset role to postgres
RESET ROLE;

-- Drop existing policy
DROP POLICY IF EXISTS "Anon users can insert draft manual markets" ON manual_markets;

-- Create simpler policy for anon inserts
CREATE POLICY "Anon users can insert draft manual markets"
  ON manual_markets
  FOR INSERT
  TO anon
  WITH CHECK (
    (status IS NULL OR status = 'draft')
  );
