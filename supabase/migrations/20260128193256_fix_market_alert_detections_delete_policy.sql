/*
  # Add DELETE Policy for Market Alert Detections

  1. Problem
    - Users cannot delete their own market alert detections
    - Missing DELETE policy on market_alert_detections table
    
  2. Solution
    - Add DELETE policy allowing users to delete their own detections
    - Ensures users can only delete detections belonging to them
    
  3. Security
    - Users can only delete detections where user_id = auth.uid()
    - Prevents unauthorized deletion of other users' detections
*/

-- Add DELETE policy for market_alert_detections
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'market_alert_detections' 
    AND policyname = 'Users can delete own market detections'
  ) THEN
    CREATE POLICY "Users can delete own market detections"
      ON market_alert_detections
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;