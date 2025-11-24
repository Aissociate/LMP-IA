/*
  # Fix Security Issues - Part 6: Fix Functions with Mutable Search Path

  1. Drop and recreate functions with proper security settings
  2. Add SECURITY DEFINER and SET search_path to prevent attacks
*/

-- =====================================================
-- update_updated_at_column
-- =====================================================

DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- update_feature_comments_updated_at
-- =====================================================

DROP FUNCTION IF EXISTS public.update_feature_comments_updated_at() CASCADE;

CREATE FUNCTION public.update_feature_comments_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- update_feature_requests_updated_at
-- =====================================================

DROP FUNCTION IF EXISTS public.update_feature_requests_updated_at() CASCADE;

CREATE FUNCTION public.update_feature_requests_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- update_memo_sections_updated_at
-- =====================================================

DROP FUNCTION IF EXISTS public.update_memo_sections_updated_at() CASCADE;

CREATE FUNCTION public.update_memo_sections_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- update_bpu_items_updated_at
-- =====================================================

DROP FUNCTION IF EXISTS public.update_bpu_items_updated_at() CASCADE;

CREATE FUNCTION public.update_bpu_items_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =====================================================
-- is_user_admin
-- =====================================================

DROP FUNCTION IF EXISTS public.is_user_admin(uuid) CASCADE;

CREATE FUNCTION public.is_user_admin(user_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Check if user is in admin list from admin_settings
  SELECT EXISTS (
    SELECT 1
    FROM admin_settings
    WHERE setting_key = 'admin_users'
    AND setting_value e user_id_param::text
  ) INTO is_admin;
  
  RETURN COALESCE(is_admin, false);
END;
$$;

-- =====================================================
-- is_bootstrap_admin
-- =====================================================

DROP FUNCTION IF EXISTS public.is_bootstrap_admin() CASCADE;

CREATE FUNCTION public.is_bootstrap_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  admin_count integer;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM admin_settings
  WHERE setting_key = 'admin_users';
  
  RETURN admin_count = 0;
END;
$$;

-- =====================================================
-- delete_knowledge_chunks_for_document
-- =====================================================

DROP FUNCTION IF EXISTS public.delete_knowledge_chunks_for_document(uuid) CASCADE;

CREATE FUNCTION public.delete_knowledge_chunks_for_document(doc_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM knowledge_chunks
  WHERE document_id = doc_id;
END;
$$;

-- =====================================================
-- match_knowledge_chunks
-- =====================================================

DROP FUNCTION IF EXISTS public.match_knowledge_chunks(vector(1536), float, int) CASCADE;

CREATE FUNCTION public.match_knowledge_chunks(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.document_id,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  FROM knowledge_chunks kc
  WHERE 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;