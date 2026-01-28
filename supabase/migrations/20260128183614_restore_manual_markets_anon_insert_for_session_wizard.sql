/*
  # Restore anon insert policy for manual_markets
  
  1. Changes
    - Re-enable RLS on manual_markets
    - Add anon insert policy for SessionWizard form
    - Restrict anon inserts to draft status only
    
  2. Security
    - Anon users can only insert draft markets
    - created_by must be provided (session ID)
    - Status must be NULL or 'draft' (default is 'draft')
*/

-- Re-enable RLS
ALTER TABLE manual_markets ENABLE ROW LEVEL SECURITY;

-- Drop and recreate the anon insert policy
DROP POLICY IF EXISTS "Anon users can insert draft manual markets" ON manual_markets;
DROP POLICY IF EXISTS "Anon can insert manual markets" ON manual_markets;

CREATE POLICY "Anon can insert draft markets"
  ON manual_markets
  FOR INSERT
  TO anon
  WITH CHECK (
    created_by IS NOT NULL
    AND (status IS NULL OR status = 'draft')
  );
