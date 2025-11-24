/*
  # Correction de la récursion infinie dans les politiques admin_settings

  1. Problème résolu
    - Suppression de la condition de bootstrap qui créait une récursion infinie
    - La politique vérifie maintenant seulement les user_profiles pour déterminer les droits admin
    
  2. Nouvelle approche
    - Politique simplifiée sans référence circulaire à admin_settings
    - Accès admin basé uniquement sur user_profiles (company ou full_name contient "admin")
    - Fonction helper pour centraliser la logique d'identification admin
    
  3. Initialisation
    - Le premier utilisateur admin doit avoir "admin" dans son company ou full_name
    - Plus de vérification de table vide qui créait la récursion
*/

-- Créer une fonction helper pour identifier les admins sans récursion
CREATE OR REPLACE FUNCTION is_user_admin(user_id_param uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE user_id = user_id_param 
    AND (
      company ILIKE '%admin%' 
      OR full_name ILIKE '%admin%'
    )
  );
$$;

-- Supprimer l'ancienne politique qui causait la récursion
DROP POLICY IF EXISTS "Admins can manage settings with bootstrap" ON admin_settings;

-- Créer une nouvelle politique sans récursion
CREATE POLICY "Admins can manage settings"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));