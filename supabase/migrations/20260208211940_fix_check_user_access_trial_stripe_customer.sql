/*
  # Fix check_user_access for trial users with stripe_customers mapping

  ## Problem
  - Users who paid via Stripe have a stripe_customers entry
  - But the webhook sync failed, so user_subscriptions.stripe_customer_id is null
  - check_user_access requires stripe_customer_id for trial access
  - This blocks users who paid from accessing the app

  ## Fix
  - When a user has an active trial but no stripe_customer_id in user_subscriptions,
    check stripe_customers table to see if they went through Stripe checkout
  - If they did, update user_subscriptions.stripe_customer_id and grant access
  - This is a self-healing mechanism for the data inconsistency
*/

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
          v_plan_id_fb uuid;
          v_plan_name_fb text;
          v_plan_limit_fb integer;
          v_mapped_status_fb text;
        BEGIN
          SELECT id, name, monthly_memories_limit 
          INTO v_plan_id_fb, v_plan_name_fb, v_plan_limit_fb
          FROM subscription_plans
          WHERE stripe_price_id = v_stripe_sub.price_id AND is_active = true;

          IF v_plan_id_fb IS NULL THEN
            SELECT id, name, monthly_memories_limit 
            INTO v_plan_id_fb, v_plan_name_fb, v_plan_limit_fb
            FROM subscription_plans
            WHERE name = 'BRONZE' AND is_active = true;
          END IF;

          IF v_plan_id_fb IS NOT NULL THEN
            v_mapped_status_fb := CASE v_stripe_sub.status
              WHEN 'active' THEN 'active'
              WHEN 'trialing' THEN 'active'
              ELSE 'canceled'
            END;

            INSERT INTO user_subscriptions (
              user_id, plan_id, stripe_customer_id, stripe_subscription_id,
              status, current_period_start, current_period_end,
              trial_end_date, cancel_at_period_end, updated_at
            ) VALUES (
              p_user_id, v_plan_id_fb, v_stripe_customer_id, v_stripe_sub.subscription_id,
              v_mapped_status_fb,
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
              'plan_name', v_plan_name_fb,
              'memories_limit', v_plan_limit_fb
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

  -- User has active subscription - check if stripe_customer_id is missing but exists in stripe_customers
  IF v_subscription.stripe_customer_id IS NULL THEN
    SELECT sc.customer_id INTO v_stripe_customer_id
    FROM stripe_customers sc
    WHERE sc.user_id = p_user_id
    AND sc.deleted_at IS NULL;

    IF v_stripe_customer_id IS NOT NULL THEN
      UPDATE user_subscriptions 
      SET stripe_customer_id = v_stripe_customer_id,
          updated_at = now()
      WHERE user_id = p_user_id;

      -- Also check if there's a stripe subscription to link
      SELECT ss.subscription_id INTO v_stripe_sub
      FROM stripe_subscriptions ss
      WHERE ss.customer_id = v_stripe_customer_id
      AND ss.subscription_id IS NOT NULL;

      IF v_stripe_sub IS NOT NULL THEN
        UPDATE user_subscriptions 
        SET stripe_subscription_id = v_stripe_sub.subscription_id,
            updated_at = now()
        WHERE user_id = p_user_id;
      END IF;

      -- Grant access since user went through Stripe checkout
      IF v_subscription.trial_end_date IS NOT NULL AND v_subscription.trial_end_date > now() THEN
        RETURN jsonb_build_object(
          'has_access', true,
          'reason', 'trial',
          'is_admin', false,
          'trial_end_date', v_subscription.trial_end_date,
          'plan_name', v_subscription.plan_name,
          'memories_limit', v_subscription.monthly_memories_limit
        );
      END IF;

      RETURN jsonb_build_object(
        'has_access', true,
        'reason', 'active_subscription',
        'is_admin', false,
        'plan_name', v_subscription.plan_name,
        'memories_limit', v_subscription.monthly_memories_limit
      );
    END IF;
  END IF;

  -- Trial with stripe_customer_id
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

  -- Active Stripe subscription
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

  RETURN jsonb_build_object(
    'has_access', false,
    'reason', 'stripe_subscription_required',
    'is_admin', false,
    'needs_subscription', true
  );
END;
$$;
