import React, { useState, useEffect } from 'react';
import { Activity, TrendingUp, Clock, Zap, Eye, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface SentinelScore {
  market_title: string;
  score: number;
  created_at: string;
}

export const IrisWidget: React.FC = () => {
  const { user } = useAuth();
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [recentScores, setRecentScores] = useState<SentinelScore[]>([]);
  const [stats, setStats] = useState({
    marketsWatched: 0,
    analysisThisWeek: 12,
    avgScore: 0,
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setLastSync(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data: alerts } = await supabase
        .from('market_alerts')
        .select('*')
        .eq('user_id', user.id);

      setStats(prev => ({
        ...prev,
        marketsWatched: alerts?.length || 0,
      }));

      const { data: detections } = await supabase
        .from('market_alert_detections')
        .select('market_title, sentinel_score, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (detections) {
        setRecentScores(
          detections.map(d => ({
            market_title: d.market_title || 'Sans titre',
            score: d.sentinel_score || 0,
            created_at: d.created_at,
          }))
        );

        const avgScore = detections.reduce((acc, d) => acc + (d.sentinel_score || 0), 0) / detections.length;
        setStats(prev => ({ ...prev, avgScore: Math.round(avgScore) }));
      }

      setLastSync(new Date());
    } catch (error) {
      console.error('Error fetching Iris widget data:', error);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'À l\'instant';
    if (diff < 60) return `il y a ${diff} min`;
    const hours = Math.floor(diff / 60);
    return `il y a ${hours}h`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-50';
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-linkedin-500 to-linkedin-600 rounded-lg p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Iris</h3>
            <p className="text-xs text-white/80">Votre assistante IA</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-green"></div>
          <span>Dernier scan : {formatTime(lastSync)}</span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-iris-card border border-iris-border rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-900 mb-3">Analyse Rapide</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Eye className="w-4 h-4" />
              <span>Marchés surveillés</span>
            </div>
            <span className="font-bold text-linkedin-500">{stats.marketsWatched}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Activity className="w-4 h-4" />
              <span>Analyses cette semaine</span>
            </div>
            <span className="font-bold text-linkedin-500">{stats.analysisThisWeek}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Target className="w-4 h-4" />
              <span>Score moyen</span>
            </div>
            <span className="font-bold text-green-600">{stats.avgScore}%</span>
          </div>
        </div>
      </div>

      {/* Recent Scores */}
      <div className="bg-iris-card border border-iris-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-900">Dernier Pipe Sentinel</h4>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </div>
        <div className="space-y-2">
          {recentScores.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Aucune analyse récente</p>
          ) : (
            recentScores.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-iris-border last:border-0">
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-xs text-slate-700 truncate font-medium">{item.market_title}</p>
                  <p className="text-xs text-slate-500">{formatTime(new Date(item.created_at))}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${getScoreColor(item.score)}`}>
                  {item.score}%
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* CTA Card */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">Gain de temps</h4>
            <p className="text-xs text-slate-600 mb-2">
              En moyenne, je vous fais gagner <strong>15h par marché</strong>. Concentrez-vous sur votre métier !
            </p>
            <button className="text-xs font-semibold text-linkedin-500 hover:text-linkedin-600">
              En savoir plus →
            </button>
          </div>
        </div>
      </div>

      {/* Premium Upsell */}
      <div className="bg-gradient-to-br from-linkedin-500 to-linkedin-600 rounded-lg p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold bg-iris-gold text-slate-900 px-2 py-1 rounded">PREMIUM</span>
        </div>
        <h4 className="font-bold mb-1">Passez en illimité</h4>
        <p className="text-xs text-white/90 mb-3">
          Débloquez l'analyse illimitée et générez autant de mémoires que vous le souhaitez
        </p>
        <button className="w-full bg-white text-linkedin-500 font-semibold text-sm py-2 rounded-full hover:bg-white/90 transition-colors">
          Découvrir Premium
        </button>
      </div>
    </div>
  );
};
