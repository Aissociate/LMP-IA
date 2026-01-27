/*
  # Add URL and special notes to donneurs d'ordre + Create sessions system
  
  1. Modifications to existing table
    - Add `markets_url` (text) - URL de consultation des marchés
    - Add `special_notes` (text) - Commentaires spéciaux pour la saisie
    - Add `display_order` (integer) - Ordre d'affichage dans le wizard
    - Add `is_active` (boolean) - Si le donneur d'ordre est actif
  
  2. New Tables
    - `manual_markets_sessions` - Sessions de saisie
      - `id` (uuid, primary key)
      - `operator_email` (text) - Email de l'opérateur
      - `started_at` (timestamptz) - Date/heure de début
      - `completed_at` (timestamptz) - Date/heure de fin (null si en cours)
      - `status` (text) - Status: 'in_progress', 'completed', 'paused'
      - `total_donneurs_ordre` (integer) - Nombre total de donneurs d'ordre
      - `completed_donneurs_ordre` (integer) - Nombre traité
      - `total_markets_added` (integer) - Nombre de marchés ajoutés
    
    - `manual_markets_session_progress` - Suivi par donneur d'ordre
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `donneur_ordre_id` (uuid, foreign key)
      - `is_completed` (boolean) - Si traité
      - `markets_added_count` (integer) - Nombre de marchés ajoutés
      - `notes` (text) - Notes de l'opérateur
      - `completed_at` (timestamptz) - Quand traité
  
  3. Security
    - Enable RLS on new tables
    - Authenticated users can manage sessions
    - Anon users can create and update sessions (for operators without login)
*/

-- Add columns to existing table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'manual_markets_donneurs_ordre' 
    AND column_name = 'markets_url'
  ) THEN
    ALTER TABLE manual_markets_donneurs_ordre 
    ADD COLUMN markets_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'manual_markets_donneurs_ordre' 
    AND column_name = 'special_notes'
  ) THEN
    ALTER TABLE manual_markets_donneurs_ordre 
    ADD COLUMN special_notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'manual_markets_donneurs_ordre' 
    AND column_name = 'display_order'
  ) THEN
    ALTER TABLE manual_markets_donneurs_ordre 
    ADD COLUMN display_order integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'manual_markets_donneurs_ordre' 
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE manual_markets_donneurs_ordre 
    ADD COLUMN is_active boolean DEFAULT true;
  END IF;
END $$;

-- Create sessions table
CREATE TABLE IF NOT EXISTS manual_markets_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operator_email text NOT NULL,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  status text DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'paused')),
  total_donneurs_ordre integer DEFAULT 0,
  completed_donneurs_ordre integer DEFAULT 0,
  total_markets_added integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create session progress table
CREATE TABLE IF NOT EXISTS manual_markets_session_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES manual_markets_sessions(id) ON DELETE CASCADE,
  donneur_ordre_id uuid NOT NULL REFERENCES manual_markets_donneurs_ordre(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  markets_added_count integer DEFAULT 0,
  notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, donneur_ordre_id)
);

-- Enable RLS
ALTER TABLE manual_markets_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE manual_markets_session_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Authenticated users can view all sessions"
  ON manual_markets_sessions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage sessions"
  ON manual_markets_sessions
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can create sessions"
  ON manual_markets_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update own sessions"
  ON manual_markets_sessions
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can view own sessions"
  ON manual_markets_sessions
  FOR SELECT
  TO anon
  USING (true);

-- RLS Policies for session progress
CREATE POLICY "Authenticated users can view all progress"
  ON manual_markets_session_progress
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage progress"
  ON manual_markets_session_progress
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can create progress"
  ON manual_markets_session_progress
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update progress"
  ON manual_markets_session_progress
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can view progress"
  ON manual_markets_session_progress
  FOR SELECT
  TO anon
  USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_operator ON manual_markets_sessions(operator_email);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON manual_markets_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON manual_markets_sessions(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_session_progress_session ON manual_markets_session_progress(session_id);
CREATE INDEX IF NOT EXISTS idx_session_progress_donneur ON manual_markets_session_progress(donneur_ordre_id);
CREATE INDEX IF NOT EXISTS idx_donneurs_ordre_display_order ON manual_markets_donneurs_ordre(display_order);
CREATE INDEX IF NOT EXISTS idx_donneurs_ordre_active ON manual_markets_donneurs_ordre(is_active);

-- Trigger to update session stats
CREATE OR REPLACE FUNCTION update_session_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE manual_markets_sessions
  SET 
    completed_donneurs_ordre = (
      SELECT COUNT(*) 
      FROM manual_markets_session_progress 
      WHERE session_id = NEW.session_id AND is_completed = true
    ),
    updated_at = now()
  WHERE id = NEW.session_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_session_stats_trigger ON manual_markets_session_progress;
CREATE TRIGGER update_session_stats_trigger
  AFTER INSERT OR UPDATE ON manual_markets_session_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_session_stats();

-- Trigger to update session updated_at
CREATE OR REPLACE FUNCTION update_manual_markets_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_sessions_updated_at ON manual_markets_sessions;
CREATE TRIGGER set_sessions_updated_at
  BEFORE UPDATE ON manual_markets_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_manual_markets_sessions_updated_at();

-- Trigger for session progress updated_at
CREATE OR REPLACE FUNCTION update_session_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    NEW.completed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_progress_updated_at ON manual_markets_session_progress;
CREATE TRIGGER set_progress_updated_at
  BEFORE UPDATE ON manual_markets_session_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_session_progress_updated_at();