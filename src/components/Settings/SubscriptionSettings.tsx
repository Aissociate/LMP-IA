import React, { useState } from 'react';
import { Check, Zap, Users, Crown, Package, Sparkles, Infinity, Star, Plus, ShoppingBag } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSubscription } from '../../hooks/useSubscription';
import { UpsellModal } from '../Common/UpsellModal';
import { AddonMarketplace } from '../Common/AddonMarketplace';

export const SubscriptionSettings: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { isDark } = useTheme();
  const {
    plan,
    monthlyUsage,
    addons,
    getRemainingMemories,
    hasMarketPro
  } = useSubscription();
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [showAddonMarketplace, setShowAddonMarketplace] = useState(false);

  const remainingMemories = getRemainingMemories ? getRemainingMemories() : 0;
  const hasProAccess = hasMarketPro ? hasMarketPro() : false;
  const marketProAddon = addons?.find(a => a.addon_type === 'market_pro' && a.status === 'active');

  const getPlanIcon = () => {
    if (plan?.id === 'projeteur') return <Star className="w-6 h-6 text-blue-600" />;
    if (plan?.id === 'pme') return <Users className="w-6 h-6 text-green-600" />;
    if (plan?.id === 'solo') return <Zap className="w-6 h-6 text-orange-600" />;
    if (plan?.id === 'admin') return <Crown className="w-6 h-6 text-purple-600" />;
    return <Infinity className="w-6 h-6 text-gray-600" />;
  };

  const getPlanColor = () => {
    if (plan?.id === 'projeteur') return 'blue';
    if (plan?.id === 'pme') return 'green';
    if (plan?.id === 'solo') return 'orange';
    if (plan?.id === 'admin') return 'purple';
    return 'gray';
  };

  const color = getPlanColor();

  return (
    <>
      <UpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        currentPlan={plan?.name || 'Freemium'}
      />

      <AddonMarketplace
        isOpen={showAddonMarketplace}
        onClose={() => setShowAddonMarketplace(false)}
      />

      <div className="space-y-6">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`bg-${color}-100 p-2 rounded-lg`}>
                {getPlanIcon()}
              </div>
              <div>
                <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {plan?.name || 'Freemium'}
                  {isAdmin && <span className="ml-2 text-sm bg-purple-600 text-white px-2 py-0.5 rounded-full">Admin</span>}
                </h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {plan?.id === 'freemium_unlimited'
                    ? 'Découverte • Sans génération de mémoires'
                    : remainingMemories === -1
                      ? 'Mémoires illimitées'
                      : plan?.id
                        ? `${monthlyUsage?.memories_included || 0} mémoires/mois`
                        : 'Accès gratuit limité'}
                </p>
              </div>
            </div>
            {!isAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddonMarketplace(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Options</span>
                </button>
                <button
                  onClick={() => setShowUpsellModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Package className="w-4 h-4" />
                  <span>Changer de plan</span>
                </button>
              </div>
            )}
          </div>

          <div className={`${
            isDark ? `bg-gradient-to-r from-${color}-900/20 to-${color}-800/10 border-${color}-700` : `bg-gradient-to-r from-${color}-50 to-${color}-100 border-${color}-200`
          } rounded-xl p-6 border transition-colors duration-200 mb-6`}>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className={`w-6 h-6 text-${color}-600`} />
              <div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {plan?.name || 'Freemium'}
                  {isAdmin && <span className="ml-2 text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">Admin</span>}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {plan?.id === 'freemium_unlimited'
                    ? 'Mode découverte'
                    : hasProAccess
                      ? 'IA Premium activée'
                      : 'IA Standard'}
                </p>
              </div>
            </div>

            {plan?.id !== 'freemium_unlimited' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                    Mémoires ce mois
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {remainingMemories === -1
                      ? '∞'
                      : `${monthlyUsage?.memories_used || 0} / ${(monthlyUsage?.memories_included || 0) + (monthlyUsage?.extra_memories_purchased || 0)}`}
                  </p>
                </div>

                {monthlyUsage?.extra_memories_purchased && monthlyUsage.extra_memories_purchased > 0 && (
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-white/50'}`}>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                      Mémoires supplémentaires
                    </p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      +{monthlyUsage.extra_memories_purchased}
                    </p>
                  </div>
                )}
              </div>
            )}

            <ul className="space-y-2">
              {plan?.features && Array.isArray(plan.features) ? (
                (plan.features as string[]).map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className={`w-5 h-5 text-${color}-600 flex-shrink-0 mt-0.5`} />
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))
              ) : (
                <>
                  <li className="flex items-start gap-2">
                    <Check className={`w-5 h-5 text-${color}-600 flex-shrink-0 mt-0.5`} />
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Veille marchés incluse
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className={`w-5 h-5 text-${color}-600 flex-shrink-0 mt-0.5`} />
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Assistant IA Marchés & BPU
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {!isAdmin && hasProAccess && marketProAddon && (
            <div className={`${
              isDark ? 'bg-gradient-to-r from-purple-900/20 to-purple-800/10 border-purple-700' : 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200'
            } rounded-xl p-6 border transition-colors duration-200`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-600 p-2 rounded-lg">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Option Premium Active
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      IA avancée pour mémoires techniques
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    +99€/mois
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isAdmin && addons && addons.length > 0 && (
            <div className="mt-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                Options actives
              </h3>
              <div className="space-y-3">
                {addons.map((addon, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {addon.addon_name}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {addon.is_recurring ? 'Abonnement mensuel' : 'Achat unique'} • {addon.quantity}x
                        </p>
                      </div>
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {(addon.price_cents / 100).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isAdmin && plan?.id === 'freemium_unlimited' && (
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Plans d'abonnement mensuels
              </h3>
              <button
                onClick={() => setShowUpsellModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Package className="w-4 h-4" />
                <span>Découvrir les plans</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-orange-700 bg-orange-900/10' : 'border-orange-200 bg-orange-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-5 h-5 text-orange-600" />
                  <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>SOLO</h4>
                </div>
                <p className="text-3xl font-bold text-orange-600 mb-1">199€</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>HT / mois</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-4 italic`}>1 Marché / Mois</p>
                <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span><strong>1 mémoire IA</strong> / mois</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Veille marchés</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Score GO/NO-GO</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Export Word/PDF</span>
                  </li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-green-700 bg-green-900/10' : 'border-green-200 bg-green-50'} relative`}>
                <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  Recommandé
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-green-600" />
                  <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>PME</h4>
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">349€</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>HT / mois</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-4 italic`}>2 Marchés / Mois</p>
                <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>2 mémoires IA</strong> / mois</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Priorité vs SOLO</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Point contact trimestriel</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Tout du plan SOLO</span>
                  </li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl border-2 ${isDark ? 'border-blue-700 bg-blue-900/10' : 'border-blue-200 bg-blue-50'}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>PROJETEUR</h4>
                </div>
                <p className="text-3xl font-bold text-blue-600 mb-1">849€</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-1`}>HT / mois</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mb-4 italic`}>5 Marchés / Mois</p>
                <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span><strong>5 mémoires IA</strong> / mois</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Priorité maximale</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Suivi mensuel mail/visio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <span>Assistant IA illimité</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/30' : 'bg-gray-50'} border ${isDark ? 'border-gray-600' : 'border-gray-200'} mt-6`}>
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Options disponibles à la carte</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2">
                  <Sparkles className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>IA Premium: <span className="text-purple-600">+99€/mois</span></p>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Upgrade vers IA avancée</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Plus className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Mémoire extra: <span className="text-orange-600">299€/unité</span></p>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Ajoutez selon vos besoins</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Users className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Booster Expert 4h: <span className="text-blue-600">590€</span></p>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Relecture + renforcement</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Crown className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'} flex-shrink-0 mt-0.5`} />
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Booster Senior 3j: <span className="text-yellow-600">2490€</span></p>
                    <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Expert dédié sur marché clé</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isAdmin && plan?.id !== 'freemium_unlimited' && (
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6 transition-colors duration-200`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              Comparatif des modes IA
            </h3>

            <div className="space-y-4">
              <div className={`p-4 rounded-xl border-2 ${
                isDark ? 'border-orange-700 bg-orange-900/10' : 'border-orange-200 bg-orange-50'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg">
                      <Zap className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Mode Standard
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        IA rapide et efficace
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-orange-600">INCLUS</p>
                    <p className="text-xs text-orange-600">Tous les plans</p>
                  </div>
                </div>
                <ul className={`space-y-1.5 text-sm pl-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span>Contexte étendu</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span>Rapidité optimale</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0" />
                    <span>Qualité professionnelle</span>
                  </li>
                </ul>
              </div>

              <div className={`p-4 rounded-xl border-2 ${
                isDark ? 'border-purple-700 bg-gradient-to-br from-purple-900/20 to-purple-800/10' : 'border-purple-300 bg-gradient-to-br from-purple-50 to-purple-100'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Mode Premium
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        IA avancée pour mémoires
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-purple-600">+99€/mois</p>
                    <p className="text-xs text-purple-600">Option</p>
                  </div>
                </div>
                <ul className={`space-y-1.5 text-sm pl-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span><strong>1 024 000 tokens</strong> de contexte (8x plus!)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Réflexion approfondie</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Arguments ultra-détaillés</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Pour marchés complexes et stratégiques</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
