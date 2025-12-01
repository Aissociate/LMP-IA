/*
  # Fix infinite recursion in memo_sections INSERT policy

  1. Changes
    - Drop the existing INSERT policy that causes recursion
    - Create a simplified INSERT policy without subscription check in the policy itself
    - The subscription check will be done in application logic before insert

  2. Security
    - Users can only insert their own memo sections
    - Subscription limits are enforced at application level
*/

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Users can insert memo sections with subscription check" ON memo_sections;

-- Create a simple INSERT policy without recursion
CREATE POLICY "Users can insert own memo sections"
  ON memo_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
