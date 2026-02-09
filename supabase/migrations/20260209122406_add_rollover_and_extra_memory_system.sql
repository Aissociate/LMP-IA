/*
  # Rollover & Extra Memory Purchase System

  1. Modified Tables
    - `monthly_memory_usage`
      - Added `rollover_credits` (integer, default 0) - credits rolled over from previous unused plan credits (max 1 month)
      - Added `extra_credits` (integer, default 0) - credits purchased at 299 EUR each

  2. New Tables
    - `memory_purchases`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `stripe_session_id` (text, unique) - Stripe checkout session ID
      - `amount` (numeric) - amount paid in EUR
      - `credits` (integer) - number of credits purchased
      - `status` (text) - 'pending', 'completed', 'refunded'
      - `created_at` (timestamptz)

  3. Updated Functions
    - `get_user_memory_stats` - now returns rollover_credits, extra_credits, and total_limit (plan + rollover + extra)
    - `increment_memory_usage` - auto-processes period rollover, consumes rollover first, then extra, then plan credits
    - `process_period_rollover` - helper function to handle month-end rollover calculation
    - `add_extra_memory_credit` - called after successful Stripe payment to add extra credits

  4. Security
    - RLS enabled on memory_purchases
    - Users can only view their own purchases
    - Only service role can insert (via webhook)

  5. Notes
    - Rollover credits expire after 1 month (they do NOT compound)
    - Consumption order: rollover first, then extra, then plan credits
    - This maximizes the chance of plan credits being unused and rolling over
*/

-- 1. Add rollover and extra columns to monthly_memory_usage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'monthly_memory_usage' AND column_name = 'rollover_credits'
  ) THEN
    ALTER TABLE monthly_memory_usage ADD COLUMN rollover_credits integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'monthly_memory_usage' AND column_name = 'extra_credits'
  ) THEN
    ALTER TABLE monthly_memory_usage ADD COLUMN extra_credits integer DEFAULT 0;
  END IF;
END $$;

-- 2. Create memory_purchases table
CREATE TABLE IF NOT EXISTS memory_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  stripe_session_id text UNIQUE,
  amount numeric NOT NULL DEFAULT 299,
  credits integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE memory_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases"
  ON memory_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_memory_purchases_user_id ON memory_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_memory_purchases_stripe_session ON memory_purchases(stripe_session_id);

