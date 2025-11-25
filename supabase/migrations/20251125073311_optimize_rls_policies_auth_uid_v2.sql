/*
  # Optimisation des politiques RLS avec (SELECT auth.uid())
  
  1. Changements
    - Remplace auth.uid() par (SELECT auth.uid()) dans toutes les politiques
    - Évite la réévaluation de la fonction pour chaque ligne
    - Améliore significativement les performances à l'échelle
*/

-- stripe_customers
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
  CREATE POLICY "Users can view their own customer data"
    ON stripe_customers FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- stripe_subscriptions  
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
  CREATE POLICY "Users can view their own subscription data"
    ON stripe_subscriptions FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- stripe_orders
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
  CREATE POLICY "Users can view their own order data"
    ON stripe_orders FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- user_profiles
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
  CREATE POLICY "Users can view own profile"
    ON user_profiles FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- markets
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own markets" ON markets;
  CREATE POLICY "Users can view own markets"
    ON markets FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own markets" ON markets;
  CREATE POLICY "Users can insert own markets"
    ON markets FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own markets" ON markets;
  CREATE POLICY "Users can update own markets"
    ON markets FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own markets" ON markets;
  CREATE POLICY "Users can delete own markets"
    ON markets FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- bpus
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own bpus" ON bpus;
  CREATE POLICY "Users can view own bpus"
    ON bpus FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own bpus" ON bpus;
  CREATE POLICY "Users can insert own bpus"
    ON bpus FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own bpus" ON bpus;
  CREATE POLICY "Users can delete own bpus"
    ON bpus FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- knowledge_files
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own knowledge files" ON knowledge_files;
  CREATE POLICY "Users can view own knowledge files"
    ON knowledge_files FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own knowledge files" ON knowledge_files;
  CREATE POLICY "Users can insert own knowledge files"
    ON knowledge_files FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own knowledge files" ON knowledge_files;
  CREATE POLICY "Users can delete own knowledge files"
    ON knowledge_files FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- model_credits
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own model credits" ON model_credits;
  CREATE POLICY "Users can view own model credits"
    ON model_credits FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- memory_credits
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own memory credits" ON memory_credits;
  CREATE POLICY "Users can view own memory credits"
    ON memory_credits FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- market_relevance_scores
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own relevance scores" ON market_relevance_scores;
  CREATE POLICY "Users can view own relevance scores"
    ON market_relevance_scores FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own relevance scores" ON market_relevance_scores;
  CREATE POLICY "Users can insert own relevance scores"
    ON market_relevance_scores FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own relevance scores" ON market_relevance_scores;
  CREATE POLICY "Users can update own relevance scores"
    ON market_relevance_scores FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own relevance scores" ON market_relevance_scores;
  CREATE POLICY "Users can delete own relevance scores"
    ON market_relevance_scores FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- market_sentinel_stats
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own sentinel stats" ON market_sentinel_stats;
  CREATE POLICY "Users can view own sentinel stats"
    ON market_sentinel_stats FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- bug_reports
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own bug reports" ON bug_reports;
  CREATE POLICY "Users can view own bug reports"
    ON bug_reports FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create bug reports" ON bug_reports;
  CREATE POLICY "Users can create bug reports"
    ON bug_reports FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- upsell_requests
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own upsell requests" ON upsell_requests;
  CREATE POLICY "Users can view own upsell requests"
    ON upsell_requests FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can create upsell requests" ON upsell_requests;
  CREATE POLICY "Users can create upsell requests"
    ON upsell_requests FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- subscription_addons
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own addons" ON subscription_addons;
  CREATE POLICY "Users can view own addons"
    ON subscription_addons FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- monthly_memory_usage
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own monthly usage" ON monthly_memory_usage;
  CREATE POLICY "Users can view own monthly usage"
    ON monthly_memory_usage FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- technical_memories
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own technical memories" ON technical_memories;
  CREATE POLICY "Users can view own technical memories"
    ON technical_memories FOR SELECT
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own technical memories" ON technical_memories;
  CREATE POLICY "Users can insert own technical memories"
    ON technical_memories FOR INSERT
    TO authenticated
    WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own technical memories" ON technical_memories;
  CREATE POLICY "Users can update own technical memories"
    ON technical_memories FOR UPDATE
    TO authenticated
    USING (user_id = (SELECT auth.uid()))
    WITH CHECK (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own technical memories" ON technical_memories;
  CREATE POLICY "Users can delete own technical memories"
    ON technical_memories FOR DELETE
    TO authenticated
    USING (user_id = (SELECT auth.uid()));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- memo_sections
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own memo sections" ON memo_sections;
  CREATE POLICY "Users can view own memo sections"
    ON memo_sections FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM technical_memories
        WHERE technical_memories.id = memo_sections.memory_id
        AND technical_memories.user_id = (SELECT auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own memo sections" ON memo_sections;
  CREATE POLICY "Users can insert own memo sections"
    ON memo_sections FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM technical_memories
        WHERE technical_memories.id = memo_sections.memory_id
        AND technical_memories.user_id = (SELECT auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own memo sections" ON memo_sections;
  CREATE POLICY "Users can update own memo sections"
    ON memo_sections FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM technical_memories
        WHERE technical_memories.id = memo_sections.memory_id
        AND technical_memories.user_id = (SELECT auth.uid())
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM technical_memories
        WHERE technical_memories.id = memo_sections.memory_id
        AND technical_memories.user_id = (SELECT auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own memo sections" ON memo_sections;
  CREATE POLICY "Users can delete own memo sections"
    ON memo_sections FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM technical_memories
        WHERE technical_memories.id = memo_sections.memory_id
        AND technical_memories.user_id = (SELECT auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- market_documents
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own market documents" ON market_documents;
  CREATE POLICY "Users can view own market documents"
    ON market_documents FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM markets
        WHERE markets.id = market_documents.market_id
        AND markets.user_id = (SELECT auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can insert own market documents" ON market_documents;
  CREATE POLICY "Users can insert own market documents"
    ON market_documents FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM markets
        WHERE markets.id = market_documents.market_id
        AND markets.user_id = (SELECT auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can update own market documents" ON market_documents;
  CREATE POLICY "Users can update own market documents"
    ON market_documents FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM markets
        WHERE markets.id = market_documents.market_id
        AND markets.user_id = (SELECT auth.uid())
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM markets
        WHERE markets.id = market_documents.market_id
        AND markets.user_id = (SELECT auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can delete own market documents" ON market_documents;
  CREATE POLICY "Users can delete own market documents"
    ON market_documents FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM markets
        WHERE markets.id = market_documents.market_id
        AND markets.user_id = (SELECT auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;