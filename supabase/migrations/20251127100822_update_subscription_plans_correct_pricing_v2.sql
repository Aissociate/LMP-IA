/*
  # Mettre à jour les prix des plans d'abonnement

  ## Changements
  
  Met à jour les prix des plans pour correspondre au modèle commercial réel :
  - SOLO : 1 mémoire/mois → 199€ HT
  - PME : 2 mémoires/mois → 349€ HT
  - PROJETEUR : 5 mémoires/mois → 849€ HT
  
  Remplace les anciens plans (Starter, Pro, Premium) par les nouveaux.
*/

-- Désactiver les anciens plans
UPDATE subscription_plans 
SET is_active = false
WHERE name IN ('Starter', 'Pro', 'Premium');

-- Supprimer les anciens plans s'ils existent pour éviter les conflits
DELETE FROM subscription_plans 
WHERE name IN ('SOLO', 'PME', 'PROJETEUR');

-- Insérer les nouveaux plans avec les bons prix
INSERT INTO subscription_plans (
  name,
  stripe_price_id,
  monthly_memories_limit,
  price_monthly,
  features,
  is_active
) VALUES
  (
    'SOLO',
    'price_solo_prod_id',
    1,
    199.00,
    '[
      "1 Marché / Mois",
      "Veille marchés incluse",
      "Score GO/NO-GO",
      "Assistant IA Marchés & BPU",
      "1 mémoire Market Light / mois",
      "Espace client & historique",
      "Formations vidéo",
      "Export Word / PDF"
    ]'::jsonb,
    true
  ),
  (
    'PME',
    'price_pme_prod_id',
    2,
    349.00,
    '[
      "2 Marchés / Mois",
      "Veille marchés incluse",
      "GO/NO-GO illimité",
      "Assistant IA Marchés & BPU",
      "2 mémoires Market Light / mois",
      "Espace client complet",
      "Priorité de génération vs SOLO",
      "1 point de contact trimestriel"
    ]'::jsonb,
    true
  ),
  (
    'PROJETEUR',
    'price_projeteur_prod_id',
    5,
    849.00,
    '[
      "5 Marchés / Mois",
      "Veille marchés incluse",
      "GO/NO-GO illimité",
      "Assistant IA illimité",
      "5 mémoires Market Light / mois",
      "Historique détaillé",
      "Priorité maximale",
      "1 point de suivi mensuel"
    ]'::jsonb,
    true
  );
