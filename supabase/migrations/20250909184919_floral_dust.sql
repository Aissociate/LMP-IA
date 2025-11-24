/*
  # Fix RLS policies for file uploads - Final Solution

  1. Storage Setup
    - Create uploads bucket if it doesn't exist
    - Set up proper storage policies for authenticated users
    
  2. Table Policies
    - Drop and recreate all RLS policies with correct syntax
    - Ensure proper permissions for authenticated users
    
  3. Security
    - Enable RLS on all tables
    - Use auth.uid() for user identification
*/

-- Create storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Create storage policies for uploads bucket
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Ensure RLS is enabled on tables
ALTER TABLE knowledge_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE bpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing table policies to avoid conflicts
DROP POLICY IF EXISTS "Users can insert own knowledge files" ON knowledge_files;
DROP POLICY IF EXISTS "Users can view own knowledge files" ON knowledge_files;
DROP POLICY IF EXISTS "Users can update own knowledge files" ON knowledge_files;
DROP POLICY IF EXISTS "Users can delete own knowledge files" ON knowledge_files;

DROP POLICY IF EXISTS "Users can insert own bpus" ON bpus;
DROP POLICY IF EXISTS "Users can view own bpus" ON bpus;
DROP POLICY IF EXISTS "Users can update own bpus" ON bpus;
DROP POLICY IF EXISTS "Users can delete own bpus" ON bpus;

-- Create knowledge_files policies
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

-- Create bpus policies
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