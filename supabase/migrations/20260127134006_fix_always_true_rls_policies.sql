/*
  # Fix Always-True RLS Policies

  1. Problem
    - Multiple RLS policies have USING or WITH CHECK clauses that are always true
    - This effectively bypasses row-level security
    
  2. Solution
    - For session-based tables (manual_markets_sessions, manual_markets_session_progress):
      * These are intentionally open for anon users during data collection sessions
      * Keep anon policies but restrict authenticated policies to admins only
    - For donneurs_ordre:
      * Restrict to admins for management operations
    
  3. Tables Affected
    - manual_markets_donneurs_ordre
    - manual_markets_session_progress
    - manual_markets_sessions
*/

-- ============================================
-- MANUAL MARKETS DONNEURS ORDRE
-- ============================================

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Authenticated can manage donneurs ordre" ON public.manual_markets_donneurs_ordre;

-- Create restrictive policies for admins only
CREATE POLICY "Admins can manage donneurs ordre"
  ON public.manual_markets_donneurs_ordre
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

-- ============================================
-- MANUAL MARKETS SESSION PROGRESS
-- ============================================

-- Keep anon policies for session tracking (intentional for data collection)
-- These are needed for the session wizard functionality

-- Drop the overly permissive authenticated policy
DROP POLICY IF EXISTS "Authenticated users can manage progress" ON public.manual_markets_session_progress;

-- Create restrictive policy for authenticated users (admins only)
CREATE POLICY "Admins can manage progress"
  ON public.manual_markets_session_progress
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

-- ============================================
-- MANUAL MARKETS SESSIONS
-- ============================================

-- Keep anon policies for session tracking (intentional for data collection)
-- These are needed for the session wizard functionality

-- Drop the overly permissive authenticated policy
DROP POLICY IF EXISTS "Authenticated users can manage sessions" ON public.manual_markets_sessions;

-- Create restrictive policy for authenticated users (admins only)
CREATE POLICY "Admins can manage sessions"
  ON public.manual_markets_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );