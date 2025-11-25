/*
  # Fix user_profiles INSERT policy
  
  ## Problem
  Users cannot create their profile because INSERT policy is missing
  
  ## Changes
  1. Drop existing INSERT policy if it exists (in case of conflict)
  2. Create new INSERT policy allowing users to create their own profile
  
  ## Security
  - Users can ONLY insert their own profile (user_id must match auth.uid())
  - RLS remains enabled on the table
*/

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create INSERT policy for user_profiles
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
