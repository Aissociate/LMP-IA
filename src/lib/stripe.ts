import { supabase } from './supabase';
import { SecurityValidation } from './securityValidation';

interface CheckoutItem {
  planId?: string;
  addonTypes?: string[];
  metadata?: Record<string, string>;
}

export class StripeService {
  private static instance: StripeService;

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async getPriceIdForPlan(planId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('stripe_price_id')
        .eq('id', planId)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data?.stripe_price_id) {
        console.error('Erreur récupération price_id pour le plan:', planId, error);
        return null;
      }

      return data.stripe_price_id;
    } catch (error) {
      console.error('Erreur getPriceIdForPlan:', error);
      return null;
    }
  }

  async getPriceIdForAddon(addonType: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('addon_catalog')
        .select('stripe_price_id')
        .eq('addon_type', addonType)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !data?.stripe_price_id) {
        console.error('Erreur récupération price_id pour l\'addon:', addonType, error);
        return null;
      }

      return data.stripe_price_id;
    } catch (error) {
      console.error('Erreur getPriceIdForAddon:', error);
      return null;
    }
  }

  async createCheckoutSessionFromPlan(planId: string, addonTypes: string[] = []): Promise<{ url: string; sessionId: string }> {
    try {
      const priceId = await this.getPriceIdForPlan(planId);
      if (!priceId) {
        throw new Error(`Aucun price_id Stripe trouvé pour le plan: ${planId}`);
      }

      const addonPriceIds: string[] = [];
      for (const addonType of addonTypes) {
        const addonPriceId = await this.getPriceIdForAddon(addonType);
        if (addonPriceId) {
          addonPriceIds.push(addonPriceId);
        }
      }

      return await this.createCheckoutSession(priceId, 'subscription', {
        plan_id: planId,
        addon_types: addonTypes.join(','),
      });
    } catch (error) {
      console.error('Erreur createCheckoutSessionFromPlan:', error);
      throw error;
    }
  }

  async createCheckoutSessionForAddons(addonTypes: string[]): Promise<{ url: string; sessionId: string }> {
    try {
      if (!addonTypes || addonTypes.length === 0) {
        throw new Error('Aucun addon sélectionné');
      }

      const firstAddonPriceId = await this.getPriceIdForAddon(addonTypes[0]);
      if (!firstAddonPriceId) {
        throw new Error(`Aucun price_id Stripe trouvé pour l'addon: ${addonTypes[0]}`);
      }

      return await this.createCheckoutSession(firstAddonPriceId, 'payment', {
        addon_types: addonTypes.join(','),
        purchase_type: 'addons_only',
      });
    } catch (error) {
      console.error('Erreur createCheckoutSessionForAddons:', error);
      throw error;
    }
  }

  async createCheckoutSession(priceId: string, mode: 'payment' | 'subscription' = 'subscription', metadata: Record<string, string> = {}) {
    try {
      // Validation de sécurité
      if (!priceId || typeof priceId !== 'string' || priceId.length > 100) {
        throw new Error('Price ID invalide');
      }
      
      if (!['payment', 'subscription'].includes(mode)) {
        throw new Error('Mode de paiement invalide');
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Utilisateur non authentifié');
      }

      // Vérifier que l'utilisateur est toujours valide
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Session utilisateur invalide');
      }

      const checkoutUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;
      
      // Validation de l'URL de base
      if (!import.meta.env.VITE_SUPABASE_URL) {
        throw new Error('Configuration Supabase manquante');
      }
      
      const response = await fetch(checkoutUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest', // Protection CSRF basique
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/parametres?checkout=success`,
          cancel_url: `${window.location.origin}/parametres?checkout=cancel`,
          mode,
          metadata,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        // Ne pas exposer d'infos sensibles dans les erreurs
        if (response.status === 401) {
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        if (response.status === 403) {
          throw new Error('Accès non autorisé');
        }
        throw new Error(`Erreur HTTP ${response.status}: ${errorData}`);
      }

      const { url, sessionId } = await response.json();
      
      if (!url) {
        throw new Error('URL de checkout non reçue');
      }
      
      // Validation de l'URL de retour
      try {
        new URL(url);
      } catch {
        throw new Error('URL de checkout invalide reçue');
      }

      return { url, sessionId };
    } catch (error) {
      console.error('Erreur création session checkout:', error);
      throw error;
    }
  }

  async getUserSubscription() {
    try {
      const { data: subscription, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // Pas d'erreur si pas de données
        throw error;
      }

      return subscription;
    } catch (error) {
      console.error('Erreur récupération abonnement:', error);
      return null;
    }
  }

  async getUserOrders() {
    try {
      const { data: orders, error } = await supabase
        .from('stripe_user_orders')
        .select('*')
        .order('order_date', { ascending: false });

      if (error) {
        throw error;
      }

      return orders || [];
    } catch (error) {
      console.error('Erreur récupération commandes:', error);
      return [];
    }
  }
}

export const stripeService = StripeService.getInstance();