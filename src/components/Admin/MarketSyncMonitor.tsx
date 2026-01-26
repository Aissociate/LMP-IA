import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

interface SyncLog {
  id: string;
  sync_date: string;
  markets_found: number;
  markets_inserted: number;
  markets_updated: number;
  errors: any;
  status: string;
  execution_time_ms: number;
}

interface Market {
  id: string;
  reference: string;
  title: string;
  client: string;
  slug: string;
  created_at: string;
  is_public: boolean;
  source: string;
}

export function MarketSyncMonitor() {
  const { isDark } = useTheme();
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [recentMarkets, setRecentMarkets] = useState<Market[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    boamp: 0,
    manual: 0,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsRes, marketsRes, statsRes] = await Promise.all([
        supabase
          .from('market_sync_logs')
          .select('*')
          .order('sync_date', { ascending: false })
          .limit(20),
        supabase
          .from('public_markets')
          .select('id, reference, title, client, slug, created_at, is_public, source')
          .eq('department', '974')
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('public_markets')
          .select('id, is_public, source, deadline')
          .eq('department', '974'),
      ]);

      if (logsRes.error) throw logsRes.error;
      if (marketsRes.error) throw marketsRes.error;
      if (statsRes.error) throw statsRes.error;

      setLogs(logsRes.data || []);
      setRecentMarkets(marketsRes.data || []);

      const allMarkets = statsRes.data || [];
      const now = new Date().toISOString();

      setStats({
        total: allMarkets.length,
        active: allMarkets.filter((m) => m.is_public).length,
        expired: allMarkets.filter((m) => !m.is_public).length,
        boamp: allMarkets.filter((m) => m.source === 'boamp').length,
        manual: allMarkets.filter((m) => m.source === 'manual').length,
      });
    } catch (error: any) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async () => {
    setSyncing(true);
    setMessage(null);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/daily-reunion-markets-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: 'success',
          text: `Synchronisation réussie: ${data.summary.marketsInserted} nouveaux marchés, ${data.summary.marketsUpdated} mis à jour`,
        });
        loadData();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors de la synchronisation' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Synchronisation Marchés Réunion 974
        </h2>
        <button
          onClick={handleForceSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Synchronisation...' : 'Forcer la synchronisation'}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Actifs</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Expirés</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.expired}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>BOAMP</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.boamp}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Manuels</p>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.manual}</p>
            </div>
            <Clock className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
        <div className="p-6 border-b border-gray-200">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Historique des synchronisations
          </h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                  <th className="text-left pb-4">Date</th>
                  <th className="text-left pb-4">Statut</th>
                  <th className="text-right pb-4">Trouvés</th>
                  <th className="text-right pb-4">Insérés</th>
                  <th className="text-right pb-4">Mis à jour</th>
                  <th className="text-right pb-4">Temps (ms)</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className={`border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <td className={`py-3 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {formatDate(log.sync_date)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                          log.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : log.status === 'partial'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {log.status === 'success' ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        {log.status}
                      </span>
                    </td>
                    <td className={`py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {log.markets_found}
                    </td>
                    <td className={`py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {log.markets_inserted}
                    </td>
                    <td className={`py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {log.markets_updated}
                    </td>
                    <td className={`py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      {log.execution_time_ms}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow`}>
        <div className="p-6 border-b border-gray-200">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            50 derniers marchés synchronisés
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {recentMarkets.map((market) => (
              <div
                key={market.id}
                className={`p-4 rounded-lg border ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{market.title}</h4>
                      <span
                        className={`text-xs px-2 py-0.5 rounded ${
                          market.source === 'boamp'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {market.source}
                      </span>
                      {market.is_public && (
                        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-800">Public</span>
                      )}
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{market.client}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                      {market.reference} • {formatDate(market.created_at)}
                    </p>
                  </div>
                  <a
                    href={`/marchepublics/974/${market.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
