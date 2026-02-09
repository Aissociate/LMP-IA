/*
  # Auto-publish article posts trigger

  1. New Trigger Function
    - `notify_auto_publish_article` - fires on INSERT to admin_settings
    - Only triggers when setting_key starts with 'post_daily_' or 'post_linkedin_'
    - Sends an async HTTP call via pg_net to the auto-publish-article edge function
    - Passes setting_key and setting_value as payload

  2. Trigger
    - `trigger_auto_publish_article` on admin_settings AFTER INSERT
    - Filters only relevant post keys to avoid firing on unrelated settings

  3. Important Notes
    - Uses existing vault secrets (supabase_url, supabase_anon_key) for HTTP calls
    - Each new post_daily_YYYY_MM_DD or post_linkedin_X entry triggers one publication
    - The post text is published as-is to Facebook and LinkedIn, no modification
*/

CREATE OR REPLACE FUNCTION notify_auto_publish_article()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, net, vault
AS $$
DECLARE
  edge_url text;
  anon_key text;
  payload jsonb;
  request_id bigint;
BEGIN
  IF NEW.setting_key NOT LIKE 'post_daily_%' AND NEW.setting_key NOT LIKE 'post_linkedin_%' THEN
    RETURN NEW;
  END IF;

  SELECT decrypted_secret INTO edge_url
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_url'
  LIMIT 1;

  SELECT decrypted_secret INTO anon_key
  FROM vault.decrypted_secrets
  WHERE name = 'supabase_anon_key'
  LIMIT 1;

  IF edge_url IS NULL OR anon_key IS NULL THEN
    RAISE WARNING '[auto-publish-article] Missing vault secrets supabase_url or supabase_anon_key';
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'setting_key', NEW.setting_key,
    'setting_value', NEW.setting_value
  );

  SELECT net.http_post(
    url := edge_url || '/functions/v1/auto-publish-article',
    body := payload,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    timeout_milliseconds := 30000
  ) INTO request_id;

  RAISE LOG '[auto-publish-article] Triggered for key: % (request_id: %)', NEW.setting_key, request_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_publish_article ON admin_settings;
CREATE TRIGGER trigger_auto_publish_article
  AFTER INSERT ON admin_settings
  FOR EACH ROW
  EXECUTE FUNCTION notify_auto_publish_article();
