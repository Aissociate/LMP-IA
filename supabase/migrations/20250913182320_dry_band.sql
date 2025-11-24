/*
  # Ajouter le prompt global de mémoire technique

  1. Nouvelle colonne
    - `global_memory_prompt` dans la table `markets`
    - Permet de stocker le prompt général pour chaque marché
    - Utilisé lors de la génération automatique de toutes les sections

  2. Sécurité
    - Les utilisateurs peuvent modifier le prompt de leurs propres marchés
    - Cohérent avec les politiques RLS existantes
*/

-- Ajouter la colonne pour le prompt global
ALTER TABLE markets 
ADD COLUMN IF NOT EXISTS global_memory_prompt text DEFAULT '';

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN markets.global_memory_prompt IS 'Prompt général utilisé pour la génération automatique de toutes les sections du mémoire technique';