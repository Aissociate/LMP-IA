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
