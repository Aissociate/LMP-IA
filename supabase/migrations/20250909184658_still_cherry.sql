/*
  # Fix RLS policies for file uploads

  1. Security Updates
    - Fix INSERT policies for knowledge_files table
    - Fix INSERT policies for bpus table
    - Ensure proper RLS policies for file operations

  2. Changes
    - Update INSERT policies to use proper auth.uid() checks
    - Add missing UPDATE policies where needed
*/

-- Fix knowledge_files policies
DROP POLICY IF EXISTS "Users can insert own knowledge files" ON knowledge_files;
DROP POLICY IF EXISTS "Users can update own knowledge files" ON knowledge_files;

CREATE POLICY "Users can insert own knowledge files"
  ON knowledge_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge files"
  ON knowledge_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Fix bpus policies
DROP POLICY IF EXISTS "Users can insert own bpus" ON bpus;
DROP POLICY IF EXISTS "Users can update own bpus" ON bpus;

CREATE POLICY "Users can insert own bpus"
  ON bpus
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bpus"
  ON bpus
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure storage policies are correct for uploads bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for uploads bucket
CREATE POLICY "Users can upload own files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);