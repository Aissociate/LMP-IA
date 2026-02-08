import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { LoginForm } from './components/Auth/LoginForm';
import { SignupForm } from './components/Auth/SignupForm';
import { ForgotPasswordForm } from './components/Auth/ForgotPasswordForm';
import { ResetPasswordForm } from './components/Auth/ResetPasswordForm';
import { SubscriptionGate } from './components/Auth/SubscriptionGate';
import { Sidebar } from './components/Layout/Sidebar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { MarketList } from './components/Markets/MarketList';
import { MarketListDebug } from './components/Markets/MarketListDebug';
import { MarketSearch } from './components/MarketSearch/MarketSearch';
import { MarketSentinel } from './components/MarketSearch/MarketSentinel';
import { Settings } from './components/Settings/Settings';
import { Admin } from './components/Admin/Admin';
import { Labo } from './components/Labo/Labo';
import { Assistant } from './components/Assistant/Assistant';
import { SecureVault } from './components/SecureVault/SecureVault';
import { CGV } from './components/Landing';
import { MentionsLegales } from './components/Landing/MentionsLegales';
import { MarketCollector } from './components/MarketSearch/MarketCollector';
import { BugReportButton } from './components/Common/BugReportButton';
import { PublicMarketPage } from './components/PublicMarket/PublicMarketPage';
import { ReunionMarketsDirectory } from './components/PublicMarket/ReunionMarketsDirectory';
import { SubscriptionSelection } from './components/Subscription/SubscriptionSelection';
import { SubscriptionOnboarding } from './components/Subscription/SubscriptionOnboarding';

type AuthMode = 'login' | 'signup';
type AppTab = 'dashboard' | 'recherche-marches' | 'surveillance-marches' | 'marche' | 'coffre-fort' | 'assistant' | 'parametres' | 'admin' | 'labo';

function AppContent() {
  const { user, loading } = useAuth();
  const { isDark } = useTheme();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const location = useLocation();

  const publicRoutes = ['/', '/cgv', '/mentions-legales', '/collecte', '/subscription', '/subscription-onboarding', '/login', '/signup', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/marchepublics/974');

  if (loading && !isPublicRoute) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-100'} flex items-center justify-center transition-colors duration-200`}>
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
          <div className="flex items-center gap-2">
            <img src="/logo1.png" alt="Le Marché Public.fr" className="h-12 w-auto" />
            <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Le Marché Public.fr</span>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'recherche-marches':
        return <MarketSearch />;
      case 'surveillance-marches':
        return <MarketSentinel />;
      case 'marche':
        return <MarketList />;
      case 'coffre-fort':
        return <SecureVault />;
      case 'assistant':
        return <Assistant />;
      case 'parametres':
        return <Settings />;
      case 'admin':
        return <Admin />;
      case 'labo':
        return <Labo />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Routes>
      <Route path="/cgv" element={<CGV />} />
      <Route path="/mentions-legales" element={<MentionsLegales />} />
      <Route path="/collecte" element={<MarketCollector />} />
      <Route path="/subscription" element={<SubscriptionSelection />} />
      <Route path="/subscription-onboarding" element={<SubscriptionOnboarding />} />
      <Route path="/forgot-password" element={
        <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900/20' : 'bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200'} flex items-center justify-center p-4 transition-colors duration-200`}>
          <ForgotPasswordForm />
        </div>
      } />
      <Route path="/reset-password" element={
        <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900/20' : 'bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200'} flex items-center justify-center p-4 transition-colors duration-200`}>
          <ResetPasswordForm />
        </div>
      } />
      <Route path="/marchepublics/974" element={<ReunionMarketsDirectory />} />
      <Route path="/marchepublics/974/:slug" element={<PublicMarketPage />} />
      <Route path="/*" element={
        !user ? (
          <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900/20' : 'bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200'} flex items-center justify-center p-4 transition-colors duration-200`}>
            {authMode === 'login' ? (
              <LoginForm onToggleMode={() => setAuthMode('signup')} />
            ) : (
              <SignupForm onToggleMode={() => setAuthMode('login')} />
            )}
          </div>
        ) : (
          <SubscriptionGate>
            <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex transition-colors duration-200`}>
              <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as AppTab)} />
              <main className="flex-1 ml-64">
                {renderContent()}
              </main>
              <BugReportButton />
            </div>
          </SubscriptionGate>
        )
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;