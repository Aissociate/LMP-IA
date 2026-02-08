/*
  # Simplify check_user_access function

  ## Problem
  - Function was 5500+ chars with nested DECLARE blocks
  - Duplicated upsert logic in two places
  - Hard to follow flow with many nested IF branches

  ## Solution
  - Extract common upsert into a helper function `repair_user_subscription`
  - Flatten the logic into a clear linear flow:
    1. Admin check
    2. Load user subscription
    3. If no subscription, try to repair from stripe_subscriptions
    4. If subscription exists but missing stripe IDs, try to repair from stripe_customers
    5. Validate subscription has proper Stripe backing
  - Clearer variable names and fewer nesting levels
*/

-- Helper function to repair user_subscriptions from stripe data
CREATE OR REPLACE FUNCTION repair_user_subscription(
  p_user_id uuid,
  p_stripe_customer_id text,
  p_stripe_subscription_id text,
  p_price_id text,
  p_status text,
  p_period_start bigint,
  p_period_end bigint,
  p_cancel_at_period_end boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_id uuid;
  v_mapped_status text;
BEGIN
  SELECT id INTO v_plan_id
  FROM subscription_plans
  WHERE stripe_price_id = p_price_id AND is_active = true;

  IF v_plan_id IS NULL THEN
    SELECT id INTO v_plan_id
    FROM subscription_plans
    WHERE name = 'BRONZE' AND is_active = true;
  END IF;

  IF v_plan_id IS NULL THEN
    RETURN;
  END IF;

  v_mapped_status := CASE p_status
    WHEN 'active' THEN 'active'
    WHEN 'trialing' THEN 'active'
    ELSE 'canceled'
  END;

  INSERT INTO user_subscriptions (
    user_id, plan_id, stripe_customer_id, stripe_subscription_id,
    status, current_period_start, current_period_end,
    trial_end_date, cancel_at_period_end, updated_at
  ) VALUES (
    p_user_id, v_plan_id, p_stripe_customer_id, p_stripe_subscription_id,
    v_mapped_status,
    to_timestamp(p_period_start),
    to_timestamp(p_period_end),
    CASE WHEN p_status = 'trialing' THEN to_timestamp(p_period_end) ELSE NULL END,
    p_cancel_at_period_end,
    now()
  )
  ON CONFLICT (user_id)
  DO UPDATE SET
    plan_id = EXCLUDED.plan_id,
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    stripe_subscription_id = EXCLUDED.stripe_subscription_id,
    status = EXCLUDED.status,
    current_period_start = EXCLUDED.current_period_start,
    current_period_end = EXCLUDED.current_period_end,
    trial_end_date = EXCLUDED.trial_end_date,
    cancel_at_period_end = EXCLUDED.cancel_at_period_end,
    updated_at = now();
END;
$$;


-- Simplified check_user_access
CREATE OR REPLACE FUNCTION check_user_access(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_sub record;
  v_cust_id text;
  v_stripe_sub record;
BEGIN
  -- 1. Admin bypass
  SELECT is_admin INTO v_is_admin FROM user_profiles WHERE user_id = p_user_id;
  IF v_is_admin = true THEN
    RETURN jsonb_build_object('has_access', true, 'reason', 'admin', 'is_admin', true);
  END IF;

  -- 2. Look up stripe_customer_id (used in multiple checks below)
  SELECT sc.customer_id INTO v_cust_id
  FROM stripe_customers sc
  WHERE sc.user_id = p_user_id AND sc.deleted_at IS NULL;

  -- 3. Load active user subscription
  SELECT us.*, sp.name as plan_name, sp.monthly_memories_limit
  INTO v_sub
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id AND us.status = 'active';

  -- 4. No active subscription -- try to repair from stripe_subscriptions
  IF v_sub IS NULL AND v_cust_id IS NOT NULL THEN
    SELECT ss.subscription_id, ss.status, ss.price_id,
           ss.current_period_start, ss.current_period_end,
           ss.cancel_at_period_end
    INTO v_stripe_sub
    FROM stripe_subscriptions ss
    WHERE ss.customer_id = v_cust_id
    AND ss.subscription_id IS NOT NULL
    AND ss.status IN ('active', 'trialing');

    IF v_stripe_sub IS NOT NULL THEN
      PERFORM repair_user_subscription(
        p_user_id, v_cust_id, v_stripe_sub.subscription_id,
        v_stripe_sub.price_id, v_stripe_sub.status,
        v_stripe_sub.current_period_start, v_stripe_sub.current_period_end,
        v_stripe_sub.cancel_at_period_end
      );

      -- Re-load the repaired subscription
      SELECT us.*, sp.name as plan_name, sp.monthly_memories_limit
      INTO v_sub
      FROM user_subscriptions us
      JOIN subscription_plans sp ON sp.id = us.plan_id
      WHERE us.user_id = p_user_id AND us.status = 'active';
    END IF;
  END IF;

  -- 5. Still no subscription
  IF v_sub IS NULL THEN
    RETURN jsonb_build_object(
      'has_access', false, 'reason', 'no_subscription',
      'is_admin', false, 'needs_subscription', true
    );
  END IF;

  -- 6. Subscription exists but missing stripe_customer_id -- auto-repair
  IF v_sub.stripe_customer_id IS NULL AND v_cust_id IS NOT NULL THEN
    UPDATE user_subscriptions
    SET stripe_customer_id = v_cust_id, updated_at = now()
    WHERE user_id = p_user_id;

    SELECT ss.subscription_id INTO v_stripe_sub
    FROM stripe_subscriptions ss
    WHERE ss.customer_id = v_cust_id AND ss.subscription_id IS NOT NULL;

    IF v_stripe_sub IS NOT NULL THEN
      UPDATE user_subscriptions
      SET stripe_subscription_id = v_stripe_sub.subscription_id, updated_at = now()
      WHERE user_id = p_user_id;
    END IF;

    -- Grant access since user went through Stripe checkout
    IF v_sub.trial_end_date IS NOT NULL AND v_sub.trial_end_date > now() THEN
      RETURN jsonb_build_object(
        'has_access', true, 'reason', 'trial', 'is_admin', false,
        'trial_end_date', v_sub.trial_end_date,
        'plan_name', v_sub.plan_name, 'memories_limit', v_sub.monthly_memories_limit
      );
    END IF;

    RETURN jsonb_build_object(
      'has_access', true, 'reason', 'active_subscription', 'is_admin', false,
      'plan_name', v_sub.plan_name, 'memories_limit', v_sub.monthly_memories_limit
    );
  END IF;

  -- 7. Trial with valid stripe customer
  IF v_sub.trial_end_date IS NOT NULL AND v_sub.trial_end_date > now()
     AND v_sub.stripe_customer_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'has_access', true, 'reason', 'trial', 'is_admin', false,
      'trial_end_date', v_sub.trial_end_date,
      'plan_name', v_sub.plan_name, 'memories_limit', v_sub.monthly_memories_limit
    );
  END IF;

  -- 8. Active Stripe subscription
  IF v_sub.stripe_subscription_id IS NOT NULL AND v_sub.stripe_customer_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'has_access', true, 'reason', 'active_subscription', 'is_admin', false,
      'plan_name', v_sub.plan_name, 'memories_limit', v_sub.monthly_memories_limit
    );
  END IF;

  -- 9. All other cases
  RETURN jsonb_build_object(
    'has_access', false, 'reason', 'stripe_subscription_required',
    'is_admin', false, 'needs_subscription', true
  );
END;
$$;
