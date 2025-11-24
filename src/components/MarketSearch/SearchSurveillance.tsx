import React, { useState, useEffect } from 'react';
import { Bell, Plus, Play, Pause, Trash2, CreditCard as Edit2, Save, X, Search, AlertCircle, Clock, TrendingUp, ExternalLink, Calendar, MapPin, Building, Euro, Star } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { BOAMPSearchParams, BOAMPMarket } from '../../types/boamp';
import { boampService } from '../../services/boampService';

interface SavedSearch {
  id: string;
  name: string;
  search_params: BOAMPSearchParams;
  created_at: string;
  updated_at: string;
  result_count?: number;
  last_executed?: string;
}

interface SearchAlert {
  id: string;
  name: string;
  search_params: BOAMPSearchParams;
  frequency: 'realtime' | 'daily' | 'weekly';
  is_active: boolean;
  last_checked_at?: string;
  created_at: string;
}

export const SearchSurveillance: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchAlerts, setSearchAlerts] = useState<SearchAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSearch, setEditingSearch] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [activeTab, setActiveTab] = useState<'searches' | 'alerts'>('searches');
  const [executingSearch, setExecutingSearch] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<BOAMPMarket[] | null>(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedSearchName, setSelectedSearchName] = useState('');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadSavedSearches();
      loadSearchAlerts();
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('boamp_favorites')
        .select('boamp_reference')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(new Set(data.map(f => f.boamp_reference)));
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const loadSavedSearches = async () => {
    try {
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSavedSearches(data || []);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const loadSearchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('search_alerts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearchAlerts(data || []);
    } catch (error) {
      console.error('Error loading search alerts:', error);
    }
  };

  const handleDeleteSearch = async (id: string) => {
    if (!confirm('Supprimer cette recherche sauvegardée ?')) return;

    try {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSavedSearches(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting search:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleUpdateSearchName = async (id: string) => {
    if (!editName.trim()) return;

    try {
      const { error } = await supabase
        .from('saved_searches')
        .update({ name: editName })
        .eq('id', id);

      if (error) throw error;

      setSavedSearches(prev => prev.map(s =>
        s.id === id ? { ...s, name: editName } : s
      ));
      setEditingSearch(null);
      setEditName('');
    } catch (error) {
      console.error('Error updating search name:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleExecuteSearch = async (search: SavedSearch) => {
    setExecutingSearch(search.id);
    try {
      const result = await boampService.searchMarkets(search.search_params);

      await supabase
        .from('saved_searches')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', search.id);

      setSavedSearches(prev => prev.map(s =>
        s.id === search.id
          ? { ...s, result_count: result.total, last_executed: new Date().toISOString() }
          : s
      ));

      setSearchResults(result.markets);
      setSelectedSearchName(search.name);
      setShowResultsModal(true);
    } catch (error) {
      console.error('Error executing search:', error);
      alert('Erreur lors de l\'exécution de la recherche');
    } finally {
      setExecutingSearch(null);
    }
  };

  const handleToggleFavorite = async (market: BOAMPMarket) => {
    if (!user) return;

    const isFavorite = favorites.has(market.reference);

    if (isFavorite) {
      try {
        const { error } = await supabase
          .from('boamp_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('boamp_reference', market.reference);

        if (error) throw error;
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(market.reference);
          return newSet;
        });
      } catch (error) {
        console.error('Error removing favorite:', error);
      }
    } else {
      try {
        const { error } = await supabase.from('boamp_favorites').insert({
          user_id: user.id,
          boamp_reference: market.reference,
          title: market.title,
          client: market.client,
          description: market.description,
          deadline: market.deadline || null,
          amount: market.amount || 0,
          location: market.location,
          publication_date: market.publicationDate || null,
          procedure_type: market.procedureType,
          service_type: market.serviceType,
          cpv_code: market.cpvCode,
          url: market.url,
          raw_data: market.rawData || {}
        });

        if (error) throw error;
        setFavorites(prev => new Set([...prev, market.reference]));
      } catch (error) {
        console.error('Error adding favorite:', error);
      }
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
      alert('Erreur lors de la modification de l\'alerte');
    }
  };

  const handleDeleteAlert = async (id: string) => {
    if (!confirm('Supprimer cette alerte ?')) return;

    try {
      const { error } = await supabase
        .from('search_alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSearchAlerts(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Error deleting alert:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatSearchParams = (params: BOAMPSearchParams): string => {
    const parts: string[] = [];
    if (params.keywords) parts.push(`"${params.keywords}"`);
    if (params.location?.length) parts.push(`📍 ${params.location.join(', ')}`);
    if (params.serviceTypes?.length) parts.push(`🏢 ${params.serviceTypes.join(', ')}`);
    if (params.deadlineFrom) parts.push(`📅 Après le ${new Date(params.deadlineFrom).toLocaleDateString('fr-FR')}`);
    if (params.amountMin) parts.push(`💰 Min: ${params.amountMin}€`);
    return parts.join(' • ') || 'Aucun critère';
  };

  const formatFrequency = (freq: string) => {
    const map = {
      realtime: 'Temps réel',
      daily: 'Quotidien',
      weekly: 'Hebdomadaire'
    };
    return map[freq as keyof typeof map] || freq;
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

  const formatMarketDate = (dateString: string) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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

  return (
    <div className={`p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 rounded-xl shadow-lg">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Surveillance des Marchés
            </h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Gérez vos recherches sauvegardées et vos alertes automatiques
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setActiveTab('searches')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'searches'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : isDark
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Recherches sauvegardées ({savedSearches.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'alerts'
                ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                : isDark
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alertes actives ({searchAlerts.filter(a => a.is_active).length})
            </div>
          </button>
        </div>
      </div>

      {activeTab === 'searches' && (
        <div className="space-y-4">
          {savedSearches.length === 0 ? (
            <div className={`p-12 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <Search className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Aucune recherche sauvegardée
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Utilisez le bouton "Sauvegarder cette recherche" dans la page de recherche
              </p>
            </div>
          ) : (
            savedSearches.map(search => (
              <div
                key={search.id}
                className={`p-6 rounded-xl shadow-lg transition-all duration-200 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {editingSearch === search.id ? (
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className={`px-3 py-2 border rounded-lg flex-1 ${
                            isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                          }`}
                          placeholder="Nom de la recherche"
                          autoFocus
                        />
                        <button
                          onClick={() => handleUpdateSearchName(search.id)}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingSearch(null);
                            setEditName('');
                          }}
                          className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {search.name}
                      </h3>
                    )}

                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatSearchParams(search.search_params)}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      {search.last_executed && (
                        <div className={`flex items-center gap-1 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          <Clock className="w-4 h-4" />
                          {formatDate(search.last_executed)}
                        </div>
                      )}
                      {search.result_count !== undefined && (
                        <div className={`flex items-center gap-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                          <TrendingUp className="w-4 h-4" />
                          {search.result_count} résultats
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleExecuteSearch(search)}
                      disabled={executingSearch === search.id}
                      className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      title="Exécuter la recherche"
                    >
                      {executingSearch === search.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingSearch(search.id);
                        setEditName(search.name);
                      }}
                      className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                      title="Modifier le nom"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSearch(search.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl flex items-start gap-3 ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className="text-sm">
              <p className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                Fonctionnalité en développement
              </p>
              <p className={isDark ? 'text-blue-400' : 'text-blue-700'}>
                Les alertes automatiques seront bientôt disponibles. Vous pourrez recevoir des notifications par email ou SMS lorsqu'un nouveau marché correspondant à vos critères est publié.
              </p>
            </div>
          </div>

          {searchAlerts.length === 0 ? (
            <div className={`p-12 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <Bell className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Aucune alerte configurée
              </h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Créez une alerte pour être notifié automatiquement des nouveaux marchés
              </p>
            </div>
          ) : (
            searchAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-6 rounded-xl shadow-lg transition-all duration-200 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } ${alert.is_active ? 'border-2 border-green-500' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {formatFrequency(alert.frequency)}
                      </span>
                    </div>

                    <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {formatSearchParams(alert.search_params)}
                    </p>

                    {alert.last_checked_at && (
                      <div className={`flex items-center gap-1 text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        <Clock className="w-4 h-4" />
                        Dernière vérification: {formatDate(alert.last_checked_at)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
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
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showResultsModal && searchResults && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col`}>
            <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <div>
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Résultats: {selectedSearchName}
                </h2>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {searchResults.length} marché(s) trouvé(s)
                </p>
              </div>
              <button
                onClick={() => {
                  setShowResultsModal(false);
                  setSearchResults(null);
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {searchResults.map((market) => {
                const daysRemaining = getDaysRemaining(market.deadline);
                const isFavorite = favorites.has(market.reference);

                return (
                  <div
                    key={market.id}
                    className={`rounded-xl shadow-lg overflow-hidden transition-all duration-200 ${
                      isDark ? 'bg-gray-900 hover:bg-gray-850' : 'bg-white hover:shadow-xl'
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} flex-1`}>
                              {market.title}
                            </h3>
                            <button
                              onClick={() => handleToggleFavorite(market)}
                              className={`p-2 rounded-lg transition-colors ${
                                isFavorite
                                  ? 'bg-yellow-500 text-white'
                                  : isDark
                                    ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                            Ref: {market.reference}
                          </p>
                        </div>
                      </div>

                      <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {market.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Building className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {market.client}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {market.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Échéance: {formatMarketDate(market.deadline)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Euro className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {formatAmount(market.amount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {daysRemaining !== null && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              daysRemaining <= 7
                                ? 'bg-red-100 text-red-800'
                                : daysRemaining <= 14
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-green-100 text-green-800'
                            }`}>
                              {daysRemaining > 0 ? `${daysRemaining}j restants` : 'Expiré'}
                            </span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {market.serviceType}
                          </span>
                        </div>

                        <a
                          href={market.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          Voir l'annonce
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
