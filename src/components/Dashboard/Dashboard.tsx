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
import { Link } from 'react-router-dom';
import { StatsCard } from './StatsCard';
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
  const [hasKnowledgeFiles, setHasKnowledgeFiles] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchTimeStats();
    fetchRecentMarkets();
    fetchUpcomingDeadlines();
    fetchKnowledgeFiles();

    const interval = setInterval(() => {
      fetchStats();
      fetchTimeStats();
      fetchRecentMarkets();
      fetchUpcomingDeadlines();
      fetchKnowledgeFiles();
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

  const fetchKnowledgeFiles = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('knowledge_files')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      if (error) {
        console.error('Error checking knowledge files:', error);
        return;
      }

      setHasKnowledgeFiles(data && data.length > 0);
    } catch (error) {
      console.error('Error checking knowledge files:', error);
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
      'en_cours': isDark ? 'text-[#70B5F9] bg-[#0A66C2]/10' : 'text-[#0A66C2] bg-[#0A66C2]/5',
      'soumis': isDark ? 'text-[#F5C75D] bg-[#F5C75D]/10' : 'text-[#915907] bg-[#915907]/10',
      'gagne': isDark ? 'text-[#57B894] bg-[#057642]/10' : 'text-[#057642] bg-[#057642]/5',
      'perdu': isDark ? 'text-[#F5989D] bg-[#CC1016]/10' : 'text-[#CC1016] bg-[#CC1016]/5'
    };
    return colors[status as keyof typeof colors] || (isDark ? 'text-[#B0B7BE] bg-[#38434F]/50' : 'text-gray-700 bg-gray-100');
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
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-[#000000]' : 'bg-[#F3F2EF]'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#0A66C2]"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-[#000000]' : 'bg-[#F3F2EF]'}`}>
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className={`${isDark ? 'bg-[#1B1F23]' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-[#38434F]' : 'border-gray-200'} mb-4 p-6`}>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150"
                alt="Iris - Votre assistante"
                className="w-20 h-20 rounded-full object-cover border-2 border-[#0A66C2]"
              />
            </div>
            <div className="flex-1">
              <h1 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-[#000000DE]'} mb-1`}>
                Bonjour, bienvenue sur votre tableau de bord
              </h1>
              <p className={`text-sm ${isDark ? 'text-[#B0B7BE]' : 'text-gray-600'}`}>
                Iris surveille vos marchés et prépare vos dossiers 24/7
              </p>
            </div>
          </div>
        </div>

        {!hasKnowledgeFiles && (
          <div className={`${isDark ? 'bg-[#915907]/10 border-[#F5C75D]' : 'bg-amber-50 border-amber-200'} rounded-lg border mb-4 p-4`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-[#F5C75D]' : 'text-amber-600'}`} />
              <div className="flex-1">
                <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-[#F5C75D]' : 'text-amber-900'}`}>
                  Base de connaissance vide
                </h3>
                <p className={`text-sm mb-2 ${isDark ? 'text-[#B0B7BE]' : 'text-amber-800'}`}>
                  Ajoutez des documents à votre base de connaissance pour améliorer la qualité des réponses d'Iris et personnaliser vos mémoires techniques.
                </p>
                <Link
                  to="/settings?tab=knowledge"
                  className={`inline-flex items-center text-sm font-medium ${isDark ? 'text-[#70B5F9] hover:text-[#0A66C2]' : 'text-[#0A66C2] hover:text-[#004182]'} transition-colors`}
                >
                  Ajouter des documents
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
            color="blue"
            isDark={isDark}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className={`lg:col-span-2 rounded-lg border shadow-sm ${isDark ? 'bg-[#1B1F23] border-[#38434F]' : 'bg-white border-gray-200'}`}>
            <div className="p-6 border-b ${isDark ? 'border-[#38434F]' : 'border-gray-200'}">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0A66C2]/10' : 'bg-[#0A66C2]/5'}`}>
                  <BarChart3 className={`w-5 h-5 ${isDark ? 'text-[#70B5F9]' : 'text-[#0A66C2]'}`} />
                </div>
                <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                  Répartition des marchés
                </h2>
              </div>
            </div>
            <div className="p-6">

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#0A66C2]' : 'bg-[#0A66C2]'}`}></div>
                  <span className={`text-sm font-medium ${isDark ? 'text-[#B0B7BE]' : 'text-gray-700'}`}>
                    En cours
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-48 ${isDark ? 'bg-[#38434F]' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className={`h-2 rounded-full ${isDark ? 'bg-[#0A66C2]' : 'bg-[#0A66C2]'}`}
                      style={{ width: `${stats.total > 0 ? (stats.en_cours / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                    {stats.en_cours}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#F5C75D]' : 'bg-[#915907]'}`}></div>
                  <span className={`text-sm font-medium ${isDark ? 'text-[#B0B7BE]' : 'text-gray-700'}`}>
                    Soumis
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-48 ${isDark ? 'bg-[#38434F]' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className={`h-2 rounded-full ${isDark ? 'bg-[#F5C75D]' : 'bg-[#915907]'}`}
                      style={{ width: `${stats.total > 0 ? (stats.soumis / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                    {stats.soumis}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#57B894]' : 'bg-[#057642]'}`}></div>
                  <span className={`text-sm font-medium ${isDark ? 'text-[#B0B7BE]' : 'text-gray-700'}`}>
                    Gagnés
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-48 ${isDark ? 'bg-[#38434F]' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className={`h-2 rounded-full ${isDark ? 'bg-[#57B894]' : 'bg-[#057642]'}`}
                      style={{ width: `${stats.total > 0 ? (stats.gagne / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                    {stats.gagne}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#F5989D]' : 'bg-[#CC1016]'}`}></div>
                  <span className={`text-sm font-medium ${isDark ? 'text-[#B0B7BE]' : 'text-gray-700'}`}>
                    Perdus
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-48 ${isDark ? 'bg-[#38434F]' : 'bg-gray-200'} rounded-full h-2`}>
                    <div
                      className={`h-2 rounded-full ${isDark ? 'bg-[#F5989D]' : 'bg-[#CC1016]'}`}
                      style={{ width: `${stats.total > 0 ? (stats.perdu / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                    {stats.perdu}
                  </span>
                </div>
              </div>
            </div>
            </div>
          </div>

          <div className={`rounded-lg border shadow-sm ${isDark ? 'bg-[#1B1F23] border-[#38434F]' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isDark ? 'border-[#38434F]' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0A66C2]/10' : 'bg-[#0A66C2]/5'}`}>
                  <Activity className={`w-5 h-5 ${isDark ? 'text-[#70B5F9]' : 'text-[#0A66C2]'}`} />
                </div>
                <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                  Productivité
                </h2>
              </div>
            </div>
            <div className="p-6">

            <div className="space-y-5">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                    {timeStats.analyzedDocuments}
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-[#B0B7BE]' : 'text-gray-600'}`}>
                  Documents analysés
                </p>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                    {timeStats.completedMemories}
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-[#B0B7BE]' : 'text-gray-600'}`}>
                  Sections de mémoire générées
                </p>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                    {timeStats.days}
                  </span>
                  <span className={`text-xs ${isDark ? 'text-[#B0B7BE]' : 'text-gray-600'}`}>
                    jours économisés
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-[#9CA3AF]' : 'text-gray-500'}`}>
                  soit {timeStats.hours}h de travail
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={`rounded-lg border shadow-sm ${isDark ? 'bg-[#1B1F23] border-[#38434F]' : 'bg-white border-gray-200'}`}>
            <div className={`p-5 border-b ${isDark ? 'border-[#38434F]' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#0A66C2]/10' : 'bg-[#0A66C2]/5'}`}>
                  <Clock className={`w-5 h-5 ${isDark ? 'text-[#70B5F9]' : 'text-[#0A66C2]'}`} />
                </div>
                <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                  Marchés récents
                </h2>
              </div>
            </div>
            <div className={`divide-y ${isDark ? 'divide-[#38434F]' : 'divide-gray-200'}`}>
              {recentMarkets.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-[#38434F]' : 'text-gray-300'}`} />
                  <p className={`text-sm ${isDark ? 'text-[#B0B7BE]' : 'text-gray-600'}`}>
                    Aucun marché récent
                  </p>
                </div>
              ) : (
                recentMarkets.map((market) => (
                  <div key={market.id} className={`p-4 ${isDark ? 'hover:bg-[#38434F]/20' : 'hover:bg-gray-50'} transition-colors cursor-pointer`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium mb-1 truncate ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                          {market.title}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-[#9CA3AF]' : 'text-gray-500'}`}>
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

          <div className={`rounded-lg border shadow-sm ${isDark ? 'bg-[#1B1F23] border-[#38434F]' : 'bg-white border-gray-200'}`}>
            <div className={`p-5 border-b ${isDark ? 'border-[#38434F]' : 'border-gray-200'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-[#CC1016]/10' : 'bg-[#CC1016]/5'}`}>
                  <AlertTriangle className={`w-5 h-5 ${isDark ? 'text-[#F5989D]' : 'text-[#CC1016]'}`} />
                </div>
                <h2 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                  Échéances à venir
                </h2>
              </div>
            </div>
            <div className={`divide-y ${isDark ? 'divide-[#38434F]' : 'divide-gray-200'}`}>
              {upcomingDeadlines.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle className={`w-10 h-10 mx-auto mb-2 ${isDark ? 'text-[#38434F]' : 'text-gray-300'}`} />
                  <p className={`text-sm ${isDark ? 'text-[#B0B7BE]' : 'text-gray-600'}`}>
                    Aucune échéance proche
                  </p>
                </div>
              ) : (
                upcomingDeadlines.map((market) => {
                  const days = getDaysUntil(market.deadline);
                  const isUrgent = days !== null && days <= 3;

                  return (
                    <div key={market.id} className={`p-4 ${isDark ? 'hover:bg-[#38434F]/20' : 'hover:bg-gray-50'} transition-colors cursor-pointer`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className={`text-sm font-medium mb-1 truncate ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>
                            {market.title}
                          </h3>
                          <p className={`text-xs ${isDark ? 'text-[#9CA3AF]' : 'text-gray-500'}`}>
                            {formatDate(market.deadline)}
                          </p>
                        </div>
                        <span className={`ml-3 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          isUrgent
                            ? isDark ? 'bg-[#CC1016]/10 text-[#F5989D]' : 'bg-[#CC1016]/10 text-[#CC1016]'
                            : isDark ? 'bg-[#F5C75D]/10 text-[#F5C75D]' : 'bg-[#915907]/10 text-[#915907]'
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
      </div>
    </div>
  );
};
