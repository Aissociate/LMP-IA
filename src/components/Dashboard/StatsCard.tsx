import React from 'react';
import { Divide as LucideIcon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'amber';
  subtitle?: string;
  isDark?: boolean;
}

const colorClasses = {
  blue: {
    light: 'bg-blue-50 text-blue-600 border-blue-200',
    dark: 'bg-blue-900/20 text-blue-400 border-blue-700'
  },
  green: {
    light: 'bg-green-50 text-green-600 border-green-200',
    dark: 'bg-green-900/20 text-green-400 border-green-700'
  },
  yellow: {
    light: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    dark: 'bg-yellow-900/20 text-yellow-400 border-yellow-700'
  },
  red: {
    light: 'bg-red-50 text-red-600 border-red-200',
    dark: 'bg-red-900/20 text-red-400 border-red-700'
  },
  purple: {
    light: 'bg-purple-50 text-purple-600 border-purple-200',
    dark: 'bg-purple-900/20 text-purple-400 border-purple-700'
  },
  orange: {
    light: 'bg-orange-50 text-orange-600 border-orange-200',
    dark: 'bg-orange-900/20 text-orange-400 border-orange-700'
  },
  amber: {
    light: 'bg-amber-50 text-amber-600 border-amber-200',
    dark: 'bg-amber-900/20 text-amber-400 border-amber-700'
  }
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  subtitle
}) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-lg border p-6 hover:shadow-xl transition-all duration-200 hover:transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mt-2`}>{value}</p>
          {subtitle && <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl shadow-lg ${isDark ? colorClasses[color].dark : colorClasses[color].light}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};