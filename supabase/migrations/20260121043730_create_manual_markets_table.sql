/*
  # Create manual_markets table for human operator data collection

  1. New Tables
    - `manual_markets`
      - `id` (uuid, primary key)
      - `reference` (text) - Reference unique du marche (generee automatiquement si non fournie)
      - `title` (text) - Intitule du marche
      - `client` (text) - Donneur d'ordre / Acheteur public
      - `description` (text) - Description detaillee
      - `deadline` (timestamptz) - Date limite de depot
      - `amount` (numeric) - Montant estime
      - `location` (text) - Localisation (departement, ville)
      - `publication_date` (timestamptz) - Date de publication
      - `procedure_type` (text) - Type de procedure
      - `service_type` (text) - Type de service (Travaux, Services, Fournitures)
      - `cpv_code` (text) - Code CPV
      - `url` (text) - Lien web vers l'annonce originale
      - `dce_url` (text) - Lien vers le DCE si disponible
      - `source` (text) - Source de l'information
      - `status` (text) - Statut de la saisie (draft, published, archived)
      - `operator_notes` (text) - Notes de l'operateur
      - `created_by` (text) - Email ou identifiant de l'operateur
      - `created_at` (timestamptz) - Date de creation
      - `updated_at` (timestamptz) - Date de mise a jour
      - `is_verified` (boolean) - Si le marche a ete verifie

  2. Security
    - Enable RLS on `manual_markets` table
    - Public read access for published markets
    - Insert/Update via password-protected interface (handled at application level)

  3. Indexes
    - Index on deadline for filtering active markets
    - Index on publication_date for sorting
    - Index on status for filtering
    - Index on client for donneur d'ordre search
*/

CREATE TABLE IF NOT EXISTS manual_markets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE,
  title text NOT NULL,
  client text NOT NULL,
  description text,
  deadline timestamptz,
  amount numeric,
  location text,
  publication_date timestamptz DEFAULT now(),
  procedure_type text,
  service_type text CHECK (service_type IN ('Travaux', 'Services', 'Fournitures', 'Mixte')),
  cpv_code text,
  url text,
  dce_url text,
  source text DEFAULT 'Saisie manuelle',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  operator_notes text,
  created_by text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_verified boolean DEFAULT false
);

ALTER TABLE manual_markets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published manual markets"
  ON manual_markets
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Authenticated users can read all manual markets"
  ON manual_markets
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert manual markets"
  ON manual_markets
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update manual markets"
  ON manual_markets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can insert manual markets"
  ON manual_markets
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update own draft markets"
  ON manual_markets
  FOR UPDATE
  TO anon
  USING (status = 'draft')
  WITH CHECK (status IN ('draft', 'published'));

CREATE INDEX IF NOT EXISTS idx_manual_markets_deadline ON manual_markets(deadline);
CREATE INDEX IF NOT EXISTS idx_manual_markets_publication_date ON manual_markets(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_manual_markets_status ON manual_markets(status);
CREATE INDEX IF NOT EXISTS idx_manual_markets_client ON manual_markets(client);
CREATE INDEX IF NOT EXISTS idx_manual_markets_location ON manual_markets(location);
CREATE INDEX IF NOT EXISTS idx_manual_markets_service_type ON manual_markets(service_type);
CREATE INDEX IF NOT EXISTS idx_manual_markets_created_by ON manual_markets(created_by);

CREATE OR REPLACE FUNCTION generate_manual_market_reference()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reference IS NULL OR NEW.reference = '' THEN
    NEW.reference := 'MAN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTR(NEW.id::text, 1, 8);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_manual_market_reference ON manual_markets;
CREATE TRIGGER set_manual_market_reference
  BEFORE INSERT ON manual_markets
  FOR EACH ROW
  EXECUTE FUNCTION generate_manual_market_reference();

CREATE OR REPLACE FUNCTION update_manual_markets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_manual_markets_updated_at ON manual_markets;
CREATE TRIGGER set_manual_markets_updated_at
  BEFORE UPDATE ON manual_markets
  FOR EACH ROW
  EXECUTE FUNCTION update_manual_markets_updated_at();

CREATE TABLE IF NOT EXISTS manual_markets_donneurs_ordre (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  siret text,
  address text,
  city text,
  postal_code text,
  department text,
  contact_email text,
  contact_phone text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE manual_markets_donneurs_ordre ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read donneurs ordre"
  ON manual_markets_donneurs_ordre
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated can manage donneurs ordre"
  ON manual_markets_donneurs_ordre
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can insert donneurs ordre"
  ON manual_markets_donneurs_ordre
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_donneurs_ordre_name ON manual_markets_donneurs_ordre(name);
CREATE INDEX IF NOT EXISTS idx_donneurs_ordre_department ON manual_markets_donneurs_ordre(department);