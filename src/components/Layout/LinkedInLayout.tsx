import React from 'react';
import { Search, FileText, BarChart3, Settings, Bell, User, Home, Building2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface LinkedInLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export const LinkedInLayout: React.FC<LinkedInLayoutProps> = ({ children, rightSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: Search, label: 'Recherche', path: '/search' },
    { icon: FileText, label: 'Mes Marchés', path: '/markets' },
    { icon: BarChart3, label: 'Sentinel', path: '/sentinel' },
    { icon: Building2, label: 'Sourcing', path: '/sourcing' },
    { icon: Settings, label: 'Paramètres', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-iris-bg">
      {/* Top Bar - LinkedIn Style */}
      <div className="fixed top-0 left-0 right-0 bg-iris-card border-b border-iris-border z-50 shadow-subtle">
        <div className="max-w-screen-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <div className="w-9 h-9 bg-linkedin-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="font-semibold text-slate-900 hidden md:block">LeMarchéPublic</span>
            </button>

            {/* Search Bar */}
            <div className="hidden md:flex items-center bg-iris-bg rounded px-3 py-2 w-64">
              <Search className="w-4 h-4 text-slate-500 mr-2" />
              <input
                type="text"
                placeholder="Rechercher des marchés..."
                className="bg-transparent text-sm text-slate-700 outline-none w-full"
                onFocus={() => navigate('/search')}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-iris-bg rounded-lg transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2 p-2 hover:bg-iris-bg rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-linkedin-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700 hidden md:block">Moi</span>
            </button>
          </div>
        </div>
      </div>

      <div className="pt-14 flex max-w-screen-2xl mx-auto">
        {/* Left Sidebar - LinkedIn Style */}
        <aside className="hidden lg:block w-56 fixed left-0 top-14 bottom-0 bg-iris-card border-r border-iris-border overflow-y-auto">
          <nav className="p-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                    ${active
                      ? 'bg-iris-bg text-linkedin-500 border-l-4 border-linkedin-500'
                      : 'text-slate-600 hover:bg-iris-bg hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Card */}
          <div className="p-4 m-2 bg-iris-bg rounded-lg border border-iris-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-linkedin-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {user?.email?.split('@')[0] || 'Utilisateur'}
                </div>
                <div className="text-xs text-slate-500">Abonné Pro</div>
              </div>
            </div>
            <div className="text-xs text-slate-600 border-t border-iris-border pt-2 mt-2">
              <div className="flex justify-between mb-1">
                <span>Vues du profil</span>
                <span className="font-semibold text-linkedin-500">127</span>
              </div>
              <div className="flex justify-between">
                <span>Analyses ce mois</span>
                <span className="font-semibold text-linkedin-500">42</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-56 lg:mr-80 min-h-screen">
          <div className="p-4">
            {children}
          </div>
        </main>

        {/* Right Sidebar - Iris Widget */}
        {rightSidebar && (
          <aside className="hidden lg:block w-80 fixed right-0 top-14 bottom-0 bg-iris-card border-l border-iris-border overflow-y-auto">
            {rightSidebar}
          </aside>
        )}
      </div>
    </div>
  );
};
