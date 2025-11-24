/*
  # Configuration des politiques RLS pour l'upload de fichiers

  Ce fichier configure correctement les politiques Row-Level Security (RLS) 
  pour permettre aux utilisateurs authentifiés d'uploader des fichiers dans 
  la base de connaissance.

  ## Changements effectués
  
  1. **Bucket de stockage**
     - Création du bucket 'uploads' s'il n'existe pas
     - Configuration des politiques de stockage pour les utilisateurs authentifiés
  
  2. **Table knowledge_files**
     - Activation de RLS
     - Politique INSERT pour les utilisateurs authentifiés
     - Politiques SELECT, UPDATE, DELETE pour les propriétaires de fichiers
  
  3. **Table bpus** 
     - Configuration similaire pour la cohérence
*/

-- Créer le bucket uploads s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Authenticated users can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete own files" ON storage.objects;

-- Créer les politiques de stockage pour le bucket uploads
CREATE POLICY "Authenticated users can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads');

CREATE POLICY "Authenticated users can view own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can update own files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Authenticated users can delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Configuration des politiques RLS pour la table knowledge_files
ALTER TABLE knowledge_files ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can insert own knowledge files" ON knowledge_files;
DROP POLICY IF EXISTS "Users can view own knowledge files" ON knowledge_files;
DROP POLICY IF EXISTS "Users can update own knowledge files" ON knowledge_files;
DROP POLICY IF EXISTS "Users can delete own knowledge files" ON knowledge_files;

-- Créer les nouvelles politiques avec la syntaxe correcte
CREATE POLICY "Users can insert own knowledge files"
ON knowledge_files
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own knowledge files"
ON knowledge_files
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own knowledge files"
ON knowledge_files
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge files"
ON knowledge_files
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Configuration des politiques RLS pour la table bpus (pour cohérence)
ALTER TABLE bpus ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour bpus
DROP POLICY IF EXISTS "Users can insert own bpus" ON bpus;
DROP POLICY IF EXISTS "Users can view own bpus" ON bpus;
DROP POLICY IF EXISTS "Users can update own bpus" ON bpus;
DROP POLICY IF EXISTS "Users can delete own bpus" ON bpus;

-- Créer les nouvelles politiques pour bpus
CREATE POLICY "Users can insert own bpus"
ON bpus
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own bpus"
ON bpus
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own bpus"
ON bpus
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bpus"
ON bpus
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);