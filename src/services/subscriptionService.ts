import { supabase } from '../lib/supabase';

export interface MemoryUsageResult {
  success: boolean;
  error?: string;
  message?: string;
  used?: number;
  limit?: number;
  remaining?: number;
}

export interface MemoryStats {
  plan_name: string;
  limit: number;
  used: number;
  remaining: number;
  rollover_credits: number;
  extra_credits: number;
  total_limit: number;
  period_start: string;
  period_end: string;
  status: string;
}

export class SubscriptionService {
  private static instance: SubscriptionService;

  private constructor() {}

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  async checkMemoryLimit(userId: string): Promise<MemoryUsageResult> {
    try {
      const stats = await this.getMemoryStats(userId);

      if (stats.used >= stats.limit) {
        return {
          success: false,
          error: 'limit_reached',
          message: `Vous avez atteint votre limite de ${stats.limit} mémoire(s) technique(s) pour ce mois.`,
          used: stats.used,
          limit: stats.limit,
          remaining: 0
        };
      }

      return {
        success: true,
        used: stats.used,
        limit: stats.limit,
        remaining: stats.remaining
      };
    } catch (error: any) {
      console.error('Error checking memory limit:', error);
      return {
        success: false,
        error: 'check_failed',
        message: 'Erreur lors de la vérification de la limite'
      };
    }
  }

  async incrementMemoryUsage(userId: string): Promise<MemoryUsageResult> {
    try {
      const { data, error } = await supabase.rpc('increment_memory_usage', {
        p_user_id: userId
      });

      if (error) throw error;

      return data as MemoryUsageResult;
    } catch (error: any) {
      console.error('Error incrementing memory usage:', error);
      return {
        success: false,
        error: 'increment_failed',
        message: error.message || 'Erreur lors de l\'incrémentation de l\'usage'
      };
    }
  }

  async getMemoryStats(userId: string): Promise<MemoryStats> {
    try {
      const { data, error } = await supabase.rpc('get_user_memory_stats', {
        p_user_id: userId
      });

      if (error) throw error;

      return data as MemoryStats;
    } catch (error: any) {
      console.error('Error getting memory stats:', error);
      return {
        plan_name: 'Erreur',
        limit: 0,
        used: 0,
        remaining: 0,
        period_start: '',
        period_end: '',
        status: 'error'
      };
    }
  }

  async checkUserAccess(userId: string) {
    try {
      const { data, error } = await supabase.rpc('check_user_access', {
        p_user_id: userId
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error checking user access:', error);
      throw error;
    }
  }

  async purchaseExtraMemory(): Promise<{ url: string } | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifie');

      const { data: settings } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'extra_memory_stripe_price_id')
        .maybeSingle();

      const priceId = settings?.setting_value;
      if (!priceId) throw new Error('Prix non configure');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            price_id: priceId,
            mode: 'payment',
            success_url: `${window.location.origin}/settings?purchase=success`,
            cancel_url: `${window.location.origin}/settings?purchase=cancelled`,
            metadata: { type: 'extra_memory', credits: '1' },
          }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);

      return { url: result.url };
    } catch (error: any) {
      console.error('Error purchasing extra memory:', error);
      return null;
    }
  }

  async startTrial(userId: string) {
    try {
      const { data, error } = await supabase.rpc('start_trial', {
        p_user_id: userId
      });

      if (error) throw error;

      return data;
    } catch (error: any) {
      console.error('Error starting trial:', error);
      throw error;
    }
  }
}

export const subscriptionService = SubscriptionService.getInstance();
