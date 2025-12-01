import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Building, Euro, Clock, CheckCircle, XCircle, TrendingUp, FileText, Brain, BookOpen, Trophy, Archive, X, CreditCard as Edit3, Star, Download } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Market } from '../../types';
import { BOAMPFavorite } from '../../types/boamp';
import { CreateMarketModal } from './CreateMarketModal';
import { DocumentAnalysisModal } from './DocumentAnalysisModal';
import { TechnicalMemoryWizard } from './TechnicalMemoryWizard';
import { EconomicDocumentsWizard } from './EconomicDocumentsWizard';
import { EditMarketModal } from './EditMarketModal';
import { MarketListCompact } from './MarketListCompact';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { favoritesService } from '../../services/favoritesService';

const statusConfig = {
  en_cours: { label: 'En cours', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
  soumis: { label: 'Soumis', icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
  gagne: { label: 'Gagné', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  perdu: { label: 'Perdu', icon: XCircle, color: 'text-red-600 bg-red-50' },
};

export const MarketList: React.FC = () => {
  const { isDark } = useTheme();
  const { user, isAdmin } = useAuth();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [favorites, setFavorites] = useState<BOAMPFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMarketForAnalysis, setSelectedMarketForAnalysis] = useState<Market | null>(null);
  const [selectedMarketForTechnicalMemory, setSelectedMarketForTechnicalMemory] = useState<Market | null>(null);
  const [selectedMarketForEconomicDocs, setSelectedMarketForEconomicDocs] = useState<Market | null>(null);
  const [selectedMarketForEdit, setSelectedMarketForEdit] = useState<Market | null>(null);
  const [activeTab, setActiveTab] = useState<'markets' | 'favorites'>('markets');

  useEffect(() => {
    if (user) {
      fetchMarkets();
      fetchFavorites();
    }
  }, [user]);

  const fetchMarkets = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching markets:', error);
        setError(`Erreur lors du chargement des marchés: ${error.message}`);
        setMarkets([]);
      } else {
        setMarkets(data || []);
        setError(null);
      }
    } catch (error: any) {
      console.error('Error fetching markets:', error);
      setError(`Erreur: ${error?.message || 'Erreur inconnue'}`);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    const data = await favoritesService.getFavorites(user.id);
    setFavorites(data);
  };

  const handleImportFavorite = async (favorite: BOAMPFavorite) => {
    const result = await favoritesService.importFavoriteToMarket(favorite);

    if (result.success) {
      alert('Marché importé avec succès');
      fetchMarkets();
      fetchFavorites();
    } else {
      alert(result.error || 'Erreur lors de l\'import');
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer ce marché de vos favoris ?')) return;

    const success = await favoritesService.removeFavorite(favoriteId);
    if (success) {
      fetchFavorites();
    } else {
      alert('Erreur lors de la suppression');
    }
  };

  const handleMarketCreated = () => {
    fetchMarkets();
    setIsCreateModalOpen(false);
  };

  const handleMarketUpdated = () => {
    fetchMarkets();
    setSelectedMarketForEdit(null);
  };

  const handleUpdateMarketStatus = async (marketId: string, newStatus: 'gagne' | 'perdu') => {
    try {
      const { error } = await supabase
        .from('markets')
        .update({ status: newStatus })
        .eq('id', marketId);

      if (error) throw error;
      fetchMarkets();
    } catch (error) {
      console.error('Error updating market status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleArchiveMarket = async (marketId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir archiver ce marché ?')) return;
    
    // Pour l'instant, on peut utiliser le statut 'perdu' comme archivé
    // ou ajouter un champ 'archived' à la base de données plus tard
    try {
      const { error } = await supabase
        .from('markets')
        .update({ status: 'perdu' }) // Temporaire - remplacer par 'archived' plus tard
        .eq('id', marketId);

      if (error) throw error;
      fetchMarkets();
    } catch (error) {
      console.error('Error archiving market:', error);
      alert('Erreur lors de l\'archivage');
    }
  };

  const handleCancelMarket = async (marketId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce marché ?')) return;
    
    try {
      const { error } = await supabase
        .from('markets')
        .delete()
        .eq('id', marketId);

      if (error) throw error;
      fetchMarkets();
    } catch (error) {
      console.error('Error deleting market:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className={`p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-pulse space-y-6">
          <div className={`h-8 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4`}></div>
          <div className={`h-12 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl`}></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Marchés</h1>
        </div>
        <div className={`${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border rounded-xl p-6`}>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h3 className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-900'}`}>Erreur</h3>
          </div>
          <p className={`${isDark ? 'text-red-300' : 'text-red-700'} mb-4`}>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchMarkets();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Marchés</h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Gérez vos marchés publics</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Nouveau marché
        </button>
      </div>

      <div className="flex gap-6 mb-6">
        <button
          onClick={() => setActiveTab('markets')}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
            activeTab === 'markets'
              ? 'border-orange-600 text-orange-600'
              : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Mes marchés ({markets.length})
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`text-sm font-medium pb-2 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'favorites'
              ? 'border-orange-600 text-orange-600'
              : isDark ? 'border-transparent text-gray-400 hover:text-gray-300' : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <Star className="w-4 h-4" />
          Favoris BOAMP ({favorites.length})
        </button>
      </div>

      {activeTab === 'markets' && markets.length === 0 ? (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-12 text-center transition-colors duration-200`}>
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <FileText className={`w-10 h-10 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Aucun marché</h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>Commencez par créer votre premier marché ou importer depuis vos favoris BOAMP</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Créer un marché
          </button>
        </div>
      ) : activeTab === 'favorites' && favorites.length === 0 ? (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-12 text-center transition-colors duration-200`}>
          <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-100'} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
            <Star className={`w-10 h-10 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          </div>
          <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Aucun favori</h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ajoutez des marchés à vos favoris depuis la section Recherche de marchés</p>
        </div>
      ) : activeTab === 'markets' ? (
        <div className="space-y-3">
          {markets.map((market) => (
            <MarketListCompact
              key={market.id}
              market={market}
              isDark={isDark}
              onEdit={() => setSelectedMarketForEdit(market)}
              onTechnicalMemory={() => {
                if (isAdmin) {
                  setSelectedMarketForTechnicalMemory(market);
                } else {
                  setSelectedMarketForTechnicalMemory(market);
                }
              }}
              onEconomicDocs={() => setSelectedMarketForEconomicDocs(market)}
              onAnalysis={() => setSelectedMarketForAnalysis(market)}
              onWin={market.status === 'en_cours' ? () => handleUpdateMarketStatus(market.id, 'gagne') : undefined}
              onArchive={() => handleArchiveMarket(market.id)}
              onDelete={() => handleCancelMarket(market.id)}
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-6">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 hover:shadow-lg transition-all duration-200`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-orange-600 fill-current" />
                    {favorite.is_imported_to_markets && (
                      <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                        Déjà importé
                      </span>
                    )}
                  </div>
                  <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                    {favorite.title}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-3`}>
                    Référence: {favorite.boamp_reference}
                  </p>
                  {favorite.description && (
                    <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{favorite.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <Building className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Client</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{favorite.client || 'Non spécifié'}</p>
                  </div>
                </div>

                {favorite.deadline && (
                  <div className="flex items-center gap-3">
                    <Calendar className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Échéance</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatDate(favorite.deadline)}
                      </p>
                    </div>
                  </div>
                )}

                {favorite.amount && (
                  <div className="flex items-center gap-3">
                    <Euro className={`w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Montant</p>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(favorite.amount)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end gap-3`}>
                <button
                  onClick={() => handleRemoveFavorite(favorite.id)}
                  className={`${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} text-gray-700 font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200`}
                >
                  <X className="w-4 h-4" />
                  Retirer des favoris
                </button>

                {!favorite.is_imported_to_markets && (
                  <button
                    onClick={() => handleImportFavorite(favorite)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Download className="w-4 h-4" />
                    Importer vers mes marchés
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateMarketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onMarketCreated={handleMarketCreated}
      />

      {selectedMarketForAnalysis && (
        <DocumentAnalysisModal
          isOpen={true}
          onClose={() => setSelectedMarketForAnalysis(null)}
          marketId={selectedMarketForAnalysis.id}
          marketTitle={selectedMarketForAnalysis.title}
        />
      )}

      {selectedMarketForTechnicalMemory && (
        <TechnicalMemoryWizard
          isOpen={true}
          onClose={() => setSelectedMarketForTechnicalMemory(null)}
          marketId={selectedMarketForTechnicalMemory.id}
          marketTitle={selectedMarketForTechnicalMemory.title}
        />
      )}

      {selectedMarketForEconomicDocs && (
        <EconomicDocumentsWizard
          isOpen={true}
          onClose={() => setSelectedMarketForEconomicDocs(null)}
          marketId={selectedMarketForEconomicDocs.id}
          marketTitle={selectedMarketForEconomicDocs.title}
        />
      )}

      {selectedMarketForEdit && (
        <EditMarketModal
          isOpen={true}
          onClose={() => setSelectedMarketForEdit(null)}
          onMarketUpdated={handleMarketUpdated}
          market={selectedMarketForEdit}
        />
      )}

    </div>
  );
};