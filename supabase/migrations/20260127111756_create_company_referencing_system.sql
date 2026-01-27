/*
  # Company Referencing System for Collectivities

  1. New Tables
    - `company_profiles`
      - Complete company information for referencing and AI context
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `company_name` (text, required)
      - `legal_form` (text, e.g., SARL, SAS, Auto-entrepreneur)
      - `siret` (text)
      - `naf_code` (text)
      - `creation_date` (date)
      - `address` (text)
      - `postal_code` (text)
      - `city` (text)
      - `region` (text)
      - `phone` (text)
      - `email` (text)
      - `website` (text)
      - `main_activity` (text, description of main business)
      - `secondary_activities` (text array)
      - `certifications` (text array, e.g., Qualibat, RGE)
      - `insurance_info` (jsonb, insurance details)
      - `workforce` (integer)
      - `annual_turnover` (text)
      - `reference_projects` (jsonb, past projects)
      - `geographical_coverage` (text array, departments covered)
      - `equipment_list` (text array)
      - `subcontracting_capacity` (boolean)
      - `presentation` (text, company presentation)
      - `differentiators` (text, what makes company unique)
      - `target_markets` (text array, types of markets targeted)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `collectivities`
      - List of collectivities with contact information
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `type` (text, e.g., Commune, EPCI, Département, Région)
      - `department` (text, department code)
      - `region` (text)
      - `email` (text)
      - `additional_emails` (text array)
      - `phone` (text)
      - `address` (text)
      - `website` (text)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `referencing_requests`
      - Track referencing requests sent to collectivities
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `company_profile_id` (uuid, references company_profiles)
      - `collectivity_id` (uuid, references collectivities)
      - `status` (text, e.g., pending, sent, confirmed, rejected)
      - `sent_at` (timestamptz)
      - `response_received_at` (timestamptz)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own company profiles
    - Users can read collectivities information
    - Users can only access their own referencing requests
    - Admins can manage collectivities

  3. Indexes
    - Index on user_id for company_profiles
    - Index on department and region for collectivities
    - Index on user_id and status for referencing_requests
*/

-- Create company_profiles table
CREATE TABLE IF NOT EXISTS company_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_name text NOT NULL,
  legal_form text,
  siret text,
  naf_code text,
  creation_date date,
  address text,
  postal_code text,
  city text,
  region text DEFAULT 'La Réunion',
  phone text,
  email text,
  website text,
  main_activity text,
  secondary_activities text[] DEFAULT '{}',
  certifications text[] DEFAULT '{}',
  insurance_info jsonb DEFAULT '{}',
  workforce integer,
  annual_turnover text,
  reference_projects jsonb DEFAULT '[]',
  geographical_coverage text[] DEFAULT '{"974"}',
  equipment_list text[] DEFAULT '{}',
  subcontracting_capacity boolean DEFAULT false,
  presentation text,
  differentiators text,
  target_markets text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_company_profile UNIQUE (user_id)
);

-- Create collectivities table
CREATE TABLE IF NOT EXISTS collectivities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  department text DEFAULT '974',
  region text DEFAULT 'La Réunion',
  email text,
  additional_emails text[] DEFAULT '{}',
  phone text,
  address text,
  website text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create referencing_requests table
CREATE TABLE IF NOT EXISTS referencing_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_profile_id uuid REFERENCES company_profiles(id) ON DELETE CASCADE NOT NULL,
  collectivity_id uuid REFERENCES collectivities(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'confirmed', 'rejected')),
  sent_at timestamptz,
  response_received_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_collectivities_department ON collectivities(department);
CREATE INDEX IF NOT EXISTS idx_collectivities_region ON collectivities(region);
CREATE INDEX IF NOT EXISTS idx_collectivities_active ON collectivities(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_referencing_requests_user_id ON referencing_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_referencing_requests_status ON referencing_requests(status);
CREATE INDEX IF NOT EXISTS idx_referencing_requests_company_profile_id ON referencing_requests(company_profile_id);

-- Enable RLS
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE collectivities ENABLE ROW LEVEL SECURITY;
ALTER TABLE referencing_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for company_profiles
CREATE POLICY "Users can view own company profile"
  ON company_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own company profile"
  ON company_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own company profile"
  ON company_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own company profile"
  ON company_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for collectivities
CREATE POLICY "Authenticated users can view active collectivities"
  ON collectivities FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage collectivities"
  ON collectivities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- RLS Policies for referencing_requests
CREATE POLICY "Users can view own referencing requests"
  ON referencing_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own referencing requests"
  ON referencing_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own referencing requests"
  ON referencing_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own referencing requests"
  ON referencing_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_company_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_company_profiles_updated_at
  BEFORE UPDATE ON company_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_company_profile_updated_at();

CREATE TRIGGER update_collectivities_updated_at
  BEFORE UPDATE ON collectivities
  FOR EACH ROW
  EXECUTE FUNCTION update_company_profile_updated_at();

CREATE TRIGGER update_referencing_requests_updated_at
  BEFORE UPDATE ON referencing_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_company_profile_updated_at();