/*
  # Créer la table d'historique des recherches de marchés

  1. Nouvelle table
    - `market_search_history`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence à auth.users)
      - `search_mode` (text) - 'keyword' ou 'reference'
      - `search_query` (text) - la requête de recherche
      - `filters` (jsonb) - les filtres appliqués
      - `results_count` (integer) - nombre de résultats trouvés
      - `created_at` (timestamptz)
  
  2. Sécurité
    - Enable RLS sur `market_search_history`
    - Les utilisateurs peuvent voir uniquement leur propre historique
    - Les utilisateurs peuvent créer leur propre historique
*/

CREATE TABLE IF NOT EXISTS market_search_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  search_mode text NOT NULL CHECK (search_mode IN ('keyword', 'reference')),
  search_query text NOT NULL,
  filters jsonb DEFAULT '{}'::jsonb,
  results_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_search_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own search history"
  ON market_search_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own search history"
  ON market_search_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_market_search_history_user_id ON market_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_market_search_history_created_at ON market_search_history(created_at DESC);
