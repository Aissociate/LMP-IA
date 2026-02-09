import React from 'react';
import { Shield, Star, Crown, Zap } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useSubscription } from '../../hooks/useSubscription';

export const SubscriptionBadge: React.FC = () => {
  const { isDark } = useTheme();
  const { memoryStats, loading } = useSubscription();

  if (loading || !memoryStats) return null;

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'TRIAL':
        return Zap;
      case 'BRONZE':
        return Shield;
      case 'ARGENT':
        return Star;
      case 'OR':
        return Crown;
      default:
        return Shield;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'TRIAL':
        return {
          bg: isDark ? 'bg-purple-900/20' : 'bg-purple-50',
          border: 'border-purple-500',
          text: 'text-purple-600'
        };
      case 'BRONZE':
        return {
          bg: isDark ? 'bg-orange-900/20' : 'bg-orange-50',
          border: 'border-orange-500',
          text: 'text-orange-600'
        };
      case 'ARGENT':
        return {
          bg: isDark ? 'bg-gray-700/20' : 'bg-gray-50',
          border: 'border-gray-400',
          text: 'text-gray-600'
        };
      case 'OR':
        return {
          bg: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-600'
        };
      default:
        return {
          bg: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-600'
        };
    }
  };

  const Icon = getPlanIcon(memoryStats.plan_name);
  const colors = getPlanColor(memoryStats.plan_name);

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colors.bg} ${colors.border}`}>
      <Icon className={`w-4 h-4 ${colors.text}`} />
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium ${colors.text}`}>
          {memoryStats.plan_name}
        </span>
        {memoryStats.total_limit > 0 && (
          <>
            <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>|</span>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {memoryStats.used}/{memoryStats.total_limit} mémoires
              {(memoryStats.rollover_credits > 0 || memoryStats.extra_credits > 0) && (
                <span className={`ml-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  ({memoryStats.rollover_credits > 0 ? `+${memoryStats.rollover_credits} report` : ''}
                  {memoryStats.rollover_credits > 0 && memoryStats.extra_credits > 0 ? ', ' : ''}
                  {memoryStats.extra_credits > 0 ? `+${memoryStats.extra_credits} extra` : ''})
                </span>
              )}
            </span>
          </>
        )}
      </div>
    </div>
  );
};
