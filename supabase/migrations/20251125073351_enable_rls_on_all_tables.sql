/*
  # Activation de RLS sur toutes les tables publiques
  
  1. Tables concernées
    - boamp_favorites, saved_searches, search_alerts
    - bpu_items, fiche_valeur, assistant_conversations
    - market_search_history, report_assets
    - feature_comments, user_subscriptions, subscription_plans
    - feature_requests, feature_votes
    - page_visits, page_clicks
    
  2. Politiques RLS
    - Politiques restrictives par défaut
    - Accès utilisateur uniquement à leurs propres données
    - Lecture publique pour subscription_plans
*/

-- Activer RLS sur toutes les tables
ALTER TABLE boamp_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bpu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiche_valeur ENABLE ROW LEVEL SECURITY;
ALTER TABLE assistant_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_clicks ENABLE ROW LEVEL SECURITY;

-- boamp_favorites
CREATE POLICY "Users can view own favorites"
  ON boamp_favorites FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own favorites"
  ON boamp_favorites FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own favorites"
  ON boamp_favorites FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- saved_searches
CREATE POLICY "Users can view own saved searches"
  ON saved_searches FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own saved searches"
  ON saved_searches FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own saved searches"
  ON saved_searches FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own saved searches"
  ON saved_searches FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- search_alerts
CREATE POLICY "Users can view own search alerts"
  ON search_alerts FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own search alerts"
  ON search_alerts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own search alerts"
  ON search_alerts FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own search alerts"
  ON search_alerts FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- bpu_items
CREATE POLICY "Users can view own bpu items"
  ON bpu_items FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own bpu items"
  ON bpu_items FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own bpu items"
  ON bpu_items FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own bpu items"
  ON bpu_items FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- fiche_valeur
CREATE POLICY "Users can view own fiche valeur"
  ON fiche_valeur FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own fiche valeur"
  ON fiche_valeur FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own fiche valeur"
  ON fiche_valeur FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own fiche valeur"
  ON fiche_valeur FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- assistant_conversations
CREATE POLICY "Users can view own conversations"
  ON assistant_conversations FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own conversations"
  ON assistant_conversations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own conversations"
  ON assistant_conversations FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own conversations"
  ON assistant_conversations FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- market_search_history
CREATE POLICY "Users can view own search history"
  ON market_search_history FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own search history"
  ON market_search_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- report_assets
CREATE POLICY "Users can view own report assets"
  ON report_assets FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own report assets"
  ON report_assets FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own report assets"
  ON report_assets FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- feature_comments
CREATE POLICY "Anyone can view feature comments"
  ON feature_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert feature comments"
  ON feature_comments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- user_subscriptions
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Service role can manage subscriptions"
  ON user_subscriptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- subscription_plans (lecture publique)
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

-- feature_requests
CREATE POLICY "Anyone can view feature requests"
  ON feature_requests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert feature requests"
  ON feature_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- feature_votes
CREATE POLICY "Anyone can view feature votes"
  ON feature_votes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own feature votes"
  ON feature_votes FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own feature votes"
  ON feature_votes FOR DELETE
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- page_visits (analytics - service role only)
CREATE POLICY "Service role can manage page visits"
  ON page_visits FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- page_clicks (analytics - service role only)
CREATE POLICY "Service role can manage page clicks"
  ON page_clicks FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);