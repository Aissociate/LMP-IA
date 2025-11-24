/*
  # Fix Security Issues - Part 1: Add Missing Indexes

  1. Foreign Key Indexes
    - Add missing indexes on foreign keys to improve query performance
    - `feature_requests.user_id`
    - `search_alerts.saved_search_id`
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_feature_requests_user_id 
  ON public.feature_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_search_alerts_saved_search_id 
  ON public.search_alerts(saved_search_id);