/*
  # Fix Security Issues - Part 6: Fix Function Search Paths

  1. Fixes Function Search Paths
    - Updates trigger functions to have immutable search_path
    - Prevents search_path manipulation attacks
    - Functions affected:
      - update_lead_captures_updated_at
      - update_invoices_updated_at

  2. Security Impact
    - Prevents potential privilege escalation through search_path manipulation
    - Ensures functions execute with predictable behavior
*/

-- Recreate update_lead_captures_updated_at with fixed search_path
CREATE OR REPLACE FUNCTION public.update_lead_captures_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate update_invoices_updated_at with fixed search_path
CREATE OR REPLACE FUNCTION public.update_invoices_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;