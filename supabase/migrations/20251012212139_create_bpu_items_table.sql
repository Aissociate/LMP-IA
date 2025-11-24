/*
  # Create BPU Items Table

  ## Description
  Create table for storing Bordereau des Prix Unitaires (BPU) items for economic documents.
  Each market can have multiple BPU items with pricing details.

  1. New Tables
    - `bpu_items`
      - `id` (uuid, primary key)
      - `market_id` (uuid, foreign key to markets)
      - `user_id` (uuid, foreign key to auth.users)
      - `numero` (text) - Item number
      - `designation` (text) - Item description
      - `unite` (text) - Unit of measurement
      - `quantite` (numeric) - Estimated quantity
      - `prix_unitaire` (numeric) - Unit price HT
      - `total_ht` (numeric) - Total price HT
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `bpu_items` table
    - Add policies for authenticated users to manage their own BPU items
*/

-- Create bpu_items table
CREATE TABLE IF NOT EXISTS bpu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_id uuid NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  numero text NOT NULL DEFAULT '',
  designation text NOT NULL DEFAULT '',
  unite text NOT NULL DEFAULT '',
  quantite numeric(12,2) NOT NULL DEFAULT 0,
  prix_unitaire numeric(12,2) NOT NULL DEFAULT 0,
  total_ht numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bpu_items_market_id ON bpu_items(market_id);
CREATE INDEX IF NOT EXISTS idx_bpu_items_user_id ON bpu_items(user_id);

-- Enable Row Level Security
ALTER TABLE bpu_items ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view own BPU items"
  ON bpu_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own BPU items"
  ON bpu_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own BPU items"
  ON bpu_items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own BPU items"
  ON bpu_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_bpu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_bpu_items_timestamp
  BEFORE UPDATE ON bpu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_bpu_items_updated_at();