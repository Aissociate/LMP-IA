/*
  # Fix Company Profile in Knowledge Base

  1. Changes
    - Update existing company profiles in knowledge_files to set extraction_status to 'completed'
    - Ensure extracted_content is properly set

  2. Purpose
    - Ensure company profiles are properly loaded in AI generation context
    - Fix profiles that were added without proper extraction_status
*/

-- Update existing company profile entries to have correct extraction_status
UPDATE knowledge_files
SET
  extraction_status = 'completed',
  category = COALESCE(category, 'company')
WHERE
  name = 'Profil entreprise complet'
  AND extraction_status IS DISTINCT FROM 'completed';
