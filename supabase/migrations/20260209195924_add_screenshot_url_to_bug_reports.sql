/*
  # Add screenshot_url column to bug_reports

  1. Modified Tables
    - `bug_reports`
      - Add `screenshot_url` (text, nullable) for storing bug report screenshots

  2. Notes
    - Aligns table schema with frontend code that uploads screenshots with bug reports
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'bug_reports' AND column_name = 'screenshot_url'
  ) THEN
    ALTER TABLE bug_reports ADD COLUMN screenshot_url text;
  END IF;
END $$;
