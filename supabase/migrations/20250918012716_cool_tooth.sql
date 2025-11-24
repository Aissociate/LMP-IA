/*
  # Ajouter les colonnes tokens à user_subscriptions

  1. Nouvelles colonnes
    - `monthly_tokens_used` (integer, default 0) - Nombre de tokens utilisés ce mois
    - `monthly_tokens_limit` (integer, default 50000) - Limite mensuelle de tokens

  2. Sécurité
    - Utilisation de DO blocks pour vérifier l'existence des colonnes
    - Valeurs par défaut appropriées
*/

DO $$
BEGIN
  -- Ajouter monthly_tokens_used si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'monthly_tokens_used'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN monthly_tokens_used integer DEFAULT 0 NOT NULL;
  END IF;

  -- Ajouter monthly_tokens_limit si elle n'existe pas  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_subscriptions' AND column_name = 'monthly_tokens_limit'
  ) THEN
    ALTER TABLE user_subscriptions ADD COLUMN monthly_tokens_limit integer DEFAULT 50000 NOT NULL;
  END IF;
END $$;