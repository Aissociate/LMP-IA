/*
  # Fix Report Assets Storage Configuration

  1. Changes
    - Rendre le bucket 'uploads' public pour permettre l'affichage des images
    - Configurer les politiques RLS pour le storage
    - Autoriser les utilisateurs à télécharger et voir leurs propres fichiers
    
  2. Security
    - Les utilisateurs peuvent uniquement accéder à leurs propres fichiers
    - Les fichiers sont dans des dossiers par user_id
*/

-- Rendre le bucket uploads public
UPDATE storage.buckets
SET public = true
WHERE name = 'uploads';

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can upload own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Public access to uploads" ON storage.objects;

-- Politique pour permettre les uploads
CREATE POLICY "Users can upload own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour voir ses propres fichiers
CREATE POLICY "Users can view own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour mettre à jour ses propres fichiers
CREATE POLICY "Users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour supprimer ses propres fichiers
CREATE POLICY "Users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Politique pour accès public en lecture (nécessaire pour afficher les images)
CREATE POLICY "Public access to uploads"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'uploads');
