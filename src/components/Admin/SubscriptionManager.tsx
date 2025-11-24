import React, { useState, useEffect } from 'react';
import { CreditCard, Save, Users, Crown, Star, Zap, Infinity, FileText, MessageCircle, Brain, Shield, ChevronDown, ChevronUp, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  technical_memories_limit: number;
  monthly_tokens_limit: number;
  features: string[];
  color: string;
  icon: React.ComponentType<any>;
  is_unlimited: boolean;
}

interface UserSubscription {
  user_id: string;
  plan_id: string;
  technical_memories_used: number;
  technical_memories_limit: number;
  monthly_tokens_used: number;
  monthly_tokens_limit: number;
  expires_at: string;
  is_active: boolean;
  user_email: string;
  plan_name: string;
}

const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'admin',
    name: 'Admin',
    price: 0,
    technical_memories_limit: -1,
    monthly_tokens_limit: -1,
    features: [
      'Accès administrateur complet',
      'Mémoires techniques illimitées',
      'Analyses de documents illimitées',
      'Agent de sourcing illimité',
      'Gestion des utilisateurs',
      'Configuration système',
      'Support technique dédié'
    ],
    color: 'red',
    icon: Shield,
    is_unlimited: true
  },
  {
    id: 'freemium',
    name: 'Freemium',
    price: 0,
    technical_memories_limit: 1,
    monthly_tokens_limit: -1,
    features: [
      '1 mémoire technique',
      'Sections illimitées',
      'Analyses de documents illimitées',
      'Agent de sourcing limité',
      'Support communautaire',
      'Tokens IA illimités'
    ],
    color: 'gray',
    icon: FileText,
    is_unlimited: false
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 99.90,
    technical_memories_limit: 1,
    monthly_tokens_limit: -1,
    features: [
      '1 mémoire technique par mois',
      'Sections illimitées',
      'Analyses de documents illimitées',
      'Agent de sourcing illimité',
      'Support email',
      'Marchés à l\'unité (+39.90€)',
      'Tokens IA illimités'
    ],
    color: 'blue',
    icon: Star,
    is_unlimited: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 349.90,
    technical_memories_limit: 5,
    monthly_tokens_limit: -1,
    features: [
      '5 mémoires techniques par mois',
      'Sections illimitées',
      'Analyses de documents illimitées',
      'Agent de sourcing illimité',
      'Support prioritaire',
      'Marchés à l\'unité (+39.90€)',
      'Statistiques avancées',
      'Tokens IA illimités'
    ],
    color: 'purple',
    icon: Crown,
    is_unlimited: false
  },
  {
    id: 'expert',
    name: 'Expert',
    price: 499.90,
    technical_memories_limit: 10,
    monthly_tokens_limit: -1,
    features: [
      '10 mémoires techniques par mois',
      'Sections illimitées',
      'Analyses de documents illimitées',
      'Agent de sourcing illimité',
      'Support prioritaire',
      'Marchés à l\'unité (+39.90€)',
      'Statistiques avancées',
      'Formation personnalisée',
      'Tokens IA illimités'
    ],
    color: 'orange',
    icon: Zap,
    is_unlimited: false
  },
  {
    id: 'unlimited',
    name: 'Illimité',
    price: 999.00,
    technical_memories_limit: -1,
    monthly_tokens_limit: -1,
    features: [
      'Mémoires techniques illimitées',
      'Sections illimitées',
      'Analyses de documents illimitées',
      'Agent de sourcing illimité',
      'Support dédié 24/7',
      'Statistiques avancées',
      'Formation personnalisée',
      'API access',
      'White-label'
    ],
    color: 'green',
    icon: Infinity,
    is_unlimited: true
  }
];

