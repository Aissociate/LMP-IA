/*
  # Nouveau système d'abonnement basé sur les crédits

  1. Modifications
    - Mise à jour des plans d'abonnement avec 3 niveaux + freemium
    - Ajout d'une table pour gérer les crédits mémoire
    - Ajout d'une table pour les demandes d'upsell
    
  2. Nouveaux plans
    - Freemium : 4 premières sections gratuites
    - AI Memory (297€) : 1 crédit mémoire (génération complète)
    - Expert Package (997€) : 1 crédit mémoire + 4h d'accompagnement expert
    - Senior Expert (2997€) : 1 crédit mémoire + 3 jours d'intervention expert senior
    
  3. Sécurité
    - RLS activé sur toutes les nouvelles tables
    - Politiques restrictives par défaut
*/

-- Mettre à jour les plans d'abonnement existants
UPDATE subscription_plans
SET is_active = false
WHERE name IN ('free', 'premium', 'enterprise');

-- Insérer les nouveaux plans (prix en centimes)
INSERT INTO subscription_plans (id, name, price, technical_memories_limit, features, is_unlimited, is_active, monthly_tokens_limit)
VALUES
  ('freemium', 'Freemium', 0, 0, 
   '["4 premières sections gratuites", "Accès recherche marchés", "Bibliothèque de contextes"]'::jsonb,
   false, true, 999999),
  ('ai_memory', 'AI Memory', 29700, 0,
   '["1 mémoire technique complète générée par IA", "Toutes les fonctionnalités freemium"]'::jsonb,
   false, true, 999999),
  ('expert_package', 'Expert Package', 99700, 0,
   '["1 mémoire technique complète générée par IA", "4 heures d''accompagnement expert", "Affinement de la réponse", "Support prioritaire"]'::jsonb,
   false, true, 999999),
  ('senior_expert', 'Senior Expert', 299700, 0,
   '["1 mémoire technique complète générée par IA", "3 jours d''intervention expert senior", "Accompagnement complet", "Support VIP"]'::jsonb,
   false, true, 999999)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  technical_memories_limit = EXCLUDED.technical_memories_limit,
  features = EXCLUDED.features,
  is_unlimited = EXCLUDED.is_unlimited,
  is_active = EXCLUDED.is_active,
  monthly_tokens_limit = EXCLUDED.monthly_tokens_limit;

-- Table pour gérer les crédits mémoire
CREATE TABLE IF NOT EXISTS memory_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining int NOT NULL DEFAULT 0,
  credits_used int NOT NULL DEFAULT 0,
  plan_type text NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE memory_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON memory_credits FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
  ON memory_credits FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Table pour les demandes d'upsell
CREATE TABLE IF NOT EXISTS upsell_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  requested_plan text NOT NULL,
  current_plan text NOT NULL,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  processed_at timestamptz
);

ALTER TABLE upsell_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own upsell requests"
  ON upsell_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create upsell requests"
  ON upsell_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Ajouter une colonne pour tracker le nombre de sections gratuites utilisées
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'free_sections_used'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN free_sections_used int DEFAULT 0;
  END IF;
END $$;

-- Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_memory_credits_user_id ON memory_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_upsell_requests_user_id ON upsell_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_upsell_requests_status ON upsell_requests(status);
