import React, { useState } from 'react';
import { Crown, Zap, Lock, AlertTriangle, Info } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface SubscriptionLimitBannerProps {
  isBlocked: boolean;
  remainingMemories: number;
  currentPlan: string;
  nextPlan?: {
    name: string;
    price: number;
    technical_memories_limit: number;
  };
  onUpgrade: () => void;
}

export const SubscriptionLimitBanner: React.FC<SubscriptionLimitBannerProps> = ({
  isBlocked,
  remainingMemories,
  currentPlan,
  nextPlan,
  onUpgrade
}) => {
  const { isDark } = useTheme();
  const [showTooltip, setShowTooltip] = useState(false);

  const isUnlimited = remainingMemories === -1;

  const getIcon = () => {
    if (isUnlimited) return <Crown className="w-4 h-4" />;
    if (isBlocked) return <Lock className="w-4 h-4" />;
    if (remainingMemories <= 1) return <AlertTriangle className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const getIconColor = () => {
    if (isUnlimited) return isDark ? 'text-green-400 bg-green-900/20' : 'text-green-600 bg-green-50';
    if (isBlocked) return isDark ? 'text-red-400 bg-red-900/20' : 'text-red-600 bg-red-50';
    if (remainingMemories <= 1) return isDark ? 'text-orange-400 bg-orange-900/20' : 'text-orange-600 bg-orange-50';
    return isDark ? 'text-gray-400 bg-gray-800' : 'text-gray-600 bg-gray-100';
  };

  const getTooltipContent = () => {
    if (isUnlimited) {
      return (
        <div>
          <div className="font-semibold mb-1">Plan {currentPlan}</div>
          <div className="text-xs">Mémoires techniques illimitées</div>
        </div>
      );
    }

    if (isBlocked) {
      return (
        <div>
          <div className="font-semibold mb-1 text-red-400">Limite atteinte</div>
          <div className="text-xs mb-2">Vous avez utilisé toutes vos mémoires techniques du plan {currentPlan}</div>
          {nextPlan && (
            <div className="text-xs border-t border-gray-600 pt-2 mt-2">
              <div className="font-medium mb-1">Passer au plan {nextPlan.name}</div>
              <div>{nextPlan.technical_memories_limit === -1 ? 'Illimité' : `${nextPlan.technical_memories_limit} mémoires`} · {nextPlan.price}€/mois</div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div>
        <div className="font-semibold mb-1">Plan {currentPlan}</div>
        <div className="text-xs mb-2">
          {remainingMemories} mémoire{remainingMemories > 1 ? 's' : ''} technique{remainingMemories > 1 ? 's' : ''} restante{remainingMemories > 1 ? 's' : ''}
        </div>
        {remainingMemories <= 1 && nextPlan && (
          <div className="text-xs border-t border-gray-600 pt-2 mt-2">
            <div className="font-medium mb-1">Passer au plan {nextPlan.name}</div>
            <div>{nextPlan.technical_memories_limit === -1 ? 'Illimité' : `${nextPlan.technical_memories_limit} mémoires`} · {nextPlan.price}€/mois</div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="relative">
        <button
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={isBlocked || remainingMemories <= 1 ? onUpgrade : undefined}
          className={`p-2 rounded-lg transition-all ${getIconColor()} ${
            isBlocked || remainingMemories <= 1
              ? 'cursor-pointer hover:scale-110 shadow-lg'
              : 'cursor-help'
          } ${isBlocked ? 'animate-pulse' : ''}`}
        >
          {getIcon()}
        </button>

        {showTooltip && (
          <div className={`absolute right-0 top-full mt-2 w-64 p-3 rounded-lg shadow-xl border z-50 ${
            isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'
          }`}>
            {getTooltipContent()}

            {(isBlocked || remainingMemories <= 1) && nextPlan && (
              <button
                onClick={onUpgrade}
                className={`w-full mt-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isBlocked
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                <Crown className="w-3 h-3 inline mr-1" />
                {isBlocked ? 'Débloquer maintenant' : 'Upgrade'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};