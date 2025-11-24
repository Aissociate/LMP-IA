import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, AlertTriangle, X, CheckCircle, ThumbsDown, Users, FileText, ExternalLink, Calendar, MapPin, Euro, Sparkles, BarChart3, Target, Clock, Trash2, Archive } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { MarketRelevanceScore, MarketSentinelStats, ScoreCategory, AIRecommendation } from '../../types/boamp';

export const MarketSentinel: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [scores, setScores] = useState<MarketRelevanceScore[]>([]);
  const [stats, setStats] = useState<MarketSentinelStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<ScoreCategory | 'all'>('all');
  const [selectedScore, setSelectedScore] = useState<MarketRelevanceScore | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadScores();
      loadStats();
    }
  }, [user, filterCategory]);

  const loadScores = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('market_relevance_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('analyzed_at', { ascending: false });

      if (filterCategory !== 'all') {
        query = query.eq('score_category', filterCategory);
      }

      const { data, error } = await query;

      if (error) throw error;
      setScores(data || []);
    } catch (error) {
      console.error('Error loading scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    try {
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - 30);

      const { data, error } = await supabase.rpc('calculate_sentinel_stats', {
        p_user_id: user.id,
        p_alert_id: null,
        p_period_start: periodStart.toISOString(),
        p_period_end: new Date().toISOString()
      });

      if (error) throw error;
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleAction = async (scoreId: string, action: AIRecommendation) => {
    try {
      const score = scores.find(s => s.id === scoreId);

      await supabase
        .from('market_relevance_scores')
        .update({
          user_action: action,
          action_taken_at: new Date().toISOString(),
          is_read: true
        })
        .eq('id', scoreId);

      if (action === 'respond' && score && user) {
        const { error: marketError } = await supabase
          .from('markets')
          .insert({
            title: score.market_title,
            reference: score.market_reference,
            client: score.market_location || 'Non spécifié',
            deadline: score.market_deadline,
            budget: score.market_amount,
            status: 'en_cours',
            description: score.market_description || '',
            user_id: user.id,
            credit_consumed: false,
            market_url: score.market_url
          });

        if (marketError) {
          console.error('Error creating market:', marketError);
          alert('Erreur lors de la création du marché: ' + marketError.message);
        } else {
          alert('Marché créé avec succès ! Vous pouvez le consulter dans la section Marchés.');
        }
      }

      loadScores();
      loadStats();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error updating action:', error);
    }
  };

  const handleDelete = async (scoreId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette analyse ?')) return;

    try {
      await supabase
        .from('market_relevance_scores')
        .delete()
        .eq('id', scoreId);

      loadScores();
      loadStats();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error deleting score:', error);
    }
  };

  const handleArchive = async (scoreId: string) => {
    try {
      await supabase
        .from('market_relevance_scores')
        .update({ is_archived: true })
        .eq('id', scoreId);

      loadScores();
      loadStats();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error archiving score:', error);
    }
  };

  const getCategoryConfig = (category: ScoreCategory) => {
    switch (category) {
      case 'go':
        return {
          label: 'GO',
          color: 'green',
          icon: CheckCircle,
          bgClass: isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200',
          textClass: 'text-green-600',
          badgeClass: 'bg-green-100 text-green-800'
        };
      case 'conditional':
        return {
          label: 'CONDITIONAL',
          color: 'orange',
          icon: AlertTriangle,
          bgClass: isDark ? 'bg-orange-900/20 border-orange-700' : 'bg-orange-50 border-orange-200',
          textClass: 'text-orange-600',
          badgeClass: 'bg-orange-100 text-orange-800'
        };
      case 'no_go':
        return {
          label: 'NO-GO',
          color: 'red',
          icon: ThumbsDown,
          bgClass: isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200',
          textClass: 'text-red-600',
          badgeClass: 'bg-red-100 text-red-800'
        };
    }
  };

  const getRecommendationConfig = (recommendation: AIRecommendation) => {
    switch (recommendation) {
      case 'respond':
        return { label: 'Répondre', icon: CheckCircle, color: 'text-green-600' };
      case 'ignore':
        return { label: 'Ignorer', icon: ThumbsDown, color: 'text-gray-600' };
      case 'request_expert':
        return { label: 'Activer Expert', icon: Users, color: 'text-blue-600' };
      case 'order_memory':
        return { label: 'Commander Mémoire', icon: FileText, color: 'text-orange-600' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border-gray-200'} rounded-xl shadow-lg border p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Market Sentinel™
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Veille intelligente avec détection automatique et scoring IA
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              {scores.length} {scores.length > 1 ? 'marchés' : 'marché'}
            </div>
            <Target className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-5 rounded-xl ${isDark ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'} shadow-md hover:shadow-lg transition-shadow`}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</span>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {stats.total_markets}
              </p>
            </div>

            <div className={`p-5 rounded-xl ${isDark ? 'bg-gradient-to-br from-green-900/30 to-green-900/20 border border-green-700' : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200'} shadow-md hover:shadow-lg transition-shadow`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-600">GO</span>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {stats.go_count}
              </p>
            </div>

            <div className={`p-5 rounded-xl ${isDark ? 'bg-gradient-to-br from-orange-900/30 to-orange-900/20 border border-orange-700' : 'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200'} shadow-md hover:shadow-lg transition-shadow`}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">CONDITIONAL</span>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {stats.conditional_count}
              </p>
            </div>

            <div className={`p-5 rounded-xl ${isDark ? 'bg-gradient-to-br from-gray-700 to-gray-800 border border-gray-600' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'} shadow-md hover:shadow-lg transition-shadow`}>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Score moyen</span>
              </div>
              <p className={`text-3xl font-bold ${getScoreColor(stats.avg_score)}`}>
                {stats.avg_score}/100
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
              filterCategory === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-105'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterCategory('go')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
              filterCategory === 'go'
                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white scale-105'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            GO
          </button>
          <button
            onClick={() => setFilterCategory('conditional')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
              filterCategory === 'conditional'
                ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white scale-105'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            CONDITIONAL
          </button>
          <button
            onClick={() => setFilterCategory('no_go')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
              filterCategory === 'no_go'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white scale-105'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            NO-GO
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : scores.length === 0 ? (
          <div className="text-center py-12">
            <Shield className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Aucun marché détecté pour le moment
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {scores.map((score) => {
              const categoryConfig = getCategoryConfig(score.score_category);
              const CategoryIcon = categoryConfig.icon;
              const recConfig = getRecommendationConfig(score.ai_recommendation);
              const RecIcon = recConfig.icon;

              return (
                <div
                  key={score.id}
                  className={`p-5 rounded-xl border-2 ${categoryConfig.bgClass} ${!score.is_read ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'} hover:shadow-xl transition-all hover:scale-[1.01]`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryConfig.badgeClass}`}>
                          {categoryConfig.label}
                        </span>
                        <span className={`text-2xl font-bold ${getScoreColor(score.relevance_score)}`}>
                          {score.relevance_score}/100
                        </span>
                        {!score.is_read && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            NOUVEAU
                          </span>
                        )}
                      </div>
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                        {score.market_title}
                      </h3>
                      {score.market_reference && (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                          Réf: {score.market_reference}
                        </p>
                      )}
                    </div>
                    <CategoryIcon className={`w-6 h-6 ${categoryConfig.textClass}`} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {score.market_location && (
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {score.market_location}
                        </span>
                      </div>
                    )}
                    {score.market_amount && (
                      <div className="flex items-center gap-2">
                        <Euro className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {score.market_amount.toLocaleString()} €
                        </span>
                      </div>
                    )}
                    {score.market_deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {new Date(score.market_deadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white/50'} mb-4`}>
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          Recommandation IA: <RecIcon className={`inline w-4 h-4 ${recConfig.color}`} /> {recConfig.label}
                        </p>
                        {score.ai_reasoning && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {score.ai_reasoning}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedScore(score);
                        setShowDetailModal(true);
                      }}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
                    >
                      Voir détails
                    </button>
                    {score.market_url && (
                      <a
                        href={score.market_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg ${
                          isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                        }`}
                        title="Ouvrir dans BOAMP"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchive(score.id);
                      }}
                      className={`px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg ${
                        isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                      }`}
                      title="Archiver"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(score.id);
                      }}
                      className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showDetailModal && selectedScore && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300`}>
            <div className={`sticky top-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between`}>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Détails du marché
              </h3>
              <button onClick={() => setShowDetailModal(false)}>
                <X className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {selectedScore.market_title}
                </h4>
                {selectedScore.market_description && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedScore.market_description}
                  </p>
                )}
              </div>

              {selectedScore.key_strengths.length > 0 && (
                <div>
                  <h5 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Points forts
                  </h5>
                  <ul className="space-y-1">
                    {selectedScore.key_strengths.map((strength, idx) => (
                      <li key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start gap-2`}>
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedScore.key_risks.length > 0 && (
                <div>
                  <h5 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Risques identifiés
                  </h5>
                  <ul className="space-y-1">
                    {selectedScore.key_risks.map((risk, idx) => (
                      <li key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start gap-2`}>
                        <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAction(selectedScore.id, 'respond')}
                  className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
                >
                  <CheckCircle className="w-5 h-5" />
                  Répondre
                </button>
                <button
                  onClick={() => handleAction(selectedScore.id, 'request_expert')}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
                >
                  <Users className="w-5 h-5" />
                  Activer Expert
                </button>
                <button
                  onClick={() => handleAction(selectedScore.id, 'order_memory')}
                  className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
                >
                  <FileText className="w-5 h-5" />
                  Commander Mémoire
                </button>
                <button
                  onClick={() => handleAction(selectedScore.id, 'ignore')}
                  className={`px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  <ThumbsDown className="w-5 h-5" />
                  Ignorer
                </button>
              </div>

              <div className="flex gap-3 mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}">
                <button
                  onClick={() => handleArchive(selectedScore.id)}
                  className={`flex-1 px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium ${
                    isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  <Archive className="w-4 h-4" />
                  Archiver
                </button>
                <button
                  onClick={() => handleDelete(selectedScore.id)}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
