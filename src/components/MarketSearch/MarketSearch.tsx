import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  Bell,
  Grid3x3,
  List,
  Star,
  MapPin,
  Building,
  Calendar,
  Euro,
  ExternalLink,
  Share2,
  Eye,
  Bookmark
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { boampService } from '../../services/boampService';
import { BOAMPSearchParams, BOAMPMarket, BOAMPSearchResult } from '../../types/boamp';
import { MarketSearchFilters } from './MarketSearchFilters';
import { MarketSearchCompact } from './MarketSearchCompact';

type SearchMode = 'keyword' | 'reference';
type ViewMode = 'cards' | 'list';
type TabType = 'active' | 'archived' | 'awarded';

export const MarketSearch: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const location = useLocation();

  const [searchMode, setSearchMode] = useState<SearchMode>(() => {
    const saved = localStorage.getItem('marketSearchMode');
    return (saved as SearchMode) || 'keyword';
  });
  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('marketSearchQuery') || '';
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('marketViewMode');
    return (saved as ViewMode) || 'cards';
  });
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('marketActiveTab');
    return (saved as TabType) || 'active';
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<BOAMPSearchResult | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedMarket, setSelectedMarket] = useState<BOAMPMarket | null>(null);
  const [logs, setLogs] = useState<Array<{ type: 'info' | 'error' | 'success'; message: string; timestamp: Date }>>([]);
  const [showLogs, setShowLogs] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const loadSavedSearchParams = (): BOAMPSearchParams => {
    try {
      const saved = localStorage.getItem('marketSearchParams');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          page: 1,
          deadlineFrom: parsed.deadlineFrom || getTodayDate()
        };
      }
    } catch (error) {
      console.error('Error loading saved search params:', error);
    }
    return {
      page: 1,
      limit: 20,
      sortBy: 'publication_date',
      sortOrder: 'desc',
      deadlineFrom: getTodayDate()
    };
  };

  const [filters, setFilters] = useState<BOAMPSearchParams>(loadSavedSearchParams());

  const addLog = (type: 'info' | 'error' | 'success', message: string) => {
    setLogs(prev => [...prev, { type, message, timestamp: new Date() }]);
  };

  useEffect(() => {
    loadFavorites();
    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('marketSearchParams', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    localStorage.setItem('marketSearchMode', searchMode);
  }, [searchMode]);

  useEffect(() => {
    localStorage.setItem('marketSearchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('marketViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('marketActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (location.state) {
      const state = location.state as { filterBySession?: string; filterByDate?: string };
      if (state.filterBySession || state.filterByDate) {
        if (state.filterByDate) {
          setFilters(prev => ({
            ...prev,
            deadlineFrom: state.filterByDate,
            page: 1
          }));
        }
        handleSearch();
      }
    }
  }, [location.state]);

  // Déclencher la recherche quand la page change
  useEffect(() => {
    if (searchResult && filters.page !== searchResult.page) {
      handleSearch();
    }
  }, [filters.page]);

  const checkAdminStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('company')
        .eq('user_id', user.id)
        .single();
      const isAdminUser = data?.company?.toLowerCase() === 'admin';
      setIsAdmin(isAdminUser);
      addLog('info', `Statut utilisateur: ${isAdminUser ? 'Administrateur' : 'Utilisateur standard'} (company: ${data?.company || 'non défini'})`);
      console.log('Admin status:', isAdminUser, 'Company:', data?.company);
    } catch (error) {
      console.error('Error checking admin status:', error);
      addLog('error', 'Erreur lors de la vérification du statut admin');
    }
  };

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('boamp_favorites')
        .select('boamp_reference')
        .eq('user_id', user.id);

      if (error) throw error;

      const refs = new Set(data.map(f => f.boamp_reference));
      setFavorites(refs);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    addLog('info', `Lancement de la recherche en mode ${searchMode}...`);

    try {
      const searchParams: BOAMPSearchParams = {
        ...filters
      };

      if (searchQuery) {
        if (searchMode === 'reference') {
          searchParams.reference = searchQuery;
        } else {
          searchParams.keywords = searchQuery;
        }
      }

      const activeFilters = [];
      if (searchParams.keywords) activeFilters.push(`Mots-clés: "${searchParams.keywords}"`);
      if (searchParams.reference) activeFilters.push(`Référence: ${searchParams.reference}`);
      if (searchParams.location && searchParams.location.length > 0) {
        activeFilters.push(`Localisation: ${searchParams.location.join(', ')}`);
      }
      if (searchParams.serviceTypes && searchParams.serviceTypes.length > 0) {
        activeFilters.push(`Types: ${searchParams.serviceTypes.join(', ')}`);
      }
      if (searchParams.publicBuyer) activeFilters.push(`Acheteur: "${searchParams.publicBuyer}"`);
      if (searchParams.cpvCode) activeFilters.push(`CPV: ${searchParams.cpvCode}`);
      if (searchParams.amountMin || searchParams.amountMax) {
        const range = `${searchParams.amountMin || '0'}€ - ${searchParams.amountMax || '∞'}€`;
        activeFilters.push(`Montant: ${range}`);
      }
      if (searchParams.deadlineFrom || searchParams.deadlineTo) {
        const range = `${searchParams.deadlineFrom || '...'} - ${searchParams.deadlineTo || '...'}`;
        activeFilters.push(`Date limite: ${range}`);
      }

      if (activeFilters.length > 0) {
        addLog('info', `Filtres actifs:\n${activeFilters.map(f => `  • ${f}`).join('\n')}`);
      }

      const result = await boampService.searchMarketsWithManual(searchParams);

      addLog('success', `${result.total} résultat(s) trouvé(s) - ${result.markets.length} marché(s) dans cette page`);

      if (result.total > 0 && result.markets.length === 0) {
        addLog('error', `⚠️ L'API BOAMP retourne ${result.total} résultats mais aucun marché dans le tableau. Problème potentiel avec l'API BOAMP.`);
      }

      setSearchResult(result);

      // Enregistrer la recherche dans l'historique
      if (user) {
        try {
          await supabase.from('market_search_history').insert({
            user_id: user.id,
            search_mode: searchMode,
            search_query: searchQuery || '',
            filters: filters,
            results_count: result.total
          });
        } catch (historyError) {
          console.error('Error saving search history:', historyError);
        }
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || 'Erreur inconnue';
      addLog('error', `Erreur: ${errorMsg}`);
      console.error('Error searching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToFavorites = async (market: BOAMPMarket) => {
    if (!user) return;

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
        raw_data: market.rawData,
        is_imported_to_markets: false
      });

      if (error) {
        if (error.code === '23505') {
          alert('Ce marché est déjà dans vos favoris');
        } else {
          throw error;
        }
        return;
      }

      setFavorites(prev => new Set([...prev, market.reference]));
      alert('Marché ajouté aux favoris avec succès');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      alert('Erreur lors de l\'ajout aux favoris');
    }
  };

  const handleRemoveFromFavorites = async (reference: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('boamp_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('boamp_reference', reference);

      if (error) throw error;

      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(reference);
        return newSet;
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      alert('Erreur lors de la suppression des favoris');
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleProspect = async (market: BOAMPMarket) => {
    addLog('info', `Lancement de la prospection pour: ${market.title}`);

    try {
      // Extraire le département depuis rawData ou location
      let departement = '';
      if (market.rawData?.['departement']) {
        departement = market.rawData['departement'];
      } else if (market.rawData?.['code_postal']) {
        departement = String(market.rawData['code_postal']).substring(0, 2);
      } else if (market.location) {
        const match = market.location.match(/\b(\d{2})\b/);
        if (match) departement = match[1];
      }

      const webhookData = {
        url: market.url,
        departement: departement || 'Non défini',
        categorie: market.serviceType,
        date_depot: market.deadline,
        titre: market.title,
        client: market.client,
        localisation: market.location
      };

      addLog('info', `Envoi au webhook: ${JSON.stringify(webhookData, null, 2)}`);

      // Construire l'URL avec les paramètres en query string pour requête GET
      const params = new URLSearchParams({
        url: webhookData.url,
        departement: webhookData.departement,
        categorie: webhookData.categorie,
        date_depot: webhookData.date_depot,
        titre: webhookData.titre,
        client: webhookData.client,
        localisation: webhookData.localisation
      });

      const webhookUrl = `https://aissociatewf.app.n8n.cloud/webhook-test/6632cbf1-56ce-4f08-86e8-724d24b3c7bb?${params.toString()}`;

      const response = await fetch(webhookUrl, {
        method: 'GET'
      });

      addLog('info', `Statut HTTP: ${response.status}`);

      if (!response.ok) {
        const responseText = await response.text();
        addLog('error', `Réponse webhook: ${responseText}`);
        throw new Error(`Erreur webhook: ${response.status} ${response.statusText}`);
      }

      const result = await response.json().catch(() => ({ message: 'Webhook reçu' }));
      addLog('success', `Prospection lancée avec succès pour ${market.title}`);
      addLog('info', `Réponse webhook: ${JSON.stringify(result)}`);

    } catch (error: any) {
      const errorMsg = error?.message || error?.toString() || 'Erreur inconnue';
      addLog('error', `Erreur lors de la prospection: ${errorMsg}`);
      addLog('error', `Vérifiez que le webhook n8n est bien actif et que l'URL est correcte`);
      console.error('Error calling prospect webhook:', error);
    }
  };

  const handleSaveSearch = async () => {
    if (!user) {
      alert('Vous devez être connecté pour sauvegarder une recherche');
      return;
    }

    const searchName = prompt('Nom de la recherche sauvegardée:');
    if (!searchName || !searchName.trim()) return;

    try {
      const { error } = await supabase.from('saved_searches').insert({
        user_id: user.id,
        name: searchName.trim(),
        search_params: filters
      });

      if (error) throw error;

      addLog('success', `Recherche "${searchName}" sauvegardée avec succès`);
      alert('Recherche sauvegardée avec succès');
    } catch (error) {
      console.error('Error saving search:', error);
      addLog('error', 'Erreur lors de la sauvegarde de la recherche');
      alert('Erreur lors de la sauvegarde de la recherche');
    }
  };

  const formatDate = (dateString: string) => {
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
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`${isDark ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-100'} sticky top-0 z-30 backdrop-blur-sm bg-opacity-95`}>
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-sm">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Marchés publics
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm mt-0.5`}>
                Explorez les marchés publics de la Réunion
              </p>
            </div>
            {isAdmin && (
              <div className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
              }`}>
                Admin
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6">

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-6 mb-4`}>
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setSearchMode('keyword')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              searchMode === 'keyword'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mots-clés
          </button>
          <button
            onClick={() => setSearchMode('reference')}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              searchMode === 'reference'
                ? 'bg-blue-600 text-white shadow-sm'
                : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Référence
          </button>
        </div>

        <div className="flex gap-2">
          <div className={`flex-1 flex items-center gap-3 border-2 rounded-xl px-4 ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          } focus-within:border-blue-500 focus-within:bg-${isDark ? 'gray-700' : 'white'} transition-all`}>
            <Search className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={searchMode === 'reference' ? 'Ex: 24-000001' : 'Rechercher par mots-clés : travaux, fournitures, services...'}
              className={`flex-1 py-3 bg-transparent outline-none ${
                isDark ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="hidden sm:inline">Recherche...</span>
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                <span className="hidden sm:inline">Rechercher</span>
              </>
            )}
          </button>
        </div>

        <div className="flex justify-between items-center gap-2 mt-3">
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(true)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 relative ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Filter className="w-4 h-4" />
              Tous les filtres
              {(() => {
                const count = (filters.location?.length || 0) +
                             (filters.serviceTypes?.length || 0) +
                             (filters.publicBuyer ? 1 : 0) +
                             (filters.cpvCode ? 1 : 0) +
                             (filters.amountMin || filters.amountMax ? 1 : 0) +
                             (filters.deadlineFrom || filters.deadlineTo ? 1 : 0) +
                             (filters.procedureType ? 1 : 0);
                return count > 0 ? (
                  <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {count}
                  </span>
                ) : null;
              })()}
            </button>

            {(filters.location?.length || filters.serviceTypes?.length || filters.publicBuyer ||
              filters.cpvCode || filters.amountMin || filters.amountMax || filters.deadlineFrom ||
              filters.deadlineTo || filters.procedureType) && (
              <button
                onClick={() => {
                  setFilters({
                    page: 1,
                    limit: 20,
                    sortBy: 'publication_date',
                    sortOrder: 'desc',
                    deadlineFrom: getTodayDate()
                  });
                  addLog('info', 'Tous les filtres ont été effacés');
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                Effacer les filtres
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveSearch}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Sauvegarder cette recherche"
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Sauvegarder</span>
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={async () => {
                    addLog('info', 'Récupération du schéma BOAMP...');
                    try {
                      const schema = await boampService.getSchema();
                      if (schema.fields) {
                        addLog('success', `${schema.fields.length} champs disponibles dans le schéma BOAMP`);
                        addLog('info', 'Liste des champs:');
                        schema.fields.forEach((field: any) => {
                          addLog('info', `  • ${field.name} (${field.type})`);
                        });
                      }
                    } catch (error: any) {
                      addLog('error', `Erreur lors de la récupération du schéma: ${error.message}`);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isDark ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  Voir Schéma
                </button>

                <button
                  onClick={async () => {
                    addLog('info', 'Test rapide: Recherche sans filtres...');
                    setLoading(true);
                    try {
                      const result = await boampService.searchMarkets({ page: 1, limit: 5 });
                      addLog('success', `Test réussi: ${result.total} marchés trouvés`);

                      if (result.markets.length > 0) {
                        const sample = result.markets[0];
                        addLog('info', `Exemple - Titre: ${sample.title}`);
                        addLog('info', `Exemple - Client: ${sample.client}`);
                        addLog('info', `Exemple - Localisation: ${sample.location}`);
                        addLog('info', `Exemple - Type: ${sample.serviceType}`);
                        addLog('info', `Tous les champs (${Object.keys(sample.rawData).length}): ${Object.keys(sample.rawData).sort().join(', ')}`);

                        const locationFields = Object.keys(sample.rawData).filter(k =>
                          k.toLowerCase().includes('ville') ||
                          k.toLowerCase().includes('dep') ||
                          k.toLowerCase().includes('postal') ||
                          k.toLowerCase().includes('commune') ||
                          k.toLowerCase().includes('lieu')
                        );
                        addLog('info', `Champs liés à la localisation: ${locationFields.join(', ') || 'AUCUN'}`);

                        locationFields.forEach(field => {
                          const value = sample.rawData[field];
                          addLog('info', `  ${field} = ${JSON.stringify(value)}`);
                        });
                      }

                      setSearchResult(result);
                    } catch (error: any) {
                      addLog('error', `Test échoué: ${error.message}`);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isDark ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  Test API
                </button>
              </>
            )}
          </div>
        </div>

        {(filters.location?.length || filters.serviceTypes?.length || filters.publicBuyer ||
          filters.cpvCode || filters.amountMin || filters.amountMax || filters.deadlineFrom ||
          filters.deadlineTo || filters.procedureType) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {filters.location?.map(loc => (
              <span key={loc} className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                isDark ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <MapPin className="w-3 h-3 inline mr-1" />
                {loc}
              </span>
            ))}
            {filters.serviceTypes?.map(type => (
              <span key={type} className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                isDark ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                <Building className="w-3 h-3 inline mr-1" />
                {type}
              </span>
            ))}
            {filters.publicBuyer && (
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                isDark ? 'bg-purple-900/30 text-purple-400 border border-purple-800' : 'bg-purple-50 text-purple-700 border border-purple-200'
              }`}>
                <Building className="w-3 h-3 inline mr-1" />
                {filters.publicBuyer}
              </span>
            )}
            {filters.cpvCode && (
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                isDark ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-800' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}>
                CPV: {filters.cpvCode}
              </span>
            )}
            {(filters.amountMin || filters.amountMax) && (
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                isDark ? 'bg-orange-900/30 text-orange-400 border border-orange-800' : 'bg-orange-50 text-orange-700 border border-orange-200'
              }`}>
                <Euro className="w-3 h-3 inline mr-1" />
                {filters.amountMin || 0}€ - {filters.amountMax || '∞'}€
              </span>
            )}
            {(filters.deadlineFrom || filters.deadlineTo) && (
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                isDark ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                <Calendar className="w-3 h-3 inline mr-1" />
                {filters.deadlineFrom || '...'} → {filters.deadlineTo || '...'}
              </span>
            )}
            {filters.procedureType && (
              <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                isDark ? 'bg-pink-900/30 text-pink-400 border border-pink-800' : 'bg-pink-50 text-pink-700 border border-pink-200'
              }`}>
                {filters.procedureType}
              </span>
            )}
          </div>
        )}
      </div>

      {searchResult && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {searchResult.total} résultat{searchResult.total > 1 ? 's' : ''}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Appels d'offres actifs
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Vue en grille"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Vue en liste"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 animate-pulse`}>
                  <div className={`h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-3/4 mb-4`}></div>
                  <div className={`h-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/2`}></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {searchResult.markets.length === 0 ? (
                <div className={`text-center py-12 px-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <Search className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Aucun résultat à afficher
                  </h3>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {searchResult.total > 0
                      ? `L'API BOAMP indique ${searchResult.total} résultat(s) mais aucun marché n'a été retourné. Vérifiez les logs pour plus de détails.`
                      : 'Aucun marché ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'}
                  </p>
                  {searchResult.total > 0 && (
                    <button
                      onClick={() => setShowLogs(true)}
                      className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                    >
                      Afficher les logs de débogage
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResult.markets.map((market) => (
                    <MarketSearchCompact
                      key={market.id}
                      market={market}
                      isFavorite={favorites.has(market.reference)}
                      isDark={isDark}
                      isAdmin={isAdmin}
                      searchQuery={filters.keywords || searchQuery}
                      onToggleFavorite={() => {
                        const isFav = favorites.has(market.reference);
                        if (isFav) {
                          handleRemoveFromFavorites(market.reference);
                        } else {
                          handleAddToFavorites(market);
                        }
                      }}
                      onProspect={async () => {
                        await handleProspect(market);
                      }}
                      onAddLog={addLog}
                    />
                  ))}
                </div>
              )}

              {searchResult.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => handlePageChange(searchResult.page - 1)}
                    disabled={searchResult.page === 1}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
                    }`}
                  >
                    Précédent
                  </button>

                  <span className={`px-4 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Page {searchResult.page} sur {searchResult.totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(searchResult.page + 1)}
                    disabled={searchResult.page === searchResult.totalPages}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-50' : 'bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50'
                    }`}
                  >
                    Suivant
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      {!searchResult && !loading && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-sm p-12 text-center`}>
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Search className={`w-10 h-10 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Lancez votre recherche
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Utilisez la barre de recherche ci-dessus pour trouver des marchés publics
          </p>
        </div>
      )}

      </div>

      <MarketSearchFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFiltersChange={setFilters}
        onSearch={handleSearch}
      />

      {showLogs && logs.length > 0 && (
        <div className={`fixed bottom-4 right-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-xl shadow-2xl w-96 max-h-96 overflow-hidden flex flex-col z-40`}>
          <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Logs de recherche</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLogs([])}
                className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                Effacer
              </button>
              <button
                onClick={() => setShowLogs(false)}
                className={`p-1 rounded ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`}
              >
                ✕
              </button>
            </div>
          </div>
          <div className="overflow-y-auto p-4 space-y-2 flex-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`text-xs p-2 rounded ${
                  log.type === 'error'
                    ? isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'
                    : log.type === 'success'
                    ? isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700'
                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="flex-1 font-mono text-xs whitespace-pre-wrap break-words">{log.message}</span>
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} flex-shrink-0`}>
                    {log.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!showLogs && logs.length > 0 && (
        <button
          onClick={() => setShowLogs(true)}
          className="fixed bottom-4 right-4 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg shadow-lg z-40 flex items-center gap-2"
        >
          <span className="text-sm font-medium">Afficher les logs</span>
          <span className="bg-white text-orange-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
            {logs.length}
          </span>
        </button>
      )}

      {/* Prospect modal removed - now using direct webhook call */}
      {false && (
        <div
          onClick={() => {
            setShowProspectModal(false);
            setProspectMarket(null);
          }}
          market={prospectMarket}
          isDark={isDark}
        />
      )}
    </div>
  );
};
