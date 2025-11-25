/*
  # Suppression complète du système d'abonnement

  1. Suppressions
    - Supprime toutes les tables liées aux abonnements et à Stripe
    - Supprime les fonctions d'aide pour les addons
    - Supprime les types enum Stripe

  2. Tables supprimées
    - subscription_plans
    - user_subscriptions
    - subscription_addons
    - addon_catalog
    - memory_credits
    - monthly_memory_usage
    - stripe_customers
    - stripe_subscriptions
    - stripe_orders
    - stripe_price_history
    - upsell_requests
*/

-- Supprimer les tables liées aux abonnements
DROP TABLE IF EXISTS upsell_requests CASCADE;
DROP TABLE IF EXISTS stripe_price_history CASCADE;
DROP TABLE IF EXISTS stripe_orders CASCADE;
DROP TABLE IF EXISTS stripe_subscriptions CASCADE;
DROP TABLE IF EXISTS stripe_customers CASCADE;
DROP TABLE IF EXISTS monthly_memory_usage CASCADE;
DROP TABLE IF EXISTS memory_credits CASCADE;
DROP TABLE IF EXISTS addon_catalog CASCADE;
DROP TABLE IF EXISTS subscription_addons CASCADE;
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- Supprimer les fonctions liées aux addons
DROP FUNCTION IF EXISTS get_user_addon_limit(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS has_active_addon(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS get_addon_remaining_quantity(uuid, text) CASCADE;

-- Supprimer les types enum Stripe
DROP TYPE IF EXISTS stripe_subscription_status CASCADE;
DROP TYPE IF EXISTS stripe_order_status CASCADE;