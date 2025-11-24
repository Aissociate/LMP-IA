/*
  # Fix Security Issues - Part 4: Optimize RLS for Admin and Subscription Tables

  1. Fix RLS policies for: admin_prompts, admin_settings, subscription_plans, user_subscriptions
  2. Consolidate duplicate policies
*/

-- =====================================================
-- admin_prompts
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage prompts" ON public.admin_prompts;

CREATE POLICY "Admins can manage prompts"
  ON public.admin_prompts FOR ALL
  TO authenticated
  USING ((SELECT is_user_admin((select auth.uid()))))
  WITH CHECK ((SELECT is_user_admin((select auth.uid()))));

-- =====================================================
-- admin_settings
-- =====================================================

DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;

CREATE POLICY "Admins can manage settings"
  ON public.admin_settings FOR ALL
  TO authenticated
  USING ((SELECT is_user_admin((select auth.uid()))))
  WITH CHECK ((SELECT is_user_admin((select auth.uid()))));

-- =====================================================
-- subscription_plans - Consolidate overlapping policies
-- =====================================================

DROP POLICY IF EXISTS "Enable all operations for admins on subscription_plans" ON public.subscription_plans;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.subscription_plans;

CREATE POLICY "All users can read subscription plans"
  ON public.subscription_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage subscription plans"
  ON public.subscription_plans FOR ALL
  TO authenticated
  USING ((SELECT is_user_admin((select auth.uid()))))
  WITH CHECK ((SELECT is_user_admin((select auth.uid()))));

-- =====================================================
-- user_subscriptions - Consolidate overlapping policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscriptions" ON public.user_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.user_subscriptions;

CREATE POLICY "Users can view own subscriptions or admins can view all"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = user_id OR (
      SELECT is_user_admin((select auth.uid()))
    )
  );

CREATE POLICY "Users can insert own subscriptions or admins can insert all"
  ON public.user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id OR (
      SELECT is_user_admin((select auth.uid()))
    )
  );

CREATE POLICY "Users can update own subscriptions or admins can update all"
  ON public.user_subscriptions FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = user_id OR (
      SELECT is_user_admin((select auth.uid()))
    )
  )
  WITH CHECK (
    (select auth.uid()) = user_id OR (
      SELECT is_user_admin((select auth.uid()))
    )
  );