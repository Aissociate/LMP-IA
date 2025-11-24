/*
  # Create bug reports table

  1. New Tables
    - `bug_reports`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text)
      - `description` (text)
      - `screenshot_url` (text, nullable)
      - `status` (text: 'reported', 'in_progress', 'resolved')
      - `page_url` (text, nullable)
      - `user_agent` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
  2. Security
    - Enable RLS on `bug_reports` table
    - Policy for users to create their own bug reports
    - Policy for users to read their own bug reports
    - Policy for admins to read all bug reports
    - Policy for admins to update bug report status
*/

CREATE TABLE IF NOT EXISTS bug_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  screenshot_url text,
  status text DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved')),
  page_url text,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own bug reports"
  ON bug_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own bug reports"
  ON bug_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all bug reports"
  ON bug_reports
  FOR SELECT
  TO authenticated
  USING (is_user_admin(auth.uid()));

CREATE POLICY "Admins can update bug reports"
  ON bug_reports
  FOR UPDATE
  TO authenticated
  USING (is_user_admin(auth.uid()))
  WITH CHECK (is_user_admin(auth.uid()));

CREATE INDEX IF NOT EXISTS idx_bug_reports_user_id ON bug_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at DESC);

CREATE TRIGGER update_bug_reports_updated_at
  BEFORE UPDATE ON bug_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();