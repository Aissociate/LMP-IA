/*
  # Configuration administration

  1. Nouvelles tables
    - `admin_settings` - Paramètres globaux de l'application
    - `admin_prompts` - Prompts configurables pour l'IA
  
  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques pour admins uniquement
*/

-- Table pour les paramètres admin
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table pour les prompts configurables
CREATE TABLE IF NOT EXISTS admin_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_type text NOT NULL CHECK (prompt_type IN ('document_analysis', 'technical_memory')),
  section_key text,
  prompt_content text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_admin_prompts_type ON admin_prompts(prompt_type, section_key);

-- Activer RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_prompts ENABLE ROW LEVEL SECURITY;

-- Politiques pour admins uniquement (à ajuster selon votre logique d'admin)
CREATE POLICY "Admins can manage settings"
  ON admin_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (company ILIKE '%admin%' OR full_name ILIKE '%admin%')
    )
  );

CREATE POLICY "Admins can manage prompts"
  ON admin_prompts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_id = auth.uid() 
      AND (company ILIKE '%admin%' OR full_name ILIKE '%admin%')
    )
  );

-- Insérer les paramètres par défaut
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('openrouter_api_key', '""', 'Clé API OpenRouter'),
('selected_ai_model', '"openai/gpt-4"', 'Modèle IA sélectionné'),
('temperature', '0.7', 'Température de génération (0.0 - 2.0)'),
('max_tokens', '2000', 'Nombre maximum de tokens'),
('top_p', '1.0', 'Top P pour le sampling (0.0 - 1.0)')
ON CONFLICT (setting_key) DO NOTHING;

-- Insérer les prompts par défaut
INSERT INTO admin_prompts (prompt_type, section_key, prompt_content, description) VALUES
('document_analysis', 'default', 'Analysez ce document de marché public et identifiez les points clés, les exigences techniques, les critères d''évaluation et les recommandations pour la réponse.', 'Prompt par défaut pour l''analyse de documents'),
('technical_memory', 'presentation', 'Rédigez une présentation d''entreprise professionnelle mettant en avant l''expertise, l''historique et les valeurs de l''entreprise dans le contexte d''un marché public.', 'Prompt pour la section présentation du mémoire technique'),
('technical_memory', 'methodologie', 'Décrivez une méthodologie de travail structurée et une approche technique innovante pour la réalisation d''un projet de marché public.', 'Prompt pour la section méthodologie du mémoire technique')
ON CONFLICT DO NOTHING;