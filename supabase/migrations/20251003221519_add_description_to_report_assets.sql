/*
  # Ajouter une colonne description aux assets

  1. Modifications
    - Ajouter la colonne `ai_description` à `report_assets` pour stocker la description générée par l'IA
    
  2. Notes
    - Cette colonne permettra de stocker un contexte descriptif de l'image généré automatiquement par l'IA
    - La description sera utilisée comme contexte lors de l'utilisation de l'image dans les mémoires techniques
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'report_assets' AND column_name = 'ai_description'
  ) THEN
    ALTER TABLE report_assets ADD COLUMN ai_description text;
  END IF;
END $$;