/*
  # Fix Security Issues - Part 2: Optimize RLS for Core Tables

  1. Replace `auth.uid()` with `(select auth.uid())` for performance
  2. Fix tables: user_profiles, markets, knowledge_files, bpus, market_documents
*/

-- =====================================================
-- user_profiles
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;

CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- markets
-- =====================================================

DROP POLICY IF EXISTS "Users can view own markets" ON public.markets;
DROP POLICY IF EXISTS "Users can insert own markets" ON public.markets;
DROP POLICY IF EXISTS "Users can update own markets" ON public.markets;
DROP POLICY IF EXISTS "Users can delete own markets" ON public.markets;
DROP POLICY IF EXISTS "Permettre toutes les operations sur markets" ON public.markets;

CREATE POLICY "Users can view own markets"
  ON public.markets FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own markets"
  ON public.markets FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own markets"
  ON public.markets FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own markets"
  ON public.markets FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- knowledge_files
-- =====================================================

DROP POLICY IF EXISTS "Users can view own knowledge files" ON public.knowledge_files;
DROP POLICY IF EXISTS "Users can insert own knowledge files" ON public.knowledge_files;
DROP POLICY IF EXISTS "Users can update own knowledge files" ON public.knowledge_files;
DROP POLICY IF EXISTS "Users can delete own knowledge files" ON public.knowledge_files;

CREATE POLICY "Users can view own knowledge files"
  ON public.knowledge_files FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own knowledge files"
  ON public.knowledge_files FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own knowledge files"
  ON public.knowledge_files FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own knowledge files"
  ON public.knowledge_files FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- bpus
-- =====================================================

DROP POLICY IF EXISTS "Users can view own bpus" ON public.bpus;
DROP POLICY IF EXISTS "Users can insert own bpus" ON public.bpus;
DROP POLICY IF EXISTS "Users can update own bpus" ON public.bpus;
DROP POLICY IF EXISTS "Users can delete own bpus" ON public.bpus;

CREATE POLICY "Users can view own bpus"
  ON public.bpus FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own bpus"
  ON public.bpus FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own bpus"
  ON public.bpus FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own bpus"
  ON public.bpus FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- market_documents
-- =====================================================

DROP POLICY IF EXISTS "Users can view own market documents" ON public.market_documents;
DROP POLICY IF EXISTS "Users can insert own market documents" ON public.market_documents;
DROP POLICY IF EXISTS "Users can update own market documents" ON public.market_documents;
DROP POLICY IF EXISTS "Users can delete own market documents" ON public.market_documents;

CREATE POLICY "Users can view own market documents"
  ON public.market_documents FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own market documents"
  ON public.market_documents FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own market documents"
  ON public.market_documents FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own market documents"
  ON public.market_documents FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);