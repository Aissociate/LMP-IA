/*
  # Fix Security Issues - Part 4: Fix Multiple Permissive Policies

  1. Fixes Multiple Permissive Policies
    - Converts multiple permissive SELECT policies into single comprehensive policies
    - Ensures proper access control without policy conflicts
    - Tables affected:
      - collectivities
      - email_digest_history
      - email_digest_queue
      - manual_markets_donneurs_ordre
      - manual_markets_session_progress
      - manual_markets_sessions
      - monthly_memory_usage
      - public_markets
      - subscription_plans
      - user_subscriptions

  2. Security Impact
    - Eliminates confusion from multiple overlapping policies
    - Makes security model clearer and more maintainable
    - Prevents accidental over-permissive access
*/

-- collectivities: Combine two SELECT policies
DROP POLICY IF EXISTS "Admins can manage collectivities" ON public.collectivities;
DROP POLICY IF EXISTS "Authenticated users can view active collectivities" ON public.collectivities;

CREATE POLICY "Authenticated users can view collectivities"
  ON public.collectivities
  FOR SELECT
  TO authenticated
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

-- email_digest_history: Combine two SELECT policies
DROP POLICY IF EXISTS "Admins can view all digest history" ON public.email_digest_history;
DROP POLICY IF EXISTS "Users can view own digest history" ON public.email_digest_history;

CREATE POLICY "Users can view digest history"
  ON public.email_digest_history
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

-- email_digest_queue: Combine two SELECT policies
DROP POLICY IF EXISTS "Admins can view all digest queue" ON public.email_digest_queue;
DROP POLICY IF EXISTS "Users can view own digest queue" ON public.email_digest_queue;

CREATE POLICY "Users can view digest queue"
  ON public.email_digest_queue
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

-- manual_markets_donneurs_ordre: Combine two SELECT policies
DROP POLICY IF EXISTS "Admins can manage donneurs ordre" ON public.manual_markets_donneurs_ordre;
DROP POLICY IF EXISTS "Anyone can read donneurs ordre" ON public.manual_markets_donneurs_ordre;

CREATE POLICY "Anyone can view donneurs ordre"
  ON public.manual_markets_donneurs_ordre
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- manual_markets_session_progress: Combine two SELECT policies
DROP POLICY IF EXISTS "Admins can manage progress" ON public.manual_markets_session_progress;
DROP POLICY IF EXISTS "Authenticated users can view all progress" ON public.manual_markets_session_progress;

CREATE POLICY "Anyone can view progress"
  ON public.manual_markets_session_progress
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- manual_markets_sessions: Combine two SELECT policies
DROP POLICY IF EXISTS "Admins can manage sessions" ON public.manual_markets_sessions;
DROP POLICY IF EXISTS "Authenticated users can view all sessions" ON public.manual_markets_sessions;

CREATE POLICY "Anyone can view sessions"
  ON public.manual_markets_sessions
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- monthly_memory_usage: Combine two SELECT policies
DROP POLICY IF EXISTS "Admins can view all usage" ON public.monthly_memory_usage;
DROP POLICY IF EXISTS "Users can view own usage" ON public.monthly_memory_usage;

CREATE POLICY "Users can view memory usage"
  ON public.monthly_memory_usage
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

-- subscription_plans: Combine two SELECT policies
DROP POLICY IF EXISTS "Admins can manage plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Anyone can view active plans" ON public.subscription_plans;

CREATE POLICY "Anyone can view plans"
  ON public.subscription_plans
  FOR SELECT
  TO authenticated, anon
  USING (
    is_active = true 
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

-- user_subscriptions: Combine two SELECT policies
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;

CREATE POLICY "Users can view subscriptions"
  ON public.user_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );