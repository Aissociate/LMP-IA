import React from 'react';
import { Building, Calendar, Euro, CreditCard as Edit3, BookOpen, Brain, Trophy, Archive, X, Clock, XCircle, CheckCircle, TrendingUp, Calculator, ExternalLink, FileText } from 'lucide-react';
import { Market } from '../../types';

interface MarketListCompactProps {
  market: Market;
  isDark: boolean;
  onEdit: () => void;
  onTechnicalMemory: () => void;
  onEconomicDocs: () => void;
  onDC1: () => void;
  onAnalysis: () => void;
  onWin?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

export const MarketListCompact: React.FC<MarketListCompactProps> = ({
  market,
  isDark,
  onEdit,
  onTechnicalMemory,
  onEconomicDocs,
  onDC1,
  onAnalysis,
  onWin,
  onArchive,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(value);
  };

  const getDaysRemaining = (deadline: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusConfig = () => {
    switch (market.status) {
      case 'en_cours':
        return {
          icon: Clock,
          label: 'En cours',
          color: isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
        };
      case 'soumis':
        return {
          icon: TrendingUp,
          label: 'Soumis',
          color: isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
        };
      case 'gagne':
        return {
          icon: CheckCircle,
          label: 'Gagné',
          color: isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
        };
      case 'perdu':
        return {
          icon: XCircle,
          label: 'Perdu',
          color: isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
        };
      default:
        return {
          icon: Clock,
          label: 'En cours',
          color: isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-700'
        };
    }
  };

  const status = getStatusConfig();
  const StatusIcon = status.icon;
  const daysRemaining = getDaysRemaining(market.deadline);

  return (
    <div
      className={`group ${
        isDark ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
      } rounded-lg border transition-all ${
        isDark ? 'border-gray-700/50' : 'border-gray-200'
      }`}
    >
      <div className="p-4">
        <div className="flex gap-3">
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-lg ${status.color} flex items-center justify-center`}
          >
            <StatusIcon className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-base font-semibold line-clamp-1 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {market.title}
                  </h3>
                  {market.market_url && (
                    <a
                      href={market.market_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex-shrink-0 p-1 rounded transition-colors ${
                        isDark ? 'text-gray-600 hover:text-gray-400 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Voir la consultation"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-0.5`}>
                  {market.reference}
                </p>
              </div>

              {daysRemaining !== null && daysRemaining > 0 && (
                <div
                  className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 ${
                    daysRemaining < 7
                      ? isDark
                        ? 'bg-red-900/30 text-red-400'
                        : 'bg-red-100 text-red-700'
                      : daysRemaining < 15
                      ? isDark
                        ? 'bg-orange-900/30 text-orange-400'
                        : 'bg-orange-100 text-orange-700'
                      : isDark
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-green-100 text-green-700'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  J-{daysRemaining}
                </div>
              )}
            </div>

            {market.description && (
              <p
                className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-600'} line-clamp-2 mb-3`}
              >
                {market.description}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-xs mb-3">
              <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Building className="w-3.5 h-3.5" />
                <span>{market.client}</span>
              </div>

              <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>{formatDate(market.deadline)}</span>
              </div>

              <div className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Euro className="w-3.5 h-3.5" />
                <span>{formatCurrency(market.budget)}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={onEdit}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
                title="Éditer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Éditer</span>
              </button>

              <button
                onClick={onAnalysis}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                title="Analyse IA"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>Analyse</span>
              </button>

              <button
                onClick={onTechnicalMemory}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                title="Mémoire technique"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Mémoire</span>
              </button>

              <button
                onClick={onEconomicDocs}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                title="Docs économiques"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Éco</span>
              </button>

              <button
                onClick={onDC1}
                className="px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 bg-orange-600 hover:bg-orange-700 text-white"
                title="DC1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>DC1</span>
              </button>

              {market.status === 'en_cours' && onWin && (
                <button
                  onClick={onWin}
                  className="px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white ml-auto"
                  title="Gagné"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Gagné</span>
                </button>
              )}

              {onArchive && (
                <button
                  onClick={onArchive}
                  className={`opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    isDark
                      ? 'text-gray-600 hover:text-gray-300 hover:bg-gray-700'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="Archiver"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              )}

              {onDelete && (
                <button
                  onClick={onDelete}
                  className={`opacity-0 group-hover:opacity-100 px-2 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    isDark
                      ? 'text-gray-600 hover:text-red-500 hover:bg-gray-700'
                      : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'
                  }`}
                  title="Supprimer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
