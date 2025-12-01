import React from 'react';
import { TrendingUp, Clock, Euro, FileText, Calendar } from 'lucide-react';
import { BOAMPSearchResult } from '../../types/boamp';

interface SearchStatsProps {
  searchResult: BOAMPSearchResult | null;
  loading: boolean;
  isDark: boolean;
}

export const SearchStats: React.FC<SearchStatsProps> = ({ searchResult, loading, isDark }) => {
  if (!searchResult || loading) return null;

  const stats = {
    total: searchResult.total,
    avgAmount: searchResult.markets.reduce((sum, m) => sum + (m.amount || 0), 0) / searchResult.markets.length || 0,
    urgentCount: searchResult.markets.filter(m => {
      if (!m.deadline) return false;
      const deadline = new Date(m.deadline);
      const now = new Date();
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft <= 7 && daysLeft >= 0;
    }).length,
    typesCount: new Set(searchResult.markets.map(m => m.serviceType)).size
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Results */}
      <div className={`${
        isDark ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700/50' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
      } border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Total marchés
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.total.toLocaleString('fr-FR')}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              {searchResult.markets.length} sur cette page
            </p>
          </div>
          <div className={`${
            isDark ? 'bg-blue-800/50' : 'bg-blue-200'
          } p-3 rounded-lg`}>
            <FileText className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
        </div>
      </div>

      {/* Urgent Markets */}
      <div className={`${
        isDark ? 'bg-gradient-to-br from-red-900/30 to-red-800/30 border-red-700/50' : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
      } border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              Urgents (≤7j)
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.urgentCount}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              {((stats.urgentCount / searchResult.markets.length) * 100).toFixed(0)}% des résultats
            </p>
          </div>
          <div className={`${
            isDark ? 'bg-red-800/50' : 'bg-red-200'
          } p-3 rounded-lg`}>
            <Clock className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
          </div>
        </div>
      </div>

      {/* Average Amount */}
      <div className={`${
        isDark ? 'bg-gradient-to-br from-green-900/30 to-green-800/30 border-green-700/50' : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
      } border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              Montant moyen
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.avgAmount > 0
                ? `${(stats.avgAmount / 1000).toFixed(0)}K€`
                : 'N/A'}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-green-300' : 'text-green-700'}`}>
              Par marché
            </p>
          </div>
          <div className={`${
            isDark ? 'bg-green-800/50' : 'bg-green-200'
          } p-3 rounded-lg`}>
            <Euro className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
        </div>
      </div>

      {/* Types Count */}
      <div className={`${
        isDark ? 'bg-gradient-to-br from-orange-900/30 to-orange-800/30 border-orange-700/50' : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
      } border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
              Types différents
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {stats.typesCount}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
              Catégories trouvées
            </p>
          </div>
          <div className={`${
            isDark ? 'bg-orange-800/50' : 'bg-orange-200'
          } p-3 rounded-lg`}>
            <TrendingUp className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
