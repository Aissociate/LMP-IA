/*
  # Fix user_profiles INSERT policy

  1. Changes
    - Add INSERT policy for user_profiles table
    - Allow authenticated users to create their own profile
    
  2. Security
    - Users can only insert their own profile (user_id must match auth.uid())
*/

-- Add INSERT policy for user_profiles
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
