import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface MemoryStats {
  plan_name: string;
  limit: number;
  used: number;
  remaining: number;
  period_start: string;
  period_end: string;
  status: string;
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMemoryStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadMemoryStats = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_memory_stats', {
        p_user_id: user.id
      });

      if (error) throw error;
      setMemoryStats(data);
    } catch (error) {
      console.error('Error loading memory stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const canGenerateMemory = (): boolean => {
    if (!memoryStats) return false;
    if (memoryStats.status !== 'active') return false;
    return memoryStats.remaining > 0;
  };

  const incrementMemoryUsage = async (): Promise<{ success: boolean; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await supabase.rpc('increment_memory_usage', {
        p_user_id: user.id
      });

      if (error) throw error;

      if (!data.success) {
        return { success: false, error: data.message };
      }

      await loadMemoryStats();

      return { success: true };
    } catch (error) {
      console.error('Error incrementing memory usage:', error);
      return { success: false, error: 'Erreur lors de l\'incrémentation' };
    }
  };

  return {
    memoryStats,
    loading,
    canGenerateMemory,
    incrementMemoryUsage,
    refresh: loadMemoryStats,
  };
};
