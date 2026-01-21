/*
  # Create candidatures table for recruitment system

  1. New Tables
    - `candidatures`
      - `id` (uuid, primary key)
      - `nom` (text) - Candidate name
      - `prenom` (text) - Candidate first name
      - `email` (text) - Email address
      - `telephone` (text) - Phone number
      - `experiences_similaires` (text) - Similar experiences
      - `methode_eviter_erreurs` (text) - Method to avoid errors
      - `disponibilite_quotidienne` (text) - Daily availability
      - `accord_paiement_tarif` (boolean) - Agreement with payment/rate
      - `motivations` (text) - Motivations
      - `statut` (text) - Status (nouveau, en_cours, accepte, refuse)
      - `notes_admin` (text) - Admin notes
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Update timestamp

  2. Security
    - Enable RLS on `candidatures` table
    - Add policy for anonymous users to insert candidatures
    - Add policy for admins to read/update candidatures
*/

CREATE TABLE IF NOT EXISTS candidatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  prenom text NOT NULL,
  email text NOT NULL,
  telephone text NOT NULL,
  experiences_similaires text NOT NULL,
  methode_eviter_erreurs text NOT NULL,
  disponibilite_quotidienne text NOT NULL,
  accord_paiement_tarif boolean DEFAULT false,
  motivations text,
  statut text DEFAULT 'nouveau' CHECK (statut IN ('nouveau', 'en_cours', 'accepte', 'refuse')),
  notes_admin text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE candidatures ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit a candidature
CREATE POLICY "Anyone can submit candidature"
  ON candidatures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read candidatures
CREATE POLICY "Admins can read candidatures"
  ON candidatures
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Only admins can update candidatures
CREATE POLICY "Admins can update candidatures"
  ON candidatures
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_candidatures_statut ON candidatures(statut);
CREATE INDEX IF NOT EXISTS idx_candidatures_created_at ON candidatures(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_candidatures_email ON candidatures(email);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_candidatures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS set_candidatures_updated_at ON candidatures;
CREATE TRIGGER set_candidatures_updated_at
  BEFORE UPDATE ON candidatures
  FOR EACH ROW
  EXECUTE FUNCTION update_candidatures_updated_at();