-- 3. Helper function: process period rollover
CREATE OR REPLACE FUNCTION process_period_rollover(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mmu record;
  v_plan_limit integer;
  v_period_start timestamptz;
  v_period_end timestamptz;
  v_plan_credits_consumed integer;
  v_new_rollover integer;
BEGIN
  SELECT us.current_period_start, us.current_period_end, sp.monthly_memories_limit
  INTO v_period_start, v_period_end, v_plan_limit
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id AND us.status = 'active';

  IF v_plan_limit IS NULL THEN
    RETURN;
  END IF;

  SELECT * INTO v_mmu FROM monthly_memory_usage WHERE user_id = p_user_id;

  IF v_mmu IS NULL THEN
    INSERT INTO monthly_memory_usage (user_id, memories_used, rollover_credits, extra_credits, period_start, period_end)
    VALUES (p_user_id, 0, 0, 0, v_period_start, v_period_end)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN;
  END IF;

  IF v_mmu.period_start IS DISTINCT FROM v_period_start THEN
    v_plan_credits_consumed := GREATEST(0, v_mmu.memories_used - COALESCE(v_mmu.rollover_credits, 0) - COALESCE(v_mmu.extra_credits, 0));
    v_plan_credits_consumed := LEAST(v_plan_limit, v_plan_credits_consumed);
    v_new_rollover := v_plan_limit - v_plan_credits_consumed;

    UPDATE monthly_memory_usage
    SET memories_used = 0,
        rollover_credits = v_new_rollover,
        extra_credits = 0,
        period_start = v_period_start,
        period_end = v_period_end,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- 4. Replace get_user_memory_stats to include rollover and extra
CREATE OR REPLACE FUNCTION get_user_memory_stats(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result jsonb;
  v_plan_limit integer;
  v_rollover integer;
  v_extra integer;
  v_used integer;
  v_total_limit integer;
BEGIN
  PERFORM process_period_rollover(p_user_id);

  SELECT jsonb_build_object(
    'plan_name', sp.name,
    'limit', sp.monthly_memories_limit,
    'used', COALESCE(mmu.memories_used, 0),
    'rollover_credits', COALESCE(mmu.rollover_credits, 0),
    'extra_credits', COALESCE(mmu.extra_credits, 0),
    'total_limit', sp.monthly_memories_limit + COALESCE(mmu.rollover_credits, 0) + COALESCE(mmu.extra_credits, 0),
    'remaining', (sp.monthly_memories_limit + COALESCE(mmu.rollover_credits, 0) + COALESCE(mmu.extra_credits, 0)) - COALESCE(mmu.memories_used, 0),
    'period_start', us.current_period_start,
    'period_end', us.current_period_end,
    'status', us.status
  ) INTO v_result
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  LEFT JOIN monthly_memory_usage mmu ON mmu.user_id = us.user_id
  WHERE us.user_id = p_user_id
  AND us.status = 'active';

  IF v_result IS NULL THEN
    RETURN jsonb_build_object(
      'plan_name', 'Aucun',
      'limit', 0,
      'used', 0,
      'rollover_credits', 0,
      'extra_credits', 0,
      'total_limit', 0,
      'remaining', 0,
      'status', 'none'
    );
  END IF;

  RETURN v_result;
END;
$$;

-- 5. Replace increment_memory_usage to handle rollover + extra
CREATE OR REPLACE FUNCTION increment_memory_usage(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_limit integer;
  v_used integer;
  v_rollover integer;
  v_extra integer;
  v_total_limit integer;
BEGIN
  PERFORM process_period_rollover(p_user_id);

  SELECT sp.monthly_memories_limit INTO v_plan_limit
  FROM user_subscriptions us
  JOIN subscription_plans sp ON sp.id = us.plan_id
  WHERE us.user_id = p_user_id
  AND us.status = 'active';

  IF v_plan_limit IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_subscription',
      'message', 'Aucun abonnement actif'
    );
  END IF;

  SELECT memories_used, COALESCE(rollover_credits, 0), COALESCE(extra_credits, 0)
  INTO v_used, v_rollover, v_extra
  FROM monthly_memory_usage
  WHERE user_id = p_user_id;

  IF v_used IS NULL THEN
    INSERT INTO monthly_memory_usage (user_id, memories_used, rollover_credits, extra_credits)
    VALUES (p_user_id, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    v_used := 0;
    v_rollover := 0;
    v_extra := 0;
  END IF;

  v_total_limit := v_plan_limit + v_rollover + v_extra;

  IF v_used >= v_total_limit THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'limit_reached',
      'message', 'Limite mensuelle atteinte (plan + report + extras)',
      'used', v_used,
      'limit', v_total_limit,
      'remaining', 0
    );
  END IF;

  UPDATE monthly_memory_usage
  SET memories_used = memories_used + 1,
      updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'used', v_used + 1,
    'limit', v_total_limit,
    'remaining', v_total_limit - (v_used + 1)
  );
END;
$$;

-- 6. Function to add extra memory credits after purchase
CREATE OR REPLACE FUNCTION add_extra_memory_credit(p_user_id uuid, p_credits integer DEFAULT 1)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_extra integer;
BEGIN
  PERFORM process_period_rollover(p_user_id);

  INSERT INTO monthly_memory_usage (user_id, memories_used, rollover_credits, extra_credits)
  VALUES (p_user_id, 0, 0, p_credits)
  ON CONFLICT (user_id)
  DO UPDATE SET
    extra_credits = monthly_memory_usage.extra_credits + p_credits,
    updated_at = now();

  SELECT extra_credits INTO v_new_extra
  FROM monthly_memory_usage
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object(
    'success', true,
    'extra_credits', v_new_extra,
    'credits_added', p_credits
  );
END;
$$;

-- 7. Update memo_sections INSERT RLS policy to account for rollover + extra
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'memo_sections'
    AND policyname = 'Users can insert memo sections with subscription check'
  ) THEN
    DROP POLICY "Users can insert memo sections with subscription check" ON memo_sections;
  END IF;
END $$;

CREATE POLICY "Users can insert memo sections with subscription check"
  ON memo_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.user_id = auth.uid()
        AND up.is_admin = true
      )
      OR
      EXISTS (
        SELECT 1
        FROM user_subscriptions us
        JOIN subscription_plans sp ON sp.id = us.plan_id
        LEFT JOIN monthly_memory_usage mmu ON mmu.user_id = us.user_id
        WHERE us.user_id = auth.uid()
        AND us.status = 'active'
        AND (
          SELECT COUNT(DISTINCT market_id)
          FROM memo_sections ms
          WHERE ms.user_id = auth.uid()
          AND ms.created_at >= us.current_period_start
          AND ms.created_at < us.current_period_end
        ) < (sp.monthly_memories_limit + COALESCE(mmu.rollover_credits, 0) + COALESCE(mmu.extra_credits, 0))
      )
    )
  );
