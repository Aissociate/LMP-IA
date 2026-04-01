/*
  # Create missing storage buckets and fix uploads bucket

  1. Fix existing bucket
    - `uploads` - Set to public so getPublicUrl works correctly

  2. New buckets
    - `marketing-videos` - Public bucket for marketing video uploads (100MB limit)
    - `report-assets` - Public bucket for bug report screenshots (10MB limit)

  3. Security
    - RLS policies on all new buckets for authenticated users
    - Path-based ownership checks using auth.uid()
*/

UPDATE storage.buckets
SET public = true
WHERE id = 'uploads';

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'marketing-videos',
  'marketing-videos',
  true,
  104857600,
  ARRAY['video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 104857600,
  allowed_mime_types = ARRAY['video/mp4', 'video/webm', 'video/quicktime'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-assets',
  'report-assets',
  true,
  10485760,
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

CREATE POLICY "Authenticated users can upload marketing videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'marketing-videos');

CREATE POLICY "Anyone can view marketing videos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'marketing-videos');

CREATE POLICY "Authenticated users can delete marketing videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'marketing-videos');

CREATE POLICY "Authenticated users can upload report assets"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'report-assets'
    AND (storage.foldername(name))[1] = 'screenshots'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Anyone can view report assets"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'report-assets');

CREATE POLICY "Users can delete own report assets"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'report-assets'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );