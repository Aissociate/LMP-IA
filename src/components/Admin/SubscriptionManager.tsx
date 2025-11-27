import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Edit, Calendar, Users, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

interface SubscriptionPlan {
  id: string;
  name: string;
  monthly_memories_limit: number;
  price_monthly: number;
  stripe_price_id: string | null;
  features: string[];
  is_active: boolean;
}

interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  user_email?: string;
  user_name?: string;
  plan_name?: string;
  plan_limit?: number;
}

interface User {
  id: string;
  email: string;
  user_profiles?: {
    full_name: string;
  }[];
}

export const SubscriptionManager: React.FC = () => {
  const { isDark } = useTheme();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscription | null>(null);

  const [newSubscription, setNewSubscription] = useState({
    user_id: '',
    plan_id: '',
    status: 'active',
    current_period_start: new Date().toISOString().split('T')[0],
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, subscriptionsRes, usersRes] = await Promise.all([
        supabase.from('subscription_plans').select('*').order('price_monthly'),
        supabase
          .from('user_subscriptions')
          .select(`
            *,
            plan:subscription_plans(name, monthly_memories_limit)
          `)
          .order('created_at', { ascending: false }),
        supabase.from('user_profiles').select('user_id, full_name'),
      ]);

      if (plansRes.data) setPlans(plansRes.data);

      if (subscriptionsRes.data) {
        const subsWithDetails = await Promise.all(
          subscriptionsRes.data.map(async (sub: any) => {
            const { data: userData } = await supabase.auth.admin.getUserById(sub.user_id);
            return {
              ...sub,
              user_email: userData?.user?.email || 'N/A',
              user_name: userData?.user?.user_metadata?.full_name || '',
              plan_name: sub.plan?.name,
              plan_limit: sub.plan?.monthly_memories_limit,
            };
          })
        );
        setSubscriptions(subsWithDetails);
      }

      const { data: authUsers } = await supabase.auth.admin.listUsers();
      if (authUsers?.users) {
        const usersWithProfiles = await Promise.all(
          authUsers.users.map(async (user) => {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('full_name')
              .eq('user_id', user.id)
              .maybeSingle();
            return {
              id: user.id,
              email: user.email || '',
              user_profiles: profile ? [profile] : [],
            };
          })
        );
        setUsers(usersWithProfiles);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    try {
      const { error } = await supabase.from('user_subscriptions').insert([
        {
          ...newSubscription,
          current_period_start: new Date(newSubscription.current_period_start).toISOString(),
          current_period_end: new Date(newSubscription.current_period_end).toISOString(),
        },
      ]);

      if (error) throw error;

      await supabase.from('monthly_memory_usage').insert([
        {
          user_id: newSubscription.user_id,
          memories_used: 0,
          period_start: new Date(newSubscription.current_period_start).toISOString(),
          period_end: new Date(newSubscription.current_period_end).toISOString(),
        },
      ]);

      setShowCreateModal(false);
      setNewSubscription({
        user_id: '',
        plan_id: '',
        status: 'active',
        current_period_start: new Date().toISOString().split('T')[0],
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      loadData();
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Erreur lors de la création de l\'abonnement');
    }
  };

  const handleUpdateSubscription = async () => {
    if (!selectedSubscription) return;

    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: selectedSubscription.status,
          current_period_end: new Date(selectedSubscription.current_period_end).toISOString(),
        })
        .eq('id', selectedSubscription.id);

      if (error) throw error;

      setShowEditModal(false);
      setSelectedSubscription(null);
      loadData();
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Erreur lors de la mise à jour de l\'abonnement');
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) return;

    try {
      const { error } = await supabase.from('user_subscriptions').delete().eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Erreur lors de la suppression de l\'abonnement');
    }
  };

  const handleResetUsage = async (userId: string) => {
    if (!confirm('Réinitialiser le compteur mensuel pour cet utilisateur ?')) return;

    try {
      const { error } = await supabase
        .from('monthly_memory_usage')
        .update({ memories_used: 0, updated_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;
      alert('Compteur réinitialisé avec succès');
    } catch (error) {
      console.error('Error resetting usage:', error);
      alert('Erreur lors de la réinitialisation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter((s) => s.status === 'active').length,
    monthlyRevenue: subscriptions
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => {
        const plan = plans.find((p) => p.id === s.plan_id);
        return sum + (plan?.price_monthly || 0);
      }, 0),
  };

  return (
    <div className={`space-y-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Abonnements</h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Gérez les abonnements et les limites des utilisateurs
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nouvel Abonnement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Abonnements</p>
              <p className="text-3xl font-bold mt-2">{stats.totalSubscriptions}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Actifs</p>
              <p className="text-3xl font-bold mt-2 text-green-500">{stats.activeSubscriptions}</p>
            </div>
            <CreditCard className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>MRR</p>
              <p className="text-3xl font-bold mt-2">{stats.monthlyRevenue.toFixed(0)}€</p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-500" />
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6 shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Plans Disponibles</p>
              <p className="text-3xl font-bold mt-2">{plans.filter((p) => p.is_active).length}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Période</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
              {subscriptions.map((sub) => (
                <tr key={sub.id} className={`${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">{sub.user_email}</div>
                      {sub.user_name && <div className="text-sm text-gray-500">{sub.user_name}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="font-medium">{sub.plan_name}</div>
                      <div className="text-sm text-gray-500">{sub.plan_limit} mémoire(s)/mois</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        sub.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(sub.current_period_start).toLocaleDateString()} -{' '}
                        {new Date(sub.current_period_end).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedSubscription(sub);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetUsage(sub.user_id)}
                        className="text-green-600 hover:text-green-800"
                        title="Réinitialiser compteur"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(sub.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {subscriptions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucun abonnement pour le moment
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
            <h3 className="text-xl font-bold mb-4">Créer un Abonnement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Utilisateur</label>
                <select
                  value={newSubscription.user_id}
                  onChange={(e) => setNewSubscription({ ...newSubscription, user_id: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un utilisateur</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.email} {user.user_profiles?.[0]?.full_name && `(${user.user_profiles[0].full_name})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Plan</label>
                <select
                  value={newSubscription.plan_id}
                  onChange={(e) => setNewSubscription({ ...newSubscription, plan_id: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un plan</option>
                  {plans
                    .filter((p) => p.is_active)
                    .map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} - {plan.monthly_memories_limit} mémoires/mois - {plan.price_monthly}€
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Début de période</label>
                <input
                  type="date"
                  value={newSubscription.current_period_start}
                  onChange={(e) => setNewSubscription({ ...newSubscription, current_period_start: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fin de période</label>
                <input
                  type="date"
                  value={newSubscription.current_period_end}
                  onChange={(e) => setNewSubscription({ ...newSubscription, current_period_end: e.target.value })}
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateSubscription}
                disabled={!newSubscription.user_id || !newSubscription.plan_id}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Créer
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`flex-1 ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } px-4 py-2 rounded-lg transition-colors`}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl max-w-md w-full p-6`}>
            <h3 className="text-xl font-bold mb-4">Modifier l'Abonnement</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Statut</label>
                <select
                  value={selectedSubscription.status}
                  onChange={(e) =>
                    setSelectedSubscription({ ...selectedSubscription, status: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="active">Actif</option>
                  <option value="canceled">Annulé</option>
                  <option value="past_due">En retard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Fin de période</label>
                <input
                  type="date"
                  value={selectedSubscription.current_period_end.split('T')[0]}
                  onChange={(e) =>
                    setSelectedSubscription({ ...selectedSubscription, current_period_end: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateSubscription}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Mettre à jour
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedSubscription(null);
                }}
                className={`flex-1 ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } px-4 py-2 rounded-lg transition-colors`}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
