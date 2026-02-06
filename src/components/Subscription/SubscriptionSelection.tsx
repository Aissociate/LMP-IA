import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Loader2, CreditCard, Shield, Star, Zap, Crown, AlertCircle } from 'lucide-react';
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
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Choisissez votre plan
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Tous les plans incluent 7 jours d'essai gratuit avec CB. Aucun paiement avant la fin de l'essai.
          </p>
        </div>

        {error && (
          <div className={`max-w-2xl mx-auto mb-8 p-4 rounded-lg border-2 ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className={`${isDark ? 'text-red-400' : 'text-red-700'}`}>{error}</p>
            </div>
          </div>
        )}

        <div className={`max-w-2xl mx-auto mb-12 p-8 rounded-2xl shadow-lg border-2 ${isDark ? 'bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-700' : 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'}`}>
          <div className="text-center">
            <div className="inline-block p-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Démarrez votre essai gratuit
            </h2>
            <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Commencez avec le plan BRONZE - 7 jours gratuits • Carte bancaire requise • Annulez à tout moment
            </p>
            <ul className={`text-left mb-6 space-y-2 max-w-md mx-auto ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Veille marchés illimitée
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                IA et GO/NO-GO illimité
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                Toutes les fonctionnalités
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                0 mémoire technique
              </li>
            </ul>
            <button
              onClick={handleStartTrial}
              disabled={startingTrial}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const colors = getPlanColor(plan.name);
            const isPopular = plan.name === 'ARGENT';

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl shadow-lg border-2 ${colors.bg} ${colors.border} p-8 transition-transform hover:scale-105 ${
                  isPopular ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                    POPULAIRE
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-block p-3 rounded-full bg-gradient-to-r ${colors.gradient} mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className={`text-4xl font-bold ${colors.text}`}>
                      {plan.price_monthly}€
                    </span>
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}> / mois</span>
                  </div>
                  <p className={`text-sm font-medium ${colors.text}`}>
                    {plan.monthly_memories_limit} mémoire{plan.monthly_memories_limit > 1 ? 's' : ''} technique{plan.monthly_memories_limit > 1 ? 's' : ''} / mois
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <Check className={`w-5 h-5 ${colors.text} flex-shrink-0 mt-0.5`} />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={selectedPlan === plan.id}
                  className={`w-full py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    isPopular
                      ? `bg-gradient-to-r ${colors.gradient} text-white hover:shadow-lg`
                      : `border-2 ${colors.border} ${colors.text} hover:bg-gradient-to-r ${colors.gradient} hover:text-white`
                  }`}
                >
                  {selectedPlan === plan.id ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Chargement...
                    </div>
                  ) : (
                    `Choisir ${plan.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className={`max-w-3xl mx-auto mt-12 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md text-center`}>
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <Shield className="w-5 h-5" />
              <span>Paiement sécurisé par Stripe</span>
            </div>
            <div className="flex items-center gap-2 text-blue-600">
              <CreditCard className="w-5 h-5" />
              <span>Sans engagement</span>
            </div>
          </div>
          <p className={`text-xs mt-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Questions ? Contactez-nous à contact@lemarchepublic.fr
          </p>
        </div>
      </div>
    </div>
  );
};
