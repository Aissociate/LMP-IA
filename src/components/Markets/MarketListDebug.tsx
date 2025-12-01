import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';
import { FileText } from 'lucide-react';

export const MarketListDebug: React.FC = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { isDark } = useTheme();
  const [markets, setMarkets] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [debug, setDebug] = useState<string[]>([]);

  useEffect(() => {
    const log = (msg: string) => setDebug(prev => [...prev, `${new Date().toISOString()}: ${msg}`]);

    log('Component mounted');
    log(`User: ${user?.id || 'null'}`);
    log(`Auth loading: ${authLoading}`);
    log(`Is admin: ${isAdmin}`);

    if (user) {
      log('Fetching markets...');
      fetchMarkets(log);
    }
  }, [user, authLoading, isAdmin]);

  const fetchMarkets = async (log: (msg: string) => void) => {
    try {
      log('Starting fetch...');

      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .eq('user_id', user!.id);

      log(`Response: data=${data?.length || 0}, error=${error?.message || 'none'}`);

      if (error) {
        setError(error.message);
        log(`Error: ${error.message}`);
      } else {
        setMarkets(data || []);
        log(`Markets loaded: ${data?.length || 0}`);
      }
    } catch (e: any) {
      const msg = e?.message || 'Unknown error';
      setError(msg);
      log(`Catch error: ${msg}`);
    }
  };

  return (
    <div className={`p-8 min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Debug - Marchés</h1>
        </div>

        <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="font-bold mb-2">État Auth</h2>
          <p>User ID: {user?.id || 'Non connecté'}</p>
          <p>Email: {user?.email || 'N/A'}</p>
          <p>Is Admin: {isAdmin ? 'Oui' : 'Non'}</p>
          <p>Auth Loading: {authLoading ? 'Oui' : 'Non'}</p>
        </div>

        {error && (
          <div className="p-4 rounded-lg mb-4 bg-red-500/20 border border-red-500">
            <h2 className="font-bold mb-2">Erreur</h2>
            <p>{error}</p>
          </div>
        )}

        <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="font-bold mb-2">Marchés ({markets.length})</h2>
          {markets.length === 0 ? (
            <p className="text-gray-500">Aucun marché</p>
          ) : (
            <ul>
              {markets.map((m) => (
                <li key={m.id} className="py-2 border-b border-gray-700">
                  <div className="font-medium">{m.title}</div>
                  <div className="text-sm text-gray-500">{m.client} - {m.status}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="font-bold mb-2">Debug Log</h2>
          <div className="text-xs font-mono space-y-1 max-h-64 overflow-y-auto">
            {debug.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
