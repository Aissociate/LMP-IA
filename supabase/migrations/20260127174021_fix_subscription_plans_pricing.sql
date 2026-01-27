/*
  # Correction des prix et nombre de mémoires des plans

  1. Corrections
    - Plan ARGENT : 3 mémoires → 2 mémoires
    - Plan OR : 10 mémoires → 5 mémoires et 549€ → 649€
  
  2. Détails
    - BRONZE reste inchangé : 199€ pour 1 mémoire
    - ARGENT : 349€ pour 2 mémoires (au lieu de 3)
    - OR : 649€ pour 5 mémoires (au lieu de 549€ pour 10)
    - TRIAL reste inchangé : gratuit avec 0 mémoire
*/

-- Mettre à jour le plan ARGENT : réduire de 3 à 2 mémoires
UPDATE subscription_plans
SET 
  monthly_memories_limit = 2,
  features = '[
    "Veille marchés illimitée",
    "IA illimitée",
    "GO/NO-GO illimité",
    "2 mémoires techniques / mois",
    "Export Word / PDF",
    "Support prioritaire"
  ]'::jsonb
WHERE name = 'ARGENT';

-- Mettre à jour le plan OR : réduire de 10 à 5 mémoires et augmenter le prix de 549€ à 649€
UPDATE subscription_plans
SET 
  monthly_memories_limit = 5,
  price_monthly = 649.00,
  features = '[
    "Veille marchés illimitée",
    "IA illimitée",
    "GO/NO-GO illimité",
    "5 mémoires techniques / mois",
    "Export Word / PDF",
    "Support VIP",
    "Accompagnement personnalisé"
  ]'::jsonb
WHERE name = 'OR';