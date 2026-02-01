import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Building, Euro, Clock, CheckCircle, XCircle, TrendingUp, FileText, Brain, BookOpen, Trophy, Archive, CreditCard as Edit3, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Market } from '../../types';
import { CreateMarketModal } from './CreateMarketModal';
import { DocumentAnalysisModal } from './DocumentAnalysisModal';
import { TechnicalMemoryWizard } from './TechnicalMemoryWizard';
import { EconomicDocumentsWizard } from './EconomicDocumentsWizard';
import { EditMarketModal } from './EditMarketModal';
import DC1Wizard from './DC1Wizard';
import { MarketListCompact } from './MarketListCompact';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMarketForAnalysis, setSelectedMarketForAnalysis] = useState<Market | null>(null);
  const [selectedMarketForTechnicalMemory, setSelectedMarketForTechnicalMemory] = useState<Market | null>(null);
  const [selectedMarketForEconomicDocs, setSelectedMarketForEconomicDocs] = useState<Market | null>(null);
  const [selectedMarketForDC1, setSelectedMarketForDC1] = useState<Market | null>(null);
  const [selectedMarketForEdit, setSelectedMarketForEdit] = useState<Market | null>(null);

  useEffect(() => {
    if (user) {
      fetchMarkets();
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
      <div className={`p-6 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Marchés</h1>
        </div>
        <div className={`${isDark ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <h3 className={`text-sm font-semibold ${isDark ? 'text-red-400' : 'text-red-900'}`}>Erreur</h3>
          </div>
          <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'} mb-3`}>{error}</p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              fetchMarkets();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg transition-colors text-xs font-medium"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Marchés</h1>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>Gérez vos marchés publics</p>
          </div>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          Nouveau marché
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className={`text-xs font-medium pb-2 border-b-2 ${isDark ? 'border-blue-500 text-blue-400' : 'border-blue-600 text-blue-600'}`}>
          Mes marchés ({markets.length})
        </div>
      </div>

      {markets.length === 0 ? (
        <div className="text-center py-16">
          <FileText className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
          <h3 className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Aucun marché</h3>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-4`}>Créez votre premier marché ou ajoutez-en depuis vos alertes</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-all text-sm shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Créer un marché
          </button>
        </div>
      ) : (
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
              onDC1={() => setSelectedMarketForDC1(market)}
              onAnalysis={() => setSelectedMarketForAnalysis(market)}
              onWin={market.status === 'en_cours' ? () => handleUpdateMarketStatus(market.id, 'gagne') : undefined}
              onArchive={() => handleArchiveMarket(market.id)}
              onDelete={() => handleCancelMarket(market.id)}
            />
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

      {selectedMarketForDC1 && (
        <DC1Wizard
          marketId={selectedMarketForDC1.id}
          marketTitle={selectedMarketForDC1.title}
          onClose={() => setSelectedMarketForDC1(null)}
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