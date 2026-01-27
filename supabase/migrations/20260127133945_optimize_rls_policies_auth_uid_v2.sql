/*
  # Optimize RLS Policies with Auth UID Initialization

  1. Problem
    - Multiple RLS policies call auth.uid() directly, causing re-evaluation for each row
    - This produces suboptimal query performance at scale
    
  2. Solution
    - Replace auth.uid() with (select auth.uid()) to evaluate once per query
    - This caches the auth.uid() result for the entire query
    
  3. Tables Affected
    - company_profiles (4 policies)
    - collectivities (1 policy)
    - referencing_requests (4 policies)
*/

-- ============================================
-- COMPANY PROFILES
-- ============================================

DROP POLICY IF EXISTS "Users can view own company profile" ON public.company_profiles;
CREATE POLICY "Users can view own company profile"
  ON public.company_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own company profile" ON public.company_profiles;
CREATE POLICY "Users can insert own company profile"
  ON public.company_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own company profile" ON public.company_profiles;
CREATE POLICY "Users can update own company profile"
  ON public.company_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own company profile" ON public.company_profiles;
CREATE POLICY "Users can delete own company profile"
  ON public.company_profiles
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- ============================================
-- COLLECTIVITIES
-- ============================================

DROP POLICY IF EXISTS "Admins can manage collectivities" ON public.collectivities;
CREATE POLICY "Admins can manage collectivities"
  ON public.collectivities
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
-- REFERENCING REQUESTS
-- ============================================

DROP POLICY IF EXISTS "Users can view own referencing requests" ON public.referencing_requests;
CREATE POLICY "Users can view own referencing requests"
  ON public.referencing_requests
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own referencing requests" ON public.referencing_requests;
CREATE POLICY "Users can insert own referencing requests"
  ON public.referencing_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own referencing requests" ON public.referencing_requests;
CREATE POLICY "Users can update own referencing requests"
  ON public.referencing_requests
  FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own referencing requests" ON public.referencing_requests;
CREATE POLICY "Users can delete own referencing requests"
  ON public.referencing_requests
  FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));