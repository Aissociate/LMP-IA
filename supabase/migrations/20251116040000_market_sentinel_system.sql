/*
  # Market Sentinel™ - Système de veille intelligente

  1. Nouvelles tables
    - market_sentinel_alerts : Alertes de veille avec scoring IA
    - market_relevance_scores : Scores de pertinence calculés par IA

  2. Colonnes ajoutées
    - Scoring : go, conditional, no_go
    - Recommandations : respond, ignore, expert, order_memory
    - Analyses IA

  3. Sécurité
    - RLS activé sur toutes les tables
    - Politiques restrictives par défaut
*/

-- Ajouter des colonnes pour le scoring IA aux alertes existantes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'market_search_alerts' AND column_name = 'enable_ai_scoring'
  ) THEN
    ALTER TABLE market_search_alerts
    ADD COLUMN enable_ai_scoring boolean DEFAULT true,
    ADD COLUMN min_relevance_score int DEFAULT 60;
  END IF;
END $$;

-- Table pour stocker les scores de pertinence IA
CREATE TABLE IF NOT EXISTS market_relevance_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  market_id text NOT NULL,
  alert_id uuid REFERENCES market_search_alerts(id) ON DELETE CASCADE,

  -- Données du marché
  market_title text NOT NULL,
  market_reference text,
  market_description text,
  market_amount numeric,
  market_location text,
  market_deadline timestamptz,
  market_url text,

  -- Scoring IA
  relevance_score int NOT NULL DEFAULT 0,
  score_category text NOT NULL DEFAULT 'no_go',

  -- Recommandation IA
  ai_recommendation text NOT NULL DEFAULT 'ignore',
  ai_reasoning text,
  key_strengths jsonb DEFAULT '[]'::jsonb,
  key_risks jsonb DEFAULT '[]'::jsonb,

  -- Métadonnées
  analyzed_at timestamptz DEFAULT now(),
  is_read boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  user_action text,
  action_taken_at timestamptz,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id, market_id, alert_id)
);

ALTER TABLE market_relevance_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own relevance scores"
  ON market_relevance_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own relevance scores"
  ON market_relevance_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own relevance scores"
  ON market_relevance_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own relevance scores"
  ON market_relevance_scores FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Table pour les statistiques Market Sentinel
CREATE TABLE IF NOT EXISTS market_sentinel_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_id uuid REFERENCES market_search_alerts(id) ON DELETE CASCADE,

  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,

  total_markets_detected int DEFAULT 0,
  go_count int DEFAULT 0,
  conditional_count int DEFAULT 0,
  no_go_count int DEFAULT 0,

  markets_responded int DEFAULT 0,
  markets_ignored int DEFAULT 0,
  expert_requested int DEFAULT 0,
  memory_ordered int DEFAULT 0,

  created_at timestamptz DEFAULT now(),

  UNIQUE(user_id, alert_id, period_start)
);

ALTER TABLE market_sentinel_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sentinel stats"
  ON market_sentinel_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert sentinel stats"
  ON market_sentinel_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_market_relevance_scores_user_id ON market_relevance_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_market_relevance_scores_alert_id ON market_relevance_scores(alert_id);
CREATE INDEX IF NOT EXISTS idx_market_relevance_scores_category ON market_relevance_scores(score_category);
CREATE INDEX IF NOT EXISTS idx_market_relevance_scores_analyzed_at ON market_relevance_scores(analyzed_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_relevance_scores_is_read ON market_relevance_scores(is_read) WHERE is_archived = false;

CREATE INDEX IF NOT EXISTS idx_market_sentinel_stats_user_id ON market_sentinel_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_market_sentinel_stats_alert_id ON market_sentinel_stats(alert_id);
CREATE INDEX IF NOT EXISTS idx_market_sentinel_stats_period ON market_sentinel_stats(period_start, period_end);

-- Fonction pour calculer les statistiques
CREATE OR REPLACE FUNCTION calculate_sentinel_stats(
  p_user_id uuid,
  p_alert_id uuid,
  p_period_start timestamptz,
  p_period_end timestamptz
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
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
