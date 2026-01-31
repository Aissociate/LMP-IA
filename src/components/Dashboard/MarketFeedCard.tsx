import React from 'react';
import { Building2, MapPin, Calendar, Euro, Heart, X, Sparkles } from 'lucide-react';

interface MarketFeedCardProps {
  market: {
    id: string;
    title: string;
    organisme?: string;
    description?: string;
    deadline?: string;
    budget?: number;
    location?: string;
    created_at: string;
  };
  onAnalyze: (id: string) => void;
  onFavorite: (id: string) => void;
  onIgnore: (id: string) => void;
}

export const MarketFeedCard: React.FC<MarketFeedCardProps> = ({
  market,
  onAnalyze,
  onFavorite,
  onIgnore,
}) => {
  const formatBudget = (budget: number | undefined) => {
    if (!budget) return 'Non communiqué';
    if (budget >= 1000000) return `${(budget / 1000000).toFixed(1)}M €`;
    if (budget >= 1000) return `${(budget / 1000).toFixed(0)}k €`;
    return `${budget} €`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.RelativeTimeFormat('fr', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-iris-card border border-iris-border rounded-lg shadow-subtle hover:shadow-card transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-iris-border">
        <div className="flex items-start gap-3">
          {/* Logo/Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-linkedin-500 to-linkedin-600 rounded flex items-center justify-center text-white font-bold shadow-sm">
              {market.organisme ? getInitials(market.organisme) : <Building2 className="w-6 h-6" />}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
              {market.organisme || 'Organisme public'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {market.location && (
                <>
                  <MapPin className="w-3 h-3" />
                  <span>{market.location}</span>
                  <span>•</span>
                </>
              )}
              <span>Publié {formatDate(market.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="font-bold text-base text-slate-900 mb-2 line-clamp-2">
          {market.title}
        </h2>

        {market.description && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-3">
            {market.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-600 mb-4">
          {market.budget && (
            <div className="flex items-center gap-1">
              <Euro className="w-3 h-3" />
              <span className="font-medium">{formatBudget(market.budget)}</span>
            </div>
          )}
          {market.deadline && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Échéance {formatDate(market.deadline)}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAnalyze(market.id)}
            className="flex-1 bg-linkedin-500 hover:bg-linkedin-600 text-white font-semibold text-sm py-2.5 px-4 rounded-full transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analyser avec Iris</span>
          </button>

          <button
            onClick={() => onFavorite(market.id)}
            className="p-2.5 hover:bg-iris-bg rounded-full transition-colors border border-iris-border"
            title="Ajouter aux favoris"
          >
            <Heart className="w-5 h-5 text-slate-600 hover:text-red-500" />
          </button>

          <button
            onClick={() => onIgnore(market.id)}
            className="p-2.5 hover:bg-iris-bg rounded-full transition-colors border border-iris-border"
            title="Ignorer"
          >
            <X className="w-5 h-5 text-slate-600 hover:text-slate-900" />
          </button>
        </div>
      </div>

      {/* Footer Stats (Optional) */}
      <div className="px-4 py-3 bg-iris-bg border-t border-iris-border flex items-center justify-between text-xs text-slate-500">
        <span>3 entreprises intéressées</span>
        <span className="text-linkedin-500 font-medium hover:underline cursor-pointer">
          Voir les détails
        </span>
      </div>
    </div>
  );
};
