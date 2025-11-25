/*
  # Ajout des index manquants sur les clés étrangères
  
  1. Index créés
    - Tous les foreign keys sans index de couverture reçoivent un index
    - Améliore les performances des jointures et des requêtes
    
  2. Tables concernées
    - assistant_conversations
    - bpu_items
    - bug_reports
    - feature_requests
    - feature_votes
    - fiche_valeur
    - market_relevance_scores
    - market_search_history
    - market_sentinel_stats
    - memory_credits
    - model_credits
    - report_assets
    - saved_searches
    - search_alerts
    - stripe_price_history
    - subscription_addons
    - upsell_requests
    - user_subscriptions
*/

-- assistant_conversations
CREATE INDEX IF NOT EXISTS idx_assistant_conversations_user_id 
  ON assistant_conversations(user_id);

-- bpu_items
CREATE INDEX IF NOT EXISTS idx_bpu_items_market_id 
  ON bpu_items(market_id);
CREATE INDEX IF NOT EXISTS idx_bpu_items_user_id 
  ON bpu_items(user_id);

-- bug_reports
CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id 
  ON bug_reports(user_id);

-- feature_requests
CREATE INDEX IF NOT EXISTS idx_feature_requests_user_id 
  ON feature_requests(user_id);

-- feature_votes
CREATE INDEX IF NOT EXISTS idx_feature_votes_user_id 
  ON feature_votes(user_id);

-- fiche_valeur
CREATE INDEX IF NOT EXISTS idx_fiche_valeur_user_id 
  ON fiche_valeur(user_id);

-- market_relevance_scores
CREATE INDEX IF NOT EXISTS idx_market_relevance_scores_user_id 
  ON market_relevance_scores(user_id);

-- market_search_history
CREATE INDEX IF NOT EXISTS idx_market_search_history_user_id 
  ON market_search_history(user_id);

-- market_sentinel_stats
CREATE INDEX IF NOT EXISTS idx_market_sentinel_stats_user_id 
  ON market_sentinel_stats(user_id);

-- memory_credits
CREATE INDEX IF NOT EXISTS idx_memory_credits_user_id 
  ON memory_credits(user_id);

-- model_credits
CREATE INDEX IF NOT EXISTS idx_model_credits_user_id 
  ON model_credits(user_id);

-- report_assets
CREATE INDEX IF NOT EXISTS idx_report_assets_user_id 
  ON report_assets(user_id);

-- saved_searches
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id 
  ON saved_searches(user_id);

-- search_alerts
CREATE INDEX IF NOT EXISTS idx_search_alerts_saved_search_id 
  ON search_alerts(saved_search_id);
CREATE INDEX IF NOT EXISTS idx_search_alerts_user_id 
  ON search_alerts(user_id);

-- stripe_price_history
CREATE INDEX IF NOT EXISTS idx_stripe_price_history_plan_id 
  ON stripe_price_history(plan_id);

-- subscription_addons (index déjà créé dans migration précédente, on le vérifie)
CREATE INDEX IF NOT EXISTS idx_subscription_addons_user_id_2 
  ON subscription_addons(user_id);

-- upsell_requests
CREATE INDEX IF NOT EXISTS idx_upsell_requests_user_id 
  ON upsell_requests(user_id);

-- user_subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id 
  ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id 
  ON user_subscriptions(plan_id);