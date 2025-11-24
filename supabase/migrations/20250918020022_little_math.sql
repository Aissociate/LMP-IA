/*
  # Create feature comments system

  1. New Tables
    - `feature_comments`
      - `id` (uuid, primary key)
      - `feature_request_id` (uuid, references feature_requests)
      - `user_id` (uuid, references users)
      - `content` (text, comment content)
      - `image_url` (text, optional image attachment)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `is_deleted` (boolean, soft delete)
  
  2. Security
    - Enable RLS on `feature_comments` table
    - Add policies for authenticated users to CRUD their own comments
    - Add policy for read access to all authenticated users
    
  3. Indexes
    - Index on feature_request_id for fast comment retrieval
    - Index on created_at for chronological ordering
*/

CREATE TABLE IF NOT EXISTS feature_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_request_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_deleted boolean DEFAULT false
);

ALTER TABLE feature_comments ENABLE ROW LEVEL SECURITY;

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_feature_comments_feature_id 
  ON feature_comments (feature_request_id, created_at);

CREATE INDEX IF NOT EXISTS idx_feature_comments_user_id 
  ON feature_comments (user_id);

-- Contrainte de clé étrangère
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'feature_comments_feature_request_id_fkey'
  ) THEN
    ALTER TABLE feature_comments 
    ADD CONSTRAINT feature_comments_feature_request_id_fkey 
    FOREIGN KEY (feature_request_id) REFERENCES feature_requests(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Policies RLS
CREATE POLICY "Anyone can read non-deleted comments"
  ON feature_comments
  FOR SELECT
  TO authenticated
  USING (is_deleted = false);

CREATE POLICY "Users can insert their own comments"
  ON feature_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON feature_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON feature_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all comments"
  ON feature_comments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (
        user_profiles.company ILIKE '%admin%'
        OR user_profiles.full_name ILIKE '%admin%'
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND (
        user_profiles.company ILIKE '%admin%'
        OR user_profiles.full_name ILIKE '%admin%'
      )
    )
  );

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_feature_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_feature_comments_updated_at'
  ) THEN
    CREATE TRIGGER update_feature_comments_updated_at
      BEFORE UPDATE ON feature_comments
      FOR EACH ROW
      EXECUTE FUNCTION update_feature_comments_updated_at();
  END IF;
END $$;