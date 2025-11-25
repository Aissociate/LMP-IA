import React, { useState, useEffect } from 'react';
import { Check, Loader, CreditCard, Calendar, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface Plan {
  id: string;
  name: string;
  stripe_price_id: string;
  monthly_memories_limit: number;
  price_monthly: number;
  features: string[];
}

interface UserSubscription {
  plan_id: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface MemoryStats {
  plan_name: string;
  limit: number;
  used: number;
  remaining: number;
  period_end: string;
  status: string;
}

export const SubscriptionSettings: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [plansRes, subRes, statsRes] = await Promise.all([
        supabase.from('subscription_plans').select('*').eq('is_active', true).order('price_monthly'),
        supabase.from('user_subscriptions').select('*').eq('user_id', user!.id).eq('status', 'active').maybeSingle(),
        supabase.rpc('get_user_memory_stats', { p_user_id: user!.id })
      ]);

      if (plansRes.data) setPlans(plansRes.data);
      if (subRes.data) setCurrentSubscription(subRes.data);
      if (statsRes.data) setMemoryStats(statsRes.data);
    } catch (error) {
      console.error('Error loading subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user) return;

    setCheckoutLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Erreur lors de la création de la session de paiement');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {memoryStats && memoryStats.status !== 'none' && (
        <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className={`text-lg font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Abonnement actuel : {memoryStats.plan_name}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  Renouvellement le {formatDate(memoryStats.period_end)}
                </span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              memoryStats.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            }`}>
              {memoryStats.status === 'active' ? 'Actif' : memoryStats.status}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Mémoires techniques utilisées
              </span>
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {memoryStats.used} / {memoryStats.limit}
              </span>
            </div>
            <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className={`h-2 rounded-full transition-all ${
                  memoryStats.remaining === 0
                    ? 'bg-red-500'
                    : memoryStats.remaining <= 1
                    ? 'bg-orange-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${(memoryStats.used / memoryStats.limit) * 100}%` }}
              />
            </div>
            {memoryStats.remaining === 0 && (
              <div className="flex items-start gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium">Limite atteinte</p>
                  <p>Passez à un plan supérieur pour générer plus de mémoires techniques ce mois-ci.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {currentSubscription ? 'Changer de plan' : 'Choisissez votre plan'}
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentSubscription?.plan_id === plan.id;
            const isPopular = plan.name === 'Pro';

            return (
              <div
                key={plan.id}
                className={`relative p-6 rounded-xl border-2 transition-all ${
                  isCurrentPlan
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : isPopular
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : isDark
                    ? 'border-gray-700 bg-gray-800'
                    : 'border-gray-200 bg-white'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                    Populaire
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                    Plan actuel
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price_monthly}€
                    </span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>/mois</span>
                  </div>
                  <p className={`mt-2 text-sm font-medium ${isPopular ? 'text-purple-600' : 'text-blue-600'}`}>
                    {plan.monthly_memories_limit} mémoire{plan.monthly_memories_limit > 1 ? 's' : ''} / mois
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`w-5 h-5 flex-shrink-0 ${
                        isPopular ? 'text-purple-600' : 'text-green-600'
                      }`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !isCurrentPlan && plan.stripe_price_id && handleSubscribe(plan.stripe_price_id)}
                  disabled={isCurrentPlan || !plan.stripe_price_id || checkoutLoading === plan.stripe_price_id}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                    isCurrentPlan
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      : isPopular
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {checkoutLoading === plan.stripe_price_id ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Chargement...</span>
                    </>
                  ) : isCurrentPlan ? (
                    'Plan actuel'
                  ) : !plan.stripe_price_id ? (
                    'Bientôt disponible'
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      <span>S'abonner</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {!currentSubscription && (
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            💡 Tous les paiements sont sécurisés par Stripe. Vous pouvez annuler votre abonnement à tout moment.
          </p>
        </div>
      )}
    </div>
  );
};
