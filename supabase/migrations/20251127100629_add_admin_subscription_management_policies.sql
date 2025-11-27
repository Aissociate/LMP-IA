/*
  # Ajouter les politiques RLS pour la gestion des abonnements par les admins

  ## Changements
  
  1. **Nouvelles Politiques RLS sur `user_subscriptions`**
     - Les admins peuvent créer, modifier et supprimer des abonnements
     - Les utilisateurs normaux peuvent uniquement voir leurs abonnements
  
  2. **Nouvelles Politiques RLS sur `monthly_memory_usage`**
     - Les admins peuvent gérer les compteurs d'utilisation
     - Nécessaire pour réinitialiser manuellement les compteurs
  
  3. **Sécurité**
     - Seuls les utilisateurs avec `is_admin = true` peuvent modifier
     - Les utilisateurs normaux restent en lecture seule
*/

-- Politique INSERT pour user_subscriptions
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can insert subscriptions" ON user_subscriptions;
  CREATE POLICY "Admins can insert subscriptions"
    ON user_subscriptions FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.is_admin = true
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Politique UPDATE pour user_subscriptions
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can update subscriptions" ON user_subscriptions;
  CREATE POLICY "Admins can update subscriptions"
    ON user_subscriptions FOR UPDATE
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
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Politique DELETE pour user_subscriptions
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete subscriptions" ON user_subscriptions;
  CREATE POLICY "Admins can delete subscriptions"
    ON user_subscriptions FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.is_admin = true
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Politique INSERT pour monthly_memory_usage
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can insert memory usage" ON monthly_memory_usage;
  CREATE POLICY "Admins can insert memory usage"
    ON monthly_memory_usage FOR INSERT
    TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.is_admin = true
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Politique UPDATE pour monthly_memory_usage
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can update memory usage" ON monthly_memory_usage;
  CREATE POLICY "Admins can update memory usage"
    ON monthly_memory_usage FOR UPDATE
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
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Politique DELETE pour monthly_memory_usage
DO $$ BEGIN
  DROP POLICY IF EXISTS "Admins can delete memory usage" ON monthly_memory_usage;
  CREATE POLICY "Admins can delete memory usage"
    ON monthly_memory_usage FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.user_id = auth.uid()
        AND user_profiles.is_admin = true
      )
    );
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
