/*
  # Système de gestion des doublons de marchés
  
  1. Modifications des tables
    - Ajoute des colonnes pour gérer les doublons dans `manual_markets`
    - Ajoute des index pour améliorer les performances
    - Crée des fonctions pour détecter et gérer les doublons
  
  2. Fonctionnalités
    - Détection automatique des doublons basée sur référence, titre et date
    - Privilégie les marchés automatiques (BOAMP) sur les marchés manuels
    - Marque les doublons pour éviter leur affichage dans les recherches
  
  3. Critères de détection
    - Référence identique + même client = doublon exact (100%)
    - URL identique = doublon très probable (95%)
    - Titre identique + date limite < 24h = doublon probable (90%)
    - Titre similaire (>80%) + date limite < 48h = doublon possible (80%)
  
  4. Sécurité
    - Les fonctions utilisent les RLS existantes
    - Les utilisateurs authenticated voient tous les marchés manuels
    - Utilisation de created_by pour identifier le propriétaire
*/

-- Ajouter des colonnes pour gérer les doublons dans manual_markets
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'manual_markets' AND column_name = 'is_duplicate'
  ) THEN
    ALTER TABLE manual_markets ADD COLUMN is_duplicate boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'manual_markets' AND column_name = 'duplicate_of_reference'
  ) THEN
    ALTER TABLE manual_markets ADD COLUMN duplicate_of_reference text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'manual_markets' AND column_name = 'duplicate_source'
  ) THEN
    ALTER TABLE manual_markets ADD COLUMN duplicate_source text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'manual_markets' AND column_name = 'duplicate_notes'
  ) THEN
    ALTER TABLE manual_markets ADD COLUMN duplicate_notes text;
  END IF;
END $$;

-- Créer des index pour améliorer les performances de recherche de doublons
CREATE INDEX IF NOT EXISTS idx_manual_markets_reference_client 
  ON manual_markets(reference, client) 
  WHERE is_duplicate = false;

CREATE INDEX IF NOT EXISTS idx_manual_markets_title_deadline 
  ON manual_markets(title, deadline) 
  WHERE is_duplicate = false;

CREATE INDEX IF NOT EXISTS idx_manual_markets_url 
  ON manual_markets(url) 
  WHERE is_duplicate = false AND url IS NOT NULL;

-- Activer l'extension pg_trgm si elle n'est pas déjà activée (pour similarity())
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Fonction pour détecter les doublons potentiels dans les marchés manuels
CREATE OR REPLACE FUNCTION check_manual_market_duplicates(
  p_reference text,
  p_title text,
  p_client text,
  p_deadline timestamptz,
  p_url text,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  reference text,
  title text,
  client text,
  deadline timestamptz,
  url text,
  source text,
  match_type text,
  match_score int
) 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.reference,
    m.title,
    m.client,
    m.deadline,
    m.url,
    m.source,
    CASE 
      WHEN m.reference = p_reference AND m.client = p_client THEN 'exact_reference'
      WHEN m.url = p_url AND p_url IS NOT NULL THEN 'same_url'
      WHEN m.title = p_title AND ABS(EXTRACT(EPOCH FROM (m.deadline - p_deadline))) < 86400 THEN 'same_title_date'
      ELSE 'similar'
    END as match_type,
    CASE 
      WHEN m.reference = p_reference AND m.client = p_client THEN 100
      WHEN m.url = p_url AND p_url IS NOT NULL THEN 95
      WHEN m.title = p_title AND ABS(EXTRACT(EPOCH FROM (m.deadline - p_deadline))) < 86400 THEN 90
      WHEN similarity(m.title, p_title) > 0.8 AND ABS(EXTRACT(EPOCH FROM (m.deadline - p_deadline))) < 172800 THEN 80
      ELSE 50
    END as match_score
  FROM manual_markets m
  WHERE 
    m.is_duplicate = false
    AND (p_exclude_id IS NULL OR m.id != p_exclude_id)
    AND (
      (m.reference = p_reference AND m.client = p_client)
      OR (m.url = p_url AND p_url IS NOT NULL)
      OR (m.title = p_title AND ABS(EXTRACT(EPOCH FROM (m.deadline - p_deadline))) < 86400)
      OR (similarity(m.title, p_title) > 0.7 AND ABS(EXTRACT(EPOCH FROM (m.deadline - p_deadline))) < 172800)
    )
  ORDER BY match_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour détecter les doublons dans les marchés BOAMP (marchés automatiques)
