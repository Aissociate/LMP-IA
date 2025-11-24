/*
  # Ajout des fonctions helper pour la gestion des addons

  1. Nouvelles fonctions
    - increment_extra_memories: Incrémente le nombre de mémoires supplémentaires achetées
    - get_active_addons: Récupère les addons actifs pour un utilisateur
    
  2. Modifications
    - Amélioration de la gestion des addons dans monthly_memory_usage
*/

-- Fonction pour incrémenter les extra memories
CREATE OR REPLACE FUNCTION increment_extra_memories(
  p_user_id uuid,
  p_month_year text,
  p_quantity integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Vérifier que monthly_memory_usage existe pour ce mois
  IF NOT EXISTS (
    SELECT 1 FROM monthly_memory_usage
    WHERE user_id = p_user_id AND month_year = p_month_year
  ) THEN
    -- Initialiser si nécessaire
    INSERT INTO monthly_memory_usage (
      user_id,
      month_year,
      memories_included,
      memories_used,
      extra_memories_purchased,
      market_pro_enabled
    )
    SELECT
      p_user_id,
      p_month_year,
      COALESCE(sp.technical_memories_limit, 0),
      0,
      0,
      false
    FROM user_subscriptions us
    LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = p_user_id;
  END IF;

  -- Incrémenter les extra memories
  UPDATE monthly_memory_usage
  SET 
    extra_memories_purchased = extra_memories_purchased + p_quantity,
    updated_at = now()
  WHERE user_id = p_user_id AND month_year = p_month_year;

  RETURN true;
END;
$$;

-- Fonction pour récupérer les addons actifs d'un utilisateur
CREATE OR REPLACE FUNCTION get_active_addons(p_user_id uuid)
RETURNS TABLE (
  addon_type text,
  addon_name text,
  price_cents integer,
  is_recurring boolean,
  quantity integer,
  status text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.addon_type,
    sa.addon_name,
    sa.price_cents,
    sa.is_recurring,
    sa.quantity,
    sa.status,
    sa.created_at
  FROM subscription_addons sa
  WHERE sa.user_id = p_user_id
    AND sa.status = 'active'
  ORDER BY sa.created_at DESC;
END;
$$;

-- Fonction pour vérifier si un utilisateur a un addon spécifique actif
CREATE OR REPLACE FUNCTION has_active_addon(p_user_id uuid, p_addon_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_addon boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM subscription_addons
    WHERE user_id = p_user_id
      AND addon_type = p_addon_type
      AND status = 'active'
  ) INTO v_has_addon;

  RETURN v_has_addon;
END;
$$;

-- Ajouter un index pour améliorer les performances des requêtes d'addons
CREATE INDEX IF NOT EXISTS idx_subscription_addons_user_status 
  ON subscription_addons(user_id, status) 
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_subscription_addons_user_type 
  ON subscription_addons(user_id, addon_type, status);
