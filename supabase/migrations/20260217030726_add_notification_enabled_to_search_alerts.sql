/*
  # Add notification_enabled column to search_alerts table
  
  ## Changes
  
  This migration adds the missing `notification_enabled` column to the `search_alerts` table.
  This column is required for the email digest system to work correctly.
  
  1. New Column
    - `notification_enabled` (boolean, default true)
      - Controls whether email notifications are sent for this alert
      - Used by the check-market-alerts Edge Function
      - Used by the send-market-digests Edge Function
  
  2. Data Migration
    - All existing alerts will have `notification_enabled` set to `true` by default
    - This ensures users continue to receive notifications for their existing alerts
  
  ## Why this is needed
  
  The check-market-alerts Edge Function filters alerts by:
  - is_active = true
  - notification_enabled = true
  
  Without this column, the Edge Function cannot find any alerts to process,
  and users never receive email digests even when alerts are triggered.
*/

-- Add notification_enabled column to search_alerts table
-- Using IF NOT EXISTS to make this migration idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'search_alerts' AND column_name = 'notification_enabled'
  ) THEN
    ALTER TABLE search_alerts
    ADD COLUMN notification_enabled boolean DEFAULT true NOT NULL;
    
    -- Create index for performance (used in WHERE clause by check-market-alerts)
    CREATE INDEX IF NOT EXISTS idx_search_alerts_notification_enabled
    ON search_alerts(notification_enabled)
    WHERE notification_enabled = true;
    
    -- Add comment for documentation
    COMMENT ON COLUMN search_alerts.notification_enabled IS
    'Controls whether email notifications are sent for this alert. Used by check-market-alerts and send-market-digests Edge Functions.';
  END IF;
END $$;