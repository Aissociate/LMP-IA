/*
  # Fix Function Search Path Issues

  1. Problem
    - Multiple functions have role mutable search_path
    - This is a security risk as it can lead to search path attacks
    
  2. Solution
    - Set explicit search_path for each function to 'public, pg_catalog'
    - This prevents search path injection attacks
    
  3. Functions Affected
    - update_company_profile_updated_at
    - update_session_stats
    - update_manual_markets_sessions_updated_at
    - update_session_progress_updated_at
*/

-- ============================================
-- UPDATE COMPANY PROFILE UPDATED AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_company_profile_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_catalog
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ============================================
-- UPDATE SESSION STATS
-- ============================================

CREATE OR REPLACE FUNCTION public.update_session_stats()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_catalog
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_donneurs INTEGER;
  v_completed_donneurs INTEGER;
BEGIN
  SELECT COUNT(DISTINCT donneur_ordre_id)
  INTO v_total_donneurs
  FROM public.manual_markets_session_progress
  WHERE session_id = NEW.session_id;

  SELECT COUNT(DISTINCT donneur_ordre_id)
  INTO v_completed_donneurs
  FROM public.manual_markets_session_progress
  WHERE session_id = NEW.session_id
  AND is_completed = true;

  UPDATE public.manual_markets_sessions
  SET
    total_donneurs_ordre = v_total_donneurs,
    completed_donneurs_ordre = v_completed_donneurs,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.session_id;

  RETURN NEW;
END;
$$;

-- ============================================
-- UPDATE MANUAL MARKETS SESSIONS UPDATED AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_manual_markets_sessions_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_catalog
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

-- ============================================
-- UPDATE SESSION PROGRESS UPDATED AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_session_progress_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, pg_catalog
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;