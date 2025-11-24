/*
  # Ajout des colonnes de mapping Stripe aux plans et addons

  1. Modifications aux tables existantes
    - subscription_plans
      - Ajout de stripe_product_id (text) pour l'ID produit Stripe
      - Ajout de stripe_price_id (text) pour l'ID prix Stripe
      - Ajout de last_stripe_sync (timestamptz) pour tracer la dernière synchronisation
      
    - addon_catalog
      - Ajout de stripe_product_id (text) pour l'ID produit Stripe
      - Ajout de stripe_price_id (text) pour l'ID prix Stripe
      - Ajout de last_stripe_sync (timestamptz) pour tracer la dernière synchronisation

  2. Table de traçabilité
    - stripe_price_history
      - Historique des changements de prix pour audit et traçabilité
      
  3. Index
    - Index sur stripe_price_id pour les deux tables pour optimiser les requêtes
    
  4. Pré-remplissage
    - Mapping initial des plans existants (SOLO, PME, PROJETEUR)
    - Mapping initial des addons existants
*/

-- Ajouter colonnes Stripe à subscription_plans
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN stripe_product_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN stripe_price_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' AND column_name = 'last_stripe_sync'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN last_stripe_sync timestamptz;
  END IF;
END $$;

-- Ajouter colonnes Stripe à addon_catalog
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addon_catalog' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE addon_catalog ADD COLUMN stripe_product_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addon_catalog' AND column_name = 'stripe_price_id'
  ) THEN
    ALTER TABLE addon_catalog ADD COLUMN stripe_price_id text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'addon_catalog' AND column_name = 'last_stripe_sync'
  ) THEN
    ALTER TABLE addon_catalog ADD COLUMN last_stripe_sync timestamptz;
  END IF;
END $$;

-- Créer la table d'historique des prix Stripe
CREATE TABLE IF NOT EXISTS stripe_price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('plan', 'addon')),
  entity_id text NOT NULL,
  old_stripe_price_id text,
  new_stripe_price_id text,
  old_price_cents integer,
  new_price_cents integer,
  changed_by uuid REFERENCES auth.users(id),
  change_reason text,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS sur la table d'historique
ALTER TABLE stripe_price_history ENABLE ROW LEVEL SECURITY;

-- Policy: Seuls les admins peuvent voir l'historique
CREATE POLICY "Admins can view price history"
  ON stripe_price_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (company ILIKE '%admin%' OR full_name ILIKE '%admin%')
    )
  );

-- Policy: Seuls les admins peuvent insérer dans l'historique
CREATE POLICY "Admins can insert price history"
  ON stripe_price_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (company ILIKE '%admin%' OR full_name ILIKE '%admin%')
    )
  );

-- Créer des index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_price_id 
  ON subscription_plans(stripe_price_id) 
  WHERE stripe_price_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_addon_catalog_stripe_price_id 
  ON addon_catalog(stripe_price_id) 
  WHERE stripe_price_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stripe_price_history_entity 
  ON stripe_price_history(entity_type, entity_id);

-- Pré-remplir les price_id Stripe pour les plans existants
-- NOTE: Ces price_id devront être remplacés par vos vrais price_id Stripe via l'interface admin
UPDATE subscription_plans
SET 
  stripe_price_id = 'price_solo_monthly',
  stripe_product_id = 'prod_solo',
  last_stripe_sync = now()
WHERE id = 'solo' AND stripe_price_id IS NULL;

UPDATE subscription_plans
SET 
  stripe_price_id = 'price_pme_monthly',
  stripe_product_id = 'prod_pme',
  last_stripe_sync = now()
WHERE id = 'pme' AND stripe_price_id IS NULL;

UPDATE subscription_plans
SET 
  stripe_price_id = 'price_projeteur_monthly',
  stripe_product_id = 'prod_projeteur',
  last_stripe_sync = now()
WHERE id = 'projeteur' AND stripe_price_id IS NULL;

-- Pré-remplir les price_id Stripe pour les addons existants
-- NOTE: Ces price_id devront être remplacés par vos vrais price_id Stripe via l'interface admin
UPDATE addon_catalog
SET 
  stripe_price_id = 'price_market_pro_monthly',
  stripe_product_id = 'prod_market_pro',
  last_stripe_sync = now()
WHERE addon_type = 'market_pro' AND stripe_price_id IS NULL;

UPDATE addon_catalog
SET 
  stripe_price_id = 'price_extra_memory',
  stripe_product_id = 'prod_extra_memory',
  last_stripe_sync = now()
WHERE addon_type = 'extra_memory' AND stripe_price_id IS NULL;

UPDATE addon_catalog
SET 
  stripe_price_id = 'price_booster_expert_4h',
  stripe_product_id = 'prod_booster_expert_4h',
  last_stripe_sync = now()
WHERE addon_type = 'booster_expert_4h' AND stripe_price_id IS NULL;

UPDATE addon_catalog
SET 
  stripe_price_id = 'price_booster_expert_3d',
  stripe_product_id = 'prod_booster_expert_3d',
  last_stripe_sync = now()
WHERE addon_type = 'booster_expert_3d' AND stripe_price_id IS NULL;

-- Créer une fonction helper pour récupérer le price_id d'un plan
CREATE OR REPLACE FUNCTION get_plan_stripe_price_id(p_plan_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_price_id text;
BEGIN
  SELECT stripe_price_id INTO v_price_id
  FROM subscription_plans
  WHERE id = p_plan_id AND is_active = true;
  
  RETURN v_price_id;
END;
$$;

-- Créer une fonction helper pour récupérer le price_id d'un addon
CREATE OR REPLACE FUNCTION get_addon_stripe_price_id(p_addon_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_price_id text;
BEGIN
  SELECT stripe_price_id INTO v_price_id
  FROM addon_catalog
  WHERE addon_type = p_addon_type AND is_active = true;
  
  RETURN v_price_id;
END;
$$;