export const SubscriptionManager: React.FC = () => {
  const { isDark } = useTheme();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(defaultPlans);
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'plans' | 'users'>('plans');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: profilesData } = await supabase
        .from('user_profiles')
        .select('user_id, full_name, company');

      const profilesMap = new Map(
        profilesData?.map(profile => [profile.user_id, profile]) || []
      );

      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('user_subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subscriptionsError) {
        console.error('Error fetching subscriptions:', subscriptionsError);
      }

      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (plansData && plansData.length > 0) {
        const mergedPlans = plansData.map(dbPlan => {
          const defaultPlan = defaultPlans.find(dp => dp.id === dbPlan.id);
          return {
            ...dbPlan,
            monthly_tokens_limit: dbPlan.monthly_tokens_limit || defaultPlan?.monthly_tokens_limit || 50000,
            icon: defaultPlan?.icon || FileText,
            color: defaultPlan?.color || 'gray'
          };
        });
        setPlans(mergedPlans);
      }

      const plansMap = new Map(
        plansData?.map(plan => [plan.id, plan.name]) ||
        defaultPlans.map(plan => [plan.id, plan.name])
      );

      const allUserIds = new Set([
        ...(subscriptionsData?.map(sub => sub.user_id) || []),
        ...(profilesData?.map(profile => profile.user_id) || [])
      ]);

      const allUserSubscriptions = Array.from(allUserIds).map(userId => {
        const profile = profilesMap.get(userId);

        const isUserAdmin =
          profile?.company?.toLowerCase().includes('admin') ||
          profile?.full_name?.toLowerCase().includes('admin') ||
          profile?.company?.toLowerCase().includes('administrateur');

        const subscription = subscriptionsData?.find(sub => sub.user_id === userId);

        const userEmail = profile?.full_name || `user-${userId.slice(0, 8)}@exemple.com`;

        if (isUserAdmin) {
          return {
            user_id: userId,
            plan_id: 'admin',
            technical_memories_used: -1,
            technical_memories_limit: -1,
            monthly_tokens_used: -1,
            monthly_tokens_limit: -1,
            expires_at: null,
            is_active: true,
            user_email: userEmail,
            plan_name: 'Admin'
          };
        } else if (subscription) {
          return {
            user_id: subscription.user_id,
            plan_id: subscription.plan_id,
            technical_memories_used: subscription.technical_memories_used || 0,
            technical_memories_limit: subscription.technical_memories_limit || 1,
            monthly_tokens_used: subscription.monthly_tokens_used || 0,
            monthly_tokens_limit: subscription.monthly_tokens_limit || 100000,
            expires_at: subscription.expires_at,
            is_active: subscription.is_active,
            user_email: userEmail,
            plan_name: plansMap.get(subscription.plan_id) || 'Plan inconnu'
          };
        } else {
          return {
            user_id: userId,
            plan_id: 'freemium',
            technical_memories_used: 0,
            technical_memories_limit: 1,
            monthly_tokens_used: 0,
            monthly_tokens_limit: 50000,
            expires_at: null,
            is_active: true,
            user_email: userEmail,
            plan_name: 'Freemium'
          };
        }
      });

      setUserSubscriptions(allUserSubscriptions);
    } catch (error) {
      console.error('Error fetching subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserExpanded = (userId: string) => {
    setExpandedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSavePlans = async () => {
    setSaving(true);
    setMessage(null);

    try {
      for (const plan of plans) {
        await supabase
          .from('subscription_plans')
          .upsert({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            technical_memories_limit: plan.technical_memories_limit,
            monthly_tokens_limit: plan.monthly_tokens_limit,
            features: plan.features,
            is_unlimited: plan.is_unlimited,
            is_active: true
          }, { onConflict: 'id' });
      }

      setMessage({ type: 'success', text: 'Plans d\'abonnement sauvegardés avec succès' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const updatePlanPrice = (planId: string, newPrice: number) => {
    setPlans(plans.map(plan =>
      plan.id === planId ? { ...plan, price: newPrice } : plan
    ));
  };

  const updatePlanLimit = (planId: string, newLimit: number) => {
    setPlans(plans.map(plan =>
      plan.id === planId ? { ...plan, technical_memories_limit: newLimit } : plan
    ));
  };

  const updateUserSubscription = (userId: string, field: string, value: any) => {
    setUserSubscriptions(prev => prev.map(sub =>
      sub.user_id === userId ? { ...sub, [field]: value } : sub
    ));
  };

  const handleSaveUserSubscriptions = async () => {
    setSaving(true);
    setMessage(null);

    try {
      for (const subscription of userSubscriptions) {
        if (subscription.plan_id === 'admin') continue;

        const plan = plans.find(p => p.id === subscription.plan_id);
        const technical_memories_limit = plan?.technical_memories_limit || 1;

        await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: subscription.user_id,
            plan_id: subscription.plan_id,
            technical_memories_used: subscription.technical_memories_used,
            technical_memories_limit,
            monthly_tokens_used: subscription.monthly_tokens_used,
            monthly_tokens_limit: subscription.monthly_tokens_limit,
            expires_at: subscription.expires_at,
            is_active: subscription.is_active,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }

      setMessage({ type: 'success', text: 'Abonnements utilisateurs sauvegardés avec succès' });
      fetchData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colors = {
      red: isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-700',
      gray: isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700',
      blue: isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-700',
      purple: isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-700',
      orange: isDark ? 'bg-orange-900/20 text-orange-400' : 'bg-orange-100 text-orange-700',
      green: isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-700'
    };
    return colors[color] || colors.gray;
  };

  const getPlanColor = (planId: string) => {
    return plans.find(p => p.id === planId)?.color || 'gray';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className={`h-6 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded w-1/4 mb-6`}></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-32 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded-xl mb-4`}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg shadow-lg">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Gestion des abonnements</h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Configurez les plans et suivez les utilisateurs</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('plans')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'plans'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Plans
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'users'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  Utilisateurs
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {userSubscriptions.length}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? isDark ? 'bg-green-900/20 border border-green-700 text-green-400' : 'bg-green-50 border border-green-200 text-green-700'
              : isDark ? 'bg-red-900/20 border border-red-700 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {activeTab === 'plans' ? (
          <div className="space-y-6">
            <div className={`${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-xl p-4 border`}>
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-full ${isDark ? 'bg-blue-800' : 'bg-blue-100'}`}>
                  <Brain className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${isDark ? 'text-blue-400' : 'text-blue-800'} mb-2`}>
                    Règles des abonnements
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Tokens IA</p>
                      <div className={`px-3 py-2 border ${isDark ? 'border-blue-600 bg-blue-900/30 text-blue-300' : 'border-blue-300 bg-white text-blue-700'} rounded-lg text-sm text-center font-medium`}>
                        ∞ Illimités pour tous
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Sections par mémoire</p>
                      <div className={`px-3 py-2 border ${isDark ? 'border-blue-600 bg-blue-900/30 text-blue-300' : 'border-blue-300 bg-white text-blue-700'} rounded-lg text-sm text-center font-medium`}>
                        ∞ Illimitées
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.id}
                    className={`${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} rounded-xl p-6 border ${isDark ? 'border-gray-600' : 'border-gray-200'} transition-colors duration-200`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${getColorClasses(plan.color)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {plan.name}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {plan.is_unlimited ? 'Illimité' : `${plan.technical_memories_limit} mémoire${plan.technical_memories_limit > 1 ? 's' : ''} par mois`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={plan.price}
                            onChange={(e) => updatePlanPrice(plan.id, parseFloat(e.target.value) || 0)}
                            className={`w-24 px-3 py-2 text-right border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500`}
                            step="0.01"
                          />
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>€/mois</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Limite mémoires techniques
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={plan.is_unlimited ? -1 : plan.technical_memories_limit}
                            onChange={(e) => updatePlanLimit(plan.id, parseInt(e.target.value) || 0)}
                            disabled={plan.is_unlimited}
                            className={`w-20 px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50`}
                            min="-1"
                          />
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {plan.is_unlimited ? '(Illimité)' : 'par mois'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                          Tokens IA & Sections
                        </label>
                        <div className={`px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg text-sm text-center font-medium`}>
                          ∞ Illimité
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSavePlans}
                disabled={saving}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder les plans'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Users className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Abonnements utilisateurs
                </h3>
              </div>

              <button
                onClick={handleSaveUserSubscriptions}
                disabled={saving}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 text-sm"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>

            {userSubscriptions.length === 0 ? (
              <div className="text-center py-12">
                <Users className={`w-12 h-12 ${isDark ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Aucun utilisateur</h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Les utilisateurs apparaîtront ici</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userSubscriptions.map((subscription) => {
                  const isExpanded = expandedUsers.has(subscription.user_id);
                  const usagePercent = subscription.technical_memories_limit === -1
                    ? 100
                    : Math.round((subscription.technical_memories_used / subscription.technical_memories_limit) * 100);

                  return (
                    <div
                      key={subscription.user_id}
                      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                        isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white'
                      } ${
                        subscription.plan_id === 'admin'
                          ? isDark ? 'border-red-600/50 bg-red-900/5' : 'border-red-200 bg-red-50/50'
                          : ''
                      }`}
                    >
                      <button
                        onClick={() => toggleUserExpanded(subscription.user_id)}
                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className={`p-2 rounded-lg ${getColorClasses(getPlanColor(subscription.plan_id))}`}>
                              {subscription.plan_id === 'admin' ? <Shield className="w-5 h-5" /> : <Users className="w-5 h-5" />}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {subscription.user_email}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getColorClasses(getPlanColor(subscription.plan_id))}`}>
                                  {subscription.plan_name}
                                </span>
                                {subscription.plan_id === 'admin' && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'}`}>
                                    ADMIN
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5" />
                                  <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                                    {subscription.technical_memories_used === -1
                                      ? '∞'
                                      : `${subscription.technical_memories_used}/${subscription.technical_memories_limit === -1 ? '∞' : subscription.technical_memories_limit}`} mémoires
                                  </span>
                                </div>

                                <div className={`px-2 py-0.5 rounded-full ${
                                  subscription.is_active
                                    ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                                    : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                                }`}>
                                  {subscription.is_active ? 'Actif' : 'Inactif'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {subscription.plan_id !== 'admin' && subscription.technical_memories_limit !== -1 && (
                              <div className="flex items-center gap-2">
                                <div className="w-32">
                                  <div className={`h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    <div
                                      className={`h-2 rounded-full transition-all ${
                                        usagePercent >= 100
                                          ? 'bg-red-500'
                                          : usagePercent >= 80
                                          ? 'bg-orange-500'
                                          : 'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(100, usagePercent)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} w-10 text-right`}>
                                  {usagePercent}%
                                </span>
                              </div>
                            )}

                            {isExpanded ? (
                              <ChevronUp className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            ) : (
                              <ChevronDown className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                            )}
                          </div>
                        </div>
                      </button>

                      {isExpanded && subscription.plan_id !== 'admin' && (
                        <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800/30' : 'border-gray-200 bg-gray-50/50'}`}>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}>
                              <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                                Mémoires utilisées
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={subscription.technical_memories_used}
                                onChange={(e) => updateUserSubscription(subscription.user_id, 'technical_memories_used', parseInt(e.target.value) || 0)}
                                className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 text-sm`}
                              />
                              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
                                / {subscription.technical_memories_limit === -1 ? '∞' : subscription.technical_memories_limit}
                              </p>
                            </div>

                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}>
                              <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                                Plan
                              </label>
                              <select
                                value={subscription.plan_id}
                                onChange={(e) => updateUserSubscription(subscription.user_id, 'plan_id', e.target.value)}
                                className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 text-sm`}
                              >
                                <option value="freemium">Freemium</option>
                                <option value="basic">Basic</option>
                                <option value="pro">Pro</option>
                                <option value="expert">Expert</option>
                                <option value="unlimited">Illimité</option>
                              </select>
                            </div>

                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}>
                              <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                                Expiration
                              </label>
                              <input
                                type="date"
                                value={subscription.expires_at ? new Date(subscription.expires_at).toISOString().split('T')[0] : ''}
                                onChange={(e) => updateUserSubscription(subscription.user_id, 'expires_at', e.target.value)}
                                className={`w-full px-3 py-2 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 text-sm`}
                              />
                            </div>

                            <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white'}`}>
                              <label className={`block text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                                Statut
                              </label>
                              <label className="relative inline-flex items-center cursor-pointer mt-1">
                                <input
                                  type="checkbox"
                                  checked={subscription.is_active}
                                  onChange={(e) => updateUserSubscription(subscription.user_id, 'is_active', e.target.checked)}
                                  className="sr-only peer"
                                />
                                <div className={`w-11 h-6 ${isDark ? 'bg-gray-600' : 'bg-gray-200'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                                <span className={`ml-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {subscription.is_active ? 'Actif' : 'Inactif'}
                                </span>
                              </label>
                            </div>
                          </div>

                          <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                  {subscription.technical_memories_used}
                                </div>
                                <div className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                                  Mémoires créés
                                </div>
                              </div>
                              <div>
                                <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                                  ∞
                                </div>
                                <div className={`text-xs ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                                  Sections illimitées
                                </div>
                              </div>
                              <div>
                                <div className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
                                  ∞
                                </div>
                                <div className={`text-xs ${isDark ? 'text-purple-300' : 'text-purple-600'}`}>
                                  Tokens IA illimités
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {isExpanded && subscription.plan_id === 'admin' && (
                        <div className={`p-4 border-t ${isDark ? 'border-red-700/50 bg-red-900/10' : 'border-red-200 bg-red-50'}`}>
                          <div className="flex items-center justify-center gap-3 text-center py-4">
                            <Shield className={`w-8 h-8 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                            <div>
                              <h4 className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-700'} mb-1`}>
                                Administrateur système
                              </h4>
                              <p className={`text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                                Accès illimité à toutes les fonctionnalités
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
