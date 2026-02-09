/*
  # Table admin_secrets pour les cles API securisees

  1. Nouvelle Table
    - `admin_secrets`
      - `id` (uuid, primary key)
      - `secret_key` (text, unique) - Identifiant du secret (ex: openrouter_api_key)
      - `secret_value` (text) - Valeur du secret
      - `description` (text) - Description du secret
      - `created_at` (timestamptz) - Date de creation
      - `updated_at` (timestamptz) - Date de mise a jour

  2. Securite
    - RLS active
    - Seuls les admins peuvent lire et modifier
    - Aucun acces pour les utilisateurs non-admin
    - Les edge functions utilisent service_role_key pour lire

  3. Notes
    - Cette table remplace le stockage de cles API dans les variables d'environnement
    - Les edge functions lisent les secrets via service_role_key (bypass RLS)
*/

CREATE TABLE IF NOT EXISTS admin_secrets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_key text UNIQUE NOT NULL,
  secret_value text NOT NULL DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_secrets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view secrets"
  ON admin_secrets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert secrets"
  ON admin_secrets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update secrets"
  ON admin_secrets FOR UPDATE
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

CREATE POLICY "Admins can delete secrets"
  ON admin_secrets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );