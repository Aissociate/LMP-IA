/*
  # Création de la table des factures

  ## Changements

  1. **Nouvelle table `invoices`**
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key vers auth.users)
    - `stripe_invoice_id` (text, unique) - ID de la facture Stripe
    - `subscription_id` (uuid, foreign key vers user_subscriptions)
    - `amount` (numeric) - Montant de la facture
    - `currency` (text) - Devise (EUR par défaut)
    - `status` (text) - Statut de la facture (paid, open, void, uncollectible)
    - `invoice_pdf` (text) - URL du PDF de la facture
    - `invoice_number` (text) - Numéro de facture
    - `invoice_date` (timestamptz) - Date de la facture
    - `period_start` (timestamptz) - Début de la période facturée
    - `period_end` (timestamptz) - Fin de la période facturée
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. **Security**
    - Enable RLS sur la table invoices
    - Les utilisateurs peuvent voir uniquement leurs propres factures
    - Les admins peuvent voir toutes les factures

  3. **Indexes**
    - Index sur user_id pour les requêtes rapides
    - Index sur stripe_invoice_id pour les webhooks Stripe
*/

-- Créer la table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id text UNIQUE,
  subscription_id uuid REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL,
  currency text DEFAULT 'EUR',
  status text NOT NULL DEFAULT 'open',
  invoice_pdf text,
  invoice_number text,
  invoice_date timestamptz NOT NULL DEFAULT now(),
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Les utilisateurs peuvent voir leurs propres factures
CREATE POLICY "Users can view own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Les admins peuvent voir toutes les factures
CREATE POLICY "Admins can view all invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Les admins peuvent insérer des factures (via webhook)
CREATE POLICY "Admins can insert invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Les admins peuvent mettre à jour les factures
CREATE POLICY "Admins can update invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.user_id = auth.uid()
      AND user_profiles.is_admin = true
    )
  );

-- Indexes pour les performances
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date DESC);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS trigger_update_invoices_updated_at ON invoices;
CREATE TRIGGER trigger_update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_invoices_updated_at();
