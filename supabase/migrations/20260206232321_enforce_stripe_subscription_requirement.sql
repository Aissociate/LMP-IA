/*
  # Renforcement des règles d'abonnement - Stripe obligatoire

  ## Changements

  1. **Mise à jour de la fonction check_user_access**
    - Les admins ont toujours accès (is_admin = true)
    - Les utilisateurs en période d'essai doivent avoir un stripe_customer_id (CB enregistrée)
    - Les utilisateurs avec abonnement actif doivent avoir un stripe_subscription_id valide
    - Tous les autres utilisateurs sont redirigés vers la page d'abonnement
  
  2. **Règles strictes**
    - Pas d'accès sans admin OU (trial valide avec CB) OU (abonnement Stripe actif)
    - L'enregistrement d'une CB via Stripe est obligatoire même pour le trial
    - Aucun plan gratuit permanent n'est autorisé

  3. **Sécurité**
    - Fonction SECURITY DEFINER avec search_path défini
    - Vérifications strictes à chaque niveau
*/

-- Fonction améliorée pour vérifier l'accès utilisateur avec Stripe obligatoire
CREATE OR REPLACE FUNCTION check_user_access(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_subscription record;
  v_result jsonb;
BEGIN
  -- Vérifier si l'utilisateur est admin
  SELECT is_admin INTO v_is_admin
  FROM user_profiles
  WHERE user_id = p_user_id;

  -- Les admins ont toujours accès (exception à la règle Stripe)
  IF v_is_admin = true THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'reason', 'admin',
      'is_admin', true
    );
  END IF;

  -- Vérifier l'abonnement actif
  SELECT 
    us.*,
    sp.name as plan_name,
    sp.monthly_memories_limit
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
  AND us.status = 'active';

  -- Pas d'abonnement trouvé du tout
  IF v_subscription IS NULL THEN
    RETURN jsonb_build_object(
      'has_access', false,
      'reason', 'no_subscription',
      'is_admin', false,
      'needs_subscription', true
    );
  END IF;

  -- RÈGLE 1 : Période d'essai valide AVEC carte bancaire enregistrée
  IF v_subscription.trial_end_date IS NOT NULL 
     AND v_subscription.trial_end_date > now() 
     AND v_subscription.stripe_customer_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'reason', 'trial',
      'is_admin', false,
      'trial_end_date', v_subscription.trial_end_date,
      'plan_name', v_subscription.plan_name,
      'memories_limit', v_subscription.monthly_memories_limit
    );
  END IF;

  -- RÈGLE 2 : Abonnement Stripe actif et payant
  IF v_subscription.stripe_subscription_id IS NOT NULL 
     AND v_subscription.stripe_customer_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'reason', 'active_subscription',
      'is_admin', false,
      'plan_name', v_subscription.plan_name,
      'memories_limit', v_subscription.monthly_memories_limit
    );
  END IF;

  -- RÈGLE 3 : Tous les autres cas = pas d'accès, redirection vers abonnement
  -- Cela inclut :
  -- - Trial expiré sans abonnement Stripe
  -- - Abonnement actif mais sans stripe_customer_id (cas anormal)
  -- - Abonnement avec stripe_customer_id mais sans stripe_subscription_id
  RETURN jsonb_build_object(
    'has_access', false,
    'reason', 'stripe_subscription_required',
    'is_admin', false,
    'needs_subscription', true
  );
END;
$$;

-- Ajouter un commentaire sur la fonction pour documenter les règles
COMMENT ON FUNCTION check_user_access IS 
'Vérifie l''accès utilisateur avec Stripe obligatoire. 
Règles : Admins = accès direct | Trial valide avec CB = accès temporaire | Abonnement Stripe actif = accès permanent | Autres = pas d''accès';
