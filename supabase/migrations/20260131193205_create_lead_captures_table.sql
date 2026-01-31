/*
  # Create lead_captures table for lead generation

  1. New Tables
    - `lead_captures`
      - `id` (uuid, primary key)
      - `company_name` (text) - Company name
      - `legal_form` (text) - Legal structure
      - `siret` (text) - SIRET number
      - `naf_code` (text) - NAF/APE code
      - `creation_date` (date) - Company creation date
      - `address` (text) - Street address
      - `postal_code` (text) - Postal code
      - `city` (text) - City
      - `region` (text) - Region
      - `phone` (text) - Phone number
      - `email` (text) - Email address
      - `website` (text) - Website URL
      - `main_activity` (text) - Main business activity
      - `secondary_activities` (jsonb) - List of secondary activities
      - `certifications` (jsonb) - List of certifications
      - `insurance_info` (jsonb) - Insurance information
      - `workforce` (integer) - Number of employees
      - `annual_turnover` (text) - Annual revenue range
      - `reference_projects` (jsonb) - Reference projects
      - `geographical_coverage` (jsonb) - Covered departments
      - `equipment_list` (jsonb) - Equipment list
      - `subcontracting_capacity` (boolean) - Subcontracting capability
      - `presentation` (text) - Company presentation
      - `differentiators` (text) - Differentiating elements
      - `target_markets` (jsonb) - Target markets
      - `contact_person_name` (text) - Contact person name
      - `contact_person_role` (text) - Contact person role
      - `status` (text) - Lead status (pending, contacted, qualified, converted, lost)
      - `notes` (text) - Admin notes
      - `created_at` (timestamptz) - Timestamp of lead capture
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `lead_captures` table
    - Add policy for anonymous users to insert (lead capture form)
    - Add policy for admins to view and manage all leads
    - Add policy for authenticated users to view their own leads

  3. Indexes
    - Index on email for quick lookups
    - Index on status for filtering
    - Index on created_at for sorting
*/

-- Create lead_captures table
CREATE TABLE IF NOT EXISTS lead_captures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  legal_form text,
  siret text,
  naf_code text,
  creation_date date,
  address text,
  postal_code text,
  city text,
  region text DEFAULT 'La Réunion',
  phone text NOT NULL,
  email text NOT NULL,
  website text,
  main_activity text,
  secondary_activities jsonb DEFAULT '[]'::jsonb,
  certifications jsonb DEFAULT '[]'::jsonb,
  insurance_info jsonb DEFAULT '{}'::jsonb,
  workforce integer DEFAULT 0,
  annual_turnover text,
  reference_projects jsonb DEFAULT '[]'::jsonb,
  geographical_coverage jsonb DEFAULT '["974"]'::jsonb,
  equipment_list jsonb DEFAULT '[]'::jsonb,
  subcontracting_capacity boolean DEFAULT false,
  presentation text,
  differentiators text,
  target_markets jsonb DEFAULT '[]'::jsonb,
  contact_person_name text,
  contact_person_role text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'qualified', 'converted', 'lost')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lead_captures_email ON lead_captures(email);
CREATE INDEX IF NOT EXISTS idx_lead_captures_status ON lead_captures(status);
CREATE INDEX IF NOT EXISTS idx_lead_captures_created_at ON lead_captures(created_at DESC);

-- Enable RLS
ALTER TABLE lead_captures ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert (lead capture form submission)
CREATE POLICY "Anyone can submit lead capture form"
  ON lead_captures
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Admins can view all leads
CREATE POLICY "Admins can view all leads"
  ON lead_captures
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Admins can update all leads
CREATE POLICY "Admins can update all leads"
  ON lead_captures
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Policy: Authenticated users can view leads with their email
CREATE POLICY "Users can view their own leads"
  ON lead_captures
  FOR SELECT
  TO authenticated
  USING (
    email IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_lead_captures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_lead_captures_updated_at_trigger ON lead_captures;
CREATE TRIGGER update_lead_captures_updated_at_trigger
  BEFORE UPDATE ON lead_captures
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_captures_updated_at();
