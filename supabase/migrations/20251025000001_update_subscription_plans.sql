/*
  # Update subscription plans - Remove Freemium, Update pricing

  1. Changes
    - Remove freemium plan (all access is now paid)
    - Update Basic plan: price 297€, 1 memory per month
    - Update Pro plan: price 997€, 5 memories per month
    - Remove Expert and Unlimited plans

  2. Notes
    - Admin plan remains unchanged for system administrators
    - Existing users on old plans should be migrated manually if needed
*/

-- Update existing plans with new pricing
UPDATE public.subscription_plans
SET
  price = 297.00,
  technical_memories_limit = 1,
  features = '["1 mémoire technique par mois", "Analyses de documents illimitées", "Agent de sourcing illimité", "Support email standard", "Statistiques de base"]'::jsonb,
  is_unlimited = false,
  updated_at = now()
WHERE id = 'basic';

UPDATE public.subscription_plans
SET
  price = 997.00,
  technical_memories_limit = 5,
  features = '["5 mémoires techniques par mois", "Analyses de documents illimitées", "Agent de sourcing illimité", "Support prioritaire", "Statistiques avancées", "Accès anticipé aux nouvelles fonctionnalités", "Formation personnalisée"]'::jsonb,
  is_unlimited = false,
  updated_at = now()
WHERE id = 'pro';

-- Disable freemium, expert and unlimited plans
UPDATE public.subscription_plans
SET
  is_active = false,
  updated_at = now()
WHERE id IN ('freemium', 'expert', 'unlimited');
