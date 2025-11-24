import React from 'react';
import { Building, Calendar, Euro, CreditCard as Edit3, BookOpen, Brain, Trophy, Archive, X, Clock, XCircle, CheckCircle, TrendingUp, Calculator, ExternalLink } from 'lucide-react';
import { Market } from '../../types';

interface MarketListCompactProps {
  market: Market;
  isDark: boolean;
  onEdit: () => void;
  onTechnicalMemory: () => void;
  onEconomicDocs: () => void;
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
      className={`${
        isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
      } rounded-lg shadow-sm border p-4 transition-all duration-200`}
    >
      <div className="flex gap-4">
        <div
          className={`flex-shrink-0 w-10 h-10 rounded-lg ${status.color} flex items-center justify-center`}
        >
          <StatusIcon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3
                  className={`text-base font-semibold line-clamp-2 ${
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
                    className={`flex-shrink-0 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                    }`}
                    title="Voir la consultation"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                Réf: {market.reference}
              </p>
            </div>

            {daysRemaining !== null && daysRemaining > 0 && (
              <div
                className={`flex-shrink-0 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
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
              className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2 mb-3`}
            >
              {market.description}
            </p>
          )}

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Building className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="min-w-0">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Client</p>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                  {market.client}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <Calendar className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="min-w-0">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Échéance</p>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatDate(market.deadline)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <Euro className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="min-w-0">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Budget</p>
                <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatCurrency(market.budget)}
                </p>
              </div>
            </div>
          </div>

          {/* Boutons d'action en ligne horizontale */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={onEdit}
              className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
                isDark
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
              title="Éditer le marché"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Éditer</span>
            </button>

            <button
              onClick={onAnalysis}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-sm"
              title="Analyser les documents"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Analyse</span>
            </button>

            <button
              onClick={onTechnicalMemory}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-sm"
              title="Mémoire technique"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mémoire</span>
            </button>

            <button
              onClick={onEconomicDocs}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-sm"
              title="Documents économiques (BPU, DQE, DPGF)"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Éco</span>
            </button>

            {onArchive && (
              <button
                onClick={onArchive}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
                  isDark
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                }`}
                title="Archiver le marché"
              >
                <Archive className="w-3.5 h-3.5" />
                <span>Archiver</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-sm"
                title="Supprimer le marché"
              >
                <X className="w-3.5 h-3.5" />
                <span>Suppr.</span>
              </button>
            )}

            {market.status === 'en_cours' && onWin && (
              <button
                onClick={onWin}
                className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-sm ml-auto"
                title="Marquer comme gagné"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Gagné</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
