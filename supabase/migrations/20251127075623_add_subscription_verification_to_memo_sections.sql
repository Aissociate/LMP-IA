/*
  # Ajouter la vérification d'abonnement pour les mémoires techniques

  ## Changements
  
  1. **Nouvelle Politique RLS sur `memo_sections`**
     - Bloque l'insertion de nouvelles sections de mémoire si :
       - L'utilisateur n'a pas d'abonnement actif (`user_subscriptions.status = 'active'`)
       - L'utilisateur a dépassé sa limite mensuelle de mémoires
     - Les admins (`is_admin = true`) peuvent toujours créer des mémoires
  
  2. **Logique de Vérification**
     - Compte le nombre de marchés distincts avec des sections ce mois-ci
     - Compare avec la limite mensuelle du plan (`monthly_memories_limit`)
     - Autorise si : `marchés_créés_ce_mois < limite_plan`
  
  3. **Exceptions**
     - Les admins ne sont pas limités
     - Les modifications de sections existantes sont toujours autorisées
     - La lecture reste accessible à tous les utilisateurs authentifiés
  
  ## Sécurité
  
  Cette migration assure que seuls les utilisateurs avec un abonnement actif 
  et n'ayant pas dépassé leur limite mensuelle peuvent créer de nouveaux mémoires.
*/

-- Supprimer l'ancienne politique d'insertion sur memo_sections
DROP POLICY IF EXISTS "Users can insert own memo sections" ON memo_sections;

-- Créer une nouvelle politique d'insertion avec vérification d'abonnement
CREATE POLICY "Users can insert memo sections with subscription check"
  ON memo_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() 
    AND (
      -- Les admins peuvent toujours créer
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.user_id = auth.uid()
        AND up.is_admin = true
      )
      OR
      -- Les utilisateurs avec abonnement actif sous la limite
      EXISTS (
        SELECT 1 
        FROM user_subscriptions us
        JOIN subscription_plans sp ON sp.id = us.plan_id
        WHERE us.user_id = auth.uid()
        AND us.status = 'active'
        AND (
          -- Compter les marchés distincts avec sections ce mois
          SELECT COUNT(DISTINCT market_id)
          FROM memo_sections ms
          WHERE ms.user_id = auth.uid()
          AND ms.created_at >= us.current_period_start
          AND ms.created_at < us.current_period_end
        ) < sp.monthly_memories_limit
      )
    )
  );

-- Ajouter un commentaire explicatif sur la politique
COMMENT ON POLICY "Users can insert memo sections with subscription check" ON memo_sections IS 
  'Autorise l''insertion uniquement si l''utilisateur est admin ou a un abonnement actif avec des crédits restants';
