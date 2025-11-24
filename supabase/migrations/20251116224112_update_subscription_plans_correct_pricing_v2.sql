/*
  # Mise à jour des plans d'abonnement - Prix et détails corrects

  1. Plans mis à jour
    - SOLO: 199€/mois - 1 mémoire/mois
    - PME: 349€/mois - 2 mémoires/mois (recommandé)
    - PROJETEUR: 849€/mois - 5 mémoires/mois
    
  2. Création du catalogue des addons disponibles
    - Market Pro: +99€/mois (upgrade modèle IA)
    - Mémoire supplémentaire: 299€/unité
    - Booster Expert 4h: 590€/mémoire
    - Booster Expert Senior 3j: 2490€/marché
*/

-- Ajouter colonne description si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' AND column_name = 'description'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN description text;
  END IF;
END $$;

-- Ajouter colonne is_recommended si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' AND column_name = 'is_recommended'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN is_recommended boolean DEFAULT false;
  END IF;
END $$;

-- Mettre à jour le plan SOLO
UPDATE subscription_plans
SET 
  price = 199,
  technical_memories_limit = 1,
  features = jsonb_build_array(
    '1 mémoire IA Market Light / mois',
    'Veille marchés incluse',
    'Score GO/NO-GO sur marchés détectés',
    'Assistant IA Marchés & BPU',
    'Export Word / PDF',
    'Espace client & historique',
    'Formations vidéo'
  ),
  description = 'Pour les structures qui se lancent ou répondent ponctuellement',
  is_recommended = false
WHERE id = 'solo';

-- Mettre à jour le plan PME (recommandé)
UPDATE subscription_plans
SET 
  price = 349,
  technical_memories_limit = 2,
  features = jsonb_build_array(
    '2 mémoires IA Market Light / mois',
    'Veille marchés incluse',
    'GO/NO-GO sur tous les marchés',
    'Assistant IA Marchés & BPU',
    'Priorité de génération vs SOLO',
    '1 point de contact trimestriel',
    'Export Word / PDF',
    'Espace client & historique complet'
  ),
  description = 'Pour les PME qui répondent régulièrement aux marchés publics',
  is_recommended = true
WHERE id = 'pme';

-- Mettre à jour le plan PROJETEUR
UPDATE subscription_plans
SET 
  price = 849,
  technical_memories_limit = 5,
  features = jsonb_build_array(
    '5 mémoires IA Market Light / mois',
    'Veille marchés incluse',
    'GO/NO-GO sur tous les marchés',
    'Assistant IA Marchés & BPU illimité',
    'Priorité maximale sur la génération',
    '1 point de suivi mensuel (mail/visio)',
    'Export Word / PDF',
    'Espace client & historique détaillé'
  ),
  description = 'Pour les structures qui vivent des marchés publics',
  is_recommended = false
WHERE id = 'projeteur';

-- Créer une table pour le catalogue des addons disponibles
CREATE TABLE IF NOT EXISTS addon_catalog (
  addon_type text PRIMARY KEY,
  addon_name text NOT NULL,
  description text NOT NULL,
  price_cents integer NOT NULL,
  is_recurring boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE addon_catalog ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire le catalogue
CREATE POLICY "Anyone can view addon catalog"
  ON addon_catalog FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insérer le catalogue des addons
INSERT INTO addon_catalog (addon_type, addon_name, description, price_cents, is_recurring)
VALUES
  (
    'market_pro',
    'Market Pro',
    'Upgrade vers Gemini 2.5 Pro avec 1M tokens de contexte pour toutes vos mémoires du mois',
    9900,
    true
  ),
  (
    'extra_memory',
    'Mémoire supplémentaire',
    'Ajoutez une mémoire IA Market Light supplémentaire à votre forfait mensuel',
    29900,
    false
  ),
  (
    'booster_expert_4h',
    'Booster Expert 4h',
    'Expert dédié 4h pour relecture approfondie, renforcement des arguments et alignement avec la grille de notation',
    59000,
    false
  ),
  (
    'booster_expert_3d',
    'Booster Expert Senior 3 jours',
    'Expert dédié 3 jours sur votre marché stratégique avec aller-retours illimités et optimisation complète',
    249000,
    false
  )
ON CONFLICT (addon_type) 
DO UPDATE SET
  addon_name = EXCLUDED.addon_name,
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  is_recurring = EXCLUDED.is_recurring,
  updated_at = now();
