/*
  # Fix manual_markets RLS policy for anonymous inserts

  1. Changes
    - Add RLS policy to allow anonymous users to insert draft markets
    - This is needed for the SessionWizard / MarketEntryForm where users create markets without authentication
    
  2. Security
    - Only allows INSERT of draft status markets
    - Requires created_by to be set (session ID)
*/

-- Drop policy if it exists
DROP POLICY IF EXISTS "Anon users can insert draft manual markets" ON manual_markets;

-- Add policy for anon users to insert draft markets
CREATE POLICY "Anon users can insert draft manual markets"
  ON manual_markets
  FOR INSERT
  TO anon
  WITH CHECK (
    status = 'draft'
    AND created_by IS NOT NULL
  );
