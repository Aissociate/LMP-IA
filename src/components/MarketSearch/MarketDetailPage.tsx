import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Building,
  Calendar,
  Euro,
  ExternalLink,
  Download,
  Star,
  Clock,
  Users,
  Shield,
  FileText,
  AlertCircle,
  CheckCircle,
  Sparkles,
  TrendingUp,
  Share2,
  Bookmark
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { BOAMPMarket } from '../../types/boamp';

export const MarketDetailPage: React.FC = () => {
  const { marketId } = useParams<{ marketId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [market, setMarket] = useState<BOAMPMarket | null>(location.state?.market || null);
  const [loading, setLoading] = useState(!market);
  const [isFavorite, setIsFavorite] = useState(false);
  const [analyzingMarket, setAnalyzingMarket] = useState(false);

  useEffect(() => {
    if (!market && marketId) {
      loadMarketDetails();
    }
    if (market) {
      checkIfFavorite();
    }
  }, [marketId, market]);

  const loadMarketDetails = async () => {
    if (!marketId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('boamp_favorites')
        .select('*')
        .eq('boamp_reference', marketId)
        .single();

      if (error) throw error;

      if (data) {
        const marketData: BOAMPMarket = {
          id: data.id,
          reference: data.boamp_reference,
          title: data.title,
          client: data.client,
          description: data.description || '',
          deadline: data.deadline || '',
          amount: data.amount,
          location: data.location || '',
          publicationDate: data.publication_date || '',
          procedureType: data.procedure_type || '',
          serviceType: data.service_type || '',
          cpvCode: data.cpv_code,
          url: data.url || '',
          dceUrl: data.raw_data?.dceUrl,
          rawData: data.raw_data
        };
        setMarket(marketData);
      }
    } catch (error) {
      console.error('Error loading market details:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async () => {
    if (!user || !market) return;
    try {
      const { data, error } = await supabase
        .from('boamp_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('boamp_reference', market.reference)
        .single();

      setIsFavorite(!!data);
    } catch (error) {
      setIsFavorite(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user || !market) return;

    try {
      if (isFavorite) {
        await supabase
          .from('boamp_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('boamp_reference', market.reference);
        setIsFavorite(false);
      } else {
        await supabase.from('boamp_favorites').insert({
          user_id: user.id,
          boamp_reference: market.reference,
          title: market.title,
          client: market.client,
          description: market.description,
          deadline: market.deadline,
          amount: market.amount,
          location: market.location,
          publication_date: market.publicationDate,
          procedure_type: market.procedureType,
          service_type: market.serviceType,
          cpv_code: market.cpvCode,
          url: market.url,
          raw_data: market.rawData,
          is_imported_to_markets: false
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleAnalyzeWithSentinel = async () => {
    if (!market || !user) return;
    setAnalyzingMarket(true);
    try {
      const { marketSentinelService } = await import('../../services/marketSentinelService');
      const userContext = await marketSentinelService.getUserContext(user.id);
      await marketSentinelService.analyzeMarket(market, undefined, userContext);
      alert('Marché analysé et ajouté à Market Sentinel™');
    } catch (error: any) {
      console.error('Error analyzing market:', error);
      alert(`Erreur d'analyse: ${error.message}`);
    } finally {
      setAnalyzingMarket(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return 'Non spécifié';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getDaysRemaining = (deadline: string) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papiers');
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
        <div className="max-w-6xl mx-auto">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-8 animate-pulse`}>
            <div className={`h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4 mb-4`}></div>
            <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2 mb-8`}></div>
            <div className={`h-64 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-8`}>
        <div className="max-w-6xl mx-auto">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-12 text-center`}>
            <AlertCircle className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Marché non trouvé
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Ce marché n'est pas disponible ou n'existe plus.
            </p>
            <button
              onClick={() => navigate('/app/recherche-marches')}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
            >
              Retour à la recherche
            </button>
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = getDaysRemaining(market.deadline);
  const relevanceScore = market.rawData?.relevanceScore;

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="max-w-6xl mx-auto p-8">
        <button
          onClick={() => navigate(-1)}
          className={`flex items-center gap-2 mb-6 px-4 py-2 rounded-lg transition-colors ${
            isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux résultats
        </button>

        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border overflow-hidden`}>
          <div className={`${isDark ? 'bg-gradient-to-r from-orange-900/20 to-orange-800/20' : 'bg-gradient-to-r from-orange-50 to-orange-100'} p-8 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {market.title}
                </h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {market.serviceType}
                  </span>
                  {market.procedureType && (
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {market.procedureType}
                    </span>
                  )}
                  {relevanceScore && relevanceScore > 0.5 && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                      isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                      {(relevanceScore * 100).toFixed(0)}% pertinent
                    </span>
                  )}
                  {daysRemaining !== null && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                      daysRemaining < 7
                        ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                        : daysRemaining < 15
                        ? isDark ? 'bg-orange-900/30 text-orange-400' : 'bg-orange-100 text-orange-700'
                        : isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                    }`}>
                      <Clock className="w-4 h-4" />
                      J-{daysRemaining}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={toggleFavorite}
                  className={`p-3 rounded-lg transition-all duration-200 ${
                    isFavorite
                      ? 'bg-orange-600 text-white shadow-md'
                      : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => copyToClipboard(window.location.href)}
                  className={`p-3 rounded-lg transition-colors ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                  title="Partager ce marché"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/50'} rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Building className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Client</span>
                </div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {market.client}
                </p>
              </div>

              <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/50'} rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Localisation</span>
                </div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {market.location}
                </p>
              </div>

              <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/50'} rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Date limite</span>
                </div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(market.deadline)}
                </p>
              </div>

              <div className={`${isDark ? 'bg-gray-800/50' : 'bg-white/50'} rounded-lg p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <Euro className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Montant</span>
                </div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatAmount(market.amount)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <FileText className="w-6 h-6" />
                    Description du marché
                  </h2>
                  <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-6`}>
                    <p className={`whitespace-pre-wrap ${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                      {market.description || 'Aucune description disponible'}
                    </p>
                  </div>
                </div>

                {market.rawData && Object.keys(market.rawData).length > 0 && (
                  <div>
                    <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <Shield className="w-6 h-6" />
                      Informations détaillées
                    </h2>
                    <div className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-lg p-6 space-y-3`}>
                      {market.cpvCode && (
                        <div className="flex justify-between items-start">
                          <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Code CPV:</span>
                          <span className={`text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>{market.cpvCode}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-start">
                        <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Référence:</span>
                        <span className={`text-right font-mono text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{market.reference}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className={`font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Date de publication:</span>
                        <span className={`text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatDate(market.publicationDate)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Actions
                  </h2>
                  <div className="space-y-3">
                    <a
                      href={market.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      Voir sur BOAMP
                    </a>

                    {market.dceUrl && (
                      <a
                        href={market.dceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Télécharger DCE
                      </a>
                    )}

                    <button
                      onClick={handleAnalyzeWithSentinel}
                      disabled={analyzingMarket}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        analyzingMarket
                          ? 'bg-gray-500 cursor-not-allowed text-white'
                          : isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <Sparkles className="w-5 h-5" />
                      {analyzingMarket ? 'Analyse en cours...' : 'Analyser avec Market Sentinel™'}
                    </button>

                    <button
                      onClick={() => navigate('/app/marche', { state: { importFromBoamp: market } })}
                      className={`w-full px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                        isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                    >
                      <Bookmark className="w-5 h-5" />
                      Importer dans mes marchés
                    </button>
                  </div>
                </div>

                <div className={`${isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} rounded-lg p-4 border`}>
                  <div className="flex items-start gap-3">
                    <CheckCircle className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <div>
                      <h3 className={`font-semibold mb-1 ${isDark ? 'text-blue-400' : 'text-blue-900'}`}>
                        Besoin d'aide pour répondre ?
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                        Utilisez notre assistant IA pour générer automatiquement vos mémoires techniques et documents administratifs.
                      </p>
                      <button
                        onClick={() => navigate('/app/assistant')}
                        className={`mt-3 text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                      >
                        Accéder à l'assistant →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
