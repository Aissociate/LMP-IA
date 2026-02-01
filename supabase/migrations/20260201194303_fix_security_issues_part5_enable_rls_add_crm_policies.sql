/*
  # Fix Security Issues - Part 5: Enable RLS and Add CRM Policies

  1. Enable RLS on manual_markets
    - RLS was disabled but policies existed
    - Enables RLS to activate security policies

  2. Add RLS Policies for CRM Tables
    - crm_leads
    - crm_activities
    - crm_deals
    - crm_tasks
    - These tables had RLS enabled but no policies

  3. Fix public_markets policy

  4. Security Impact
    - Activates row-level security on manual_markets
    - Provides proper access control for CRM data
    - Admins can fully manage CRM data
    - Authenticated users can read CRM data
*/

-- Enable RLS on manual_markets
ALTER TABLE public.manual_markets ENABLE ROW LEVEL SECURITY;

-- Fix public_markets policy (correct column name)
DROP POLICY IF EXISTS "Anyone can view public markets" ON public.public_markets;

CREATE POLICY "Anyone can view public markets"
  ON public.public_markets
  FOR SELECT
  TO authenticated, anon
  USING (
    is_public = true 
    OR EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

-- CRM Leads Policies
CREATE POLICY "Admins can manage leads"
  ON public.crm_leads
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

CREATE POLICY "Authenticated users can view leads"
  ON public.crm_leads
  FOR SELECT
  TO authenticated
  USING (true);

-- CRM Activities Policies
CREATE POLICY "Admins can manage activities"
  ON public.crm_activities
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

CREATE POLICY "Authenticated users can view activities"
  ON public.crm_activities
  FOR SELECT
  TO authenticated
  USING (true);

-- CRM Deals Policies
CREATE POLICY "Admins can manage deals"
  ON public.crm_deals
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

CREATE POLICY "Authenticated users can view deals"
  ON public.crm_deals
  FOR SELECT
  TO authenticated
  USING (true);

-- CRM Tasks Policies
CREATE POLICY "Admins can manage tasks"
  ON public.crm_tasks
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

CREATE POLICY "Authenticated users can view tasks"
  ON public.crm_tasks
  FOR SELECT
  TO authenticated
  USING (true);