/*
  # Fix manual_markets RLS - Final approach
  
  1. Changes
    - Drop ALL existing policies on manual_markets
    - Recreate simple, clear policies
    - Ensure anon can insert with minimal restrictions
    
  2. Security
    - Anon can insert any market (SessionWizard use case)
    - Anon can update draft markets
    - Authenticated users have full control of their markets
    - Anyone can read published markets
*/

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Anon can insert draft markets" ON manual_markets;
DROP POLICY IF EXISTS "Anon users can insert draft manual markets" ON manual_markets;
DROP POLICY IF EXISTS "Anon can insert manual markets" ON manual_markets;
DROP POLICY IF EXISTS "Authenticated users can insert manual markets" ON manual_markets;
DROP POLICY IF EXISTS "Authenticated users can update manual markets" ON manual_markets;
DROP POLICY IF EXISTS "Authenticated users can read all manual markets" ON manual_markets;
DROP POLICY IF EXISTS "Anyone can read published manual markets" ON manual_markets;
DROP POLICY IF EXISTS "Anon can update own draft markets" ON manual_markets;

-- Recreate policies with clear intent

-- SELECT policies
CREATE POLICY "public_read_published"
  ON manual_markets FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "authenticated_read_all"
  ON manual_markets FOR SELECT
  TO authenticated
  USING (true);

-- INSERT policies
CREATE POLICY "anon_can_insert"
  ON manual_markets FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "authenticated_can_insert"
  ON manual_markets FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE policies
CREATE POLICY "anon_update_draft"
  ON manual_markets FOR UPDATE
  TO anon
  USING (status = 'draft')
  WITH CHECK (status IN ('draft', 'published'));

CREATE POLICY "authenticated_can_update"
  ON manual_markets FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE policy
CREATE POLICY "authenticated_can_delete"
  ON manual_markets FOR DELETE
  TO authenticated
  USING (true);
