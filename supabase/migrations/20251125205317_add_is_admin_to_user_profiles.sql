/*
  # Add is_admin column to user_profiles

  1. Changes
    - Add `is_admin` boolean column to `user_profiles` table
    - Set default value to false
    - Add index for faster queries

  2. Notes
    - Existing users will have is_admin = false by default
    - Admins must be set manually via SQL update
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN is_admin boolean DEFAULT false NOT NULL;
    CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin) WHERE is_admin = true;
  END IF;
END $$;