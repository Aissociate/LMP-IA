/*
  # Fix Security Issues - Part 5: Fix Function Search Paths

  Set explicit search_path for all functions to prevent security vulnerabilities.
*/

ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;
ALTER FUNCTION public.remove_accents(text) SET search_path = public, pg_temp;
ALTER FUNCTION public.update_candidatures_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_manual_market_reference() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_manual_markets_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.generate_market_slug(text, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.trigger_generate_market_slug() SET search_path = public, pg_temp;
ALTER FUNCTION public.trigger_update_timestamp() SET search_path = public, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;
