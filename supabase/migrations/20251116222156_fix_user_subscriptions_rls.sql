/*
  # Fix RLS policies for user_subscriptions

  1. Politiques RLS
    - Permettre aux utilisateurs de voir leur propre abonnement
    - Permettre aux utilisateurs de créer leur abonnement
    - Permettre aux utilisateurs de mettre à jour leur abonnement
    
  2. Sécurité
    - RLS activé
    - Politiques restrictives
*/

-- S'assurer que RLS est activé
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Politique de lecture (SELECT)
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Politique d'insertion (INSERT)
DROP POLICY IF EXISTS "Users can create own subscription" ON user_subscriptions;
CREATE POLICY "Users can create own subscription"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Politique de mise à jour (UPDATE)
DROP POLICY IF EXISTS "Users can update own subscription" ON user_subscriptions;
CREATE POLICY "Users can update own subscription"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
