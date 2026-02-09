import React, { useState, useEffect } from 'react';
import { Shield, TrendingUp, AlertTriangle, X, CheckCircle, ThumbsDown, Users, FileText, ExternalLink, Calendar, MapPin, Euro, Sparkles, BarChart3, Target, Clock, Trash2, Archive, Bell, Plus, Play, Pause, Mail, Tag, Edit2, Save, Search as SearchIcon, AlertCircle, Star, Building, Brain } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { MarketRelevanceScore, MarketSentinelStats, ScoreCategory, AIRecommendation } from '../../types/boamp';
import { CreateAlertForm } from './CreateAlertForm';
import { AIAnalysisModal } from './AIAnalysisModal';

interface SearchAlert {
  id: string;
  name: string;
  keywords: string[];
  match_all_keywords: boolean;
  search_params: any;
  frequency: string;
  is_active: boolean;
  notifications_enabled: boolean;
  last_checked_at?: string;
  created_at: string;
}

interface AlertDetection {
  id: string;
  alert_id: string;
  market_reference: string;
  market_title: string;
  market_client?: string;
  market_description?: string;
  market_amount?: number;
  market_location?: string;
  market_deadline?: string;
  market_url?: string;
  market_service_type?: string;
  detected_at: string;
  is_read: boolean;
  is_favorited: boolean;
}

interface DetectionWithScore extends AlertDetection {
  score?: MarketRelevanceScore;
  alert_name?: string;
}

type TabType = 'alerts' | 'detections' | 'stats';

