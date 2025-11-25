/*
  # Ajout des colonnes pour le contexte Market Sentinel
  
  1. Colonnes ajoutées à user_profiles
    - company_name (text) - Nom de l'entreprise
    - activity_sectors (text[]) - Secteurs d'activité
    - expertise_areas (text[]) - Domaines d'expertise
    - geographical_zones (text[]) - Zones géographiques
    
  2. Colonnes ajoutées à knowledge_files
    - extracted_content (text) - Contenu extrait du fichier
    - extraction_status (text) - Statut de l'extraction (pending, processing, completed, error)
    - extraction_error (text) - Erreur d'extraction si applicable
*/

-- Ajouter colonnes à user_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN company_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'activity_sectors'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN activity_sectors text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'expertise_areas'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN expertise_areas text[] DEFAULT '{}';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'geographical_zones'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN geographical_zones text[] DEFAULT '{}';
  END IF;
END $$;

-- Ajouter colonnes à knowledge_files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_files' AND column_name = 'extracted_content'
  ) THEN
    ALTER TABLE knowledge_files ADD COLUMN extracted_content text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_files' AND column_name = 'extraction_status'
  ) THEN
    ALTER TABLE knowledge_files ADD COLUMN extraction_status text DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'error'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'knowledge_files' AND column_name = 'extraction_error'
  ) THEN
    ALTER TABLE knowledge_files ADD COLUMN extraction_error text;
  END IF;
END $$;

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_knowledge_files_extraction_status 
  ON knowledge_files(extraction_status) 
  WHERE extraction_status = 'completed';