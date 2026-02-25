/*
  # Remove recursive subscription check INSERT policy from memo_sections

  1. Problem
    - The "Users can insert memo sections with subscription check" INSERT policy
      still causes infinite recursion even with the SECURITY DEFINER helper function.
    - PostgreSQL evaluates ALL permissive INSERT policies during the INSERT operation
      and the complex subscription check triggers recursion in the policy evaluation chain.

  2. Solution
    - Drop the problematic subscription check INSERT policy entirely
    - Keep the simple "Users can insert own memo sections" policy (user_id = auth.uid())
    - Subscription limits will be enforced at the application level instead

  3. Security
    - RLS still enforces ownership: only the authenticated user can insert their own rows
    - Subscription limit checking moves to application code (already partially implemented)
*/

DROP POLICY IF EXISTS "Users can insert memo sections with subscription check" ON memo_sections;
