/*
  # Fix Security Issues - Part 2: Optimize RLS Policies

  1. Optimizes RLS Policies for Performance
    - Replaces auth.uid() with (select auth.uid()) to prevent re-evaluation for each row
    - Tables affected:
      - market_alert_detections
      - invoices
      - lead_captures

  2. Security Impact
    - Dramatically improves query performance at scale
    - Prevents DoS conditions from slow RLS policy evaluation
*/

-- market_alert_detections policies
DROP POLICY IF EXISTS "Users can delete own market detections" ON public.market_alert_detections;
CREATE POLICY "Users can delete own market detections"
  ON public.market_alert_detections
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own market detections" ON public.market_alert_detections;
CREATE POLICY "Users can insert own market detections"
  ON public.market_alert_detections
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- invoices policies
DROP POLICY IF EXISTS "Admins can insert invoices" ON public.invoices;
CREATE POLICY "Admins can insert invoices"
  ON public.invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update invoices" ON public.invoices;
CREATE POLICY "Admins can update invoices"
  ON public.invoices
  FOR UPDATE
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

DROP POLICY IF EXISTS "Admins can view all invoices" ON public.invoices;
CREATE POLICY "Admins can view all invoices"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;
CREATE POLICY "Users can view own invoices"
  ON public.invoices
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

-- lead_captures policies
DROP POLICY IF EXISTS "Admins can update all leads" ON public.lead_captures;
CREATE POLICY "Admins can update all leads"
  ON public.lead_captures
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can view all leads" ON public.lead_captures;
CREATE POLICY "Admins can view all leads"
  ON public.lead_captures
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.user_id = (select auth.uid())
      AND user_profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Users can view their own leads" ON public.lead_captures;
CREATE POLICY "Users can view their own leads"
  ON public.lead_captures
  FOR SELECT
  TO authenticated
  USING (
    email IN (
      SELECT users.email
      FROM auth.users
      WHERE users.id = (select auth.uid())
    )
  );