import React from 'react';
import {
  BarChart3,
  FileText,
  Search,
  Settings,
  LogOut,
  Shield,
  Zap,
  Beaker,
  Crown,
  Timer,
  Bell,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSubscription } from '../../hooks/useSubscription';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'recherche-marches', label: 'Recherche de marchés', icon: Search },
  { id: 'surveillance-marches', label: 'Market Sentinel™', icon: Shield },
  { id: 'marche', label: 'Marchés', icon: FileText },
  { id: 'assistant', label: 'Assistant IA', icon: MessageSquare },
  { id: 'parametres', label: 'Paramètres', icon: Settings },
  { id: 'labo', label: 'Labo', icon: Beaker },
];

const adminMenuItem = { id: 'admin', label: 'Administration', icon: Shield };

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { signOut, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const { subscription, plan, loading: subscriptionLoading } = useSubscription();

  const allMenuItems = isAdmin ? [...menuItems, adminMenuItem] : menuItems;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} h-screen w-64 fixed left-0 top-0 flex flex-col border-r transition-colors duration-200`}>
      <div className={`px-6 py-5 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center justify-center">
          <img src="/logo1.png" alt="Le Marché Public.fr" className="h-30 w-auto" />
        </div>
      </div>

      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {allMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 focus-visible-ring ${
                    isActive
                      ? isDark
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-blue-600 text-white shadow-sm'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Indicateur d'abonnement permanent dans la sidebar */}
      {!subscriptionLoading && !isAdmin && (
        <div className={`mx-4 mb-4 p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} transition-colors duration-200`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded ${
                plan?.is_unlimited 
                  ? isDark ? 'bg-green-800' : 'bg-green-100'
                  : subscription && subscription.technical_memories_used >= subscription.technical_memories_limit
                  ? isDark ? 'bg-red-800' : 'bg-red-100'
                  : subscription && subscription.technical_memories_limit - subscription.technical_memories_used <= 1
                  ? isDark ? 'bg-orange-800' : 'bg-orange-100'
                  : isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}>
                {plan?.is_unlimited ? (
                  <Crown className={`w-3 h-3 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                ) : (
                  <Timer className={`w-3 h-3 ${
                    subscription && subscription.technical_memories_used >= subscription.technical_memories_limit
                      ? isDark ? 'text-red-400' : 'text-red-600'
                      : subscription && subscription.technical_memories_limit - subscription.technical_memories_used <= 1
                      ? isDark ? 'text-orange-400' : 'text-orange-600'
                      : isDark ? 'text-gray-400' : 'text-gray-600'
                  }`} />
                )}
              </div>
              <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {plan?.name || 'Freemium'}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700'}`}>
                ∞ Tokens
              </span>
            </div>
            {!plan?.is_unlimited && (
              <span className={`text-xs px-2 py-1 rounded-full ${
                subscription && subscription.technical_memories_used >= subscription.technical_memories_limit
                  ? isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700'
                  : subscription && subscription.technical_memories_limit - subscription.technical_memories_used <= 1
                  ? isDark ? 'bg-orange-900/20 text-orange-400' : 'bg-orange-100 text-orange-700'
                  : isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700'
              }`}>
                {subscription 
                  ? `${Math.max(0, subscription.technical_memories_limit - subscription.technical_memories_used)}/${subscription.technical_memories_limit}`
                  : '1/1'
                }
              </span>
            )}
          </div>
          
          {/* Barre de progression subtile */}
          {!plan?.is_unlimited && subscription && (
            <div className={`w-full h-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'} mb-2`}>
              <div
                className={`h-1 rounded-full transition-all duration-300 ${
                  subscription.technical_memories_used >= subscription.technical_memories_limit
                    ? 'bg-red-500'
                    : subscription.technical_memories_limit - subscription.technical_memories_used <= 1
                    ? 'bg-orange-500'
                    : 'bg-green-500'
                }`}
                style={{
                  width: `${Math.min(100, (subscription.technical_memories_used / subscription.technical_memories_limit) * 100)}%`
                }}
              ></div>
            </div>
          )}
          
          {/* Appel à l'action discret mais permanent */}
          {!plan?.is_unlimited && (
            <button
              onClick={() => onTabChange('parametres')}
              className={`w-full text-xs py-1.5 px-2 rounded transition-colors ${
                subscription && subscription.technical_memories_used >= subscription.technical_memories_limit
                  ? 'bg-red-600 hover:bg-red-700 text-white font-medium'
                  : subscription && subscription.technical_memories_limit - subscription.technical_memories_used <= 1
                  ? 'bg-orange-600 hover:bg-orange-700 text-white font-medium'
                  : isDark ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-900/20' : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
              }`}
            >
              {subscription && subscription.technical_memories_used >= subscription.technical_memories_limit
                ? '🚀 Débloquer'
                : subscription && subscription.technical_memories_limit - subscription.technical_memories_used <= 1
                ? '⚠️ Upgrade'
                : '⭐ Voir les plans'
              }
            </button>
          )}
          
          <div className={`text-xs text-center mt-2 ${isDark ? 'text-green-400' : 'text-green-600'} font-medium`}>
            ✨ Tokens IA illimités pour tous
          </div>
        </div>
      )}

      <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className={`mb-4 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-xs leading-relaxed">
            Le Marché Public.fr est une IA conforme aux dispositions de l'IA Act et du RGPD
          </p>
        </div>
        <button
          onClick={handleSignOut}
          className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
            isDark 
              ? 'text-gray-300 hover:bg-red-900/20 hover:text-red-400' 
              : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
          }`}
        >
          <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
            isDark ? 'bg-gray-800 group-hover:bg-red-900/20' : 'bg-gray-100 group-hover:bg-red-100'
          }`}>
            <LogOut className={`w-4 h-4 ${isDark ? 'text-gray-400 group-hover:text-red-400' : 'text-gray-500 group-hover:text-red-600'}`} />
          </div>
          <span className="font-semibold">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};