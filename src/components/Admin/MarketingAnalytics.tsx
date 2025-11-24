import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { BarChart3, Users, Clock, MousePointerClick, TrendingUp, Calendar } from 'lucide-react';

interface PageStats {
  page: string;
  uniqueVisitors: number;
  totalVisits: number;
  avgTimeSpent: number;
  totalClicks: number;
  conversionRate: number;
}

export function MarketingAnalytics() {
  const [stats, setStats] = useState<PageStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();

    const interval = setInterval(() => {
      loadAnalytics();
    }, 300000);

    const visitChannel = supabase
      .channel('page_visits_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_visits' }, () => {
        loadAnalytics();
      })
      .subscribe();

    const clickChannel = supabase
      .channel('page_clicks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'page_clicks' }, () => {
        loadAnalytics();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(visitChannel);
      supabase.removeChannel(clickChannel);
    };
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const pages = ['home', 'artisans', 'btp', 'pme'];
      const pageStats: PageStats[] = [];

      for (const page of pages) {
        // Get visits
        const { data: visits } = await supabase
          .from('page_visits')
          .select('visitor_id, time_spent')
          .eq('page', page)
          .gte('created_at', startDate.toISOString());

        // Get clicks
        const { data: clicks } = await supabase
          .from('page_clicks')
          .select('*')
          .eq('page', page)
          .gte('created_at', startDate.toISOString());

        // Calculate unique visitors
        const uniqueVisitors = new Set(visits?.map(v => v.visitor_id) || []).size;
        const totalVisits = visits?.length || 0;
        const avgTimeSpent = visits && visits.length > 0
          ? Math.round(visits.reduce((sum, v) => sum + (v.time_spent || 0), 0) / visits.length)
          : 0;
        const totalClicks = clicks?.length || 0;
        const conversionRate = totalVisits > 0 ? ((totalClicks / totalVisits) * 100) : 0;

        pageStats.push({
          page,
          uniqueVisitors,
          totalVisits,
          avgTimeSpent,
          totalClicks,
          conversionRate
        });
      }

      setStats(pageStats);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPageLabel = (page: string) => {
    const labels: Record<string, string> = {
      home: 'Page d\'accueil',
      artisans: 'Landing Artisans',
      btp: 'Landing BTP',
      pme: 'Landing PME'
    };
    return labels[page] || page;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-200 border-t-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-orange-600" />
            Statistiques Marketing
          </h2>
          <p className="text-gray-600 mt-1">Performances des pages landing</p>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setDateRange('7d')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateRange === '7d'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            7 jours
          </button>
          <button
            onClick={() => setDateRange('30d')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateRange === '30d'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            30 jours
          </button>
          <button
            onClick={() => setDateRange('90d')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              dateRange === '90d'
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            90 jours
          </button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visiteurs uniques</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.reduce((sum, s) => sum + s.uniqueVisitors, 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Visites totales</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.reduce((sum, s) => sum + s.totalVisits, 0)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clics totaux</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.reduce((sum, s) => sum + s.totalClicks, 0)}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <MousePointerClick className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Taux de conversion moyen</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.length > 0
                  ? (stats.reduce((sum, s) => sum + s.conversionRate, 0) / stats.length).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Per-Page Stats */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Détails par page</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Visiteurs uniques
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Visites totales
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Temps moyen
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <MousePointerClick className="w-4 h-4" />
                    Clics
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Taux de conversion
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.map((stat) => (
                <tr key={stat.page} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{getPageLabel(stat.page)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stat.uniqueVisitors}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stat.totalVisits}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatTime(stat.avgTimeSpent)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stat.totalClicks}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-900">
                        {stat.conversionRate.toFixed(1)}%
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${Math.min(stat.conversionRate, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">Comment interpréter ces données</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Visiteurs uniques</strong> : Nombre de personnes différentes ayant visité la page</li>
              <li>• <strong>Temps moyen</strong> : Durée moyenne passée sur la page par visiteur</li>
              <li>• <strong>Taux de conversion</strong> : Pourcentage de visiteurs ayant cliqué sur un CTA (Demo, Navigation, etc.)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
