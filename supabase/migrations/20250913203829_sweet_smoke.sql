/*
  # Création des tables pour la section Labo

  1. Tables créées
    - `feature_requests`
      - `id` (uuid, primary key)
      - `title` (text, titre de la fonctionnalité)
      - `description` (text, description détaillée)
      - `type` (text, type: bug_fix, new_feature, improvement)
      - `status` (text, statut: proposed, approved, in_progress, completed, rejected)
      - `votes_count` (integer, nombre de votes)
      - `user_id` (uuid, utilisateur qui a proposé)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `feature_votes`
      - `id` (uuid, primary key)
      - `feature_request_id` (uuid, référence vers feature_requests)
      - `user_id` (uuid, utilisateur qui vote)
      - `created_at` (timestamp)

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Policies pour lecture/écriture appropriées
*/

-- Table des demandes de fonctionnalités
CREATE TABLE IF NOT EXISTS feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  type text NOT NULL CHECK (type IN ('bug_fix', 'new_feature', 'improvement')),
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'approved', 'in_progress', 'completed', 'rejected')),
  votes_count integer DEFAULT 0,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des votes pour les fonctionnalités
CREATE TABLE IF NOT EXISTS feature_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_request_id uuid NOT NULL REFERENCES feature_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(feature_request_id, user_id)
);

-- Indexes pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_feature_requests_status ON feature_requests(status);
CREATE INDEX IF NOT EXISTS idx_feature_requests_type ON feature_requests(type);
CREATE INDEX IF NOT EXISTS idx_feature_requests_created_at ON feature_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feature_requests_votes_count ON feature_requests(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_feature_votes_feature_id ON feature_votes(feature_request_id);
CREATE INDEX IF NOT EXISTS idx_feature_votes_user_id ON feature_votes(user_id);

-- Enable RLS
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;

-- Policies pour feature_requests
CREATE POLICY "Anyone can read feature requests" ON feature_requests
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create their own feature requests" ON feature_requests
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feature requests" ON feature_requests
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Policy pour permettre aux admins de modifier le statut
CREATE POLICY "Admins can update feature request status" ON feature_requests
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND (
        user_profiles.company ILIKE '%admin%' OR 
        user_profiles.full_name ILIKE '%admin%'
      )
    )
  );

-- Policies pour feature_votes
CREATE POLICY "Anyone can read feature votes" ON feature_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can vote" ON feature_votes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their votes" ON feature_votes
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_feature_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_feature_requests_updated_at
  BEFORE UPDATE ON feature_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_requests_updated_at();

-- Insérer quelques exemples de fonctionnalités pour démonstration
INSERT INTO feature_requests (title, description, type, status, votes_count, user_id) VALUES
  ('Amélioration de l''apparence des réponses mémoire technique', 'Améliorer le formatage et la présentation visuelle des mémoires techniques générés par l''IA pour une meilleure lisibilité.', 'improvement', 'proposed', 3, (SELECT id FROM auth.users LIMIT 1)),
  ('Coffre-fort virtuel pour documents', 'Ajouter un espace sécurisé pour stocker et organiser les documents confidentiels avec chiffrement avancé.', 'new_feature', 'approved', 8, (SELECT id FROM auth.users LIMIT 1)),
  ('Notifications en temps réel', 'Système de notifications push pour les mises à jour importantes des marchés et les nouvelles fonctionnalités.', 'new_feature', 'in_progress', 12, (SELECT id FROM auth.users LIMIT 1));