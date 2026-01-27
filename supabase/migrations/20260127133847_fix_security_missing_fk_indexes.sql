/*
  # Fix Security Issue: Add Missing Foreign Key Indexes

  1. Problem
    - Multiple tables have foreign keys without covering indexes
    - This leads to suboptimal query performance, especially for joins and cascading operations
    
  2. Solution
    - Add indexes for all unindexed foreign keys
    
  3. Tables Affected
    - bpu_items (market_id, user_id)
    - bug_reports (user_id)
    - email_digest_history (user_id)
    - email_digest_queue (user_id)
    - feature_requests (user_id)
    - feature_votes (user_id)
    - fiche_valeur (user_id)
    - market_alert_detections (alert_id, user_id)
    - market_search_history (user_id)
    - market_sentinel_stats (user_id)
    - memo_sections (user_id)
    - referencing_requests (collectivity_id)
    - report_assets (user_id)
    - saved_searches (user_id)
    - search_alerts (saved_search_id, user_id)
*/

-- Add index for bpu_items foreign keys
CREATE INDEX IF NOT EXISTS idx_bpu_items_market_id ON public.bpu_items(market_id);
CREATE INDEX IF NOT EXISTS idx_bpu_items_user_id ON public.bpu_items(user_id);

-- Add index for bug_reports foreign key
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON public.bug_reports(user_id);

-- Add index for email_digest_history foreign key
CREATE INDEX IF NOT EXISTS idx_email_digest_history_user_id ON public.email_digest_history(user_id);

-- Add index for email_digest_queue foreign key
CREATE INDEX IF NOT EXISTS idx_email_digest_queue_user_id ON public.email_digest_queue(user_id);

-- Add index for feature_requests foreign key
CREATE INDEX IF NOT EXISTS idx_feature_requests_user_id ON public.feature_requests(user_id);

-- Add index for feature_votes foreign key
CREATE INDEX IF NOT EXISTS idx_feature_votes_user_id ON public.feature_votes(user_id);

-- Add index for fiche_valeur foreign key
CREATE INDEX IF NOT EXISTS idx_fiche_valeur_user_id ON public.fiche_valeur(user_id);

-- Add indexes for market_alert_detections foreign keys
CREATE INDEX IF NOT EXISTS idx_market_alert_detections_alert_id ON public.market_alert_detections(alert_id);
CREATE INDEX IF NOT EXISTS idx_market_alert_detections_user_id ON public.market_alert_detections(user_id);

-- Add index for market_search_history foreign key
CREATE INDEX IF NOT EXISTS idx_market_search_history_user_id ON public.market_search_history(user_id);

-- Add index for market_sentinel_stats foreign key
CREATE INDEX IF NOT EXISTS idx_market_sentinel_stats_user_id ON public.market_sentinel_stats(user_id);

-- Add index for memo_sections foreign key (user_id was missing)
CREATE INDEX IF NOT EXISTS idx_memo_sections_user_id ON public.memo_sections(user_id);

-- Add index for referencing_requests foreign key
CREATE INDEX IF NOT EXISTS idx_referencing_requests_collectivity_id ON public.referencing_requests(collectivity_id);

-- Add index for report_assets foreign key
CREATE INDEX IF NOT EXISTS idx_report_assets_user_id ON public.report_assets(user_id);

-- Add index for saved_searches foreign key
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);

-- Add indexes for search_alerts foreign keys
CREATE INDEX IF NOT EXISTS idx_search_alerts_saved_search_id ON public.search_alerts(saved_search_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id ON public.search_alerts(user_id);