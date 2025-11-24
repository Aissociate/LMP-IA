/*
  # Create subscription system tables

  1. New Tables
    - `subscription_plans`
      - `id` (text, primary key)
      - `name` (text, plan name)
      - `price` (numeric, monthly price)
      - `technical_memories_limit` (integer, -1 for unlimited)
      - `features` (jsonb, list of features)
      - `is_unlimited` (boolean, unlimited flag)
      - `is_active` (boolean, plan status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `plan_id` (text, foreign key to subscription_plans)
      - `technical_memories_used` (integer, current usage)
      - `technical_memories_limit` (integer, plan limit)
      - `expires_at` (timestamp, subscription expiry)
      - `is_active` (boolean, subscription status)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read subscription plans
    - Add policies for users to manage their own subscriptions
    - Add admin policies for subscription management

  3. Default Data
    - Insert default subscription plans (Admin, Freemium, Basic, Pro, Expert, Unlimited)
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id text PRIMARY KEY,
    name text NOT NULL,
    price numeric NOT NULL DEFAULT 0,
    technical_memories_limit integer NOT NULL DEFAULT 1,
    features jsonb NOT NULL DEFAULT '[]'::jsonb,
    is_unlimited boolean NOT NULL DEFAULT false,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    plan_id text NOT NULL,
    technical_memories_used integer NOT NULL DEFAULT 0,
    technical_memories_limit integer NOT NULL DEFAULT 1,
    expires_at timestamptz,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    CONSTRAINT fk_user_subscriptions_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_subscriptions_plan_id FOREIGN KEY (plan_id) REFERENCES public.subscription_plans(id) ON DELETE RESTRICT
);

-- Enable RLS
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans
CREATE POLICY "Enable read access for all authenticated users" 
ON public.subscription_plans FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable all operations for admins on subscription_plans" 
ON public.subscription_plans FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND (company ILIKE '%admin%' OR full_name ILIKE '%admin%')
  )
);

-- Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" 
ON public.user_subscriptions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscriptions" 
ON public.user_subscriptions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions" 
ON public.user_subscriptions FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions" 
ON public.user_subscriptions FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND (company ILIKE '%admin%' OR full_name ILIKE '%admin%')
  )
);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (id, name, price, technical_memories_limit, features, is_unlimited, is_active) VALUES
('admin', 'Admin', 0, -1, '["Accès administrateur complet", "Mémoires techniques illimitées", "Analyses de documents illimitées", "Agent de sourcing illimité", "Gestion des utilisateurs", "Configuration système", "Support technique dédié"]'::jsonb, true, true),
('freemium', 'Freemium', 0, 1, '["1 mémoire technique", "Analyses de documents illimitées", "Agent de sourcing limité", "Support communautaire"]'::jsonb, false, true),
('basic', 'Basic', 99.90, 1, '["1 mémoire technique par mois", "Analyses de documents illimitées", "Agent de sourcing illimité", "Support email", "Marchés à l''unité (+39.90€)"]'::jsonb, false, true),
('pro', 'Pro', 349.90, 5, '["5 mémoires techniques par mois", "Analyses de documents illimitées", "Agent de sourcing illimité", "Support prioritaire", "Marchés à l''unité (+39.90€)", "Statistiques avancées"]'::jsonb, false, true),
('expert', 'Expert', 499.90, 10, '["10 mémoires techniques par mois", "Analyses de documents illimitées", "Agent de sourcing illimité", "Support prioritaire", "Marchés à l''unité (+39.90€)", "Statistiques avancées", "Formation personnalisée"]'::jsonb, false, true),
('unlimited', 'Illimité', 999.00, -1, '["Mémoires techniques illimitées", "Analyses de documents illimitées", "Agent de sourcing illimité", "Support dédié 24/7", "Statistiques avancées", "Formation personnalisée", "API access", "White-label"]'::jsonb, true, true)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_id ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_active ON public.user_subscriptions(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON public.subscription_plans(is_active);