export const MarketSentinel: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('detections');
  const [loading, setLoading] = useState(true);

  // Alertes
  const [searchAlerts, setSearchAlerts] = useState<SearchAlert[]>([]);
  const [showCreateAlertForm, setShowCreateAlertForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  // Détections et scores
  const [detections, setDetections] = useState<DetectionWithScore[]>([]);
  const [filterCategory, setFilterCategory] = useState<ScoreCategory | 'all'>('all');
  const [filterAlert, setFilterAlert] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'favorited'>('all');
  const [selectedDetection, setSelectedDetection] = useState<DetectionWithScore | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetectionForAnalysis, setSelectedDetectionForAnalysis] = useState<DetectionWithScore | null>(null);
  const [showAIAnalysisModal, setShowAIAnalysisModal] = useState(false);

  // Statistiques
  const [stats, setStats] = useState<MarketSentinelStats | null>(null);
  const [alertStats, setAlertStats] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user) {
      loadAll();
    }
  }, [user]);

  useEffect(() => {
    if (user && activeTab === 'detections') {
      loadDetections();
    }
  }, [user, activeTab, filterAlert, filterStatus]);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      loadAlerts(),
      loadDetections(),
      loadStats()
    ]);
    setLoading(false);
  };

  const loadAlerts = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('search_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearchAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const loadDetections = async () => {
    if (!user) return;
    try {
      let detectionsQuery = supabase
        .from('market_alert_detections')
        .select('*')
        .eq('user_id', user.id)
        .order('detected_at', { ascending: false });

      if (filterAlert !== 'all') {
        detectionsQuery = detectionsQuery.eq('alert_id', filterAlert);
      }

      if (filterStatus === 'unread') {
        detectionsQuery = detectionsQuery.eq('is_read', false);
      } else if (filterStatus === 'favorited') {
        detectionsQuery = detectionsQuery.eq('is_favorited', true);
      }

      const { data: detectionsData, error: detectionsError } = await detectionsQuery;
      if (detectionsError) throw detectionsError;

      const { data: scoresData, error: scoresError } = await supabase
        .from('market_relevance_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false);

      if (scoresError) throw scoresError;

      const scoresMap = new Map(
        (scoresData || []).map(score => [score.market_reference, score])
      );

      const alertsMap = new Map(
        searchAlerts.map(alert => [alert.id, alert.name])
      );

      const enrichedDetections: DetectionWithScore[] = (detectionsData || []).map(detection => ({
        ...detection,
        score: scoresMap.get(detection.market_reference),
        alert_name: alertsMap.get(detection.alert_id)
      }));

      setDetections(enrichedDetections);
    } catch (error) {
      console.error('Error loading detections:', error);
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

      for (const alert of searchAlerts) {
        const { data: alertData, error: alertError } = await supabase.rpc('calculate_sentinel_stats', {
          p_user_id: user.id,
          p_alert_id: alert.id,
          p_period_start: periodStart.toISOString(),
          p_period_end: new Date().toISOString()
        });

        if (!alertError && alertData) {
          setAlertStats(prev => ({ ...prev, [alert.id]: alertData }));
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleToggleAlert = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('search_alerts')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;
      setSearchAlerts(prev => prev.map(a =>
        a.id === id ? { ...a, is_active: !currentState } : a
      ));
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  const handleToggleNotifications = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('search_alerts')
        .update({ notifications_enabled: !currentState })
        .eq('id', id);

      if (error) throw error;
      setSearchAlerts(prev => prev.map(a =>
        a.id === id ? { ...a, notifications_enabled: !currentState } : a
      ));
    } catch (error) {
      console.error('Error toggling notifications:', error);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('Supprimer cette alerte ? Les détections associées seront conservées.')) return;

    try {
      const { error } = await supabase
        .from('search_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSearchAlerts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const handleUpdateAlertName = async (id: string) => {
    if (!editName.trim()) return;

    try {
      const { error } = await supabase
        .from('search_alerts')
        .update({ name: editName })
        .eq('id', id);

      if (error) throw error;
      setSearchAlerts(prev => prev.map(a =>
        a.id === id ? { ...a, name: editName } : a
      ));
      setEditingAlert(null);
      setEditName('');
    } catch (error) {
      console.error('Error updating alert name:', error);
    }
  };

  const handleAction = async (detection: DetectionWithScore, action: AIRecommendation) => {
    try {
      if (detection.score) {
        await supabase
          .from('market_relevance_scores')
          .update({
            user_action: action,
            action_taken_at: new Date().toISOString(),
            is_read: true
          })
          .eq('id', detection.score.id);
      }

      await supabase
        .from('market_alert_detections')
        .update({ is_read: true })
        .eq('id', detection.id);

      if (action === 'respond' && user) {
        const { error: marketError } = await supabase
          .from('markets')
          .insert({
            title: detection.market_title,
            reference: detection.market_reference,
            client: detection.market_client || 'Non spécifié',
            deadline: detection.market_deadline,
            budget: detection.market_amount,
            status: 'en_cours',
            description: detection.market_description || '',
            user_id: user.id,
            credit_consumed: false,
            market_url: detection.market_url
          });

        if (marketError) {
          console.error('Error creating market:', marketError);
          alert('Erreur lors de la création du marché: ' + marketError.message);
        } else {
          alert('Marché créé avec succès ! Vous pouvez le consulter dans la section Marchés.');
        }
      }

      loadDetections();
      loadStats();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error handling action:', error);
    }
  };

  const handleToggleFavorite = async (detectionId: string, currentState: boolean) => {
    try {
      if (currentState) {
        await supabase
          .from('market_alert_detections')
          .update({ is_favorited: false })
          .eq('id', detectionId);
        alert('Marché retiré des favoris');
      } else {
        const detection = detections.find(d => d.id === detectionId);
        if (!detection) return;

        const { data: existingMarket } = await supabase
          .from('markets')
          .select('id')
          .eq('reference', detection.market_reference)
          .eq('user_id', user?.id)
          .maybeSingle();

        if (existingMarket) {
          alert('Ce marché existe déjà dans "Mes Marchés"');
          return;
        }

        const deadline = detection.market_deadline
          ? new Date(detection.market_deadline).toISOString().split('T')[0]
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const { error: marketError } = await supabase.from('markets').insert({
          title: detection.market_title || 'Marché sans titre',
          reference: detection.market_reference || `REF-${Date.now()}`,
          client: detection.market_client || 'Client non spécifié',
          deadline: deadline,
          budget: detection.market_amount || 0,
          description: detection.market_description || '',
          status: 'en_cours',
          user_id: user?.id,
          global_memory_prompt: ''
        });

        if (marketError) throw marketError;

        await supabase
          .from('market_alert_detections')
          .update({ is_favorited: true })
          .eq('id', detectionId);

        alert('✓ Marché ajouté à "Mes Marchés" avec succès !');
      }

      loadDetections();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Erreur lors de l\'ajout du marché');
    }
  };

  const handleMarkAsRead = async (detectionId: string) => {
    try {
      await supabase
        .from('market_alert_detections')
        .update({ is_read: true })
        .eq('id', detectionId);

      loadDetections();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDeleteDetection = async (detectionId: string, scoreId?: string) => {
    if (!confirm('Supprimer cette détection ?')) return;

    try {
      if (scoreId) {
        await supabase
          .from('market_relevance_scores')
          .delete()
          .eq('id', scoreId);
      }

      await supabase
        .from('market_alert_detections')
        .delete()
        .eq('id', detectionId);

      loadDetections();
      loadStats();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error deleting detection:', error);
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

  const formatSearchParams = (params: any): string => {
    const parts: string[] = [];
    if (params.location) parts.push(`📍 ${params.location}`);
    if (params.serviceType) parts.push(`🏢 ${params.serviceType}`);
    if (params.minAmount) parts.push(`💰 Min: ${params.minAmount}€`);
    if (params.maxAmount) parts.push(`💰 Max: ${params.maxAmount}€`);
    if (params.minDeadline) parts.push(`📅 Après le ${new Date(params.minDeadline).toLocaleDateString('fr-FR')}`);
    return parts.join(' • ') || 'Aucun filtre';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Jamais';
    return new Date(dateString).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const unreadCount = detections.filter(d => !d.is_read).length;

  const renderAlertsTab = () => (
    <div className="space-y-6">
      {!showCreateAlertForm && (
        <button
          onClick={() => setShowCreateAlertForm(true)}
          className="w-full p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Créer une nouvelle alerte
        </button>
      )}

      {showCreateAlertForm && (
        <CreateAlertForm
          onSuccess={async () => {
            setShowCreateAlertForm(false);
            await loadAlerts();
            await new Promise(resolve => setTimeout(resolve, 1000));
            await loadDetections();
            await loadStats();
          }}
          onCancel={() => setShowCreateAlertForm(false)}
        />
      )}

      {searchAlerts.length === 0 && !showCreateAlertForm ? (
        <div className={`p-12 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <Bell className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Aucune alerte configurée
          </h3>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Créez une alerte pour être notifié automatiquement des nouveaux marchés correspondants
          </p>
        </div>
      ) : (
        searchAlerts.map(alert => {
          const alertStat = alertStats[alert.id];
          return (
            <div
              key={alert.id}
              className={`p-6 rounded-xl shadow-lg transition-all duration-200 ${
                isDark ? 'bg-gray-800' : 'bg-white'
              } ${alert.is_active ? 'border-2 border-green-500' : 'border-2 border-transparent'}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  {editingAlert === alert.id ? (
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className={`px-3 py-2 border rounded-lg flex-1 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                        }`}
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdateAlertName(alert.id)}
                        className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingAlert(null);
                          setEditName('');
                        }}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mb-3">
                      {alert.notifications_enabled && (
                        <div className="bg-orange-500 p-1.5 rounded-lg">
                          <Bell className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {alert.name}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        alert.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {alert.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  )}

                  {alert.keywords && alert.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {alert.keywords.map((keyword, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          {keyword}
                        </span>
                      ))}
                      {alert.match_all_keywords && (
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                          Tous requis
                        </span>
                      )}
                    </div>
                  )}

                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {formatSearchParams(alert.search_params)}
                  </p>

                  {alertStat && (
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Détections</div>
                        <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{alertStat.total_markets}</div>
                      </div>
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                        <div className="text-xs text-green-600 mb-1">GO</div>
                        <div className="text-lg font-bold text-green-600">{alertStat.go_count}</div>
                      </div>
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Score moyen</div>
                        <div className={`text-lg font-bold ${getScoreColor(alertStat.avg_score)}`}>{alertStat.avg_score}/100</div>
                      </div>
                    </div>
                  )}

                  {alert.last_checked_at && (
                    <div className={`flex items-center gap-1 text-sm mt-3 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      <Clock className="w-4 h-4" />
                      Dernière vérification: {formatDate(alert.last_checked_at)}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleToggleAlert(alert.id, alert.is_active)}
                    className={`p-2 rounded-lg ${
                      alert.is_active
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    title={alert.is_active ? 'Mettre en pause' : 'Activer'}
                  >
                    {alert.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleToggleNotifications(alert.id, alert.notifications_enabled)}
                    className={`p-2 rounded-lg ${
                      alert.notifications_enabled
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : isDark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                    title={alert.notifications_enabled ? 'Désactiver les notifications' : 'Activer les notifications'}
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingAlert(alert.id);
                      setEditName(alert.name);
                    }}
                    className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                    title="Modifier le nom"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {searchAlerts.length > 0 && (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border border-blue-500/30' : 'bg-blue-50 border border-blue-200'}`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className="text-sm">
              <p className={`font-medium mb-1 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                Comment fonctionnent les alertes ?
              </p>
              <ul className={`space-y-1 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                <li>• Les alertes sont vérifiées automatiquement 2 fois par jour (8h et 18h)</li>
                <li>• Vous recevez un email avec les nouveaux marchés détectés</li>
                <li>• Consultez tous les résultats dans l'onglet "Détections"</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderDetectionsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <select
          value={filterAlert}
          onChange={(e) => setFilterAlert(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${
            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          }`}
        >
          <option value="all">Toutes les alertes</option>
          {searchAlerts.map(alert => (
            <option key={alert.id} value={alert.id}>{alert.name}</option>
          ))}
        </select>

        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterStatus('unread')}
            className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
              filterStatus === 'unread'
                ? 'bg-blue-600 text-white'
                : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Non lus {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setFilterStatus('favorited')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterStatus === 'favorited'
                ? 'bg-blue-600 text-white'
                : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
            }`}
          >
            <Star className="w-4 h-4" />
          </button>
        </div>
      </div>

      {detections.length === 0 ? (
        <div className="text-center py-12">
          <Shield className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Aucune détection pour le moment
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {detections.map((detection) => {
            const score = detection.score;
            const categoryConfig = score ? getCategoryConfig(score.score_category) : null;
            const CategoryIcon = categoryConfig?.icon;
            const recConfig = score ? getRecommendationConfig(score.ai_recommendation) : null;
            const RecIcon = recConfig?.icon;

            return (
              <div
                key={detection.id}
                className={`p-5 rounded-xl border-2 ${
                  categoryConfig ? categoryConfig.bgClass : isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } ${!detection.is_read ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-md'} hover:shadow-xl transition-all hover:scale-[1.01]`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {score && categoryConfig && (
                        <>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${categoryConfig.badgeClass}`}>
                            {categoryConfig.label}
                          </span>
                          <span className={`text-2xl font-bold ${getScoreColor(score.relevance_score)}`}>
                            {score.relevance_score}/100
                          </span>
                        </>
                      )}
                      {!detection.is_read && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          NOUVEAU
                        </span>
                      )}
                      {detection.alert_name && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {detection.alert_name}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                      {detection.market_title}
                    </h3>
                    {detection.market_reference && (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                        Réf: {detection.market_reference}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {CategoryIcon && <CategoryIcon className={`w-6 h-6 ${categoryConfig?.textClass}`} />}
                    <button
                      onClick={() => handleToggleFavorite(detection.id, detection.is_favorited)}
                      className={`p-2 rounded-lg transition-colors ${
                        detection.is_favorited
                          ? 'bg-yellow-500 text-white'
                          : isDark ? 'bg-gray-700 text-gray-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Star className={`w-5 h-5 ${detection.is_favorited ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {detection.market_location && (
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {detection.market_location}
                      </span>
                    </div>
                  )}
                  {detection.market_amount && (
                    <div className="flex items-center gap-2">
                      <Euro className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {detection.market_amount.toLocaleString()} €
                      </span>
                    </div>
                  )}
                  {detection.market_deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {new Date(detection.market_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {score && recConfig && RecIcon && (
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
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedDetectionForAnalysis(detection);
                      setShowAIAnalysisModal(true);
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium"
                    title="Analyse IA GO/NO GO"
                  >
                    <Brain className="w-4 h-4" />
                    Analyse IA
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDetection(detection);
                      setShowDetailModal(true);
                      if (!detection.is_read) {
                        handleMarkAsRead(detection.id);
                      }
                    }}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    Voir détails
                  </button>
                  {detection.market_url && (
                    <a
                      href={detection.market_url}
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
                    onClick={() => handleDeleteDetection(detection.id, score?.id)}
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
  );

  const renderStatsTab = () => (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div>
        <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Statistiques par alerte (30 derniers jours)
        </h3>
        <div className="space-y-4">
          {searchAlerts.map(alert => {
            const alertStat = alertStats[alert.id];
            if (!alertStat) return null;

            return (
              <div
                key={alert.id}
                className={`p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {alert.name}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    alert.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {alert.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total</div>
                    <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{alertStat.total_markets}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                    <div className="text-xs text-green-600 mb-1">GO</div>
                    <div className="text-xl font-bold text-green-600">{alertStat.go_count}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
                    <div className="text-xs text-orange-600 mb-1">CONDITIONAL</div>
                    <div className="text-xl font-bold text-orange-600">{alertStat.conditional_count}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className="text-xs text-red-600 mb-1">NO-GO</div>
                    <div className="text-xl font-bold text-red-600">{alertStat.no_go_count || 0}</div>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Score moyen</div>
                    <div className={`text-xl font-bold ${getScoreColor(alertStat.avg_score)}`}>{alertStat.avg_score}/100</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

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
                Veille intelligente avec détection automatique de marchés
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <div className="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold">
                {unreadCount} nouveau{unreadCount > 1 ? 'x' : ''}
              </div>
            )}
            <Target className={`w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('detections')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
              activeTab === 'detections'
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white scale-105'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Détections ({detections.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
              activeTab === 'alerts'
                ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white scale-105'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Mes Alertes ({searchAlerts.filter(a => a.is_active).length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white scale-105'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Statistiques
            </div>
          </button>
        </div>

        {activeTab === 'alerts' && renderAlertsTab()}
        {activeTab === 'detections' && renderDetectionsTab()}
        {activeTab === 'stats' && renderStatsTab()}
      </div>

      {showDetailModal && selectedDetection && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className={`${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300`}>
            <div className={`sticky top-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 flex items-center justify-between z-10`}>
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
                  {selectedDetection.market_title}
                </h4>
                {selectedDetection.market_description && (
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {selectedDetection.market_description}
                  </p>
                )}
              </div>

              {selectedDetection.market_client && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Client</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedDetection.market_client}
                  </p>
                </div>
              )}

              {selectedDetection.score && selectedDetection.score.key_strengths.length > 0 && (
                <div>
                  <h5 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Points forts
                  </h5>
                  <ul className="space-y-1">
                    {selectedDetection.score.key_strengths.map((strength, idx) => (
                      <li key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start gap-2`}>
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDetection.score && selectedDetection.score.key_risks.length > 0 && (
                <div>
                  <h5 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Risques identifiés
                  </h5>
                  <ul className="space-y-1">
                    {selectedDetection.score.key_risks.map((risk, idx) => (
                      <li key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} flex items-start gap-2`}>
                        <AlertTriangle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDetection.score && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleAction(selectedDetection, 'respond')}
                    className="px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Répondre
                  </button>
                  <button
                    onClick={() => handleAction(selectedDetection, 'request_expert')}
                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
                  >
                    <Users className="w-5 h-5" />
                    Activer Expert
                  </button>
                  <button
                    onClick={() => handleAction(selectedDetection, 'order_memory')}
                    className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
                  >
                    <FileText className="w-5 h-5" />
                    Commander Mémoire
                  </button>
                  <button
                    onClick={() => handleAction(selectedDetection, 'ignore')}
                    className={`px-4 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <ThumbsDown className="w-5 h-5" />
                    Ignorer
                  </button>
                </div>
              )}

              <div className={`flex gap-3 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={() => handleDeleteDetection(selectedDetection.id, selectedDetection.score?.id)}
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

      {showAIAnalysisModal && selectedDetectionForAnalysis && (
        <AIAnalysisModal
          isOpen={showAIAnalysisModal}
          onClose={() => {
            setShowAIAnalysisModal(false);
            setSelectedDetectionForAnalysis(null);
            loadDetections();
            loadStats();
          }}
          marketData={{
            title: selectedDetectionForAnalysis.market_title || 'Marché sans titre',
            reference: selectedDetectionForAnalysis.market_reference || '',
            client: selectedDetectionForAnalysis.market_client,
            description: selectedDetectionForAnalysis.market_description,
            amount: selectedDetectionForAnalysis.market_amount,
            location: selectedDetectionForAnalysis.market_location,
            deadline: selectedDetectionForAnalysis.market_deadline,
            service_type: selectedDetectionForAnalysis.market_service_type
          }}
        />
      )}
    </div>
  );
};
