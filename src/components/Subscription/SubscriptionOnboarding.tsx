import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  Sparkles,
  Crown,
  Zap,
  ArrowRight,
  Shield,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface SubscriptionPlan {
  id: string;
  name: string;
  stripe_price_id: string | null;
  monthly_memories_limit: number;
  price_monthly: string;
  features: string[];
  is_active: boolean;
}

export function SubscriptionOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (plan.name === 'TRIAL') {
      setProcessingPlan(plan.id);
      try {
        const { data, error } = await supabase.rpc('start_trial', {
          p_user_id: user.id
        });

        if (error) throw error;
        if (data && !data.success) {
          throw new Error(data.message || 'Erreur lors du démarrage de l\'essai');
        }

        navigate('/dashboard');
      } catch (error: any) {
        console.error('Error starting trial:', error);
        alert(error.message || 'Erreur lors du démarrage de l\'essai gratuit');
      } finally {
        setProcessingPlan(null);
      }
      return;
    }

    // Pour les plans payants, créer une session Stripe
    setProcessingPlan(plan.id);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            price_id: plan.stripe_price_id,
            mode: 'subscription',
            success_url: `${window.location.origin}/dashboard?subscription=success`,
            cancel_url: `${window.location.origin}/subscription?cancelled=true`,
            trial_period_days: 7
          })
        }
      );

      const { url, error } = await response.json();

      if (error) throw new Error(error);
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Erreur lors de la création de la session de paiement');
    } finally {
      setProcessingPlan(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'TRIAL':
        return Sparkles;
      case 'BRONZE':
        return Shield;
      case 'ARGENT':
        return Zap;
      case 'OR':
        return Crown;
      default:
        return TrendingUp;
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'TRIAL':
        return 'from-blue-500 to-blue-600';
      case 'BRONZE':
        return 'from-amber-700 to-amber-800';
      case 'ARGENT':
        return 'from-gray-400 to-gray-500';
      case 'OR':
        return 'from-yellow-400 to-yellow-500';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const isPopular = (planName: string) => planName === 'ARGENT';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des offres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-2 rounded-full border border-orange-200 mb-4">
            <Sparkles className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-900">Offre de lancement</span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900">
            Choisissez votre plan et commencez
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
              votre essai gratuit de 7 jours
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Testez toutes les fonctionnalités sans risque. Aucune carte bancaire requise pour le plan d'essai.
            <br />
            <strong className="text-gray-900">Annulez à tout moment.</strong>
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const popular = isPopular(plan.name);
            const isTrial = plan.name === 'TRIAL';

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-2xl ${
                  popular
                    ? 'border-orange-500 scale-105 lg:scale-110 z-10'
                    : 'border-gray-200 hover:border-orange-300'
                }`}
              >
                {popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    ⭐ PLUS POPULAIRE
                  </div>
                )}

                <div className="p-6 lg:p-8">
                  {/* Icon & Name */}
                  <div className="mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getPlanColor(plan.name)} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {isTrial ? (
                      <div>
                        <div className="text-5xl font-bold text-gray-900">
                          0€
                        </div>
                        <div className="text-sm text-gray-600 mt-1">7 jours gratuits</div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-gray-900">
                            {parseFloat(plan.price_monthly).toFixed(0)}€
                          </span>
                          <span className="text-gray-600">/mois</span>
                        </div>
                        <div className="text-sm text-green-600 font-semibold mt-1">
                          + 7 jours gratuits avec CB
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={processingPlan === plan.id}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2 ${
                      popular
                        ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-xl hover:shadow-2xl'
                        : isTrial
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {processingPlan === plan.id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Chargement...</span>
                      </>
                    ) : (
                      <>
                        <span>{isTrial ? 'Commencer l\'essai' : 'Choisir ce plan'}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantees Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🛡️ Nos garanties pour votre tranquillité
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: Shield,
                  title: 'Sans risque',
                  description: 'Testez 7 jours gratuitement. Annulez quand vous voulez, sans justification.'
                },
                {
                  icon: Check,
                  title: 'Sans engagement',
                  description: 'Pas de contrat. Pas de période minimale. Vous restez libre à 100%.'
                },
                {
                  icon: Zap,
                  title: 'Activation immédiate',
                  description: 'Accédez à toutes les fonctionnalités dès maintenant. Commencez en 2 minutes.'
                }
              ].map((guarantee, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-3">
                    <guarantee.icon className="w-7 h-7 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{guarantee.title}</h4>
                  <p className="text-sm text-gray-700">{guarantee.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Rapide */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Questions fréquentes</h3>
          <div className="space-y-4">
            {[
              {
                q: 'Comment fonctionne l\'essai gratuit ?',
                a: 'Vous avez accès à toutes les fonctionnalités pendant 7 jours, sans limitation. Aucune carte bancaire n\'est requise pour le plan d\'essai. Pour les plans payants, votre carte ne sera débitée qu\'après les 7 jours.'
              },
              {
                q: 'Puis-je changer de plan plus tard ?',
                a: 'Oui, vous pouvez upgrader ou downgrader à tout moment depuis votre espace client. Les changements sont effectifs immédiatement.'
              },
              {
                q: 'Que se passe-t-il à la fin de mon essai ?',
                a: 'Si vous avez choisi un plan payant, votre abonnement démarre automatiquement. Vous pouvez annuler avant la fin des 7 jours sans aucun frais. Si vous choisissez le plan gratuit, votre compte reste actif mais avec les limitations du plan.'
              }
            ].map((faq, idx) => (
              <details key={idx} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <summary className="font-semibold text-gray-900 cursor-pointer">
                  {faq.q}
                </summary>
                <p className="mt-3 text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Vous avez des questions ? Contactez-nous à{' '}
            <a href="mailto:support@lemarchepublic.fr" className="text-orange-600 hover:underline font-semibold">
              support@lemarchepublic.fr
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
