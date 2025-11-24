import { supabase } from './supabase';
import { SecurityValidation } from './securityValidation';

export class StripeService {
  private static instance: StripeService;

  static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  async createCheckoutSession(priceId: string, mode: 'payment' | 'subscription' = 'subscription') {
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