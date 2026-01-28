import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, Trash2, Calendar, Building2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';

interface Market {
  id: string;
  reference: string;
  title: string;
  client: string;
  deadline: string;
  url: string | null;
  service_type: string | null;
  amount: number | null;
  created_at: string;
}

interface SessionMarketsListProps {
  sessionId: string;
  onUpdate?: () => void;
}

export const SessionMarketsList: React.FC<SessionMarketsListProps> = ({ sessionId, onUpdate }) => {
  const { isDark } = useTheme();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarkets();
  }, [sessionId]);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('manual_markets')
        .select('id, reference, title, client, deadline, url, service_type, amount, created_at')
        .eq('created_by', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMarkets(data || []);
    } catch (error) {
      console.error('Error loading session markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (marketId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce marché ?')) return;

    try {
      const { error } = await supabase
        .from('manual_markets')
        .delete()
        .eq('id', marketId);

      if (error) throw error;

      setMarkets(prev => prev.filter(m => m.id !== marketId));
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error deleting market:', error);
      alert('Erreur lors de la suppression du marché');
    }
  };

  if (loading) {
    return (
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="animate-pulse space-y-2">
          <div className={`h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className={`h-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    );
  }

  if (markets.length === 0) {
    return (
      <div className={`p-6 rounded-lg border-2 border-dashed text-center ${
        isDark ? 'bg-gray-800 border-gray-700 text-gray-400' : 'bg-gray-50 border-gray-300 text-gray-500'
      }`}>
        <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Aucun marché ajouté pour le moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Marchés de cette session ({markets.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {markets.map((market) => (
          <div
            key={market.id}
            className={`p-3 rounded-lg border transition-all ${
              isDark
                ? 'bg-gray-800 border-gray-700 hover:border-orange-500'
                : 'bg-white border-gray-200 hover:border-orange-400'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-1">
                  <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                    isDark ? 'text-orange-400' : 'text-orange-500'
                  }`} />
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm mb-1 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {market.title}
                    </h4>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className={`flex items-center gap-1 ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        <Building2 className="w-3 h-3" />
                        {market.client}
                      </span>
                      {market.deadline && (
                        <span className={`flex items-center gap-1 ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {new Date(market.deadline).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    {market.reference && (
                      <div className={`text-xs mt-1 font-mono ${
                        isDark ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Réf: {market.reference}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {market.url && (
                  <a
                    href={market.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-1.5 rounded hover:bg-opacity-10 transition-colors ${
                      isDark
                        ? 'text-blue-400 hover:bg-blue-400'
                        : 'text-blue-500 hover:bg-blue-500'
                    }`}
                    title="Ouvrir le lien"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleDelete(market.id)}
                  className={`p-1.5 rounded hover:bg-opacity-10 transition-colors ${
                    isDark
                      ? 'text-red-400 hover:bg-red-400'
                      : 'text-red-500 hover:bg-red-500'
                  }`}
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
