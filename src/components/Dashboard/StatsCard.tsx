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
    light: 'bg-[#0A66C2]/5 text-[#0A66C2]',
    dark: 'bg-[#0A66C2]/10 text-[#70B5F9]'
  },
  green: {
    light: 'bg-[#057642]/5 text-[#057642]',
    dark: 'bg-[#057642]/10 text-[#57B894]'
  },
  yellow: {
    light: 'bg-[#F5C75D]/10 text-[#915907]',
    dark: 'bg-[#F5C75D]/10 text-[#F5C75D]'
  },
  red: {
    light: 'bg-[#CC1016]/5 text-[#CC1016]',
    dark: 'bg-[#CC1016]/10 text-[#F5989D]'
  },
  purple: {
    light: 'bg-[#5E1EA5]/5 text-[#5E1EA5]',
    dark: 'bg-[#5E1EA5]/10 text-[#A78BDB]'
  },
  orange: {
    light: 'bg-[#C37D16]/5 text-[#C37D16]',
    dark: 'bg-[#C37D16]/10 text-[#EFA640]'
  },
  amber: {
    light: 'bg-[#F5C75D]/10 text-[#915907]',
    dark: 'bg-[#F5C75D]/10 text-[#F5C75D]'
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
    <div className={`${isDark ? 'bg-[#1B1F23] border-[#38434F]' : 'bg-white border-gray-200'} rounded-lg shadow-sm border p-5 hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${isDark ? colorClasses[color].dark : colorClasses[color].light}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-[#B0B7BE]' : 'text-gray-500'} mb-2`}>{title}</p>
        <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-[#000000DE]'}`}>{value}</p>
        {subtitle && <p className={`text-xs ${isDark ? 'text-[#9CA3AF]' : 'text-gray-600'} mt-2`}>{subtitle}</p>}
      </div>
    </div>
  );
};