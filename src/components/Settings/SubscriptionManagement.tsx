import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, Shield, Star, Crown, Zap, Calendar, Clock, AlertCircle,
  CheckCircle, TrendingUp, FileText, Download, ExternalLink, ChevronRight
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import { supabase } from '../../lib/supabase';

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
                Mémoires techniques
              </h4>
              <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {memoryStats.used} / {memoryStats.limit === 999999 ? '∞' : memoryStats.limit}
              </span>
            </div>
            {memoryStats.limit > 0 && memoryStats.limit !== 999999 && (
              <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}>
                <div
                  className={`h-full transition-all duration-300 ${
                    memoryStats.remaining === 0
                      ? 'bg-red-500'
                      : memoryStats.remaining <= 1
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                  }`}
                  style={{ width: `${(memoryStats.used / memoryStats.limit) * 100}%` }}
                />
              </div>
            )}
            <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {memoryStats.limit === 0
                ? 'Aucune mémoire technique disponible en période d\'essai'
                : memoryStats.remaining === 0
                  ? 'Limite atteinte pour ce mois-ci'
                  : `${memoryStats.remaining} mémoire${memoryStats.remaining > 1 ? 's' : ''} restante${memoryStats.remaining > 1 ? 's' : ''} ce mois-ci`
              }
            </p>
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
