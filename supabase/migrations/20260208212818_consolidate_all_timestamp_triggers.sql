/*
  # Consolidate all duplicate timestamp trigger functions

  ## Problem
  - 9 separate functions all doing `NEW.updated_at = now()` with different names
  - Inconsistent SECURITY DEFINER and search_path settings
  - Maintenance burden from duplicated code

  ## Solution
  - Create single canonical function `set_updated_at()`
  - Re-point all 12 triggers to use this single function
  - Drop all 10 redundant functions

  ## Affected triggers:
    - candidatures, collectivities, company_profiles, invoices,
      lead_captures, manual_markets, manual_markets_session_progress,
      manual_markets_sessions, memo_sections, public_markets,
      referencing_requests, user_notification_preferences
*/

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_candidatures_updated_at ON candidatures;
CREATE TRIGGER set_candidatures_updated_at
  BEFORE UPDATE ON candidatures FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS update_collectivities_updated_at ON collectivities;
CREATE TRIGGER update_collectivities_updated_at
  BEFORE UPDATE ON collectivities FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS update_company_profiles_updated_at ON company_profiles;
CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_update_invoices_updated_at ON invoices;
CREATE TRIGGER trigger_update_invoices_updated_at
  BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS update_lead_captures_updated_at_trigger ON lead_captures;
CREATE TRIGGER update_lead_captures_updated_at_trigger
  BEFORE UPDATE ON lead_captures FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_manual_markets_updated_at ON manual_markets;
CREATE TRIGGER set_manual_markets_updated_at
  BEFORE UPDATE ON manual_markets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_progress_updated_at ON manual_markets_session_progress;
CREATE TRIGGER set_progress_updated_at
  BEFORE UPDATE ON manual_markets_session_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_sessions_updated_at ON manual_markets_sessions;
CREATE TRIGGER set_sessions_updated_at
  BEFORE UPDATE ON manual_markets_sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS update_memo_sections_timestamp ON memo_sections;
CREATE TRIGGER update_memo_sections_timestamp
  BEFORE UPDATE ON memo_sections FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS update_public_markets_timestamp ON public_markets;
CREATE TRIGGER update_public_markets_timestamp
  BEFORE UPDATE ON public_markets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS update_referencing_requests_updated_at ON referencing_requests;
CREATE TRIGGER update_referencing_requests_updated_at
  BEFORE UPDATE ON referencing_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS update_user_notification_preferences_updated_at ON user_notification_preferences;
CREATE TRIGGER update_user_notification_preferences_updated_at
  BEFORE UPDATE ON user_notification_preferences FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP FUNCTION IF EXISTS update_candidatures_updated_at();
DROP FUNCTION IF EXISTS update_company_profile_updated_at();
DROP FUNCTION IF EXISTS update_invoices_updated_at();
DROP FUNCTION IF EXISTS update_lead_captures_updated_at();
DROP FUNCTION IF EXISTS update_manual_markets_sessions_updated_at();
DROP FUNCTION IF EXISTS update_manual_markets_updated_at();
DROP FUNCTION IF EXISTS update_memo_sections_updated_at();
DROP FUNCTION IF EXISTS update_session_progress_updated_at();
DROP FUNCTION IF EXISTS trigger_update_timestamp();
DROP FUNCTION IF EXISTS update_updated_at_column();
