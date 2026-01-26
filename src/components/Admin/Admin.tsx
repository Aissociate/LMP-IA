import React, { useState } from 'react';
import { Shield, Brain, Settings as SettingsIcon, MessageSquare, BarChart3, Bug, Video, UserCheck, CreditCard, RefreshCw } from 'lucide-react';
import { AIModelSelector } from './AIModelSelector';
import { AIParameters } from './AIParameters';
import { PromptManager } from './PromptManager';
import { MarketingAnalytics } from './MarketingAnalytics';
import { BugManager } from './BugManager';
import { VideoUploader } from './VideoUploader';
import { UserImpersonation } from './UserImpersonation';
import { SubscriptionManager } from './SubscriptionManager';
import { MarketSyncMonitor } from './MarketSyncMonitor';
import { useTheme } from '../../hooks/useTheme';

type AdminTab = 'ai-models' | 'ai-parameters' | 'prompts' | 'subscriptions' | 'marketing' | 'bugs' | 'videos' | 'impersonation' | 'market-sync';

const adminTabs = [
  { id: 'ai-models' as const, label: 'Modèles IA', icon: Brain },
  { id: 'ai-parameters' as const, label: 'Paramètres IA', icon: SettingsIcon },
  { id: 'prompts' as const, label: 'Gestion des prompts', icon: MessageSquare },
  { id: 'subscriptions' as const, label: 'Abonnements', icon: CreditCard },
  { id: 'market-sync' as const, label: 'Synchronisation Marchés 974', icon: RefreshCw },
  { id: 'marketing' as const, label: 'Analytics Marketing', icon: BarChart3 },
  { id: 'bugs' as const, label: 'Gestion des bugs', icon: Bug },
  { id: 'videos' as const, label: 'Vidéos Marketing', icon: Video },
  { id: 'impersonation' as const, label: 'Prise de contrôle', icon: UserCheck },
];

export const Admin: React.FC = () => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<AdminTab>('ai-models');

  const renderContent = () => {
    switch (activeTab) {
      case 'ai-models':
        return <AIModelSelector />;
      case 'ai-parameters':
        return <AIParameters />;
      case 'prompts':
        return <PromptManager />;
      case 'subscriptions':
        return <SubscriptionManager />;
      case 'market-sync':
        return <MarketSyncMonitor />;
      case 'marketing':
        return <MarketingAnalytics />;
      case 'bugs':
        return <BugManager />;
      case 'videos':
        return <VideoUploader />;
      case 'impersonation':
        return <UserImpersonation />;
      default:
        return <AIModelSelector />;
    }
  };

  return (
    <div className={`p-8 min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Administration</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-2`}>Configuration globale de l'application</p>
          </div>
        </div>
        
        <div className={`${isDark ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200'} border rounded-xl p-4 transition-colors duration-200`}>
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            <span className={`font-medium ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Zone réservée aux administrateurs</span>
          </div>
          <p className={`${isDark ? 'text-amber-400' : 'text-amber-700'} text-sm mt-1`}>
            Les modifications effectuées ici affectent l'ensemble de l'application.
          </p>
        </div>
      </div>

      <div className="flex gap-8">
        <div className="w-64 space-y-3">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-4 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? `${isDark ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border-r-4 border-red-500' : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-r-4 border-red-500'} shadow-lg transform scale-105`
                    : `${isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-red-400' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'} hover:transform hover:scale-102`
                }`}
              >
                <div className={`p-2 rounded-lg mr-3 transition-all duration-200 ${
                  isActive 
                    ? 'bg-red-500 shadow-lg' 
                    : `${isDark ? 'bg-gray-800 group-hover:bg-red-500/20' : 'bg-gray-100 group-hover:bg-red-100'}`
                }`}>
                  <Icon className={`w-4 h-4 ${
                    isActive 
                      ? 'text-white' 
                      : `${isDark ? 'text-gray-400 group-hover:text-red-400' : 'text-gray-500 group-hover:text-red-600'}`
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