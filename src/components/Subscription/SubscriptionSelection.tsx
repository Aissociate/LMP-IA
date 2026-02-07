import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, CreditCard, Shield, Star, Zap, Crown, AlertCircle, Sparkles, Award, TrendingUp, Lock } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';

interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  monthly_memories_limit: number;
  features: string[];
  stripe_price_id: string | null;
}

export const SubscriptionSelection: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingTrial, setStartingTrial] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .in('name', ['BRONZE', 'ARGENT', 'OR'])
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (err: any) {
      console.error('Error loading plans:', err);
      setError('Erreur lors du chargement des plans');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    if (!user) {
      setError('Vous devez être connecté pour démarrer l\'essai gratuit');
      return;
    }

    // Récupérer le plan BRONZE pour l'essai gratuit
    const bronzePlan = plans.find(p => p.name === 'BRONZE');

    if (!bronzePlan || !bronzePlan.stripe_price_id) {
      setError('Plan d\'essai non disponible. Veuillez réessayer ou contacter le support.');
      return;
    }

    try {
      setStartingTrial(true);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      // Rediriger vers Stripe avec le plan BRONZE qui aura automatiquement 7 jours d'essai gratuit
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: bronzePlan.stripe_price_id,
          mode: 'subscription',
          success_url: `${window.location.origin}/subscription-onboarding?success=true&trial=true`,
          cancel_url: `${window.location.origin}/subscription?canceled=true`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création de la session de paiement');
      }

      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('URL de checkout non reçue');
      }
    } catch (err: any) {
      console.error('Error starting trial:', err);
      setError(err.message || 'Erreur lors du démarrage de l\'essai');
    } finally {
      setStartingTrial(false);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      setError('Vous devez être connecté pour souscrire à un abonnement');
      return;
    }

    if (!plan.stripe_price_id) {
      setError('Ce plan n\'est pas encore disponible. Veuillez contacter notre support.');
      return;
    }

    try {
      setSelectedPlan(plan.id);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expirée. Veuillez vous reconnecter.');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: plan.stripe_price_id,
          mode: 'subscription',
          success_url: `${window.location.origin}/subscription-onboarding?success=true`,
          cancel_url: `${window.location.origin}/subscription?canceled=true`,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la création de la session de paiement');
      }

      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('URL de checkout non reçue');
      }
    } catch (err: any) {
      console.error('Error creating checkout session:', err);
      setError(err.message || 'Erreur lors de la création de la session de paiement');
      setSelectedPlan(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'BRONZE':
        return Shield;
      case 'ARGENT':
        return Star;
      case 'OR':
        return Crown;
      default:
        return Shield;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'BRONZE':
        return {
          gradient: 'from-orange-500 to-orange-700',
          bg: isDark ? 'bg-orange-900/20' : 'bg-orange-50',
          border: 'border-orange-500',
          text: 'text-orange-600'
        };
      case 'ARGENT':
        return {
          gradient: 'from-gray-400 to-gray-600',
          bg: isDark ? 'bg-gray-700/20' : 'bg-gray-50',
          border: 'border-gray-400',
          text: 'text-gray-600'
        };
      case 'OR':
        return {
          gradient: 'from-yellow-400 to-yellow-600',
          bg: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-600'
        };
      default:
        return {
          gradient: 'from-blue-500 to-blue-700',
          bg: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-600'
        };
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Loader2 className={`w-12 h-12 ${isDark ? 'text-orange-400' : 'text-orange-600'} animate-spin`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-16 relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-blue-500/20 border border-orange-500/30 mb-6">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
                7 jours d'essai gratuit inclus
              </span>
            </div>

            <h1 className={`text-5xl md:text-6xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Choisissez votre plan
            </h1>

            <p className={`text-xl md:text-2xl mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-3xl mx-auto leading-relaxed`}>
              Simplifiez vos réponses aux marchés publics avec l'IA
            </p>

            <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'} max-w-2xl mx-auto`}>
              Aucun paiement avant la fin de l'essai • Annulez à tout moment • Support inclus
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {error && (
          <div className={`max-w-2xl mx-auto mb-8 p-4 rounded-xl border ${isDark ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200'} backdrop-blur-sm`}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className={`${isDark ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
            </div>
          </div>
        )}

        {/* Trial CTA Card */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className={`relative rounded-3xl shadow-2xl overflow-hidden ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-white to-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/20 to-blue-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-blue-500/20 to-orange-500/20 rounded-full blur-3xl"></div>

            <div className="relative p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold mb-4">
                    <Zap className="w-4 h-4" />
                    OFFRE DE LANCEMENT
                  </div>

                  <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Essai gratuit de 7 jours
                  </h2>

                  <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Testez toutes les fonctionnalités avec le plan BRONZE sans engagement
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Veille marchés illimitée</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>IA et analyse GO/NO-GO</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Export Word / PDF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Support email</span>
                    </div>
                  </div>

                  <button
                    onClick={handleStartTrial}
                    disabled={startingTrial}
                    className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    {startingTrial ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Démarrage...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Démarrer l'essai gratuit
                      </div>
                    )}
                  </button>
                </div>

                <div className={`flex-shrink-0 p-8 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 mb-4">
                      <Award className="w-8 h-8 text-white" />
                    </div>
                    <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      Puis seulement
                    </div>
                    <div className="text-4xl font-bold text-orange-600 mb-1">
                      199€
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      par mois
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Plans Section */}
        <div className="mb-12 text-center">
          <h2 className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Ou choisissez directement votre plan
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Tous les plans incluent 7 jours d'essai gratuit
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-16">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const colors = getPlanColor(plan.name);
            const isPopular = plan.name === 'ARGENT';

            return (
              <div
                key={plan.id}
                className={`relative group`}
              >
                <div className={`relative rounded-2xl shadow-xl ${isDark ? 'bg-gray-800' : 'bg-white'} p-8 h-full flex flex-col border-2 ${colors.border} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  isPopular ? 'scale-105' : ''
                }`}>
                  {isPopular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-full shadow-lg flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        LE PLUS POPULAIRE
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.gradient} mb-4 transform group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {plan.name}
                    </h3>

                    <div className="mb-4">
                      <div className="flex items-end justify-center gap-1">
                        <span className={`text-5xl font-bold ${colors.text}`}>
                          {plan.price_monthly}
                        </span>
                        <span className={`text-xl font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'} mb-2`}>
                          €
                        </span>
                      </div>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        par mois
                      </div>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.bg} ${colors.text} text-sm font-semibold`}>
                      <TrendingUp className="w-4 h-4" />
                      {plan.monthly_memories_limit} mémoire{plan.monthly_memories_limit > 1 ? 's' : ''} / mois
                    </div>
                  </div>

                  <div className={`flex-1 space-y-4 mb-8 pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center mt-0.5`}>
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={selectedPlan === plan.id}
                    className={`w-full py-4 rounded-xl font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 ${
                      isPopular
                        ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg hover:shadow-xl`
                        : `border-2 ${colors.border} ${colors.text} hover:bg-gradient-to-r ${colors.gradient} hover:text-white hover:border-transparent`
                    }`}
                  >
                    {selectedPlan === plan.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Chargement...
                      </div>
                    ) : (
                      `Choisir ${plan.name}`
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Section */}
        <div className={`max-w-4xl mx-auto rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} p-8 shadow-lg`}>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Paiement sécurisé
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Propulsé par Stripe
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Sans engagement
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Annulez à tout moment
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center mb-3">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Essai gratuit
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                7 jours sans frais
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Questions ? Besoin d'aide ? Contactez-nous à{' '}
              <a href="mailto:contact@lemarchepublic.fr" className="text-orange-600 hover:text-orange-700 font-medium">
                contact@lemarchepublic.fr
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
