/*
  # Fix RLS policies for file uploads

  1. Storage Policies
    - Create uploads bucket if not exists
    - Add proper INSERT, SELECT, UPDATE, DELETE policies for uploads bucket
    
  2. Table Policies
    - Fix knowledge_files table policies
    - Fix bpus table policies
    - Ensure proper auth.uid() usage
    
  3. Security
    - Enable RLS on all tables
    - Ensure users can only access their own data
*/

-- Create uploads bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to recreate them
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;

-- Create storage policies for uploads bucket
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Fix knowledge_files table policies
DROP POLICY IF EXISTS "Users can insert own knowledge files" ON knowledge_files;
DROP POLICY IF EXISTS "Users can view own knowledge files" ON knowledge_files;
DROP POLICY IF EXISTS "Users can update own knowledge files" ON knowledge_files;
DROP POLICY IF EXISTS "Users can delete own knowledge files" ON knowledge_files;

CREATE POLICY "Users can insert own knowledge files"
ON knowledge_files FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own knowledge files"
ON knowledge_files FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge files"
ON knowledge_files FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge files"
ON knowledge_files FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Fix bpus table policies
DROP POLICY IF EXISTS "Users can insert own bpus" ON bpus;
DROP POLICY IF EXISTS "Users can view own bpus" ON bpus;
DROP POLICY IF EXISTS "Users can update own bpus" ON bpus;
DROP POLICY IF EXISTS "Users can delete own bpus" ON bpus;

CREATE POLICY "Users can insert own bpus"
ON bpus FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own bpus"
ON bpus FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own bpus"
ON bpus FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bpus"
ON bpus FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Ensure RLS is enabled on all tables
ALTER TABLE knowledge_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE bpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;