/*
  # Système d'abonnement Stripe

  1. Tables
    - `subscription_plans` : Les 3 plans d'abonnement (Starter: 1/mois, Pro: 3/mois, Premium: 5/mois)
    - `user_subscriptions` : Abonnement actif par utilisateur
    - `monthly_memory_usage` : Compteur mensuel par utilisateur

  2. Sécurité
    - Enable RLS sur toutes les tables
    - Policies pour que les utilisateurs voient uniquement leurs données

  3. Fonctions
    - `reset_monthly_usage` : Réinitialise le compteur (appelé par webhook Stripe)
    - `increment_memory_usage` : Incrémente avec vérification de limite
    - `get_user_memory_stats` : Récupère les stats d'usage
*/

-- Table des plans d'abonnement
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  stripe_price_id text UNIQUE,
  monthly_memories_limit integer NOT NULL,
  price_monthly numeric(10,2) NOT NULL,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Tout le monde peut lire les plans actifs
CREATE POLICY "Anyone can view active plans"
  ON subscription_plans
  FOR SELECT
  USING (is_active = true);

-- Seuls les admins peuvent modifier les plans
CREATE POLICY "Admins can manage plans"
  ON subscription_plans
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Table des abonnements utilisateurs
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES subscription_plans(id),
  stripe_customer_id text,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs voient leur propre abonnement
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Les admins voient tout
CREATE POLICY "Admins can view all subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Table du compteur mensuel
CREATE TABLE IF NOT EXISTS monthly_memory_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memories_used integer NOT NULL DEFAULT 0,
  period_start timestamptz NOT NULL DEFAULT now(),
  period_end timestamptz NOT NULL DEFAULT (now() + interval '1 month'),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE monthly_memory_usage ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs voient leur propre usage
CREATE POLICY "Users can view own usage"
  ON monthly_memory_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Les admins voient tout
CREATE POLICY "Admins can view all usage"
  ON monthly_memory_usage
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_monthly_memory_usage_user_id ON monthly_memory_usage(user_id);

-- Fonction pour réinitialiser l'usage mensuel (appelée par webhook Stripe)
CREATE OR REPLACE FUNCTION reset_monthly_usage(p_user_id uuid, p_period_start timestamptz, p_period_end timestamptz)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO monthly_memory_usage (user_id, memories_used, period_start, period_end, updated_at)
  VALUES (p_user_id, 0, p_period_start, p_period_end, now())
  ON CONFLICT (user_id)
  DO UPDATE SET
    memories_used = 0,
    period_start = p_period_start,
    period_end = p_period_end,
    updated_at = now();
END;
$$;

-- Fonction pour incrémenter l'usage avec vérification
CREATE OR REPLACE FUNCTION increment_memory_usage(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_limit integer;
  v_used integer;
BEGIN
  -- Récupérer la limite du plan
  SELECT sp.monthly_memories_limit INTO v_limit
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
  AND us.status = 'active';

  -- Si pas d'abonnement, retourner erreur
  IF v_limit IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_subscription',
      'message', 'Aucun abonnement actif'
    );
  END IF;

  -- Récupérer l'usage actuel
  SELECT memories_used INTO v_used
  FROM monthly_memory_usage
  WHERE user_id = p_user_id;

  -- Créer l'entrée si elle n'existe pas
  IF v_used IS NULL THEN
    INSERT INTO monthly_memory_usage (user_id, memories_used)
    VALUES (p_user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    v_used := 0;
  END IF;

  -- Vérifier la limite
  IF v_used >= v_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'limit_reached',
      'message', 'Limite mensuelle atteinte',
      'used', v_used,
      'limit', v_limit
    );
  END IF;

  -- Incrémenter
  UPDATE monthly_memory_usage
  SET memories_used = memories_used + 1,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'used', v_used + 1,
    'limit', v_limit,
    'remaining', v_limit - (v_used + 1)
  );
END;
$$;

-- Fonction pour récupérer les stats
CREATE OR REPLACE FUNCTION get_user_memory_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'plan_name', sp.name,
    'limit', sp.monthly_memories_limit,
    'used', COALESCE(mmu.memories_used, 0),
    'remaining', sp.monthly_memories_limit - COALESCE(mmu.memories_used, 0),
    'period_start', us.current_period_start,
    'period_end', us.current_period_end,
    'status', us.status
  ) INTO v_result
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  LEFT JOIN monthly_memory_usage mmu ON mmu.user_id = us.user_id
  WHERE us.user_id = p_user_id
  AND us.status = 'active';

  IF v_result IS NULL THEN
    RETURN jsonb_build_object(
      'plan_name', 'Aucun',
      'limit', 0,
      'used', 0,
      'remaining', 0,
      'status', 'none'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- Insérer les 3 plans par défaut (vous devrez mettre à jour stripe_price_id après création dans Stripe)
INSERT INTO subscription_plans (name, monthly_memories_limit, price_monthly, features) VALUES
  ('Starter', 1, 29.00, '["1 mémoire technique par mois", "Génération IA avancée", "Export Word et PDF", "Support email"]'::jsonb),
  ('Pro', 3, 79.00, '["3 mémoires techniques par mois", "Génération IA avancée", "Export Word et PDF", "Support prioritaire", "Accès aux templates premium"]'::jsonb),
  ('Premium', 5, 129.00, '["5 mémoires techniques par mois", "Génération IA avancée", "Export Word et PDF", "Support prioritaire", "Accès aux templates premium", "Accompagnement personnalisé"]'::jsonb)
ON CONFLICT (name) DO NOTHING;