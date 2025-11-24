/*
  # Fix Security Issues - Part 3: Optimize RLS for Feature Tables

  1. Fix RLS policies for: feature_comments, feature_requests, feature_votes
  2. Consolidate duplicate policies
*/

-- =====================================================
-- feature_comments - Consolidate overlapping policies
-- =====================================================

DROP POLICY IF EXISTS "Users can insert their own comments" ON public.feature_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON public.feature_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON public.feature_comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON public.feature_comments;
DROP POLICY IF EXISTS "Anyone can read non-deleted comments" ON public.feature_comments;

-- Anyone can read non-deleted comments
CREATE POLICY "Anyone can read non-deleted comments"
  ON public.feature_comments FOR SELECT
  TO authenticated
  USING (is_deleted = false OR is_deleted IS NULL);

-- Users can insert comments (admins via same check)
CREATE POLICY "Users can insert comments"
  ON public.feature_comments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id OR (
    SELECT is_user_admin((select auth.uid()))
  ));

-- Users can update own comments or admins can update all
CREATE POLICY "Users can update own comments or admins can update all"
  ON public.feature_comments FOR UPDATE
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

-- Users can delete own comments or admins can delete all
CREATE POLICY "Users can delete own comments or admins can delete all"
  ON public.feature_comments FOR DELETE
  TO authenticated
  USING (
    (select auth.uid()) = user_id OR (
      SELECT is_user_admin((select auth.uid()))
    )
  );

-- =====================================================
-- feature_requests - Consolidate overlapping policies
-- =====================================================

DROP POLICY IF EXISTS "Users can create their own feature requests" ON public.feature_requests;
DROP POLICY IF EXISTS "Users can update their own feature requests" ON public.feature_requests;
DROP POLICY IF EXISTS "Admins can update feature request status" ON public.feature_requests;

CREATE POLICY "Users can create feature requests"
  ON public.feature_requests FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own requests or admins can update all"
  ON public.feature_requests FOR UPDATE
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

-- =====================================================
-- feature_votes
-- =====================================================

DROP POLICY IF EXISTS "Users can vote" ON public.feature_votes;
DROP POLICY IF EXISTS "Users can remove their votes" ON public.feature_votes;

CREATE POLICY "Users can vote"
  ON public.feature_votes FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can remove their votes"
  ON public.feature_votes FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);