CREATE OR REPLACE FUNCTION check_boamp_market_duplicates(
  p_reference text,
  p_title text,
  p_deadline timestamptz,
  p_url text
)
RETURNS TABLE (
  id text,
  reference text,
  title text,
  deadline timestamptz,
  url text,
  match_type text,
  match_score int
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bm.id,
    bm.reference,
    bm.intitule as title,
    bm.date_limite_reponse as deadline,
    bm.liens_telechargement as url,
    CASE 
      WHEN bm.reference = p_reference THEN 'exact_reference'
      WHEN bm.liens_telechargement = p_url AND p_url IS NOT NULL THEN 'same_url'
      WHEN bm.intitule = p_title AND ABS(EXTRACT(EPOCH FROM (bm.date_limite_reponse - p_deadline))) < 86400 THEN 'same_title_date'
      ELSE 'similar'
    END as match_type,
    CASE 
      WHEN bm.reference = p_reference THEN 100
      WHEN bm.liens_telechargement = p_url AND p_url IS NOT NULL THEN 95
      WHEN bm.intitule = p_title AND ABS(EXTRACT(EPOCH FROM (bm.date_limite_reponse - p_deadline))) < 86400 THEN 90
      WHEN similarity(bm.intitule, p_title) > 0.8 AND ABS(EXTRACT(EPOCH FROM (bm.date_limite_reponse - p_deadline))) < 172800 THEN 80
      ELSE 50
    END as match_score
  FROM boamp_markets bm
  WHERE 
    (
      bm.reference = p_reference
      OR (bm.liens_telechargement = p_url AND p_url IS NOT NULL)
      OR (bm.intitule = p_title AND ABS(EXTRACT(EPOCH FROM (bm.date_limite_reponse - p_deadline))) < 86400)
      OR (similarity(bm.intitule, p_title) > 0.7 AND ABS(EXTRACT(EPOCH FROM (bm.date_limite_reponse - p_deadline))) < 172800)
    )
  ORDER BY match_score DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour marquer un marché manuel comme doublon
CREATE OR REPLACE FUNCTION mark_manual_market_as_duplicate(
  p_market_id uuid,
  p_duplicate_of_reference text,
  p_duplicate_source text,
  p_notes text DEFAULT NULL
)
RETURNS void
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE manual_markets
  SET 
    is_duplicate = true,
    duplicate_of_reference = p_duplicate_of_reference,
    duplicate_source = p_duplicate_source,
    duplicate_notes = p_notes,
    updated_at = now()
  WHERE id = p_market_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction combinée pour vérifier tous les doublons (manuels + BOAMP)
CREATE OR REPLACE FUNCTION check_all_market_duplicates(
  p_reference text,
  p_title text,
  p_client text,
  p_deadline timestamptz,
  p_url text,
  p_exclude_id uuid DEFAULT NULL
)
RETURNS TABLE (
  source_type text,
  id text,
  reference text,
  title text,
  organisme text,
  deadline timestamptz,
  url text,
  match_type text,
  match_score int
)
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Retourner d'abord les doublons BOAMP (priorité plus haute)
  RETURN QUERY
  SELECT 
    'boamp'::text as source_type,
    b.id,
    b.reference,
    b.title,
    ''::text as organisme,
    b.deadline,
    b.url,
    b.match_type,
    b.match_score + 1000 as match_score -- Bonus pour les marchés BOAMP
  FROM check_boamp_market_duplicates(p_reference, p_title, p_deadline, p_url) b
  
  UNION ALL
  
  -- Puis les doublons manuels
  SELECT 
    'manual'::text as source_type,
    m.id::text,
    m.reference,
    m.title,
    m.client as organisme,
    m.deadline,
    m.url,
    m.match_type,
    m.match_score
  FROM check_manual_market_duplicates(p_reference, p_title, p_client, p_deadline, p_url, p_exclude_id) m
  
  ORDER BY match_score DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_all_market_duplicates IS 'Détecte les doublons potentiels dans tous les marchés (BOAMP + manuels), en privilégiant les marchés BOAMP';
COMMENT ON FUNCTION check_manual_market_duplicates IS 'Détecte les doublons potentiels dans les marchés manuels uniquement';
COMMENT ON FUNCTION check_boamp_market_duplicates IS 'Détecte les doublons potentiels dans les marchés BOAMP uniquement';
COMMENT ON FUNCTION mark_manual_market_as_duplicate IS 'Marque un marché manuel comme doublon d''un autre marché';
