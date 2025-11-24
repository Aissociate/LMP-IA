/*
  # Mise à jour plan Freemium - Aucune mémoire technique

  1. Modifications
    - Plan Freemium: 0 mémoires techniques (accès bloqué)
    - Les utilisateurs Freemium doivent s'abonner pour générer des mémoires
    
  2. Objectif commercial
    - Forcer l'abonnement pour accéder à la génération de mémoires
    - Freemium = Découverte uniquement (recherche BOAMP, veille, etc.)
*/

-- Mettre à jour le plan Freemium pour bloquer les mémoires techniques
UPDATE subscription_plans
SET 
  technical_memories_limit = 0,
  features = jsonb_build_array(
    'Recherche BOAMP illimitée',
    'Veille marchés',
    'Assistant IA basique',
    'Favoris et organisation',
    '❌ Pas de génération de mémoires techniques'
  )
WHERE id = 'freemium_unlimited';
