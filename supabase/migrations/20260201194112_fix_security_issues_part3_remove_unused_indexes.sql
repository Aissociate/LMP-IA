/*
  # Fix Security Issues - Part 3: Remove Unused Indexes

  1. Removes Unused Indexes
    - Drops indexes that are not being used by queries
    - Improves write performance and reduces storage
    - Tables affected:
      - saved_searches
      - search_alerts
      - bpu_items
      - fiche_valeur
      - manual_markets
      - market_search_history
      - referencing_requests
      - report_assets
      - feature_requests
      - feature_votes
      - public_markets
      - market_sentinel_stats
      - bug_reports
      - email_digest_queue
      - email_digest_history
      - market_alert_detections
      - memo_sections
      - invoices
      - lead_captures

  2. Security Impact
    - Reduces database bloat and improves write performance
    - Frees up resources that can be used for actual queries
*/

-- saved_searches
DROP INDEX IF EXISTS public.idx_saved_searches_user_id;

-- search_alerts
DROP INDEX IF EXISTS public.idx_search_alerts_saved_search_id;
DROP INDEX IF EXISTS public.idx_search_alerts_user_id;

-- bpu_items
DROP INDEX IF EXISTS public.idx_bpu_items_market_id;
DROP INDEX IF EXISTS public.idx_bpu_items_user_id;

-- fiche_valeur
DROP INDEX IF EXISTS public.idx_fiche_valeur_user_id;

-- manual_markets
DROP INDEX IF EXISTS public.idx_manual_markets_created_by_status;
DROP INDEX IF EXISTS public.manual_markets_title_gin_idx;
DROP INDEX IF EXISTS public.manual_markets_description_gin_idx;
DROP INDEX IF EXISTS public.manual_markets_client_gin_idx;
DROP INDEX IF EXISTS public.manual_markets_location_gin_idx;
DROP INDEX IF EXISTS public.manual_markets_service_type_gin_idx;

-- market_search_history
DROP INDEX IF EXISTS public.idx_market_search_history_user_id;

-- referencing_requests
DROP INDEX IF EXISTS public.idx_referencing_requests_collectivity_id;

-- report_assets
DROP INDEX IF EXISTS public.idx_report_assets_user_id;

-- feature_requests
DROP INDEX IF EXISTS public.idx_feature_requests_user_id;

-- feature_votes
DROP INDEX IF EXISTS public.idx_feature_votes_user_id;

-- public_markets
DROP INDEX IF EXISTS public.public_markets_description_gin_idx;
DROP INDEX IF EXISTS public.public_markets_client_gin_idx;
DROP INDEX IF EXISTS public.public_markets_location_gin_idx;
DROP INDEX IF EXISTS public.public_markets_service_type_gin_idx;

-- market_sentinel_stats
DROP INDEX IF EXISTS public.idx_market_sentinel_stats_user_id;

-- bug_reports
DROP INDEX IF EXISTS public.idx_bug_reports_user_id;

-- email_digest_queue
DROP INDEX IF EXISTS public.idx_email_digest_queue_user_id;

-- email_digest_history
DROP INDEX IF EXISTS public.idx_email_digest_history_user_id;

-- market_alert_detections
DROP INDEX IF EXISTS public.idx_market_alert_detections_alert_id;
DROP INDEX IF EXISTS public.idx_market_alert_detections_user_id;

-- memo_sections
DROP INDEX IF EXISTS public.idx_memo_sections_user_id;

-- invoices
DROP INDEX IF EXISTS public.idx_invoices_stripe_invoice_id;
DROP INDEX IF EXISTS public.idx_invoices_subscription_id;
DROP INDEX IF EXISTS public.idx_invoices_status;
DROP INDEX IF EXISTS public.idx_invoices_invoice_date;

-- lead_captures
DROP INDEX IF EXISTS public.idx_lead_captures_email;
DROP INDEX IF EXISTS public.idx_lead_captures_status;
DROP INDEX IF EXISTS public.idx_lead_captures_created_at;