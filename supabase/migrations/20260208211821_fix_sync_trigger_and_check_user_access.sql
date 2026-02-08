/*
  # Fix subscription sync trigger and check_user_access function

  1. **Fix sync_stripe_subscription_to_user trigger function**
    - Remove reference to `stripe.subscriptions` table which may not exist
    - Calculate trial_end from subscription status and current_period_end instead
    - More robust error handling

  2. **Fix check_user_access function**
    - Handle the case where stripe_customers has a mapping but user_subscriptions doesn't have stripe IDs yet
    - Check stripe_customers table as a fallback to find active stripe data
    - Ensure users who paid via Stripe get access even if trigger sync was delayed

  3. **Security**
    - Both functions remain SECURITY DEFINER with search_path set
*/

-- Fix the sync trigger function to not reference stripe.subscriptions
CREATE OR REPLACE FUNCTION sync_stripe_subscription_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_plan_id uuid;
  v_subscription_status text;
BEGIN
  SELECT user_id INTO v_user_id
  FROM stripe_customers
  WHERE customer_id = NEW.customer_id
  AND deleted_at IS NULL;

  IF v_user_id IS NULL THEN
    RAISE WARNING 'No user found for customer_id: %', NEW.customer_id;
    RETURN NEW;
  END IF;

  SELECT id INTO v_plan_id
  FROM subscription_plans
  WHERE stripe_price_id = NEW.price_id
  AND is_active = true;

  IF v_plan_id IS NULL THEN
    RAISE WARNING 'No plan found for price_id: %. Trying to find default active plan.', NEW.price_id;
    SELECT id INTO v_plan_id
    FROM subscription_plans
    WHERE name = 'BRONZE' AND is_active = true;
  END IF;

  IF v_plan_id IS NULL THEN
    RAISE WARNING 'No plan found at all for price_id: %', NEW.price_id;
    RETURN NEW;
  END IF;

  v_subscription_status := CASE NEW.status
    WHEN 'active' THEN 'active'
    WHEN 'trialing' THEN 'active'
    WHEN 'past_due' THEN 'past_due'
    WHEN 'canceled' THEN 'canceled'
    WHEN 'unpaid' THEN 'canceled'
    WHEN 'incomplete' THEN 'canceled'
    WHEN 'incomplete_expired' THEN 'canceled'
    ELSE 'canceled'
  END;

  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    stripe_customer_id,
    stripe_subscription_id,
    status,
    current_period_start,
    current_period_end,
    trial_end_date,
    cancel_at_period_end,
    updated_at
  ) VALUES (
    v_user_id,
    v_plan_id,
    NEW.customer_id,
    NEW.subscription_id,
    v_subscription_status,
    to_timestamp(NEW.current_period_start),
    to_timestamp(NEW.current_period_end),
    CASE WHEN NEW.status = 'trialing' THEN to_timestamp(NEW.current_period_end) ELSE NULL END,
    NEW.cancel_at_period_end,
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

  RAISE NOTICE 'Sync successful for user_id: % with plan_id: % and status: %', v_user_id, v_plan_id, v_subscription_status;

  RETURN NEW;
END;
$$;

-- Recreate trigger with less restrictive condition
DROP TRIGGER IF EXISTS trigger_sync_stripe_to_user ON stripe_subscriptions;

CREATE TRIGGER trigger_sync_stripe_to_user
  AFTER INSERT OR UPDATE
  ON stripe_subscriptions
  FOR EACH ROW
  WHEN (NEW.subscription_id IS NOT NULL)
  EXECUTE FUNCTION sync_stripe_subscription_to_user();


-- Fix check_user_access to also check stripe_customers as fallback
CREATE OR REPLACE FUNCTION check_user_access(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin boolean;
  v_subscription record;
  v_stripe_customer_id text;
  v_stripe_sub record;
BEGIN
  SELECT is_admin INTO v_is_admin
  FROM user_profiles
  WHERE user_id = p_user_id;

  IF v_is_admin = true THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'reason', 'admin',
      'is_admin', true
    );
  END IF;

  SELECT 
    us.*,
    sp.name as plan_name,
    sp.monthly_memories_limit
  INTO v_subscription
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
  AND us.status = 'active';

  IF v_subscription IS NULL THEN
    SELECT sc.customer_id INTO v_stripe_customer_id
    FROM stripe_customers sc
    WHERE sc.user_id = p_user_id
    AND sc.deleted_at IS NULL;

    IF v_stripe_customer_id IS NOT NULL THEN
      SELECT ss.subscription_id, ss.status, ss.price_id, 
             ss.current_period_start, ss.current_period_end,
             ss.cancel_at_period_end
      INTO v_stripe_sub
      FROM stripe_subscriptions ss
      WHERE ss.customer_id = v_stripe_customer_id
      AND ss.subscription_id IS NOT NULL
      AND ss.status IN ('active', 'trialing');

      IF v_stripe_sub IS NOT NULL THEN
        DECLARE
          v_plan_id_fallback uuid;
          v_plan_name_fallback text;
          v_plan_limit_fallback integer;
          v_mapped_status text;
        BEGIN
          SELECT id, name, monthly_memories_limit 
          INTO v_plan_id_fallback, v_plan_name_fallback, v_plan_limit_fallback
          FROM subscription_plans
          WHERE stripe_price_id = v_stripe_sub.price_id AND is_active = true;

          IF v_plan_id_fallback IS NULL THEN
            SELECT id, name, monthly_memories_limit 
            INTO v_plan_id_fallback, v_plan_name_fallback, v_plan_limit_fallback
            FROM subscription_plans
            WHERE name = 'BRONZE' AND is_active = true;
          END IF;

          IF v_plan_id_fallback IS NOT NULL THEN
            v_mapped_status := CASE v_stripe_sub.status
              WHEN 'active' THEN 'active'
              WHEN 'trialing' THEN 'active'
              ELSE 'canceled'
            END;

            INSERT INTO user_subscriptions (
              user_id, plan_id, stripe_customer_id, stripe_subscription_id,
              status, current_period_start, current_period_end,
              trial_end_date, cancel_at_period_end, updated_at
            ) VALUES (
              p_user_id, v_plan_id_fallback, v_stripe_customer_id, v_stripe_sub.subscription_id,
              v_mapped_status,
              to_timestamp(v_stripe_sub.current_period_start),
              to_timestamp(v_stripe_sub.current_period_end),
              CASE WHEN v_stripe_sub.status = 'trialing' THEN to_timestamp(v_stripe_sub.current_period_end) ELSE NULL END,
              v_stripe_sub.cancel_at_period_end,
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

            RETURN jsonb_build_object(
              'has_access', true,
              'reason', 'active_subscription',
              'is_admin', false,
              'plan_name', v_plan_name_fallback,
              'memories_limit', v_plan_limit_fallback
            );
          END IF;
        END;
      END IF;
    END IF;

    RETURN jsonb_build_object(
      'has_access', false,
      'reason', 'no_subscription',
      'is_admin', false,
      'needs_subscription', true
    );
  END IF;

  IF v_subscription.trial_end_date IS NOT NULL 
     AND v_subscription.trial_end_date > now() 
     AND v_subscription.stripe_customer_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'reason', 'trial',
      'is_admin', false,
      'trial_end_date', v_subscription.trial_end_date,
      'plan_name', v_subscription.plan_name,
      'memories_limit', v_subscription.monthly_memories_limit
    );
  END IF;

  IF v_subscription.stripe_subscription_id IS NOT NULL 
     AND v_subscription.stripe_customer_id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'has_access', true,
      'reason', 'active_subscription',
      'is_admin', false,
      'plan_name', v_subscription.plan_name,
      'memories_limit', v_subscription.monthly_memories_limit
    );
  END IF;

  SELECT sc.customer_id INTO v_stripe_customer_id
  FROM stripe_customers sc
  WHERE sc.user_id = p_user_id
  AND sc.deleted_at IS NULL;

  IF v_stripe_customer_id IS NOT NULL THEN
    SELECT ss.subscription_id, ss.status
    INTO v_stripe_sub
    FROM stripe_subscriptions ss
    WHERE ss.customer_id = v_stripe_customer_id
    AND ss.subscription_id IS NOT NULL
    AND ss.status IN ('active', 'trialing');

    IF v_stripe_sub IS NOT NULL THEN
      UPDATE user_subscriptions 
      SET stripe_customer_id = v_stripe_customer_id,
          stripe_subscription_id = v_stripe_sub.subscription_id,
          updated_at = now()
      WHERE user_id = p_user_id;

      RETURN jsonb_build_object(
        'has_access', true,
        'reason', 'active_subscription',
        'is_admin', false,
        'plan_name', v_subscription.plan_name,
        'memories_limit', v_subscription.monthly_memories_limit
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'has_access', false,
    'reason', 'stripe_subscription_required',
    'is_admin', false,
    'needs_subscription', true
  );
END;
$$;
