/*
  # Restauration des tables et colonnes manquantes critiques
  
  1. Tables manquantes
    - technical_memories - Mémoires techniques
    - memo_sections - Sections de mémoires
    - market_documents - Documents de marchés
    
  2. Colonnes manquantes
    - user_subscriptions.monthly_tokens_limit
    - user_subscriptions.monthly_tokens_used
    - markets.global_memory_prompt
    
  3. Fonction manquante
    - calculate_sentinel_stats
*/

-- Table technical_memories
CREATE TABLE IF NOT EXISTS technical_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  ai_model_used text DEFAULT 'basic-model',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE technical_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own technical memories"
  ON technical_memories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own technical memories"
  ON technical_memories FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own technical memories"
  ON technical_memories FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own technical memories"
  ON technical_memories FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_technical_memories_market_id ON technical_memories(market_id);
CREATE INDEX IF NOT EXISTS idx_technical_memories_user_id ON technical_memories(user_id);

-- Table memo_sections
CREATE TABLE IF NOT EXISTS memo_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id uuid NOT NULL REFERENCES technical_memories(id) ON DELETE CASCADE,
  market_id uuid NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text DEFAULT '',
  order_index integer DEFAULT 0,
  is_generated boolean DEFAULT false,
  prompt text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE memo_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memo sections"
  ON memo_sections FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memo sections"
  ON memo_sections FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memo sections"
  ON memo_sections FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own memo sections"
  ON memo_sections FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_memo_sections_memory_id ON memo_sections(memory_id);
CREATE INDEX IF NOT EXISTS idx_memo_sections_market_id ON memo_sections(market_id);
CREATE INDEX IF NOT EXISTS idx_memo_sections_user_id ON memo_sections(user_id);

-- Table market_documents
CREATE TABLE IF NOT EXISTS market_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint DEFAULT 0,
  file_type text,
  analysis_status text DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'completed', 'error')),
  analysis_result text,
  extracted_content text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own market documents"
  ON market_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own market documents"
  ON market_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own market documents"
  ON market_documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own market documents"
  ON market_documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_market_documents_market_id ON market_documents(market_id);
CREATE INDEX IF NOT EXISTS idx_market_documents_user_id ON market_documents(user_id);

-- Ajouter colonnes manquantes à user_subscriptions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'monthly_tokens_limit'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN monthly_tokens_limit integer DEFAULT 999999 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'monthly_tokens_used'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN monthly_tokens_used integer DEFAULT 0 NOT NULL;
  END IF;
END $$;

-- Ajouter colonne manquante à markets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'markets' AND column_name = 'global_memory_prompt'
  ) THEN
    ALTER TABLE markets ADD COLUMN global_memory_prompt text DEFAULT '';
  END IF;
END $$;

-- Ajouter colonne manquante à subscription_plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'monthly_tokens_limit'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN monthly_tokens_limit integer DEFAULT 999999;
  END IF;
END $$;

-- Fonction calculate_sentinel_stats
CREATE OR REPLACE FUNCTION calculate_sentinel_stats(
  p_user_id uuid,
  p_alert_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats json;
BEGIN
  SELECT json_build_object(
    'total_markets', COUNT(*),
    'go_count', COUNT(*) FILTER (WHERE score_category = 'go'),
    'conditional_count', COUNT(*) FILTER (WHERE score_category = 'conditional'),
    'no_go_count', COUNT(*) FILTER (WHERE score_category = 'no_go'),
    'markets_responded', COUNT(*) FILTER (WHERE user_action = 'respond'),
    'markets_ignored', COUNT(*) FILTER (WHERE user_action = 'ignore'),
    'expert_requested', COUNT(*) FILTER (WHERE user_action = 'request_expert'),
    'memory_ordered', COUNT(*) FILTER (WHERE user_action = 'order_memory'),
    'avg_score', ROUND(AVG(relevance_score), 1)
  )
  INTO v_stats
  FROM market_relevance_scores
  WHERE user_id = p_user_id
    AND (p_alert_id IS NULL OR alert_id = p_alert_id)
    AND analyzed_at BETWEEN p_period_start AND p_period_end;

  RETURN v_stats;
END;
$$;

-- Trigger pour updated_at sur memo_sections
CREATE OR REPLACE FUNCTION update_memo_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_memo_sections_timestamp ON memo_sections;
CREATE TRIGGER update_memo_sections_timestamp
  BEFORE UPDATE ON memo_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_memo_sections_updated_at();