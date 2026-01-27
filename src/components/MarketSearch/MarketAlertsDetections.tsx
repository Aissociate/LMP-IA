import React, { useState, useEffect } from 'react';
import { Bell, Star, Eye, Calendar, MapPin, Euro, ExternalLink, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

interface MarketDetection {
  id: string;
  alert_id: string;
  market_reference: string;
  market_title: string;
  market_client: string;
  market_description: string | null;
  market_amount: number | null;
  market_location: string | null;
  market_deadline: string | null;
  market_url: string | null;
  market_service_type: string | null;
  detected_at: string;
  is_read: boolean;
  is_favorited: boolean;
  alert?: {
    name: string;
  };
}

export const MarketAlertsDetections: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [detections, setDetections] = useState<MarketDetection[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'favorited'>('unread');
  const [selectedAlert, setSelectedAlert] = useState<string>('all');
  const [alerts, setAlerts] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    loadDetections();
    loadAlerts();
  }, [filter, selectedAlert]);

  const loadAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('search_alerts')
        .select('id, name')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const loadDetections = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('market_alert_detections')
        .select(`
          *,
          alert:search_alerts(name)
        `)
        .eq('user_id', user?.id)
        .order('detected_at', { ascending: false });

      if (filter === 'unread') {
        query = query.eq('is_read', false);
      } else if (filter === 'favorited') {
        query = query.eq('is_favorited', true);
      }

      if (selectedAlert !== 'all') {
        query = query.eq('alert_id', selectedAlert);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDetections(data || []);
    } catch (error) {
      console.error('Error loading detections:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('market_alert_detections')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
      loadDetections();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const toggleFavorite = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('market_alert_detections')
        .update({ is_favorited: !currentState })
        .eq('id', id);

      if (error) throw error;
      loadDetections();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const deleteDetection = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette détection ?')) return;

    try {
      const { error } = await supabase
        .from('market_alert_detections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadDetections();
    } catch (error) {
      console.error('Error deleting detection:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('market_alert_detections')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;
      loadDetections();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'Non communiqué';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'Non communiquée';
    const date = new Date(deadline);
    const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const dateStr = date.toLocaleDateString('fr-FR');

    if (daysUntil < 0) return <span className="text-red-600">{dateStr} (Expirée)</span>;
    if (daysUntil <= 7) return <span className="text-red-600">{dateStr} ({daysUntil}j restants)</span>;
    if (daysUntil <= 14) return <span className="text-orange-600">{dateStr} ({daysUntil}j restants)</span>;
    return `${dateStr} (${daysUntil}j restants)`;
  };

  const unreadCount = detections.filter(d => !d.is_read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Marchés détectés
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {detections.length} détection{detections.length > 1 ? 's' : ''}
                {unreadCount > 0 && ` · ${unreadCount} non lu${unreadCount > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Tout marquer comme lu
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-orange-500 text-white'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-orange-500 text-white'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Non lus {unreadCount > 0 && `(${unreadCount})`}
          </button>
          <button
            onClick={() => setFilter('favorited')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'favorited'
                ? 'bg-orange-500 text-white'
                : isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Favoris
          </button>

          <select
            value={selectedAlert}
            onChange={(e) => setSelectedAlert(e.target.value)}
            className={`px-4 py-2 rounded-lg border font-medium ${
              isDark
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            }`}
          >
            <option value="all">Toutes les alertes</option>
            {alerts.map(alert => (
              <option key={alert.id} value={alert.id}>{alert.name}</option>
            ))}
          </select>
        </div>
      </div>

      {detections.length === 0 ? (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-12 text-center`}>
          <Bell className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Aucune détection
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Aucun marché détecté avec les critères sélectionnés.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {detections.map((detection) => (
            <div
              key={detection.id}
              className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 ${
                !detection.is_read ? 'border-l-4 border-orange-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {detection.alert && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        <Bell className="w-3 h-3" />
                        {detection.alert.name}
                      </span>
                    )}
                    {!detection.is_read && (
                      <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                        Nouveau
                      </span>
                    )}
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Détecté le {new Date(detection.detected_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {detection.market_title}
                  </h3>
                  <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {detection.market_client}
                  </p>
                  {detection.market_description && (
                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {detection.market_description.substring(0, 200)}
                      {detection.market_description.length > 200 && '...'}
                    </p>
                  )}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {detection.market_location && (
                      <div className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {detection.market_location}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Euro className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {formatAmount(detection.market_amount)}
                      </span>
                    </div>
                    {detection.market_deadline && (
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {formatDeadline(detection.market_deadline)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {!detection.is_read && (
                  <button
                    onClick={() => markAsRead(detection.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    <Eye className="w-4 h-4" />
                    Marquer comme lu
                  </button>
                )}
                <button
                  onClick={() => toggleFavorite(detection.id, detection.is_favorited)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    detection.is_favorited
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <Star className={`w-4 h-4 ${detection.is_favorited ? 'fill-current' : ''}`} />
                  {detection.is_favorited ? 'Favori' : 'Ajouter aux favoris'}
                </button>
                {detection.market_url && (
                  <a
                    href={detection.market_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Consulter le marché
                  </a>
                )}
                <button
                  onClick={() => deleteDetection(detection.id)}
                  className={`ml-auto flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-red-900/30 hover:bg-red-900/50 text-red-400'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
