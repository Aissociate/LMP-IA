/*
  # Correction des politiques RLS pour admin_settings

  1. Changements
    - Création d'une fonction helper pour vérifier si un utilisateur est admin
    - Ajout de politiques permettant aux admins d'insérer et modifier admin_settings
    - Conservation de la politique de lecture publique

  2. Sécurité
    - Seuls les vrais admins peuvent modifier admin_settings
    - Vérification basée sur user_profiles (company ou full_name contenant 'admin')
*/

-- Créer une fonction helper pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_profiles
    WHERE user_id = auth.uid()
    AND (
      LOWER(company) LIKE '%admin%'
      OR LOWER(full_name) LIKE '%admin%'
      OR LOWER(company) LIKE '%administrateur%'
    )
  );
END;
$$;

-- Supprimer l'ancienne politique restrictive si elle existe
DROP POLICY IF EXISTS "Service role can manage admin settings" ON admin_settings;

-- Ajouter les nouvelles politiques pour les admins
CREATE POLICY "Admins can insert admin settings"
  ON admin_settings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update admin settings"
  ON admin_settings FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete admin settings"
  ON admin_settings FOR DELETE
  TO authenticated
  USING (is_admin());
