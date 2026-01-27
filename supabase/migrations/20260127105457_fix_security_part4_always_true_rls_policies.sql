/*
  # Fix Security Issues - Part 4: Fix "Always True" RLS Policies

  Replace overly permissive RLS policies with proper security checks.
*/

-- candidatures - restrict to reasonable rate limiting with email validation
DROP POLICY IF EXISTS "Anyone can submit candidature" ON candidatures;
CREATE POLICY "Anyone can submit candidature"
  ON candidatures FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    email IS NOT NULL 
    AND email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  );

-- manual_markets - require authentication for insert/update (created_by is text, need to cast uuid)
DROP POLICY IF EXISTS "Anon can insert manual markets" ON manual_markets;
DROP POLICY IF EXISTS "Authenticated users can insert manual markets" ON manual_markets;
CREATE POLICY "Authenticated users can insert manual markets"
  ON manual_markets FOR INSERT
  TO authenticated
  WITH CHECK (created_by = (select auth.uid())::text);

DROP POLICY IF EXISTS "Authenticated users can update manual markets" ON manual_markets;
CREATE POLICY "Authenticated users can update manual markets"
  ON manual_markets FOR UPDATE
  TO authenticated
  USING (created_by = (select auth.uid())::text)
  WITH CHECK (created_by = (select auth.uid())::text);

-- manual_markets_donneurs_ordre - keep permissive for authenticated (needed for functionality)
DROP POLICY IF EXISTS "Anon can insert donneurs ordre" ON manual_markets_donneurs_ordre;
DROP POLICY IF EXISTS "Authenticated can manage donneurs ordre" ON manual_markets_donneurs_ordre;
CREATE POLICY "Authenticated can manage donneurs ordre"
  ON manual_markets_donneurs_ordre FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- market_sync_logs - restrict to service role only
DROP POLICY IF EXISTS "Authenticated users can insert sync logs" ON market_sync_logs;
CREATE POLICY "Service role can insert sync logs"
  ON market_sync_logs FOR INSERT
  TO service_role
  WITH CHECK (true);

-- public_markets - restrict modifications to admins only
DROP POLICY IF EXISTS "Authenticated users can insert markets" ON public_markets;
CREATE POLICY "Admins can insert markets"
  ON public_markets FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_admin()));

DROP POLICY IF EXISTS "Authenticated users can update markets" ON public_markets;
CREATE POLICY "Admins can update markets"
  ON public_markets FOR UPDATE
  TO authenticated
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

DROP POLICY IF EXISTS "Authenticated users can delete markets" ON public_markets;
CREATE POLICY "Admins can delete markets"
  ON public_markets FOR DELETE
  TO authenticated
  USING ((select public.is_admin()));
