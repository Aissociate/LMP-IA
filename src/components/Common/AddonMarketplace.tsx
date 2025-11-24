import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { stripeService } from '../../lib/stripe';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

interface AddonMarketplaceProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Addon {
  addon_type: string;
  addon_name: string;
  description: string;
  price_cents: number;
  is_recurring: boolean;
  stripe_price_id: string | null;
  is_active: boolean;
}

const getAddonIcon = (addonType: string) => {
  return <Sparkles className="w-6 h-6" />;
};

const getAddonColor = (addonType: string) => {
  if (addonType === 'market_pro') return 'purple';
  if (addonType === 'extra_memory') return 'orange';
  if (addonType === 'booster_expert_4h') return 'blue';
  if (addonType === 'booster_expert_3d') return 'yellow';
  return 'gray';
};

export function AddonMarketplace({ isOpen, onClose }: AddonMarketplaceProps) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [addons, setAddons] = useState<Addon[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAddons();
    }
  }, [isOpen]);

  const loadAddons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('addon_catalog')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (error) throw error;

      setAddons(data || []);
      const initialQuantities: Record<string, number> = {};
      (data || []).forEach(addon => {
        initialQuantities[addon.addon_type] = 0;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error('Error loading addons:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementQuantity = (addonType: string) => {
    setQuantities(prev => ({
      ...prev,
      [addonType]: (prev[addonType] || 0) + 1
    }));
  };

  const decrementQuantity = (addonType: string) => {
    setQuantities(prev => ({
      ...prev,
      [addonType]: Math.max(0, (prev[addonType] || 0) - 1)
    }));
  };

  const getTotalPrice = () => {
    return addons.reduce((total, addon) => {
      const quantity = quantities[addon.addon_type] || 0;
      return total + (addon.price_cents / 100) * quantity;
    }, 0);
  };

  const getSelectedAddons = () => {
    return Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([addonType, _]) => addonType);
  };

  const handlePurchase = async () => {
    if (!user) return;

    const selectedAddons = getSelectedAddons();
    if (selectedAddons.length === 0) {
      alert('Veuillez sélectionner au moins un addon');
      return;
    }

    setPurchasing(true);
    try {
      const { url } = await stripeService.createCheckoutSessionForAddons(selectedAddons);

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Une erreur est survenue lors de la création de la session de paiement. Vérifiez que les prix Stripe sont bien configurés.');
    } finally {
      setPurchasing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto`}>
        <div className={`sticky top-0 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-6 py-4 z-10`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Marketplace des Options
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Ajoutez des options à la carte pour booster votre abonnement
              </p>
            </div>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Chargement des options...</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid gap-4 mb-6">
              {addons.map((addon) => {
                const color = getAddonColor(addon.addon_type);
                const quantity = quantities[addon.addon_type] || 0;
                const subtotal = (addon.price_cents / 100) * quantity;

                return (
                  <div
                    key={addon.addon_type}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      quantity > 0
                        ? 'border-orange-500 bg-orange-50'
                        : `${isDark ? 'border-gray-700 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`bg-${color}-100 p-2 rounded-lg`}>
                            <div className={`text-${color}-600`}>
                              {getAddonIcon(addon.addon_type)}
                            </div>
                          </div>
                          <div>
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {addon.addon_name}
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {addon.is_recurring ? 'Abonnement mensuel' : 'Achat unique'}
                            </p>
                          </div>
                        </div>

                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
                          {addon.description}
                        </p>

                        <div className="flex items-center gap-4">
                          <div>
                            <p className={`text-2xl font-bold text-${color}-600`}>
                              {(addon.price_cents / 100).toFixed(2)}€
                            </p>
                            {addon.is_recurring && (
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>par mois</p>
                            )}
                          </div>

                          {!addon.is_recurring && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => decrementQuantity(addon.addon_type)}
                                disabled={quantity === 0}
                                className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className={`text-lg font-semibold min-w-[2rem] text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {quantity}
                              </span>
                              <button
                                onClick={() => incrementQuantity(addon.addon_type)}
                                className="p-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          {addon.is_recurring && (
                            <button
                              onClick={() => setQuantities(prev => ({
                                ...prev,
                                [addon.addon_type]: prev[addon.addon_type] === 1 ? 0 : 1
                              }))}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                quantity > 0
                                  ? 'bg-red-600 hover:bg-red-700 text-white'
                                  : 'bg-orange-600 hover:bg-orange-700 text-white'
                              }`}
                            >
                              {quantity > 0 ? 'Retirer' : 'Ajouter'}
                            </button>
                          )}
                        </div>
                      </div>

                      {quantity > 0 && !addon.is_recurring && (
                        <div className={`text-right ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          <p className="text-sm">Sous-total</p>
                          <p className="text-xl font-bold">{subtotal.toFixed(2)}€</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {getSelectedAddons().length > 0 && (
              <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'} rounded-xl border p-6 mb-6`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className={`w-5 h-5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`} />
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Votre panier
                    </h3>
                  </div>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {getTotalPrice().toFixed(2)}€
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  {addons.filter(addon => quantities[addon.addon_type] > 0).map(addon => (
                    <div key={addon.addon_type} className={`flex items-center justify-between text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span>
                        {addon.addon_name}
                        {!addon.is_recurring && quantities[addon.addon_type] > 1 && ` × ${quantities[addon.addon_type]}`}
                      </span>
                      <span className="font-medium">
                        {((addon.price_cents / 100) * quantities[addon.addon_type]).toFixed(2)}€
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button
                onClick={handlePurchase}
                disabled={getSelectedAddons().length === 0 || purchasing}
                className="flex-1 bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {purchasing ? 'Redirection vers le paiement...' : 'Continuer vers le paiement'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-3 border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} rounded-lg font-medium transition-colors`}
              >
                Annuler
              </button>
            </div>

            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center mt-4`}>
              Paiement sécurisé par Stripe
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
