import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../lib/supabase';

interface MarketsChartProps {
  operatorEmail?: string;
}

interface ChartData {
  date: string;
  count: number;
}

type PeriodType = '30days' | 'last_month' | 'custom';

export const MarketsChart: React.FC<MarketsChartProps> = ({ operatorEmail }) => {
  const { isDark } = useTheme();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodType>('30days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [totalMarkets, setTotalMarkets] = useState(0);
  const [avgPerDay, setAvgPerDay] = useState(0);

  useEffect(() => {
    loadChartData();
  }, [period, operatorEmail]);

  const getDateRange = (): { startDate: string; endDate: string } => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (period) {
      case '30days':
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;
      case 'last_month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          startDate = new Date(customStartDate);
          endDate = new Date(customEndDate);
        } else {
          startDate = new Date(now);
          startDate.setDate(startDate.getDate() - 30);
        }
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    };
  };

  const loadChartData = async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = getDateRange();

      let query = supabase
        .from('manual_markets')
        .select('created_at')
        .gte('created_at', `${startDate}T00:00:00`)
        .lte('created_at', `${endDate}T23:59:59`)
        .order('created_at', { ascending: true });

      if (operatorEmail) {
        query = query.eq('operator_email', operatorEmail);
      }

      const { data, error } = await query;

      if (error) throw error;

      const groupedByDate: { [key: string]: number } = {};

      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        groupedByDate[dateStr] = 0;
      }

      data?.forEach((market) => {
        const date = new Date(market.created_at).toISOString().split('T')[0];
        if (groupedByDate[date] !== undefined) {
          groupedByDate[date]++;
        }
      });

      const chartDataArray = Object.entries(groupedByDate).map(([date, count]) => ({
        date,
        count,
      }));

      setChartData(chartDataArray);

      const total = chartDataArray.reduce((sum, item) => sum + item.count, 0);
      setTotalMarkets(total);
      setAvgPerDay(chartDataArray.length > 0 ? total / chartDataArray.length : 0);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      loadChartData();
    }
  };

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  const getPeriodLabel = () => {
    switch (period) {
      case '30days':
        return '30 derniers jours';
      case 'last_month':
        return 'Mois dernier';
      case 'custom':
        return 'Période personnalisée';
      default:
        return '';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-700' : 'bg-white'} rounded-xl p-4 border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-orange-600" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Marchés ajoutés - {getPeriodLabel()}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as PeriodType)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              isDark
                ? 'bg-gray-600 border-gray-500 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
          >
            <option value="30days">30 derniers jours</option>
            <option value="last_month">Mois dernier</option>
            <option value="custom">Personnalisé</option>
          </select>
        </div>
      </div>

      {period === 'custom' && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Du:
            </label>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Au:
            </label>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className={`px-3 py-1.5 rounded-lg text-sm border ${
                isDark
                  ? 'bg-gray-600 border-gray-500 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
            />
          </div>
          <button
            onClick={handleCustomDateApply}
            disabled={!customStartDate || !customEndDate}
            className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Appliquer
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-50'} p-3 rounded-lg`}>
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-orange-600" />
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Total sur la période
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {totalMarkets}
          </p>
        </div>

        <div className={`${isDark ? 'bg-gray-600' : 'bg-gray-50'} p-3 rounded-lg`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Moyenne par jour
            </span>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {avgPerDay.toFixed(1)}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Aucune donnée disponible pour cette période
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-end justify-between gap-1 h-48 pb-6">
            {chartData.map((item, index) => {
              const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
              const isWeekend = new Date(item.date).getDay() === 0 || new Date(item.date).getDay() === 6;

              return (
                <div
                  key={item.date}
                  className="flex-1 group relative"
                  style={{ maxWidth: '40px' }}
                >
                  <div className="relative h-full flex items-end">
                    <div
                      className={`w-full rounded-t transition-all duration-300 ${
                        isWeekend
                          ? isDark
                            ? 'bg-gray-500 hover:bg-gray-400'
                            : 'bg-gray-300 hover:bg-gray-400'
                          : 'bg-gradient-to-t from-orange-600 to-orange-400 hover:from-orange-700 hover:to-orange-500'
                      }`}
                      style={{ height: `${height}%`, minHeight: item.count > 0 ? '4px' : '0' }}
                    />
                  </div>

                  <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {index % Math.ceil(chartData.length / 10) === 0 && formatDate(item.date)}
                  </div>

                  <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 ${
                    isDark ? 'bg-gray-900 text-white' : 'bg-gray-800 text-white'
                  }`}>
                    <div className="text-xs font-medium">{formatDate(item.date)}</div>
                    <div className="text-xs">{item.count} marché{item.count > 1 ? 's' : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
