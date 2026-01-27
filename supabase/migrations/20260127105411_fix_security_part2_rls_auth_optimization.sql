/*
  # Fix Security Issues - Part 2: RLS Auth Function Optimization

  Replace direct auth function calls with subqueries to prevent re-evaluation for each row.
  This significantly improves query performance at scale.
*/

-- user_notification_preferences
DROP POLICY IF EXISTS "Users can view own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can view own notification preferences"
  ON user_notification_preferences FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can insert own notification preferences"
  ON user_notification_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own notification preferences" ON user_notification_preferences;
CREATE POLICY "Users can update own notification preferences"
  ON user_notification_preferences FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

-- email_digest_queue
DROP POLICY IF EXISTS "Users can view own digest queue" ON email_digest_queue;
CREATE POLICY "Users can view own digest queue"
  ON email_digest_queue FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all digest queue" ON email_digest_queue;
CREATE POLICY "Admins can view all digest queue"
  ON email_digest_queue FOR SELECT
  TO authenticated
  USING ((select public.is_admin()));

-- email_digest_history
DROP POLICY IF EXISTS "Users can view own digest history" ON email_digest_history;
CREATE POLICY "Users can view own digest history"
  ON email_digest_history FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all digest history" ON email_digest_history;
CREATE POLICY "Admins can view all digest history"
  ON email_digest_history FOR SELECT
  TO authenticated
  USING ((select public.is_admin()));

-- subscription_plans
DROP POLICY IF EXISTS "Admins can manage plans" ON subscription_plans;
CREATE POLICY "Admins can manage plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- user_subscriptions
DROP POLICY IF EXISTS "Users can view own subscription" ON user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can view all subscriptions"
  ON user_subscriptions FOR SELECT
  TO authenticated
  USING ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins can insert subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can insert subscriptions"
  ON user_subscriptions FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins can update subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can update subscriptions"
  ON user_subscriptions FOR UPDATE
  TO authenticated
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins can delete subscriptions" ON user_subscriptions;
CREATE POLICY "Admins can delete subscriptions"
  ON user_subscriptions FOR DELETE
  TO authenticated
  USING ((select public.is_admin()));

-- monthly_memory_usage
DROP POLICY IF EXISTS "Users can view own usage" ON monthly_memory_usage;
CREATE POLICY "Users can view own usage"
  ON monthly_memory_usage FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can view all usage" ON monthly_memory_usage;
CREATE POLICY "Admins can view all usage"
  ON monthly_memory_usage FOR SELECT
  TO authenticated
  USING ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins can insert memory usage" ON monthly_memory_usage;
CREATE POLICY "Admins can insert memory usage"
  ON monthly_memory_usage FOR INSERT
  TO authenticated
  WITH CHECK ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins can update memory usage" ON monthly_memory_usage;
CREATE POLICY "Admins can update memory usage"
  ON monthly_memory_usage FOR UPDATE
  TO authenticated
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins can delete memory usage" ON monthly_memory_usage;
CREATE POLICY "Admins can delete memory usage"
  ON monthly_memory_usage FOR DELETE
  TO authenticated
  USING ((select public.is_admin()));

-- stripe_customers
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) AND deleted_at IS NULL);

-- stripe_subscriptions (customer_id is text, need to match it)
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM stripe_customers 
      WHERE stripe_customers.customer_id = stripe_subscriptions.customer_id
        AND stripe_customers.user_id = (select auth.uid())
        AND stripe_customers.deleted_at IS NULL
    )
    AND stripe_subscriptions.deleted_at IS NULL
  );

-- stripe_orders (customer_id is text, need to match it)
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON stripe_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM stripe_customers 
      WHERE stripe_customers.customer_id = stripe_orders.customer_id
        AND stripe_customers.user_id = (select auth.uid())
        AND stripe_customers.deleted_at IS NULL
    )
    AND stripe_orders.deleted_at IS NULL
  );

-- user_profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- memo_sections
DROP POLICY IF EXISTS "Users can insert own memo sections" ON memo_sections;
CREATE POLICY "Users can insert own memo sections"
  ON memo_sections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

-- secure_documents
DROP POLICY IF EXISTS "Users can view their own secure documents" ON secure_documents;
CREATE POLICY "Users can view their own secure documents"
  ON secure_documents FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can insert their own secure documents" ON secure_documents;
CREATE POLICY "Users can insert their own secure documents"
  ON secure_documents FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update their own secure documents" ON secure_documents;
CREATE POLICY "Users can update their own secure documents"
  ON secure_documents FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own secure documents" ON secure_documents;
CREATE POLICY "Users can delete their own secure documents"
  ON secure_documents FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

-- candidatures
DROP POLICY IF EXISTS "Admins can read candidatures" ON candidatures;
CREATE POLICY "Admins can read candidatures"
  ON candidatures FOR SELECT
  TO authenticated
  USING ((select public.is_admin()));

DROP POLICY IF EXISTS "Admins can update candidatures" ON candidatures;
CREATE POLICY "Admins can update candidatures"
  ON candidatures FOR UPDATE
  TO authenticated
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- alert_execution_logs
DROP POLICY IF EXISTS "Admins can view execution logs" ON alert_execution_logs;
CREATE POLICY "Admins can view execution logs"
  ON alert_execution_logs FOR SELECT
  TO authenticated
  USING ((select public.is_admin()));

-- market_alert_detections
DROP POLICY IF EXISTS "Users can view own market detections" ON market_alert_detections;
CREATE POLICY "Users can view own market detections"
  ON market_alert_detections FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can update own market detections" ON market_alert_detections;
CREATE POLICY "Users can update own market detections"
  ON market_alert_detections FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));
