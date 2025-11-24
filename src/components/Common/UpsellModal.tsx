import React, { useState } from 'react';
import { X, Check, Zap, Users, Crown, Star, Sparkles, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
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
}

interface AddonOption {
  id: string;
  name: string;
  price: number;
  description: string;
  isRecurring: boolean;
  color: string;
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'solo',
    name: 'SOLO',
    price: 199,
    subtitle: '1 Marché / Mois',
    memories: 1,
    features: [
      '1 mémoire IA / mois',
      'Veille marchés incluse',
      'Score GO/NO-GO',
      'Assistant IA Marchés & BPU',
      'Export Word / PDF',
      'Formations vidéo'
    ],
    icon: <Zap className="w-6 h-6" />,
    color: 'orange',
    borderColor: 'border-orange-300',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'pme',
    name: 'PME',
    price: 349,
    subtitle: '2 Marchés / Mois',
    memories: 2,
    features: [
      '2 mémoires IA / mois',
      'Priorité de génération vs SOLO',
      '1 point de contact trimestriel',
      'Tout du plan SOLO'
    ],
    icon: <Users className="w-6 h-6" />,
    color: 'green',
    borderColor: 'border-green-300',
    bgColor: 'bg-green-50',
    recommended: true
  },
  {
    id: 'projeteur',
    name: 'PROJETEUR',
    price: 849,
    subtitle: '5 Marchés / Mois',
    memories: 5,
    features: [
      '5 mémoires IA / mois',
      'Priorité maximale',
      'Suivi mensuel mail/visio',
      'Assistant IA illimité'
    ],
    icon: <Star className="w-6 h-6" />,
    color: 'blue',
    borderColor: 'border-blue-300',
    bgColor: 'bg-blue-50'
  }
];

const addonOptions: AddonOption[] = [
  {
    id: 'market_pro',
    name: 'IA Premium',
    price: 99,
    description: 'Upgrade vers IA avancée pour toutes vos mémoires',
    isRecurring: true,
    color: 'purple'
  },
  {
    id: 'extra_memory',
    name: 'Mémoire supplémentaire',
    price: 299,
    description: 'Ajoutez des mémoires selon vos besoins',
    isRecurring: false,
    color: 'orange'
  },
  {
    id: 'booster_4h',
    name: 'Booster Expert 4h',
    price: 590,
    description: 'Relecture approfondie + renforcement des arguments',
    isRecurring: false,
    color: 'blue'
  },
  {
    id: 'booster_3d',
    name: 'Booster Expert Senior 3 jours',
    price: 2490,
    description: 'Expert dédié 3 jours sur votre marché stratégique',
    isRecurring: false,
    color: 'yellow'
  }
];

export function UpsellModal({ isOpen, onClose, currentPlan }: UpsellModalProps) {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

      const addonsList = getSelectedAddonsText();
      const fullRequest = `${plan.name} - ${plan.price}€ HT/mois${addonsList}`;

      await supabase
        .from('upsell_requests')
        .insert({
          user_id: user.id,
          user_email: user.email || '',
          requested_plan: fullRequest,
          current_plan: currentPlan,
          message: message || `Demande d'abonnement au plan ${plan.name}${addonsList}`
        });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-upsell-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userEmail: user.email,
            userName: user.user_metadata?.full_name || user.email,
            requestedPlan: fullRequest,
            currentPlan,
            message: message || `Demande d'abonnement au plan ${plan.name}${addonsList}`
          })
        }
      );

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setSelectedPlan('');
          setSelectedAddons({});
          setMessage('');
        }, 3000);
      }
    } catch (error) {
      console.error('Error submitting upsell request:', error);
      alert('Une erreur est survenue. Veuillez réessayer.');
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
                {loading ? 'Envoi en cours...' : 'Demander à être contacté'}
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
              Un membre de notre équipe vous contactera sous 24h à l'adresse {user?.email}
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
