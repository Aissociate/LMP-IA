/*
  # Nouveau système Freemium avec modèles IA

  1. Changements
    - Suppression de l'ancien système de crédits par mémoire
    - Nouveau système : Freemium illimité avec choix de modèle IA
    - Les crédits se dépensent uniquement pour les modèles renforcés
    - Consommation lors de l'édition d'une mémoire

  2. Nouveaux plans
    - Freemium : Accès illimité gratuit avec Grok 4 Fast
    - AI Memory (297€) : 1 crédit pour Gemini 2.5 Pro
    - Expert 4h (997€) : 4h accompagnement + Gemini 2.5 Pro
    - Expert 3 jours (2997€) : 3 jours accompagnement + Gemini 2.5 Pro
    - Pack Mixte : 5 unités à -20%

  3. Modèles disponibles
    - Modèle IA Basic : Modèle gratuit
    - Modèle IA Avancé : Modèle renforcé payant

  4. Sécurité
    - RLS activé sur toutes les tables
    - Politiques restrictives par défaut
*/

-- Supprimer les anciens plans
UPDATE subscription_plans
SET is_active = false
WHERE name NOT IN ('Admin');

-- Créer la table des modèles IA disponibles
CREATE TABLE IF NOT EXISTS ai_models (
  id text PRIMARY KEY,
  name text NOT NULL,
  display_name text NOT NULL,
  description text,
  is_free boolean DEFAULT false,
  credit_cost int DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active AI models"
  ON ai_models FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insérer les modèles IA
INSERT INTO ai_models (id, name, display_name, description, is_free, credit_cost, is_active)
VALUES
  ('basic-model', 'basic-model', 'Modèle IA Basic', 'Modèle gratuit pour un usage illimité', true, 0, true),
  ('advanced-model', 'advanced-model', 'Modèle IA Avancé', 'Modèle renforcé haute performance', false, 1, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  is_free = EXCLUDED.is_free,
  credit_cost = EXCLUDED.credit_cost,
  is_active = EXCLUDED.is_active;

-- Recréer la table des crédits pour les modèles renforcés
DROP TABLE IF EXISTS memory_credits CASCADE;

CREATE TABLE IF NOT EXISTS model_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining int NOT NULL DEFAULT 0,
  credits_used int NOT NULL DEFAULT 0,
  package_type text NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE model_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own model credits"
  ON model_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own model credits"
  ON model_credits FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ajouter une colonne pour tracker le modèle utilisé dans les mémoires techniques
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'technical_memories' AND column_name = 'ai_model_used'
  ) THEN
    ALTER TABLE technical_memories ADD COLUMN ai_model_used text DEFAULT 'basic-model';
  END IF;
END $$;

-- Mettre à jour les plans d'abonnement (prix en centimes)
INSERT INTO subscription_plans (id, name, price, technical_memories_limit, features, is_unlimited, is_active, monthly_tokens_limit)
VALUES
  ('freemium', 'Freemium', 0, 0,
   '["Accès illimité avec Modèle IA Basic", "Mémoires techniques illimitées", "Analyse de marchés", "Recherche BOAMP", "Bibliothèque de contextes"]'::jsonb,
   true, true, 999999),
  ('ai_memory', 'AI Memory', 29700, 0,
   '["1 crédit Modèle IA Avancé", "Modèle IA renforcé", "Toutes les fonctionnalités Freemium"]'::jsonb,
   false, true, 999999),
  ('expert_4h', 'Expert 4h', 99700, 0,
   '["1 crédit Modèle IA Avancé", "4 heures d''accompagnement expert", "Affinement de la réponse", "Support prioritaire"]'::jsonb,
   false, true, 999999),
  ('expert_3days', 'Expert 3 jours', 299700, 0,
   '["1 crédit Modèle IA Avancé", "3 jours d''intervention expert senior", "Accompagnement complet", "Support VIP dédié"]'::jsonb,
   false, true, 999999)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  technical_memories_limit = EXCLUDED.technical_memories_limit,
  features = EXCLUDED.features,
  is_unlimited = EXCLUDED.is_unlimited,
  is_active = EXCLUDED.is_active,
  monthly_tokens_limit = EXCLUDED.monthly_tokens_limit;

-- Supprimer la colonne free_sections_used qui n'est plus utilisée
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'free_sections_used'
  ) THEN
    ALTER TABLE user_subscriptions DROP COLUMN free_sections_used;
  END IF;
END $$;

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_model_credits_user_id ON model_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_technical_memories_ai_model ON technical_memories(ai_model_used);

-- Fonction pour consommer un crédit lors de l'édition d'une mémoire
CREATE OR REPLACE FUNCTION consume_model_credit(
  p_user_id uuid,
  p_model_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_model_is_free boolean;
  v_credit_record record;
BEGIN
  -- Vérifier si le modèle est gratuit
  SELECT is_free INTO v_model_is_free
  FROM ai_models
  WHERE id = p_model_id AND is_active = true;

  -- Si le modèle est gratuit, pas besoin de consommer de crédit
  IF v_model_is_free THEN
    RETURN true;
  END IF;

  -- Chercher un crédit disponible
  SELECT * INTO v_credit_record
  FROM model_credits
  WHERE user_id = p_user_id
    AND credits_remaining > 0
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY purchased_at ASC
  LIMIT 1
  FOR UPDATE;

  -- Si aucun crédit disponible
  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Consommer le crédit
  UPDATE model_credits
  SET credits_remaining = credits_remaining - 1,
      credits_used = credits_used + 1
  WHERE id = v_credit_record.id;

  RETURN true;
END;
$$;
