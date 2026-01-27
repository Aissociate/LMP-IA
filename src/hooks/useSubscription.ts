import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { subscriptionService, MemoryStats } from '../services/subscriptionService';

export const useSubscription = () => {
  const { user } = useAuth();
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMemoryStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const stats = await subscriptionService.getMemoryStats(user.id);
      setMemoryStats(stats);
    } catch (err: any) {
      console.error('Error loading memory stats:', err);
      setError(err.message || 'Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemoryStats();
  }, [user]);

  const checkCanCreateMemory = async (): Promise<boolean> => {
    if (!user) return false;

    const result = await subscriptionService.checkMemoryLimit(user.id);
    return result.success;
  };

  const incrementMemoryUsage = async () => {
    if (!user) return { success: false, error: 'no_user' };

    const result = await subscriptionService.incrementMemoryUsage(user.id);

    if (result.success) {
      await loadMemoryStats();
    }

    return result;
  };

  const refreshStats = () => {
    loadMemoryStats();
  };

  return {
    memoryStats,
    loading,
    error,
    checkCanCreateMemory,
    incrementMemoryUsage,
    refreshStats
  };
};
