/*
  # Mise à jour du système d'abonnement avec période d'essai

  ## Changements

  1. **Ajout de champs pour la période d'essai**
    - `trial_end_date` : Date de fin de la période d'essai
    - `has_trial_used` : Indique si l'utilisateur a déjà utilisé sa période d'essai

  2. **Mise à jour des plans d'abonnement**
    - TRIAL : 7 jours gratuits, tout illimité SAUF 0 mémoires techniques
    - BRONZE : 199€/mois - veille illimitée, IA illimitée, 1 mémoire technique
    - ARGENT : 349€/mois - veille illimitée, IA illimitée, 3 mémoires techniques  
    - OR : 549€/mois - veille illimitée, IA illimitée, 10 mémoires techniques

  3. **Règles d'accès**
    - Les admins ont accès sans abonnement
    - Les utilisateurs doivent avoir un abonnement Stripe valide ou être en période d'essai
    - Pas d'abonnement = pas d'accès (sauf admin)

  4. **Security**
    - Maintien de toutes les politiques RLS existantes
*/

-- Ajouter les champs pour la période d'essai
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' AND column_name = 'trial_end_date'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN trial_end_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_subscriptions' AND column_name = 'has_trial_used'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN has_trial_used boolean DEFAULT false;
  END IF;
END $$;

-- Désactiver tous les anciens plans
UPDATE subscription_plans 
SET is_active = false
WHERE name NOT IN ('TRIAL', 'BRONZE', 'ARGENT', 'OR');

-- Supprimer les plans pour éviter les conflits
DELETE FROM subscription_plans 
WHERE name IN ('TRIAL', 'BRONZE', 'ARGENT', 'OR');

-- Insérer les nouveaux plans
INSERT INTO subscription_plans (
  name,
  stripe_price_id,
  monthly_memories_limit,
  price_monthly,
  features,
  is_active
) VALUES
  (
    'TRIAL',
    NULL,
    0,
    0.00,
    '[
      "7 jours gratuits avec CB",
      "Veille marchés illimitée",
      "IA illimitée",
      "GO/NO-GO illimité",
      "0 mémoire technique",
      "Toutes les fonctionnalités"
    ]'::jsonb,
    true
  ),
  (
    'BRONZE',
    'price_bronze_prod_id',
    1,
    199.00,
    '[
      "Veille marchés illimitée",
      "IA illimitée",
      "GO/NO-GO illimité",
      "1 mémoire technique / mois",
      "Export Word / PDF",
      "Support email"
    ]'::jsonb,
    true
  ),
  (
    'ARGENT',
    'price_argent_prod_id',
    3,
    349.00,
    '[
      "Veille marchés illimitée",
      "IA illimitée",
      "GO/NO-GO illimité",
      "3 mémoires techniques / mois",
      "Export Word / PDF",
      "Support prioritaire"
    ]'::jsonb,
    true
  ),
  (
    'OR',
    'price_or_prod_id',
    10,
    549.00,
    '[
      "Veille marchés illimitée",
      "IA illimitée",
      "GO/NO-GO illimité",
      "10 mémoires techniques / mois",
      "Export Word / PDF",
      "Support VIP",
      "Accompagnement personnalisé"
    ]'::jsonb,
    true
  );

-- Fonction pour vérifier si un utilisateur a accès à l'application
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

  -- Les admins ont toujours accès
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

  -- Pas d'abonnement trouvé
  IF v_subscription IS NULL THEN
    RETURN jsonb_build_object(
      'has_access', false,
      'reason', 'no_subscription',
      'is_admin', false,
      'needs_subscription', true
    );
  END IF;

  -- Vérifier si en période d'essai
  IF v_subscription.trial_end_date IS NOT NULL AND v_subscription.trial_end_date > now() THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'reason', 'trial',
      'is_admin', false,
      'trial_end_date', v_subscription.trial_end_date,
      'plan_name', v_subscription.plan_name
    );
  END IF;

  -- Vérifier si abonnement Stripe valide
  IF v_subscription.stripe_subscription_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'reason', 'active_subscription',
      'is_admin', false,
      'plan_name', v_subscription.plan_name,
      'memories_limit', v_subscription.monthly_memories_limit
    );
  END IF;

  -- Sinon, pas d'accès
  RETURN jsonb_build_object(
    'has_access', false,
    'reason', 'no_valid_subscription',
    'is_admin', false,
    'needs_subscription', true
  );
END;
$$;

-- Fonction pour démarrer la période d'essai
CREATE OR REPLACE FUNCTION start_trial(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trial_plan_id uuid;
  v_has_trial_used boolean;
BEGIN
  -- Vérifier si l'utilisateur a déjà utilisé sa période d'essai
  SELECT has_trial_used INTO v_has_trial_used
  FROM user_subscriptions
  WHERE user_id = p_user_id;

  IF v_has_trial_used = true THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'trial_already_used',
      'message', 'Période d''essai déjà utilisée'
    );
  END IF;

  -- Récupérer l'ID du plan TRIAL
  SELECT id INTO v_trial_plan_id
  FROM subscription_plans
  WHERE name = 'TRIAL'
  AND is_active = true;

  IF v_trial_plan_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'trial_plan_not_found',
      'message', 'Plan d''essai non trouvé'
    );
  END IF;

  -- Créer ou mettre à jour l'abonnement avec période d'essai
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    trial_end_date,
    has_trial_used,
    current_period_start,
    current_period_end
  ) VALUES (
    p_user_id,
    v_trial_plan_id,
    'active',
    now() + interval '7 days',
    true,
    now(),
    now() + interval '7 days'
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    plan_id = v_trial_plan_id,
    status = 'active',
    trial_end_date = now() + interval '7 days',
    has_trial_used = true,
    current_period_start = now(),
    current_period_end = now() + interval '7 days',
    updated_at = now();

  RETURN jsonb_build_object(
    'success', true,
    'trial_end_date', now() + interval '7 days'
  );
END;
$$;
