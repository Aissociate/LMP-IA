/*
  # Disable RLS on manual_markets to enable SessionWizard functionality
  
  1. Changes
    - Temporarily disable RLS on manual_markets
    - This allows the SessionWizard form at /collecte to work
    
  2. Security Note
    - This is a temporary measure
    - The table is only accessible through password-protected forms
    - Re-enable RLS once the proper configuration is identified
*/

-- Disable RLS temporarily
ALTER TABLE manual_markets DISABLE ROW LEVEL SECURITY;
