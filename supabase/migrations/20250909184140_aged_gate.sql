/*
  # Création des tables principales pour l'application de marchés publics

  1. Nouvelles Tables
    - `user_profiles` - Profils utilisateurs étendus
      - `user_id` (uuid, clé étrangère vers auth.users)
      - `full_name` (text, nom complet)
      - `company` (text, entreprise)
      - `phone` (text, téléphone)
      - `address` (text, adresse)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `markets` - Marchés publics
      - `id` (uuid, clé primaire)
      - `title` (text, titre du marché)
      - `reference` (text, référence)
      - `client` (text, nom du client)
      - `deadline` (date, date limite)
      - `budget` (numeric, budget)
      - `status` (text, statut)
      - `description` (text, description)
      - `user_id` (uuid, clé étrangère)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `bpus` - Fichiers BPU
      - `id` (uuid, clé primaire)
      - `name` (text, nom du fichier)
      - `file_path` (text, chemin du fichier)
      - `file_size` (bigint, taille du fichier)
      - `user_id` (uuid, clé étrangère)
      - `created_at` (timestamp)

    - `knowledge_files` - Base de connaissance
      - `id` (uuid, clé primaire)
      - `name` (text, nom du fichier)
      - `file_path` (text, chemin du fichier)
      - `file_size` (bigint, taille du fichier)
      - `category` (text, catégorie optionnelle)
      - `user_id` (uuid, clé étrangère)
      - `created_at` (timestamp)

  2. Sécurité
    - Activation de RLS sur toutes les tables
    - Politiques pour que les utilisateurs ne voient que leurs propres données
    - Bucket de stockage pour les fichiers uploadés

  3. Storage
    - Création du bucket 'uploads' pour les fichiers
    - Politiques de sécurité pour l'upload et l'accès aux fichiers
*/

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  company text,
  phone text,
  address text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des marchés
CREATE TABLE IF NOT EXISTS markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  reference text NOT NULL,
  client text NOT NULL,
  deadline date NOT NULL,
  budget numeric DEFAULT 0,
  status text DEFAULT 'en_cours' CHECK (status IN ('en_cours', 'soumis', 'gagne', 'perdu')),
  description text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des BPU
CREATE TABLE IF NOT EXISTS bpus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Table des fichiers de base de connaissance
CREATE TABLE IF NOT EXISTS knowledge_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL DEFAULT 0,
  category text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Activation de RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE bpus ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_files ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques RLS pour markets
CREATE POLICY "Users can view own markets"
  ON markets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own markets"
  ON markets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own markets"
  ON markets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own markets"
  ON markets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques RLS pour bpus
CREATE POLICY "Users can view own bpus"
  ON bpus
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bpus"
  ON bpus
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bpus"
  ON bpus
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Politiques RLS pour knowledge_files
CREATE POLICY "Users can view own knowledge files"
  ON knowledge_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own knowledge files"
  ON knowledge_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own knowledge files"
  ON knowledge_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_markets_user_id ON markets(user_id);
CREATE INDEX IF NOT EXISTS idx_markets_status ON markets(status);
CREATE INDEX IF NOT EXISTS idx_bpus_user_id ON bpus(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_files_user_id ON knowledge_files(user_id);

-- Bucket de stockage pour les uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Politiques de storage
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'uploads' AND (storage.foldername(name))[1] = auth.uid()::text);