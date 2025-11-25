import React, { useState } from 'react';
import { User, BookOpen, Palette, Webhook, CreditCard } from 'lucide-react';
import { Image } from 'lucide-react';
import { ProfileSettings } from './ProfileSettings';
import { SubscriptionSettings } from './SubscriptionSettings';
import { KnowledgeBase } from './KnowledgeBase';
import { ThemeSettings } from './ThemeSettings';
import { WebhookSettings } from './WebhookSettings';
import { ReportAssetManager } from './ReportAssetManager';
import { useTheme } from '../../hooks/useTheme';

type SettingsTab = 'profile' | 'subscription' | 'knowledge' | 'assets' | 'webhook' | 'theme';

const tabs = [
  { id: 'profile' as const, label: 'Informations personnelles', icon: User },
  { id: 'subscription' as const, label: 'Abonnement', icon: CreditCard },
  { id: 'knowledge' as const, label: 'Base de connaissance', icon: BookOpen },
  { id: 'assets' as const, label: 'Mes images', icon: Image },
  { id: 'webhook' as const, label: 'Intégrations', icon: Webhook },
  { id: 'theme' as const, label: 'Apparence', icon: Palette },
];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const { isDark } = useTheme();

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'subscription':
        return <SubscriptionSettings />;
      case 'knowledge':
        return <KnowledgeBase />;
      case 'assets':
        return <ReportAssetManager />;
      case 'webhook':
        return <WebhookSettings />;
      case 'theme':
        return <ThemeSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-3 rounded-xl shadow-lg">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Paramètres</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Gérez vos préférences et paramètres de compte</p>
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="w-64 space-y-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-4 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? `${isDark ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-400 border-r-4 border-orange-500' : 'bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 border-r-4 border-orange-500'} shadow-lg transform scale-105`
                    : `${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-orange-400' : 'text-gray-700 hover:bg-orange-50 hover:text-orange-600'} hover:transform hover:scale-102`
                }`}
              >
                <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                  isActive 
                    ? 'bg-orange-500 shadow-lg' 
                    : `${isDark ? 'bg-gray-800 group-hover:bg-orange-500/20' : 'bg-gray-100 group-hover:bg-orange-100'}`
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isActive 
                      ? 'text-white' 
                      : `${isDark ? 'text-gray-400 group-hover:text-orange-400' : 'text-gray-500 group-hover:text-orange-600'}`
                  }`} />
                </div>
                <span className="font-semibold text-sm">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};