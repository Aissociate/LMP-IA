import React, { useState, useEffect } from 'react';
import { X, Check, Zap, Users, Crown, Star, Sparkles, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { stripeService } from '../../lib/stripe';
import { useAuth } from '../../hooks/useAuth';

interface UpsellModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  subtitle: string;
  memories: number;
  features: string[];
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  recommended?: boolean;
  stripe_price_id?: string;
}

interface AddonOption {
  id: string;
  name: string;
  price: number;
  description: string;
  isRecurring: boolean;
  color: string;
  stripe_price_id?: string;
}

interface DBPlan {
  id: string;
  name: string;
  price: number;
  technical_memories_limit: number;
  features: string[];
  is_recommended?: boolean;
  stripe_price_id?: string;
}

interface DBAddon {
  addon_type: string;
  addon_name: string;
  description: string;
  price_cents: number;
  is_recurring: boolean;
  stripe_price_id?: string;
}

const getPlanIcon = (planId: string) => {
  if (planId === 'solo') return <Zap className="w-6 h-6" />;
  if (planId === 'pme') return <Users className="w-6 h-6" />;
  if (planId === 'projeteur') return <Star className="w-6 h-6" />;
  return <Zap className="w-6 h-6" />;
};

const getPlanColor = (planId: string) => {
  if (planId === 'solo') return { color: 'orange', borderColor: 'border-orange-300', bgColor: 'bg-orange-50' };
  if (planId === 'pme') return { color: 'green', borderColor: 'border-green-300', bgColor: 'bg-green-50' };
  if (planId === 'projeteur') return { color: 'blue', borderColor: 'border-blue-300', bgColor: 'bg-blue-50' };
  return { color: 'orange', borderColor: 'border-orange-300', bgColor: 'bg-orange-50' };
};

const getAddonColor = (addonType: string) => {
  if (addonType === 'market_pro') return 'purple';
  if (addonType === 'extra_memory') return 'orange';
  if (addonType === 'booster_expert_4h') return 'blue';
  if (addonType === 'booster_expert_3d') return 'yellow';
  return 'gray';
};

export function UpsellModal({ isOpen, onClose, currentPlan }: UpsellModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [addonOptions, setAddonOptions] = useState<AddonOption[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadPlansAndAddons();
    }
  }, [isOpen]);

  const loadPlansAndAddons = async () => {
    setLoadingData(true);
    try {
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .in('id', ['solo', 'pme', 'projeteur'])
        .order('price', { ascending: true });

      if (plansError) throw plansError;

      const { data: addons, error: addonsError } = await supabase
        .from('addon_catalog')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (addonsError) throw addonsError;

      const formattedPlans: SubscriptionPlan[] = (plans || []).map((plan: DBPlan) => {
        const colors = getPlanColor(plan.id);
        return {
          id: plan.id,
          name: plan.name.toUpperCase(),
          price: plan.price,
          subtitle: `${plan.technical_memories_limit} Marché${plan.technical_memories_limit > 1 ? 's' : ''} / Mois`,
          memories: plan.technical_memories_limit,
          features: Array.isArray(plan.features) ? plan.features : [],
          icon: getPlanIcon(plan.id),
          ...colors,
          recommended: plan.is_recommended || false,
          stripe_price_id: plan.stripe_price_id
        };
      });

      const formattedAddons: AddonOption[] = (addons || []).map((addon: DBAddon) => ({
        id: addon.addon_type,
        name: addon.addon_name,
        price: addon.price_cents / 100,
        description: addon.description,
        isRecurring: addon.is_recurring,
        color: getAddonColor(addon.addon_type),
        stripe_price_id: addon.stripe_price_id
      }));

      setSubscriptionPlans(formattedPlans);
      setAddonOptions(formattedAddons);
    } catch (error) {
      console.error('Erreur lors du chargement des plans et addons:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (!isOpen) return null;

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev => ({
      ...prev,
      [addonId]: !prev[addonId]
    }));
  };

  const getSelectedAddonsText = () => {
    const addons = addonOptions
      .filter(addon => selectedAddons[addon.id])
      .map(addon => `${addon.name} (${addon.price}€${addon.isRecurring ? '/mois' : ''})`)
      .join(', ');
    return addons ? `\n\nOptions: ${addons}` : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !user) return;

    setLoading(true);

    try {
      const plan = subscriptionPlans.find(p => p.id === selectedPlan);
      if (!plan) return;

      const selectedAddonTypes = Object.keys(selectedAddons).filter(key => selectedAddons[key]);

      const { url } = await stripeService.createCheckoutSessionFromPlan(
        selectedPlan,
        selectedAddonTypes
      );

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Une erreur est survenue lors de la création de la session de paiement. Vérifiez que les prix Stripe sont bien configurés.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Passez à un abonnement mensuel
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Choisissez le plan adapté à votre activité de réponse aux marchés publics
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {success ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée!</h3>
            <p className="text-gray-600">
              Nous vous contacterons très rapidement à l'adresse {user?.email}
            </p>
          </div>
        ) : loadingData ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600">Chargement des offres...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Étape 1 : Choisissez votre plan mensuel
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Tous nos plans incluent : veille marchés, GO/NO-GO, assistant IA Marchés & BPU
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedPlan === plan.id
                      ? 'border-orange-600 bg-orange-50 shadow-lg scale-105'
                      : `${plan.borderColor} ${plan.bgColor} hover:shadow-md`
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Recommandé
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <div className={`text-${plan.color}-600`}>
                      {plan.icon}
                    </div>
                    <h4 className="font-bold text-gray-900">{plan.name}</h4>
                  </div>

                  <p className="text-3xl font-bold text-gray-900 mb-1">{plan.price}€</p>
                  <p className="text-sm text-gray-600 mb-1">HT / mois</p>
                  <p className="text-xs text-gray-500 mb-4 italic">{plan.subtitle}</p>

                  <ul className="space-y-2 text-sm text-gray-700">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 text-${plan.color}-600 flex-shrink-0 mt-0.5`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {selectedPlan === plan.id && (
                    <div className="mt-4 pt-4 border-t border-orange-300">
                      <div className="flex items-center justify-center gap-2 text-orange-600 font-semibold">
                        <Check className="w-5 h-5" />
                        <span>Plan sélectionné</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedPlan && (
              <>
                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-purple-600" />
                    Étape 2 : Ajoutez des options (facultatif)
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Boostez votre abonnement avec ces options à la carte
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {addonOptions.map((addon) => (
                      <div
                        key={addon.id}
                        onClick={() => toggleAddon(addon.id)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedAddons[addon.id]
                            ? 'border-orange-600 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{addon.name}</h4>
                              {selectedAddons[addon.id] && (
                                <Check className="w-5 h-5 text-orange-600" />
                              )}
                            </div>
                            <p className={`text-lg font-bold text-${addon.color}-600`}>
                              {addon.price}€{addon.isRecurring ? ' /mois' : ''}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{addon.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optionnel)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Décrivez votre activité ou vos besoins spécifiques..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={!selectedPlan || loading}
                className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Redirection vers le paiement...' : 'Continuer vers le paiement'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Paiement sécurisé par Stripe
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
