/*
  # Temporarily disable RLS on manual_markets for testing

  1. Changes
    - Disable RLS on manual_markets table to test if the form works
    - This is a temporary measure to identify if the issue is with RLS or something else
    
  2. Security
    - THIS IS NOT SECURE and should be re-enabled after testing
*/

-- Temporarily disable RLS
ALTER TABLE manual_markets DISABLE ROW LEVEL SECURITY;
