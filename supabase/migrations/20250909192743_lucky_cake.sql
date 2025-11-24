/*
  # Ajouter la table des documents de marchés

  1. Nouvelle table
    - `market_documents`
      - `id` (uuid, clé primaire)
      - `market_id` (uuid, référence vers markets)
      - `name` (text, nom du fichier)
      - `file_path` (text, chemin du fichier)
      - `file_size` (bigint, taille du fichier)
      - `file_type` (text, type MIME)
      - `analysis_status` (text, statut de l'analyse)
      - `analysis_result` (text, résultat de l'analyse IA)
      - `user_id` (uuid, référence vers auth.users)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur `market_documents` table
    - Add politique pour les utilisateurs authentifiés
*/

CREATE TABLE IF NOT EXISTS market_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint DEFAULT 0,
  file_type text,
  analysis_status text DEFAULT 'pending' CHECK (analysis_status IN ('pending', 'analyzing', 'completed', 'error')),
  analysis_result text,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE market_documents ENABLE ROW LEVEL SECURITY;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_market_documents_market_id ON market_documents(market_id);
CREATE INDEX IF NOT EXISTS idx_market_documents_user_id ON market_documents(user_id);

-- Politiques RLS
CREATE POLICY "Users can insert own market documents"
  ON market_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own market documents"
  ON market_documents
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own market documents"
  ON market_documents
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own market documents"
  ON market_documents
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);