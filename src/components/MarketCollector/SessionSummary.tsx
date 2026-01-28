import React from 'react';
import { CheckCircle, FileText, Building2, Clock, TrendingUp, ArrowRight, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Market {
  id: string;
  reference: string | null;
  title: string;
  client: string;
  amount: number | null;
  deadline: string | null;
  created_at: string;
}

interface ProgressWithDonneur {
  donneur_name: string;
  markets_count: number;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  is_completed: boolean;
}

interface SessionSummaryData {
  id: string;
  operator_email: string;
  started_at: string;
  completed_at: string | null;
  total_donneurs_ordre: number;
  completed_donneurs_ordre: number;
  total_markets_added: number;
  duration_minutes: number;
  markets: Market[];
  progress_with_donneurs: ProgressWithDonneur[];
}

interface SessionSummaryProps {
  sessionData: SessionSummaryData;
  onClose: () => void;
  onNewSession: () => void;
}

export const SessionSummary: React.FC<SessionSummaryProps> = ({
  sessionData,
  onClose,
  onNewSession,
}) => {
  const navigate = useNavigate();

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}min` : ''}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const handleViewMarkets = () => {
    navigate('/market-search', {
      state: {
        filterBySession: sessionData.id,
        filterByDate: sessionData.started_at.split('T')[0]
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-6xl my-8 animate-fade-in">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <div className="flex items-center gap-3">
            <div className="bg-green-500 rounded-full p-3">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Session Terminée !
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Récapitulatif de votre session de saisie
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <FileText className="h-6 w-6 opacity-80" />
                <span className="text-3xl font-bold">{sessionData.total_markets_added}</span>
              </div>
              <p className="text-sm opacity-90">Marchés Saisis</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <Building2 className="h-6 w-6 opacity-80" />
                <span className="text-3xl font-bold">{sessionData.completed_donneurs_ordre}</span>
              </div>
              <p className="text-sm opacity-90">Donneurs d'Ordre Traités</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <Clock className="h-6 w-6 opacity-80" />
                <span className="text-2xl font-bold">{formatDuration(sessionData.duration_minutes)}</span>
              </div>
              <p className="text-sm opacity-90">Durée de la Session</p>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-6 w-6 opacity-80" />
                <span className="text-3xl font-bold">
                  {sessionData.completed_donneurs_ordre > 0
                    ? (sessionData.total_markets_added / sessionData.completed_donneurs_ordre).toFixed(1)
                    : '0'}
                </span>
              </div>
              <p className="text-sm opacity-90">Marchés par Donneur</p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Détails par Donneur d'Ordre
            </h3>
            <div className="space-y-3">
              {sessionData.progress_with_donneurs.map((progress, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${progress.is_completed ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {progress.donneur_name}
                      </h4>
                    </div>
                    <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      {progress.markets_count} marché{progress.markets_count > 1 ? 's' : ''}
                    </span>
                  </div>
                  {progress.notes && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-5">
                      Note: {progress.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {sessionData.markets.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Marchés Créés ({sessionData.markets.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sessionData.markets.map((market) => (
                  <div
                    key={market.id}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {market.reference && (
                            <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                              {market.reference}
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white truncate">
                          {market.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {market.client}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {market.amount && (
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {formatAmount(market.amount)}
                          </p>
                        )}
                        {market.deadline && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Échéance: {new Date(market.deadline).toLocaleDateString('fr-FR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="text-blue-500 mt-0.5">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Tous les marchés ont été publiés immédiatement</strong> et sont maintenant
                  visibles dans la recherche de marchés et disponibles pour le public.
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Session démarrée: {formatDate(sessionData.started_at)}
                  {sessionData.completed_at && ` • Terminée: ${formatDate(sessionData.completed_at)}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex flex-wrap gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium"
          >
            Fermer
          </button>
          <button
            onClick={handleViewMarkets}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            Voir Mes Marchés
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={onNewSession}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle Session
          </button>
        </div>
      </div>
    </div>
  );
};
