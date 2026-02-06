/*
  # Synchronisation automatique Stripe → user_subscriptions

  ## Changements

  1. **Fonction de synchronisation**
    - `sync_stripe_subscription_to_user` : Synchronise les données de stripe_subscriptions vers user_subscriptions
    - Appelée automatiquement via trigger quand stripe_subscriptions change
    - Récupère le user_id via stripe_customers
    - Récupère le plan_id via le price_id Stripe
    - Crée ou met à jour user_subscriptions avec :
      - stripe_customer_id
      - stripe_subscription_id
      - status (mappage des statuts Stripe)
      - current_period_start/end
      - trial_end_date (si trial actif)

  2. **Trigger automatique**
    - Se déclenche AFTER INSERT OR UPDATE sur stripe_subscriptions
    - Appelle sync_stripe_subscription_to_user

  3. **Mapping des statuts Stripe**
    - active, trialing → active
    - past_due → past_due
    - canceled, unpaid, incomplete, incomplete_expired → canceled

  4. **Sécurité**
    - Fonction SECURITY DEFINER avec search_path défini
*/

-- Fonction pour synchroniser stripe_subscriptions → user_subscriptions
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
  v_trial_end timestamptz;
BEGIN
  -- Récupérer le user_id via stripe_customers
  SELECT user_id INTO v_user_id
  FROM stripe_customers
  WHERE customer_id = NEW.customer_id
  AND deleted_at IS NULL;

  IF v_user_id IS NULL THEN
    RAISE WARNING 'Aucun utilisateur trouvé pour customer_id: %', NEW.customer_id;
    RETURN NEW;
  END IF;

  -- Récupérer le plan_id via le price_id
  SELECT id INTO v_plan_id
  FROM subscription_plans
  WHERE stripe_price_id = NEW.price_id
  AND is_active = true;

  IF v_plan_id IS NULL THEN
    RAISE WARNING 'Aucun plan trouvé pour price_id: %', NEW.price_id;
    RETURN NEW;
  END IF;

  -- Mapper le statut Stripe vers notre statut
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

  -- Récupérer la date de fin de trial depuis Stripe si applicable
  IF NEW.status = 'trialing' THEN
    SELECT to_timestamp(trial_end) INTO v_trial_end
    FROM stripe.subscriptions
    WHERE id = NEW.subscription_id;
  END IF;

  -- Créer ou mettre à jour user_subscriptions
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
    v_trial_end,
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

  RAISE NOTICE 'Synchronisation réussie pour user_id: % avec plan_id: % et status: %', v_user_id, v_plan_id, v_subscription_status;

  RETURN NEW;
END;
$$;

-- Créer le trigger sur stripe_subscriptions
DROP TRIGGER IF EXISTS trigger_sync_stripe_to_user ON stripe_subscriptions;

CREATE TRIGGER trigger_sync_stripe_to_user
  AFTER INSERT OR UPDATE OF subscription_id, price_id, status, current_period_start, current_period_end, cancel_at_period_end
  ON stripe_subscriptions
  FOR EACH ROW
  WHEN (NEW.subscription_id IS NOT NULL AND NEW.status IS NOT NULL)
  EXECUTE FUNCTION sync_stripe_subscription_to_user();

-- Commentaire pour documenter
COMMENT ON FUNCTION sync_stripe_subscription_to_user IS 
'Synchronise automatiquement les données de stripe_subscriptions vers user_subscriptions. 
Appelé via trigger quand stripe_subscriptions change.';

COMMENT ON TRIGGER trigger_sync_stripe_to_user ON stripe_subscriptions IS
'Synchronise automatiquement stripe_subscriptions → user_subscriptions pour maintenir la cohérence des données.';
