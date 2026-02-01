import React, { useState } from 'react';
import {
  MapPin,
  Building,
  Calendar,
  Euro,
  ExternalLink,
  Download,
  Star,
  Eye,
  Clock,
  Users,
  Shield,
  Sparkles,
  Database,
  TrendingUp
} from 'lucide-react';
import { BOAMPMarket } from '../../types/boamp';
import { marketSentinelService } from '../../services/marketSentinelService';
import { highlightSearchTerms, extractSearchContext } from '../../utils/searchHighlight';

interface MarketSearchCompactProps {
  market: BOAMPMarket;
  isFavorite: boolean;
  isDark: boolean;
  isAdmin?: boolean;
  searchQuery?: string;
  onToggleFavorite: () => void;
  onProspect?: () => void;
  onAddLog?: (type: string, message: string) => void;
}

export const MarketSearchCompact: React.FC<MarketSearchCompactProps> = ({
  market,
  isFavorite,
  isDark,
  isAdmin = false,
  searchQuery = '',
  onToggleFavorite,
  onProspect,
  onAddLog
}) => {
  const [analyzingMarket, setAnalyzingMarket] = useState(false);

  const handleAnalyzeWithSentinel = async () => {
    setAnalyzingMarket(true);
    if (onAddLog) {
      onAddLog('info', `Analyse Market Sentinel en cours pour: ${market.title}`);
    }

    try {
      const { supabase } = await import('../../lib/supabase');
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      const userContext = await marketSentinelService.getUserContext(user.id);

      await marketSentinelService.analyzeMarket(market, undefined, userContext);

      if (onAddLog) {
        onAddLog('success', `Marché analysé et ajouté à Market Sentinel™`);
      }
    } catch (error: any) {
      if (onAddLog) {
        onAddLog('error', `Erreur d'analyse: ${error.message}`);
      }
      console.error('Error analyzing market:', error);
    } finally {
      setAnalyzingMarket(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      notation: 'compact',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDaysRemaining = (deadline: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const daysRemaining = getDaysRemaining(market.deadline);
  const isManualMarket = market.rawData?.isManualMarket === true || market.id.startsWith('manual-');
  const relevanceScore = market.rawData?.relevanceScore;

  const highlightedTitle = searchQuery ? highlightSearchTerms(market.title, searchQuery) : market.title;
  const highlightedClient = searchQuery ? highlightSearchTerms(market.client, searchQuery) : market.client;
  const descriptionContext = searchQuery && market.description
    ? extractSearchContext(market.description, searchQuery, 200)
    : market.description?.substring(0, 200) || '';
  const highlightedDescription = searchQuery ? highlightSearchTerms(descriptionContext, searchQuery) : descriptionContext;

  return (
    <div
      className={`${
        isDark ? 'bg-gray-800 hover:shadow-lg' : 'bg-white hover:shadow-md'
      } rounded-xl shadow-sm p-5 transition-all duration-200 group border ${
        isDark ? 'border-gray-700/50' : 'border-gray-100'
      }`}
    >
      <div className="flex gap-4">
        <div className="flex flex-col gap-2 items-center">
          <button
            onClick={onToggleFavorite}
            className={`flex-shrink-0 w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center ${
              isFavorite
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark
                ? 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {isAdmin && onProspect && (
            <button
              onClick={onProspect}
              className={`flex-shrink-0 w-9 h-9 rounded-lg transition-all duration-200 flex items-center justify-center ${
                isDark
                  ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-900/40 hover:text-purple-300'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100 hover:text-purple-700'
              }`}
              title="Rechercher des dirigeants pour prospection"
            >
              <Users className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3
              className={`text-base font-semibold line-clamp-2 leading-snug ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
              dangerouslySetInnerHTML={{ __html: highlightedTitle }}
            />

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {relevanceScore && relevanceScore > 0.5 && (
                <div
                  className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                    isDark
                      ? 'bg-blue-900/20 text-blue-400 border border-blue-800'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                  title={`Score de pertinence: ${(relevanceScore * 100).toFixed(0)}%`}
                >
                  <TrendingUp className="w-3 h-3" />
                  {(relevanceScore * 100).toFixed(0)}%
                </div>
              )}

              {daysRemaining !== null && (
                <div
                  className={`flex-shrink-0 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                    daysRemaining < 7
                      ? isDark
                        ? 'bg-red-900/20 text-red-400 border border-red-800'
                        : 'bg-red-50 text-red-700 border border-red-200'
                      : daysRemaining < 15
                      ? isDark
                        ? 'bg-orange-900/20 text-orange-400 border border-orange-800'
                        : 'bg-orange-50 text-orange-700 border border-orange-200'
                      : isDark
                      ? 'bg-green-900/20 text-green-400 border border-green-800'
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  J-{daysRemaining}
                </div>
              )}
            </div>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 pb-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="flex items-start gap-2 min-w-0">
              <Building className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="min-w-0">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>Acheteur</p>
                <p
                  className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} truncate`}
                  dangerouslySetInnerHTML={{ __html: highlightedClient }}
                />
              </div>
            </div>

            <div className="flex items-start gap-2 min-w-0">
              <MapPin className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="min-w-0">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>Localisation</p>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} truncate`}>
                  {market.location}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 min-w-0">
              <Calendar className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="min-w-0">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>Date limite</p>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {formatDate(market.deadline)}
                </p>
              </div>
            </div>

            {market.amount && (
              <div className="flex items-start gap-2 min-w-0">
                <Euro className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <div className="min-w-0">
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-0.5`}>Montant</p>
                  <p className={`text-sm font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatAmount(market.amount)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {isManualMarket && (
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                    isDark ? 'bg-teal-900/20 text-teal-400 border border-teal-800' : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}
                >
                  <Database className="w-3 h-3" />
                  Local
                </span>
              )}
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${
                  isDark ? 'bg-blue-900/20 text-blue-400 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {market.serviceType}
              </span>
              {market.procedureType && (
                <span
                  className={`px-2 py-1 rounded-md text-xs ${
                    isDark ? 'text-gray-500' : 'text-gray-500'
                  }`}
                >
                  {market.procedureType}
                </span>
              )}
            </div>
            <span
              className={`text-xs font-mono ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
            >
              Réf: {market.reference}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={market.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            Consulter
          </a>

          {market.dceUrl ? (
            <a
              href={market.dceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
                isDark
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <Download className="w-4 h-4" />
              DCE
            </a>
          ) : (
            <button
              disabled
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-not-allowed ${
                isDark
                  ? 'bg-gray-700/50 text-gray-500'
                  : 'bg-gray-100 text-gray-400'
              }`}
              title="DCE non disponible"
            >
              <Download className="w-4 h-4" />
              DCE
            </button>
          )}

          <button
            onClick={handleAnalyzeWithSentinel}
            disabled={analyzingMarket}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              analyzingMarket
                ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark
                  ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
            }`}
            title="Analyser avec Market Sentinel™"
          >
            {analyzingMarket ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span className="hidden xl:inline">Analyse...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span className="hidden xl:inline">Analyser</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
