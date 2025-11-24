/*
  # Mise à jour des plans d'abonnement - Nouvelle tarification 2025

  1. Plans mensuels
    - Plan SOLO (199€/mois) : 1 mémoire Market Light/mois
    - Plan PME (349€/mois) : 2 mémoires Market Light/mois (recommandé)
    - Plan PROJETEUR (849€/mois) : 5 mémoires Market Light/mois
    
  2. Options à la carte
    - Market Pro : +99€/mois (appliqué sur tous les mémoires du plan)
    - Mémoire supplémentaire : 299€/unité
    - Booster Expert 4h : 590€/mémoire
    - Booster Expert Senior 3j : 2490€/marché
    
  3. Nouvelles tables
    - subscription_addons : pour gérer les options Market Pro et boosters
    - monthly_memory_usage : pour tracker l'utilisation mensuelle des crédits
    
  4. Sécurité
    - RLS activé sur toutes les tables
    - Politiques restrictives par défaut
*/

-- Désactiver les anciens plans
UPDATE subscription_plans
SET is_active = false
WHERE id NOT IN ('admin', 'freemium_unlimited');

-- Créer/Mettre à jour les nouveaux plans (prix en centimes pour Stripe)
INSERT INTO subscription_plans (id, name, price, technical_memories_limit, features, is_unlimited, is_active, monthly_tokens_limit)
VALUES
  ('solo', 'Plan SOLO', 19900, 1, 
   '["Veille marchés incluse", "Score GO/NO-GO", "Assistant IA Marchés & BPU", "1 mémoire Market Light/mois", "Espace client & historique", "Formations vidéo", "Export Word/PDF"]'::jsonb,
   false, true, 128000),
  
  ('pme', 'Plan PME', 34900, 2,
   '["Veille marchés incluse", "GO/NO-GO sur tous les marchés", "Assistant IA Marchés & BPU", "2 mémoires Market Light/mois", "Espace client & historique complet", "Priorité de génération vs SOLO", "1 point de contact trimestriel"]'::jsonb,
   false, true, 128000),
  
  ('projeteur', 'Plan PROJETEUR', 84900, 5,
   '["Veille marchés incluse", "GO/NO-GO sur tous les marchés", "Assistant IA illimité", "5 mémoires Market Light/mois", "Espace client + historique détaillé", "Priorité maximale", "1 point de suivi mensuel"]'::jsonb,
   false, true, 128000)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  technical_memories_limit = EXCLUDED.technical_memories_limit,
  features = EXCLUDED.features,
  is_active = EXCLUDED.is_active,
  monthly_tokens_limit = EXCLUDED.monthly_tokens_limit;

-- Table pour gérer les add-ons (options à la carte)
CREATE TABLE IF NOT EXISTS subscription_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addon_type text NOT NULL CHECK (addon_type IN ('market_pro', 'extra_memory', 'booster_4h', 'booster_3days')),
  addon_name text NOT NULL,
  price_cents int NOT NULL,
  is_recurring boolean DEFAULT false,
  quantity int DEFAULT 1,
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  stripe_subscription_id text,
  purchased_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addons"
  ON subscription_addons FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addons"
  ON subscription_addons FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addons"
  ON subscription_addons FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Table pour tracker l'utilisation mensuelle des mémoires
CREATE TABLE IF NOT EXISTS monthly_memory_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year text NOT NULL,
  plan_id text NOT NULL REFERENCES subscription_plans(id),
  memories_included int NOT NULL DEFAULT 0,
  memories_used int NOT NULL DEFAULT 0,
  extra_memories_purchased int NOT NULL DEFAULT 0,
  market_pro_enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

ALTER TABLE monthly_memory_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
  ON monthly_memory_usage FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON monthly_memory_usage FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON monthly_memory_usage FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fonction pour initialiser l'utilisation mensuelle
CREATE OR REPLACE FUNCTION init_monthly_usage(p_user_id uuid, p_plan_id text)
RETURNS void AS $$
DECLARE
  v_month_year text;
  v_memories_limit int;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');
  
  SELECT technical_memories_limit INTO v_memories_limit
  FROM subscription_plans
  WHERE id = p_plan_id;
  
  INSERT INTO monthly_memory_usage (user_id, month_year, plan_id, memories_included, memories_used)
  VALUES (p_user_id, v_month_year, p_plan_id, v_memories_limit, 0)
  ON CONFLICT (user_id, month_year) 
  DO UPDATE SET 
    plan_id = p_plan_id,
    memories_included = v_memories_limit,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour incrémenter l'utilisation des mémoires
CREATE OR REPLACE FUNCTION increment_memory_usage(p_user_id uuid)
RETURNS boolean AS $$
DECLARE
  v_month_year text;
  v_current_usage int;
  v_total_available int;
BEGIN
  v_month_year := TO_CHAR(NOW(), 'YYYY-MM');
  
  SELECT 
    memories_used,
    memories_included + extra_memories_purchased
  INTO v_current_usage, v_total_available
  FROM monthly_memory_usage
  WHERE user_id = p_user_id AND month_year = v_month_year;
  
  IF v_current_usage >= v_total_available THEN
    RETURN false;
  END IF;
  
  UPDATE monthly_memory_usage
  SET 
    memories_used = memories_used + 1,
    updated_at = NOW()
  WHERE user_id = p_user_id AND month_year = v_month_year;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_subscription_addons_user_id ON subscription_addons(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_addons_type ON subscription_addons(addon_type);
CREATE INDEX IF NOT EXISTS idx_subscription_addons_status ON subscription_addons(status);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_user_month ON monthly_memory_usage(user_id, month_year);
