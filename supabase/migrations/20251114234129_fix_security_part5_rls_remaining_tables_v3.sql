/*
  # Fix Security Issues - Part 5: Optimize RLS for Remaining Tables

  1. Fix RLS policies with (select auth.uid()) optimization
  2. Only update tables with user_id column
*/

-- =====================================================
-- report_assets
-- =====================================================

DROP POLICY IF EXISTS "Users can view own assets" ON public.report_assets;
DROP POLICY IF EXISTS "Users can insert own assets" ON public.report_assets;
DROP POLICY IF EXISTS "Users can update own assets" ON public.report_assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON public.report_assets;

CREATE POLICY "Users can view own assets"
  ON public.report_assets FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own assets"
  ON public.report_assets FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own assets"
  ON public.report_assets FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own assets"
  ON public.report_assets FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- stripe_customers
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own customer data" ON public.stripe_customers;

CREATE POLICY "Users can view their own customer data"
  ON public.stripe_customers FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- boamp_favorites
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own BOAMP favorites" ON public.boamp_favorites;
DROP POLICY IF EXISTS "Users can insert their own BOAMP favorites" ON public.boamp_favorites;
DROP POLICY IF EXISTS "Users can update their own BOAMP favorites" ON public.boamp_favorites;
DROP POLICY IF EXISTS "Users can delete their own BOAMP favorites" ON public.boamp_favorites;

CREATE POLICY "Users can view their own BOAMP favorites"
  ON public.boamp_favorites FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own BOAMP favorites"
  ON public.boamp_favorites FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own BOAMP favorites"
  ON public.boamp_favorites FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own BOAMP favorites"
  ON public.boamp_favorites FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- saved_searches
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own saved searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can insert their own saved searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can update their own saved searches" ON public.saved_searches;
DROP POLICY IF EXISTS "Users can delete their own saved searches" ON public.saved_searches;

CREATE POLICY "Users can view their own saved searches"
  ON public.saved_searches FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own saved searches"
  ON public.saved_searches FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own saved searches"
  ON public.saved_searches FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own saved searches"
  ON public.saved_searches FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- search_alerts
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own search alerts" ON public.search_alerts;
DROP POLICY IF EXISTS "Users can insert their own search alerts" ON public.search_alerts;
DROP POLICY IF EXISTS "Users can update their own search alerts" ON public.search_alerts;
DROP POLICY IF EXISTS "Users can delete their own search alerts" ON public.search_alerts;

CREATE POLICY "Users can view their own search alerts"
  ON public.search_alerts FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert their own search alerts"
  ON public.search_alerts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update their own search alerts"
  ON public.search_alerts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete their own search alerts"
  ON public.search_alerts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- bpu_items
-- =====================================================

DROP POLICY IF EXISTS "Users can view own BPU items" ON public.bpu_items;
DROP POLICY IF EXISTS "Users can insert own BPU items" ON public.bpu_items;
DROP POLICY IF EXISTS "Users can update own BPU items" ON public.bpu_items;
DROP POLICY IF EXISTS "Users can delete own BPU items" ON public.bpu_items;

CREATE POLICY "Users can view own BPU items"
  ON public.bpu_items FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own BPU items"
  ON public.bpu_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own BPU items"
  ON public.bpu_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own BPU items"
  ON public.bpu_items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- fiche_valeur
-- =====================================================

DROP POLICY IF EXISTS "Users can view own fiche valeur" ON public.fiche_valeur;
DROP POLICY IF EXISTS "Users can insert own fiche valeur" ON public.fiche_valeur;
DROP POLICY IF EXISTS "Users can update own fiche valeur" ON public.fiche_valeur;
DROP POLICY IF EXISTS "Users can delete own fiche valeur" ON public.fiche_valeur;

CREATE POLICY "Users can view own fiche valeur"
  ON public.fiche_valeur FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own fiche valeur"
  ON public.fiche_valeur FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own fiche valeur"
  ON public.fiche_valeur FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own fiche valeur"
  ON public.fiche_valeur FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- =====================================================
-- market_search_history
-- =====================================================

DROP POLICY IF EXISTS "Users can view own search history" ON public.market_search_history;
DROP POLICY IF EXISTS "Users can create own search history" ON public.market_search_history;

CREATE POLICY "Users can view own search history"
  ON public.market_search_history FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can create own search history"
  ON public.market_search_history FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

-- =====================================================
-- assistant_conversations
-- =====================================================

DROP POLICY IF EXISTS "Users can view own conversations" ON public.assistant_conversations;
DROP POLICY IF EXISTS "Users can insert own conversations" ON public.assistant_conversations;
DROP POLICY IF EXISTS "Users can delete own conversations" ON public.assistant_conversations;

CREATE POLICY "Users can view own conversations"
  ON public.assistant_conversations FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.assistant_conversations FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.assistant_conversations FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);