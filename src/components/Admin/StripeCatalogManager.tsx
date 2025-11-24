import React, { useState, useEffect } from 'react';
import { Check, X, RefreshCw, AlertCircle, Edit2, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

interface Plan {
  id: string;
  name: string;
  price: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  last_stripe_sync: string | null;
  is_active: boolean;
}

interface Addon {
  addon_type: string;
  addon_name: string;
  price_cents: number;
  stripe_price_id: string | null;
  stripe_product_id: string | null;
  last_stripe_sync: string | null;
  is_active: boolean;
}

export function StripeCatalogManager() {
  const { isDark } = useTheme();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<{type: 'plan' | 'addon', id: string} | null>(null);
  const [editValues, setEditValues] = useState<{priceId: string, productId: string}>({priceId: '', productId: ''});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const { data: plansData, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (plansError) throw plansError;

      const { data: addonsData, error: addonsError } = await supabase
        .from('addon_catalog')
        .select('*')
        .order('price_cents', { ascending: true });

      if (addonsError) throw addonsError;

      setPlans(plansData || []);
      setAddons(addonsData || []);
    } catch (error) {
      console.error('Error loading catalog:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (type: 'plan' | 'addon', id: string, currentPriceId: string | null, currentProductId: string | null) => {
    setEditingItem({ type, id });
    setEditValues({
      priceId: currentPriceId || '',
      productId: currentProductId || ''
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValues({ priceId: '', productId: '' });
  };

  const saveEdit = async () => {
    if (!editingItem) return;

    setSaving(true);
    try {
      const table = editingItem.type === 'plan' ? 'subscription_plans' : 'addon_catalog';
      const idColumn = editingItem.type === 'plan' ? 'id' : 'addon_type';

      const { error } = await supabase
        .from(table)
        .update({
          stripe_price_id: editValues.priceId || null,
          stripe_product_id: editValues.productId || null,
          last_stripe_sync: new Date().toISOString()
        })
        .eq(idColumn, editingItem.id);

      if (error) throw error;

      await loadCatalog();
      setEditingItem(null);
      setEditValues({ priceId: '', productId: '' });
    } catch (error) {
      console.error('Error saving:', error);
      alert('Erreur lors de la sauvegarde. Vérifiez les IDs Stripe.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (priceId: string | null) => {
    if (!priceId) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <AlertCircle className="w-3 h-3" />
          Non configuré
        </span>
      );
    }

    if (priceId.startsWith('price_') && priceId.length > 20) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <Check className="w-3 h-3" />
          Configuré
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
        <AlertCircle className="w-3 h-3" />
        À vérifier
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Gestion du catalogue Stripe
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Configurez les price_id et product_id Stripe pour chaque plan et addon
          </p>
        </div>
        <button
          onClick={loadCatalog}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Actualiser
        </button>
      </div>

      <div className={`${isDark ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-4`}>
        <div className="flex gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-yellow-200' : 'text-yellow-800'}`}>
              Information importante
            </p>
            <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'} mt-1`}>
              Les price_id doivent être copiés depuis votre dashboard Stripe. Assurez-vous qu'ils sont bien actifs et correspondent aux bons montants.
            </p>
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Plans d'abonnement
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Plan
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Prix
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Stripe Price ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Stripe Product ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Statut
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${isDark ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
              {plans.map((plan) => (
                <tr key={plan.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{plan.name}</span>
                      {!plan.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">Inactif</span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {plan.price}€/mois
                  </td>
                  <td className="px-6 py-4">
                    {editingItem?.type === 'plan' && editingItem.id === plan.id ? (
                      <input
                        type="text"
                        value={editValues.priceId}
                        onChange={(e) => setEditValues({...editValues, priceId: e.target.value})}
                        placeholder="price_..."
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <code className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {plan.stripe_price_id || '-'}
                      </code>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingItem?.type === 'plan' && editingItem.id === plan.id ? (
                      <input
                        type="text"
                        value={editValues.productId}
                        onChange={(e) => setEditValues({...editValues, productId: e.target.value})}
                        placeholder="prod_..."
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <code className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {plan.stripe_product_id || '-'}
                      </code>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(plan.stripe_price_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {editingItem?.type === 'plan' && editingItem.id === plan.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit('plan', plan.id, plan.stripe_price_id, plan.stripe_product_id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Options (Addons)
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Addon
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Prix
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Stripe Price ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Stripe Product ID
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Statut
                </th>
                <th className={`px-6 py-3 text-right text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${isDark ? 'divide-gray-700' : 'divide-gray-200'} divide-y`}>
              {addons.map((addon) => (
                <tr key={addon.addon_type} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{addon.addon_name}</span>
                      {!addon.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">Inactif</span>
                      )}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>
                    {(addon.price_cents / 100).toFixed(2)}€
                  </td>
                  <td className="px-6 py-4">
                    {editingItem?.type === 'addon' && editingItem.id === addon.addon_type ? (
                      <input
                        type="text"
                        value={editValues.priceId}
                        onChange={(e) => setEditValues({...editValues, priceId: e.target.value})}
                        placeholder="price_..."
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <code className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {addon.stripe_price_id || '-'}
                      </code>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingItem?.type === 'addon' && editingItem.id === addon.addon_type ? (
                      <input
                        type="text"
                        value={editValues.productId}
                        onChange={(e) => setEditValues({...editValues, productId: e.target.value})}
                        placeholder="prod_..."
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    ) : (
                      <code className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {addon.stripe_product_id || '-'}
                      </code>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(addon.stripe_price_id)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {editingItem?.type === 'addon' && editingItem.id === addon.addon_type ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit('addon', addon.addon_type, addon.stripe_price_id, addon.stripe_product_id)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
