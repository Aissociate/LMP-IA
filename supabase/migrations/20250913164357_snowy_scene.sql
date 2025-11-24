/*
  # Fix admin_settings RLS policies

  This migration addresses the RLS policy violation for the admin_settings table by:
  
  1. Security Updates
    - Add a policy for initial setup/bootstrapping
    - Allow the first user to become admin if no admin exists
    - Maintain security for subsequent operations
  
  2. Policy Updates
    - Add bootstrap policy for empty admin_settings table
    - Keep existing admin check policy
    - Ensure at least one user can initialize settings
*/

-- Drop existing policies to recreate them with better logic
DROP POLICY IF EXISTS "Admins can manage settings" ON admin_settings;

-- Create a more flexible policy that allows:
-- 1. Users with admin in their profile (existing logic)
-- 2. Any authenticated user if no admin settings exist yet (bootstrap)
CREATE POLICY "Admins can manage settings with bootstrap"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (
    -- Existing admin check
    (EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
        AND (
          user_profiles.company ILIKE '%admin%' 
          OR user_profiles.full_name ILIKE '%admin%'
        )
    ))
    OR
    -- Bootstrap check: allow if no admin settings exist yet
    (NOT EXISTS (SELECT 1 FROM admin_settings LIMIT 1))
  )
  WITH CHECK (
    -- Same logic for INSERT/UPDATE
    (EXISTS (
      SELECT 1
      FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
        AND (
          user_profiles.company ILIKE '%admin%' 
          OR user_profiles.full_name ILIKE '%admin%'
        )
    ))
    OR
    -- Bootstrap check: allow if no admin settings exist yet
    (NOT EXISTS (SELECT 1 FROM admin_settings LIMIT 1))
  );

-- Create a function to help identify if current user should have admin access
CREATE OR REPLACE FUNCTION is_bootstrap_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Allow admin access during bootstrap (no settings exist)
  IF NOT EXISTS (SELECT 1 FROM admin_settings LIMIT 1) THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has admin in their profile
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_profiles.user_id = auth.uid()
      AND (
        user_profiles.company ILIKE '%admin%' 
        OR user_profiles.full_name ILIKE '%admin%'
      )
  );
END;
$$;