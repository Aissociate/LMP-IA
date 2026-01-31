import React, { useState, useEffect } from 'react';
import { Filter, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { LinkedInLayout } from '../Layout/LinkedInLayout';
import { IrisWidget } from './IrisWidget';
import { MarketFeedCard } from './MarketFeedCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface Market {
  id: string;
  title: string;
  organisme?: string;
  description?: string;
  deadline?: string;
  budget?: number;
  location?: string;
  created_at: string;
}

export const DashboardLinkedIn: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'recommended' | 'recent'>('recommended');

  useEffect(() => {
    fetchMarkets();
  }, [user, filter]);

  const fetchMarkets = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let query = supabase
        .from('manual_markets')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setMarkets(data.map(m => ({
          id: m.id,
          title: m.title || 'Sans titre',
          organisme: m.organisme || 'Organisme public',
          description: m.description || m.objet,
          deadline: m.date_limite_depot,
          budget: m.montant_estime,
          location: 'La Réunion (974)',
          created_at: m.created_at,
        })));
      }
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = (marketId: string) => {
    navigate(`/sentinel?marketId=${marketId}`);
  };

  const handleFavorite = async (marketId: string) => {
    try {
      await supabase
        .from('favorites')
        .insert({
          user_id: user?.id,
          market_id: marketId,
        });
      alert('Marché ajouté aux favoris !');
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const handleIgnore = async (marketId: string) => {
    setMarkets(prev => prev.filter(m => m.id !== marketId));
  };

  return (
    <LinkedInLayout rightSidebar={<IrisWidget />}>
      {/* Feed Header */}
      <div className="bg-iris-card border border-iris-border rounded-lg p-4 mb-4 shadow-subtle">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-slate-900">Marchés pour vous</h1>
          <button
            onClick={() => fetchMarkets()}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('recommended')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'recommended'
                ? 'bg-linkedin-500 text-white'
                : 'bg-iris-bg text-slate-600 hover:bg-slate-200'
            }`}
          >
            Recommandés
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'recent'
                ? 'bg-linkedin-500 text-white'
                : 'bg-iris-bg text-slate-600 hover:bg-slate-200'
            }`}
          >
            Récents
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-linkedin-500 text-white'
                : 'bg-iris-bg text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tous
          </button>

          <div className="ml-auto flex items-center gap-2">
            <button className="p-2 hover:bg-iris-bg rounded-lg transition-colors">
              <SlidersHorizontal className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 hover:bg-iris-bg rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-linkedin-50 border border-linkedin-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-linkedin-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">i</span>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 mb-1">
              {markets.length} nouveaux marchés correspondent à votre profil
            </h3>
            <p className="text-sm text-slate-600">
              Iris a analysé ces opportunités et les recommande selon vos critères. Cliquez sur "Analyser avec Iris" pour un score de pertinence détaillé.
            </p>
          </div>
        </div>
      </div>

      {/* Market Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-iris-card border border-iris-border rounded-lg p-8 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-4"></div>
              <div className="h-3 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : markets.length === 0 ? (
        <div className="bg-iris-card border border-iris-border rounded-lg p-12 text-center">
          <p className="text-slate-600 mb-4">Aucun marché disponible pour le moment</p>
          <button
            onClick={() => navigate('/search')}
            className="bg-linkedin-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-linkedin-600 transition-colors"
          >
            Rechercher des marchés
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {markets.map(market => (
            <MarketFeedCard
              key={market.id}
              market={market}
              onAnalyze={handleAnalyze}
              onFavorite={handleFavorite}
              onIgnore={handleIgnore}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {!loading && markets.length > 0 && (
        <div className="mt-6 text-center">
          <button className="bg-iris-card border border-iris-border text-slate-700 px-6 py-3 rounded-full font-medium hover:bg-iris-bg transition-colors">
            Afficher plus de marchés
          </button>
        </div>
      )}
    </LinkedInLayout>
  );
};
