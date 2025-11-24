/*
  # Ajout de la colonne extracted_content

  1. Modifications
    - Ajout de la colonne `extracted_content` de type TEXT dans la table `market_documents`
    - Cette colonne stockera le contenu textuel extrait des fichiers
    - Permet d'éviter les problèmes de storage et d'accès aux fichiers

  2. Avantages
    - Plus de dépendance au storage de fichiers
    - Accès direct au contenu pour l'analyse IA
    - Performance améliorée
    - Robustesse maximale
*/

-- Ajout de la colonne pour stocker le contenu textuel extrait
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'market_documents' AND column_name = 'extracted_content'
  ) THEN
    ALTER TABLE market_documents ADD COLUMN extracted_content TEXT;
  END IF;
END $$;