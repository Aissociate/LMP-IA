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
  MessageSquare,
  Lock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Iris - Mon Assistante', icon: BarChart3 },
  { id: 'recherche-marches', label: 'Recherche de marchés', icon: Search },
  { id: 'surveillance-marches', label: 'Market Sentinel™', icon: Shield },
  { id: 'marche', label: 'Marchés', icon: FileText },
  { id: 'assistant', label: 'Assistant IA', icon: MessageSquare },
  { id: 'coffre-fort', label: 'Coffre-Fort', icon: Lock },
  { id: 'parametres', label: 'Paramètres', icon: Settings },
  { id: 'labo', label: 'Labo', icon: Beaker },
];

const adminMenuItem = { id: 'admin', label: 'Administration', icon: Shield };

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { signOut, isAdmin } = useAuth();
  const { isDark } = useTheme();

  const allMenuItems = isAdmin ? [...menuItems, adminMenuItem] : menuItems;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} h-screen w-64 fixed left-0 top-0 flex flex-col border-r transition-colors duration-200`}>
      <div className={`px-6 py-5 border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className="flex items-center justify-center">
          <img src="/logo1.png" alt="Le Marché Public.fr" className="h-15 w-auto" />
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