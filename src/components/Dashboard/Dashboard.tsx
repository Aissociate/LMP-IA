import React, { useState, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Euro,
  TrendingUp,
  Timer,
  BarChart3,
  BookOpen,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { FormationSection } from './FormationSection';
import { supabase } from '../../lib/supabase';
import { MarketStats } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface TimeStats {
  analyzedDocuments: number;
  completedMemories: number;
  totalMinutes: number;
  hours: number;
  days: number;
}

interface RecentMarket {
  id: string;
  title: string;
  status: string;
  deadline?: string;
  created_at: string;
}

export const Dashboard: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [stats, setStats] = useState<MarketStats>({
    total: 0,
    en_cours: 0,
    soumis: 0,
    gagne: 0,
    perdu: 0,
    budget_total: 0
  });
  const [timeStats, setTimeStats] = useState<TimeStats>({
    analyzedDocuments: 0,
    completedMemories: 0,
    totalMinutes: 0,
    hours: 0,
    days: 0
  });
  const [recentMarkets, setRecentMarkets] = useState<RecentMarket[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<RecentMarket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTimeStats();
    fetchRecentMarkets();
    fetchUpcomingDeadlines();

    const interval = setInterval(() => {
      fetchStats();
      fetchTimeStats();
      fetchRecentMarkets();
      fetchUpcomingDeadlines();
    }, 300000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleDataUpdate = () => {
      fetchStats();
      fetchTimeStats();
      fetchRecentMarkets();
      fetchUpcomingDeadlines();
    };

    window.addEventListener('straticia:document-analyzed', handleDataUpdate);
    window.addEventListener('straticia:memory-generated', handleDataUpdate);
    window.addEventListener('straticia:market-updated', handleDataUpdate);

    return () => {
      window.removeEventListener('straticia:document-analyzed', handleDataUpdate);
      window.removeEventListener('straticia:memory-generated', handleDataUpdate);
      window.removeEventListener('straticia:market-updated', handleDataUpdate);
    };
  }, []);

  const fetchStats = async () => {
    try {
      if (!user) return;

      const { data: markets } = await supabase
        .from('markets')
        .select('status, budget')
        .eq('user_id', user.id);

      if (markets) {
        const statsData = markets.reduce((acc, market) => {
          acc.total += 1;
          acc[market.status as keyof MarketStats] += 1;
          acc.budget_total += market.budget || 0;
          return acc;
        }, {
          total: 0,
          en_cours: 0,
          soumis: 0,
          gagne: 0,
          perdu: 0,
          budget_total: 0
        });

        setStats(statsData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const fetchTimeStats = async () => {
    try {
      if (!user) return;

      // Compter les documents analysés (dans market_documents avec analysis_result)
      const { data: analyzedDocs } = await supabase
        .from('market_documents')
        .select('id')
        .eq('user_id', user.id)
        .not('analysis_result', 'is', null);

      // Compter toutes les sections de mémoire technique générées
      // Joindre avec markets pour filtrer par user_id
      const { data: allSections } = await supabase
        .from('memo_sections')
        .select('id, market_id, markets!inner(user_id)')
        .eq('markets.user_id', user.id);

      const documentsAnalyzes = analyzedDocs?.length || 0;
      const sectionsGenerees = allSections?.length || 0;

      // Calcul du temps économisé selon la nouvelle règle:
      // - 40 minutes par document analysé
      // - 30 minutes par section de mémoire technique générée
      const totalMinutes =
        (documentsAnalyzes * 40) +
        (sectionsGenerees * 30);

      setTimeStats({
        analyzedDocuments: documentsAnalyzes,
        completedMemories: sectionsGenerees,
        totalMinutes: totalMinutes,
        hours: Math.floor(totalMinutes / 60),
        days: Math.floor(totalMinutes / (60 * 8))
      });
    } catch (error) {
      console.error('Error fetching time stats:', error);
    }
  };

  const fetchRecentMarkets = async () => {
    try {
      if (!user) return;

      const { data } = await supabase
        .from('markets')
        .select('id, title, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setRecentMarkets(data);
      }
    } catch (error) {
      console.error('Error fetching recent markets:', error);
    }
  };

  const fetchUpcomingDeadlines = async () => {
    try {
      if (!user) return;

      const today = new Date();
      const in14Days = new Date();
      in14Days.setDate(today.getDate() + 14);

      const { data } = await supabase
        .from('markets')
        .select('id, title, status, deadline')
        .eq('user_id', user.id)
        .gte('deadline', today.toISOString())
        .lte('deadline', in14Days.toISOString())
        .order('deadline', { ascending: true })
        .limit(5);

      if (data) {
        setUpcomingDeadlines(data);
      }
    } catch (error) {
      console.error('Error fetching deadlines:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Non spécifié';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysUntil = (dateString?: string) => {
    if (!dateString) return null;
    const deadline = new Date(dateString);
    const today = new Date();
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'en_cours': isDark ? 'text-blue-400 bg-blue-500/10' : 'text-blue-700 bg-blue-50',
      'soumis': isDark ? 'text-amber-400 bg-amber-500/10' : 'text-amber-700 bg-amber-50',
      'gagne': isDark ? 'text-green-400 bg-green-500/10' : 'text-green-700 bg-green-50',
      'perdu': isDark ? 'text-red-400 bg-red-500/10' : 'text-red-700 bg-red-50'
    };
    return colors[status as keyof typeof colors] || (isDark ? 'text-gray-400 bg-gray-500/10' : 'text-gray-700 bg-gray-50');
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'en_cours': 'En cours',
      'soumis': 'Soumis',
      'gagne': 'Gagné',
      'perdu': 'Perdu'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const successRate = stats.soumis > 0
    ? Math.round((stats.gagne / stats.soumis) * 100)
    : 0;

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <h1 className={`text-3xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Tableau de bord
          </h1>
          <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Vue d'ensemble de vos appels d'offres et performances
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total marchés"
            value={stats.total}
            icon={FileText}
            color="blue"
            isDark={isDark}
          />
          <StatsCard
            title="En cours"
            value={stats.en_cours}
            icon={Clock}
            color="amber"
            isDark={isDark}
          />
          <StatsCard
            title="Taux de réussite"
            value={`${successRate}%`}
            icon={TrendingUp}
            color="green"
            isDark={isDark}
            subtitle={`${stats.gagne} gagnés / ${stats.soumis} soumis`}
          />
          <StatsCard
            title="Budget total"
            value={`${(stats.budget_total / 1000000).toFixed(1)}M€`}
            icon={Euro}
            color="purple"
            isDark={isDark}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className={`lg:col-span-2 rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                <BarChart3 className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Répartition des marchés
                </h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`}></div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    En cours
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isDark ? 'bg-blue-500' : 'bg-blue-600'}`}
                      style={{ width: `${stats.total > 0 ? (stats.en_cours / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.en_cours}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-amber-500' : 'bg-amber-600'}`}></div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Soumis
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isDark ? 'bg-amber-500' : 'bg-amber-600'}`}
                      style={{ width: `${stats.total > 0 ? (stats.soumis / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.soumis}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-green-500' : 'bg-green-600'}`}></div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Gagnés
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isDark ? 'bg-green-500' : 'bg-green-600'}`}
                      style={{ width: `${stats.total > 0 ? (stats.gagne / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.gagne}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isDark ? 'bg-red-500' : 'bg-red-600'}`}></div>
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Perdus
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${isDark ? 'bg-red-500' : 'bg-red-600'}`}
                      style={{ width: `${stats.total > 0 ? (stats.perdu / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.perdu}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className={`rounded-xl border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-500/10' : 'bg-purple-50'}`}>
                <Activity className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Productivité
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {timeStats.analyzedDocuments}
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Documents analysés
                </p>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {timeStats.completedMemories}
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Sections de mémoire générées
                </p>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {timeStats.days}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    jours économisés
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  soit {timeStats.hours}h de travail
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>
                  <Clock className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Marchés récents
                </h2>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentMarkets.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Aucun marché récent
                  </p>
                </div>
              ) : (
                recentMarkets.map((market) => (
                  <div key={market.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {market.title}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          {formatDate(market.created_at)}
                        </p>
                      </div>
                      <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(market.status)}`}>
                        {getStatusLabel(market.status)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-red-500/10' : 'bg-red-50'}`}>
                  <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Échéances à venir
                </h2>
              </div>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {upcomingDeadlines.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Aucune échéance proche
                  </p>
                </div>
              ) : (
                upcomingDeadlines.map((market) => {
                  const days = getDaysUntil(market.deadline);
                  const isUrgent = days !== null && days <= 3;

                  return (
                    <div key={market.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-medium mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {market.title}
                          </h3>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {formatDate(market.deadline)}
                          </p>
                        </div>
                        <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          isUrgent
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {days !== null && days > 0 ? `${days}j restants` : 'Aujourd\'hui'}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <FormationSection />
      </div>
    </div>
  );
};
