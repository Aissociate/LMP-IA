/*
  # Correction du search_path pour la fonction update_memo_sections_updated_at
  
  1. Changement
    - Ajoute SET search_path = public pour éviter le search_path mutable
    - Garantit la sécurité et la stabilité de la fonction
*/

CREATE OR REPLACE FUNCTION update_memo_sections_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;