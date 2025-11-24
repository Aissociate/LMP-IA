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
  Sparkles
} from 'lucide-react';
import { BOAMPMarket } from '../../types/boamp';
import { marketSentinelService } from '../../services/marketSentinelService';

interface MarketSearchCompactProps {
  market: BOAMPMarket;
  isFavorite: boolean;
  isDark: boolean;
  isAdmin?: boolean;
  onToggleFavorite: () => void;
  onProspect?: () => void;
  onAddLog?: (type: string, message: string) => void;
}

export const MarketSearchCompact: React.FC<MarketSearchCompactProps> = ({
  market,
  isFavorite,
  isDark,
  isAdmin = false,
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

  return (
    <div
      className={`${
        isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
      } rounded-lg shadow-sm border p-4 transition-all duration-200 group`}
    >
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <button
            onClick={onToggleFavorite}
            className={`flex-shrink-0 w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center ${
              isFavorite
                ? 'bg-orange-600 text-white shadow-md'
                : isDark
                ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-300'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
            }`}
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {isAdmin && onProspect && (
            <button
              onClick={onProspect}
              className={`flex-shrink-0 w-10 h-10 rounded-lg transition-all duration-200 flex items-center justify-center ${
                isDark
                  ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 hover:text-purple-300'
                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200 hover:text-purple-700'
              }`}
              title="Rechercher des dirigeants pour prospection"
            >
              <Users className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3
              className={`text-base font-semibold line-clamp-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}
            >
              {market.title}
            </h3>

            {daysRemaining !== null && (
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <Building className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="min-w-0">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} truncate`}>
                  {market.client}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <MapPin className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="min-w-0">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                  {market.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <Calendar className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <div className="min-w-0">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatDate(market.deadline)}
                </p>
              </div>
            </div>

            {market.amount && (
              <div className="flex items-center gap-2 min-w-0">
                <Euro className={`w-4 h-4 flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <div className="min-w-0">
                  <p className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {formatAmount(market.amount)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
              }`}
            >
              {market.serviceType}
            </span>
            {market.procedureType && (
              <span
                className={`px-2 py-0.5 rounded text-xs ${
                  isDark ? 'text-gray-500' : 'text-gray-500'
                }`}
              >
                {market.procedureType}
              </span>
            )}
            <span
              className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'} ml-auto`}
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
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            Voir
          </a>

          {market.dceUrl ? (
            <a
              href={market.dceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
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
              onClick={() => {
                if (onAddLog) {
                  onAddLog('info', `Recherche du DCE pour ${market.reference}...`);
                  if (market.rawData?.donnees) {
                    onAddLog('info', `Données brutes disponibles`);
                  } else {
                    onAddLog('info', 'Aucune donnée DCE trouvée');
                  }
                }
              }}
              className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center gap-2 ${
                isDark
                  ? 'bg-gray-700 text-gray-500 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
              }`}
              title="DCE non disponible"
            >
              <Download className="w-4 h-4" />
              N/A
            </button>
          )}

          <button
            onClick={handleAnalyzeWithSentinel}
            disabled={analyzingMarket}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              analyzingMarket
                ? isDark ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : isDark
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white'
            }`}
            title="Analyser avec Market Sentinel™"
          >
            {analyzingMarket ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                IA...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                Sentinel
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
