/*
  # Créer la table report_assets pour la gestion des images

  1. Nouvelle table
    - `report_assets`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, clé étrangère vers auth.users)
      - `name` (text, nom du fichier)
      - `file_path` (text, chemin dans le storage)
      - `file_url` (text, URL publique)
      - `file_size` (bigint, taille du fichier)
      - `file_type` (text, type MIME)
      - `created_at` (timestamp)

  2. Sécurité
    - Activer RLS sur la table `report_assets`
    - Politiques pour que les utilisateurs gèrent leurs propres assets
*/

CREATE TABLE IF NOT EXISTS report_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_path text NOT NULL,
  file_url text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  file_type text,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE report_assets ENABLE ROW LEVEL SECURITY;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_report_assets_user_id ON report_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_report_assets_created_at ON report_assets(created_at DESC);

-- Politiques RLS
CREATE POLICY "Users can view own assets"
  ON report_assets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON report_assets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON report_assets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON report_assets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);