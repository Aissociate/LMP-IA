import React from 'react';
import { Calendar, MapPin, Building2, FileText, ExternalLink, Euro, Tag } from 'lucide-react';

interface Market {
  id: string;
  title: string;
  client: string;
  description: string;
  deadline: string | null;
  amount: number | null;
  location: string;
  publication_date: string;
  procedure_type: string | null;
  service_type: string | null;
  cpv_code: string | null;
  url: string | null;
  dce_url: string | null;
  department: string;
}

interface MarketDetailsProps {
  market: Market;
}

export function MarketDetails({ market }: MarketDetailsProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Non spécifié';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'Non communiqué';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysRemaining = (deadline: string | null) => {
    if (!deadline) return null;
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(market.deadline);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{market.title}</h1>

          {daysRemaining !== null && (
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
              daysRemaining < 7
                ? 'bg-red-100 text-red-700'
                : daysRemaining < 14
                ? 'bg-orange-100 text-orange-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {daysRemaining > 0
                ? `${daysRemaining} jour${daysRemaining > 1 ? 's' : ''} restant${daysRemaining > 1 ? 's' : ''}`
                : 'Date limite dépassée'}
            </div>
          )}
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Building2 className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Donneur d'ordre</p>
                <p className="font-semibold text-gray-900">{market.client}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Lieu d'exécution</p>
                <p className="font-semibold text-gray-900">{market.location}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Date limite de réponse</p>
                <p className="font-semibold text-gray-900">{formatDate(market.deadline)}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500 mb-1">Date de publication</p>
                <p className="font-semibold text-gray-900">{formatDate(market.publication_date)}</p>
              </div>
            </div>

            {market.amount && (
              <div className="flex items-start space-x-3">
                <Euro className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Montant estimé</p>
                  <p className="font-semibold text-gray-900">{formatAmount(market.amount)}</p>
                </div>
              </div>
            )}

            {market.procedure_type && (
              <div className="flex items-start space-x-3">
                <FileText className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Type de procédure</p>
                  <p className="font-semibold text-gray-900">{market.procedure_type}</p>
                </div>
              </div>
            )}

            {market.service_type && (
              <div className="flex items-start space-x-3">
                <Tag className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Type de service</p>
                  <p className="font-semibold text-gray-900">{market.service_type}</p>
                </div>
              </div>
            )}

            {market.cpv_code && (
              <div className="flex items-start space-x-3">
                <Tag className="w-5 h-5 text-gray-400 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 mb-1">Code CPV</p>
                  <p className="font-semibold text-gray-900">{market.cpv_code}</p>
                </div>
              </div>
            )}
          </div>

          {market.description && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                {market.description}
              </div>
            </div>
          )}

          {(market.url || market.dce_url) && (
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Liens utiles</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                {market.url && (
                  <a
                    href={market.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Voir l'annonce officielle</span>
                  </a>
                )}
                {market.dce_url && (
                  <a
                    href={market.dce_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Télécharger le DCE</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
