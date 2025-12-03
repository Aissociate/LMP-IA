/*
  # Système de Coffre-Fort Sécurisé

  ## Description
  Ce système permet aux utilisateurs de stocker leurs documents administratifs sensibles de manière sécurisée.

  ## 1. Nouvelles Tables
    - `secure_documents`
      - `id` (uuid, primary key) - Identifiant unique du document
      - `user_id` (uuid, foreign key) - Propriétaire du document
      - `document_type` (text) - Type de document (kbis, bilan_1, bilan_2, bilan_3, attestation_sociale, attestation_fiscale, cni_recto, cni_verso, rib)
      - `file_name` (text) - Nom original du fichier
      - `file_path` (text) - Chemin dans le storage
      - `file_size` (bigint) - Taille du fichier en octets
      - `mime_type` (text) - Type MIME du fichier
      - `uploaded_at` (timestamptz) - Date d'upload
      - `expires_at` (timestamptz, nullable) - Date d'expiration du document
      - `notes` (text, nullable) - Notes ou commentaires sur le document

  ## 2. Storage
    - Création du bucket `secure-documents` pour stocker les fichiers
    - Bucket privé avec chiffrement

  ## 3. Sécurité
    - Enable RLS sur `secure_documents`
    - Policies strictes : utilisateurs peuvent uniquement accéder à leurs propres documents
    - Policies sur le storage pour contrôler l'accès aux fichiers
    - Un seul document par type et par utilisateur (contrainte unique)

  ## 4. Notes Importantes
    - Les fichiers sont stockés dans le bucket `secure-documents`
    - Chaque utilisateur a son propre dossier : `{user_id}/{document_type}_{timestamp}.{ext}`
    - Les documents sensibles ont une durée de validité (expires_at)
*/

-- Create secure_documents table
CREATE TABLE IF NOT EXISTS secure_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (
    document_type IN (
      'kbis',
      'bilan_1',
      'bilan_2',
      'bilan_3',
      'attestation_sociale',
      'attestation_fiscale',
      'cni_recto',
      'cni_verso',
      'rib'
    )
  ),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL CHECK (file_size > 0),
  mime_type text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  notes text,
  UNIQUE(user_id, document_type)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_secure_documents_user_id ON secure_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_secure_documents_type ON secure_documents(user_id, document_type);
CREATE INDEX IF NOT EXISTS idx_secure_documents_expires_at ON secure_documents(expires_at) WHERE expires_at IS NOT NULL;

-- Enable RLS
ALTER TABLE secure_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for secure_documents
CREATE POLICY "Users can view their own secure documents"
  ON secure_documents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own secure documents"
  ON secure_documents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own secure documents"
  ON secure_documents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own secure documents"
  ON secure_documents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for secure documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'secure-documents',
  'secure-documents',
  false,
  10485760, -- 10MB limit per file
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for secure-documents bucket
CREATE POLICY "Users can upload their own secure documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'secure-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own secure documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'secure-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own secure documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'secure-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'secure-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own secure documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'secure-documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );