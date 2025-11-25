/*
  # Ajout des politiques RLS pour admin_settings et stripe_price_history
  
  1. admin_settings
    - Lecture publique pour authenticated
    - Modification réservée au service_role
    
  2. stripe_price_history
    - Lecture réservée au service_role
    - Toutes opérations réservées au service_role
*/

-- admin_settings : Lecture publique, modification admin only
CREATE POLICY "Anyone can view admin settings"
  ON admin_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage admin settings"
  ON admin_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- stripe_price_history : Accès service_role uniquement
CREATE POLICY "Service role can view price history"
  ON stripe_price_history FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage price history"
  ON stripe_price_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);