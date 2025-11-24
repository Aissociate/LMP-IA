/*
  # Create fiche_valeur table

  1. New Tables
    - `fiche_valeur`
      - `id` (uuid, primary key)
      - `market_id` (uuid, foreign key to markets)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text) - Contenu markdown de la fiche valeur
      - `prompt` (text) - Prompt utilisé pour la génération
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `fiche_valeur` table
    - Add policies for authenticated users to manage their own fiches valeur

  3. Indexes
    - Index on market_id for faster lookups
    - Unique constraint on market_id to ensure one fiche per market
*/

CREATE TABLE IF NOT EXISTS fiche_valeur (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL DEFAULT '',
  prompt text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(market_id)
);

ALTER TABLE fiche_valeur ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fiche valeur"
  ON fiche_valeur FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fiche valeur"
  ON fiche_valeur FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fiche valeur"
  ON fiche_valeur FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own fiche valeur"
  ON fiche_valeur FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_fiche_valeur_market_id ON fiche_valeur(market_id);
CREATE INDEX IF NOT EXISTS idx_fiche_valeur_user_id ON fiche_valeur(user_id);