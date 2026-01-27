/*
  # Fix market_alert_detections INSERT policy

  1. Changes
    - Add missing INSERT policy for market_alert_detections table
    - Users can insert their own detections
    
  2. Security
    - Users can only insert detections for their own user_id
    - Ensures proper authorization for creating detections
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'market_alert_detections' 
    AND policyname = 'Users can insert own market detections'
  ) THEN
    CREATE POLICY "Users can insert own market detections"
      ON market_alert_detections
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;