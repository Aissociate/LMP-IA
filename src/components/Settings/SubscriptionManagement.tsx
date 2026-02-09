import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Shield, Star, Crown, Zap, Calendar, Clock, AlertCircle,
  CheckCircle, TrendingUp, FileText, Download, ExternalLink, ChevronRight,
  XCircle, RefreshCw, Plus, RotateCcw, ShoppingCart
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { supabase } from '../../lib/supabase';
import { subscriptionService } from '../../services/subscriptionService';

interface Invoice {
  id: string;
  invoice_date: string;
  amount: number;
  status: string;
  invoice_pdf: string;
  invoice_number: string;
  currency: string;
}

export const SubscriptionManagement: React.FC = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { memoryStats, loading: statsLoading } = useSubscription();

  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  useEffect(() => {
    loadSubscriptionDetails();
    loadInvoices();
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setIsAdmin(data.is_admin || false);
    }
  };

  const loadSubscriptionDetails = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      setSubscriptionDetails(subscription);
    } catch (error: any) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('invoice_date', { ascending: false });

      if (error) throw error;

      setInvoices(data || []);
    } catch (error: any) {
      console.error('Error loading invoices:', error);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName) {
      case 'TRIAL':
        return Zap;
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
      case 'TRIAL':
        return {
          gradient: 'from-purple-500 to-purple-700',
          bg: isDark ? 'bg-purple-900/20' : 'bg-purple-50',
          border: 'border-purple-500',
          text: 'text-purple-600',
          badge: 'bg-purple-500'
        };
      case 'BRONZE':
        return {
          gradient: 'from-orange-500 to-orange-700',
          bg: isDark ? 'bg-orange-900/20' : 'bg-orange-50',
          border: 'border-orange-500',
          text: 'text-orange-600',
          badge: 'bg-orange-500'
        };
      case 'ARGENT':
        return {
          gradient: 'from-gray-400 to-gray-600',
          bg: isDark ? 'bg-gray-700/20' : 'bg-gray-50',
          border: 'border-gray-400',
          text: 'text-gray-600',
          badge: 'bg-gray-500'
        };
      case 'OR':
        return {
          gradient: 'from-yellow-400 to-yellow-600',
          bg: isDark ? 'bg-yellow-900/20' : 'bg-yellow-50',
          border: 'border-yellow-500',
          text: 'text-yellow-600',
          badge: 'bg-yellow-500'
        };
      default:
        return {
          gradient: 'from-blue-500 to-blue-700',
          bg: isDark ? 'bg-blue-900/20' : 'bg-blue-50',
          border: 'border-blue-500',
          text: 'text-blue-600',
          badge: 'bg-blue-500'
        };
    }
  };

  const getStatusInfo = () => {
    if (isAdmin) {
      return {
        title: 'Accès Administrateur',
        description: 'Vous avez un accès illimité en tant qu\'administrateur. Aucun abonnement n\'est requis.',
        icon: Crown,
        color: 'purple',
        showUpgrade: false,
        statusBadge: { text: 'Admin', color: 'bg-purple-600' }
      };
    }

    if (!subscriptionDetails) {
      return {
        title: 'Aucun abonnement actif',
        description: 'Vous n\'avez pas d\'abonnement actif. Choisissez un plan pour accéder à toutes les fonctionnalités.',
        icon: AlertCircle,
        color: 'red',
        showUpgrade: true,
        statusBadge: { text: 'Inactif', color: 'bg-red-600' }
      };
    }

    const plan = subscriptionDetails.plan;
    const isTrialActive = subscriptionDetails.trial_end_date && new Date(subscriptionDetails.trial_end_date) > new Date();
    const hasStripeSubscription = !!subscriptionDetails.stripe_subscription_id;

    if (isTrialActive) {
      const daysLeft = Math.ceil((new Date(subscriptionDetails.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        title: 'Période d\'essai en cours',
        description: `Profitez de toutes les fonctionnalités gratuitement pendant encore ${daysLeft} jour${daysLeft > 1 ? 's' : ''}. Choisissez ensuite votre plan pour continuer.`,
        icon: Zap,
        color: 'purple',
        showUpgrade: true,
        statusBadge: { text: `${daysLeft} jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}`, color: 'bg-purple-600' },
        ctaText: 'Choisir mon plan maintenant'
      };
    }

    if (hasStripeSubscription && subscriptionDetails.status === 'active') {
      const renewalDate = new Date(subscriptionDetails.current_period_end);
      return {
        title: `Abonnement ${plan.name} Actif`,
        description: `Vous bénéficiez de ${plan.monthly_memories_limit} mémoire${plan.monthly_memories_limit > 1 ? 's' : ''} technique${plan.monthly_memories_limit > 1 ? 's' : ''} par mois et de toutes les fonctionnalités incluses.`,
        icon: CheckCircle,
        color: 'green',
        showUpgrade: plan.name !== 'OR',
        statusBadge: { text: 'Actif', color: 'bg-green-600' },
        renewalDate,
        ctaText: plan.name === 'OR' ? 'Gérer mon abonnement' : 'Passer à un plan supérieur'
      };
    }

    if (subscriptionDetails.status === 'past_due') {
      return {
        title: 'Paiement en attente',
        description: 'Le dernier paiement a échoué. Veuillez mettre à jour votre moyen de paiement pour continuer à profiter de votre abonnement.',
        icon: AlertCircle,
        color: 'orange',
        showUpgrade: false,
        statusBadge: { text: 'Paiement requis', color: 'bg-orange-600' },
        ctaText: 'Mettre à jour le paiement'
      };
    }

    if (subscriptionDetails.cancel_at_period_end) {
      const endDate = new Date(subscriptionDetails.current_period_end);
      return {
        title: 'Abonnement en cours d\'annulation',
        description: `Votre abonnement sera annulé le ${endDate.toLocaleDateString('fr-FR')}. Vous pouvez le réactiver à tout moment avant cette date.`,
        icon: AlertCircle,
        color: 'orange',
        showUpgrade: false,
        statusBadge: { text: 'Annulation prévue', color: 'bg-orange-600' },
        ctaText: 'Réactiver l\'abonnement'
      };
    }

    return {
      title: 'Statut inconnu',
      description: 'Contactez le support pour plus d\'informations sur votre abonnement.',
      icon: AlertCircle,
      color: 'gray',
      showUpgrade: true,
      statusBadge: { text: 'Inconnu', color: 'bg-gray-600' }
    };
  };

  const handleUpgrade = () => {
    navigate('/subscription');
  };

  const handleCancelSubscription = async () => {
    setCancelLoading(true);
    setCancelError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifie');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'cancel' }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erreur lors de l\'annulation');

      setShowCancelConfirm(false);
      await loadSubscriptionDetails();
    } catch (err: any) {
      setCancelError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setCancelLoading(true);
    setCancelError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifie');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'reactivate' }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Erreur lors de la reactivation');

      await loadSubscriptionDetails();
    } catch (err: any) {
      setCancelError(err.message);
    } finally {
      setCancelLoading(false);
    }
  };

  const handlePurchaseExtraMemory = async () => {
    setPurchaseLoading(true);
    try {
      const result = await subscriptionService.purchaseExtraMemory();
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err: any) {
      setCancelError(err.message || 'Erreur lors de l\'achat');
    } finally {
      setPurchaseLoading(false);
    }
  };

  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-600"></div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const plan = subscriptionDetails?.plan;
  const planColors = plan ? getPlanColor(plan.name) : null;
  const PlanIcon = plan ? getPlanIcon(plan.name) : Shield;

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-2xl border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${statusInfo.color === 'green' ? 'bg-green-500' : statusInfo.color === 'red' ? 'bg-red-500' : statusInfo.color === 'orange' ? 'bg-orange-500' : statusInfo.color === 'purple' ? 'bg-purple-500' : 'bg-gray-500'}`}>
              <StatusIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {statusInfo.title}
              </h2>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {statusInfo.description}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${statusInfo.statusBadge.color}`}>
            {statusInfo.statusBadge.text}
          </span>
        </div>

        {plan && !isAdmin && (
          <div className={`p-4 rounded-xl border-2 ${planColors?.bg} ${planColors?.border} mb-6`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${planColors?.gradient}`}>
                  <PlanIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Plan {plan.name}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {plan.price_monthly}€ / mois
                  </p>
                </div>
              </div>
              {statusInfo.renewalDate && (
                <div className={`text-right ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <p className="text-sm">Prochain renouvellement</p>
                  <p className="font-semibold">
                    {statusInfo.renewalDate.toLocaleDateString('fr-FR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {memoryStats && !isAdmin && (
          <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'} mb-6`}>
            <div className="flex items-center justify-between mb-2">
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Memoires techniques
              </h4>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {memoryStats.used} / {memoryStats.total_limit === 999999 ? '\u221E' : memoryStats.total_limit}
              </span>
            </div>
            {memoryStats.total_limit > 0 && memoryStats.total_limit !== 999999 && (
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div
                  className={`h-full transition-all duration-300 ${
                    memoryStats.remaining === 0
                      ? 'bg-red-500'
                      : memoryStats.remaining <= 1
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(100, (memoryStats.used / memoryStats.total_limit) * 100)}%` }}
                />
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>
                {memoryStats.limit} plan
              </span>
              {memoryStats.rollover_credits > 0 && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                  <RotateCcw className="w-3 h-3" />
                  +{memoryStats.rollover_credits} report{memoryStats.rollover_credits > 1 ? 's' : ''}
                </span>
              )}
              {memoryStats.extra_credits > 0 && (
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'}`}>
                  <Plus className="w-3 h-3" />
                  +{memoryStats.extra_credits} achat{memoryStats.extra_credits > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {memoryStats.total_limit === 0
                ? 'Aucune memoire technique disponible en periode d\'essai'
                : memoryStats.remaining === 0
                  ? 'Limite atteinte pour ce mois-ci'
                  : `${memoryStats.remaining} memoire${memoryStats.remaining > 1 ? 's' : ''} restante${memoryStats.remaining > 1 ? 's' : ''} ce mois-ci`
              }
            </p>
            {memoryStats.rollover_credits > 0 && (
              <p className={`text-xs mt-1 italic ${isDark ? 'text-blue-400/70' : 'text-blue-600/70'}`}>
                Les credits reportes expirent a la fin de ce mois.
              </p>
            )}

            {subscriptionDetails?.status === 'active' && (
              <button
                onClick={handlePurchaseExtraMemory}
                disabled={purchaseLoading}
                className={`mt-4 w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                  isDark
                    ? 'border-orange-700 text-orange-400 hover:bg-orange-900/20 disabled:opacity-50'
                    : 'border-orange-300 text-orange-700 hover:bg-orange-50 disabled:opacity-50'
                }`}
              >
                {purchaseLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingCart className="w-4 h-4" />
                )}
                {purchaseLoading ? 'Redirection...' : 'Acheter une memoire supplementaire - 299\u20AC'}
              </button>
            )}
          </div>
        )}

        {statusInfo.showUpgrade && (
          <button
            onClick={handleUpgrade}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              statusInfo.color === 'purple'
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                : statusInfo.color === 'orange'
                  ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            {statusInfo.ctaText || 'Découvrir nos plans'}
          </button>
        )}

        {cancelError && (
          <div className={`p-3 rounded-lg text-sm ${isDark ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {cancelError}
          </div>
        )}

        {subscriptionDetails?.cancel_at_period_end && subscriptionDetails?.stripe_subscription_id && !isAdmin && (
          <button
            onClick={handleReactivateSubscription}
            disabled={cancelLoading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 mt-3 ${
              isDark
                ? 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-800'
                : 'bg-green-600 hover:bg-green-700 text-white disabled:bg-green-400'
            }`}
          >
            {cancelLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            {cancelLoading ? 'Reactivation en cours...' : 'Reactiver mon abonnement'}
          </button>
        )}

        {subscriptionDetails?.stripe_subscription_id && subscriptionDetails?.status === 'active' && !subscriptionDetails?.cancel_at_period_end && !isAdmin && (
          <>
            {!showCancelConfirm ? (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 mt-3 border ${
                  isDark
                    ? 'border-red-800 text-red-400 hover:bg-red-900/30'
                    : 'border-red-200 text-red-600 hover:bg-red-50'
                }`}
              >
                <XCircle className="w-5 h-5" />
                Annuler mon abonnement
              </button>
            ) : (
              <div className={`mt-3 p-4 rounded-xl border-2 ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-start gap-3 mb-4">
                  <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-red-400' : 'text-red-800'}`}>
                      Confirmer l'annulation
                    </h4>
                    <p className={`text-sm mt-1 ${isDark ? 'text-red-300/80' : 'text-red-700'}`}>
                      Votre abonnement restera actif jusqu'a la fin de la periode en cours.
                      Vous pourrez le reactiver a tout moment avant cette date.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleCancelSubscription}
                    disabled={cancelLoading}
                    className="flex-1 py-2.5 px-4 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {cancelLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    {cancelLoading ? 'Annulation...' : 'Confirmer l\'annulation'}
                  </button>
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelLoading}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition-colors ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                  >
                    Garder mon abonnement
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className={`p-6 rounded-2xl border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
        <div className="flex items-center gap-3 mb-4">
          <FileText className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Factures
          </h3>
        </div>

        {invoices.length > 0 ? (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} flex items-center justify-between hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {invoice.invoice_number ? `#${invoice.invoice_number}` : new Date(invoice.invoice_date).toLocaleDateString('fr-FR')}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {invoice.amount}€ • {invoice.status === 'paid' ? 'Payée' : invoice.status === 'open' ? 'En attente' : 'Annulée'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isDark ? 'text-orange-400 hover:bg-orange-900/20' : 'text-orange-600 hover:bg-orange-50'}`}
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={`py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <FileText className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className="font-medium">Aucune facture disponible</p>
            <p className="text-sm mt-1">
              Vos factures apparaîtront ici une fois votre abonnement activé.
            </p>
          </div>
        )}
      </div>

      {plan && !isAdmin && (
        <div className={`p-6 rounded-2xl border-2 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg`}>
          <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Fonctionnalités de votre plan
          </h3>
          <div className="space-y-2">
            {plan.features.map((feature: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${planColors?.text}`} />
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
