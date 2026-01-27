/*
  # Fix Security Issues - Part 3: Remove Unused Indexes

  Remove indexes that are not being used to reduce storage overhead and improve write performance.
*/

DROP INDEX IF EXISTS idx_saved_searches_user_id;
DROP INDEX IF EXISTS idx_secure_documents_user_id;
DROP INDEX IF EXISTS idx_secure_documents_expires_at;
DROP INDEX IF EXISTS idx_search_alerts_saved_search_id;
DROP INDEX IF EXISTS idx_search_alerts_user_id;
DROP INDEX IF EXISTS idx_bpu_items_market_id;
DROP INDEX IF EXISTS idx_bpu_items_user_id;
DROP INDEX IF EXISTS idx_fiche_valeur_user_id;
DROP INDEX IF EXISTS idx_user_profiles_is_admin;
DROP INDEX IF EXISTS idx_manual_markets_deadline;
DROP INDEX IF EXISTS idx_manual_markets_publication_date;
DROP INDEX IF EXISTS idx_manual_markets_client;
DROP INDEX IF EXISTS idx_manual_markets_location;
DROP INDEX IF EXISTS idx_manual_markets_service_type;
DROP INDEX IF EXISTS idx_manual_markets_created_by;
DROP INDEX IF EXISTS idx_donneurs_ordre_department;
DROP INDEX IF EXISTS idx_knowledge_files_extraction_status;
DROP INDEX IF EXISTS idx_market_search_history_user_id;
DROP INDEX IF EXISTS idx_report_assets_user_id;
DROP INDEX IF EXISTS idx_feature_requests_user_id;
DROP INDEX IF EXISTS idx_feature_votes_user_id;
DROP INDEX IF EXISTS idx_public_markets_is_public;
DROP INDEX IF EXISTS idx_market_sentinel_stats_user_id;
DROP INDEX IF EXISTS idx_bug_reports_user_id;
DROP INDEX IF EXISTS idx_email_digest_queue_scheduled_for;
DROP INDEX IF EXISTS idx_email_digest_queue_status;
DROP INDEX IF EXISTS idx_email_digest_queue_user_id;
DROP INDEX IF EXISTS idx_alert_execution_logs_execution_date;
DROP INDEX IF EXISTS idx_email_digest_history_user_id;
DROP INDEX IF EXISTS idx_email_digest_history_sent_at;
DROP INDEX IF EXISTS idx_market_alert_detections_alert_id;
DROP INDEX IF EXISTS idx_market_alert_detections_detected_at;
DROP INDEX IF EXISTS idx_market_alert_detections_user_id;
DROP INDEX IF EXISTS idx_market_alert_detections_is_read;
DROP INDEX IF EXISTS idx_memo_sections_user_id;
DROP INDEX IF EXISTS idx_user_subscriptions_user_id;
DROP INDEX IF EXISTS idx_user_subscriptions_stripe_subscription_id;
DROP INDEX IF EXISTS idx_monthly_memory_usage_user_id;
DROP INDEX IF EXISTS idx_candidatures_statut;
DROP INDEX IF EXISTS idx_candidatures_email;
