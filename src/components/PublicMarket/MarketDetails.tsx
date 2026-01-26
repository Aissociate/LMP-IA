import React from 'react';
import { Calendar, MapPin, Building2, FileText, ExternalLink, Euro, Tag, Clock, Package, Wrench, Settings } from 'lucide-react';

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

  const getServiceIcon = () => {
    switch (market.service_type) {
      case 'Travaux':
        return <Wrench className="w-6 h-6" />;
      case 'Fournitures':
        return <Package className="w-6 h-6" />;
      case 'Services':
        return <Settings className="w-6 h-6" />;
      default:
        return <Building2 className="w-6 h-6" />;
    }
  };

  const getStatusBadge = () => {
    if (!daysRemaining || daysRemaining <= 0) {
      return { label: 'Fermé', color: 'bg-red-50 text-red-700 border-red-200' };
    }
    return { label: 'Ouvert', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {/* Header with Icon and Status */}
        <div className="bg-gradient-to-r from-gray-50 to-white p-8 border-b border-gray-200">
          <div className="flex items-start justify-between mb-6">
            <div className={`p-4 rounded-lg ${
              market.service_type === 'Travaux' ? 'bg-orange-50 text-orange-600' :
              market.service_type === 'Fournitures' ? 'bg-amber-50 text-amber-600' :
              'bg-blue-50 text-blue-600'
            }`}>
              {getServiceIcon()}
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusBadge.color}`}>
              {statusBadge.label}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{market.title}</h1>

          {daysRemaining !== null && daysRemaining > 0 && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="w-5 h-5" />
              <span className="text-lg font-medium">
                {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="p-8">
          {/* Key Information Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {market.amount && (
              <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
                <div className="flex items-center space-x-3 mb-2">
                  <Euro className="w-5 h-5 text-blue-600" />
                  <p className="text-sm text-blue-900 font-medium">Montant estimé</p>
                </div>
                <p className="text-2xl font-bold text-blue-600">{formatAmount(market.amount)}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-700 font-medium">Date limite</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">{formatDate(market.deadline)}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <p className="text-sm text-gray-700 font-medium">Publication</p>
              </div>
              <p className="text-lg font-semibold text-gray-900">{formatDate(market.publication_date)}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <Building2 className="w-5 h-5 text-gray-500" />
                <p className="text-sm text-gray-600 font-medium">Donneur d'ordre</p>
              </div>
              <p className="text-gray-900 font-semibold">{market.client}</p>
            </div>

            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <MapPin className="w-5 h-5 text-gray-500" />
                <p className="text-sm text-gray-600 font-medium">Lieu d'exécution</p>
              </div>
              <p className="text-gray-900 font-semibold">{market.location}</p>
            </div>

            {market.service_type && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Tag className="w-5 h-5 text-gray-500" />
                  <p className="text-sm text-gray-600 font-medium">Type de service</p>
                </div>
                <p className="text-gray-900 font-semibold">{market.service_type}</p>
              </div>
            )}

            {market.procedure_type && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <p className="text-sm text-gray-600 font-medium">Type de procédure</p>
                </div>
                <p className="text-gray-900 font-semibold">{market.procedure_type}</p>
              </div>
            )}

            {market.cpv_code && (
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center space-x-3 mb-3">
                  <Tag className="w-5 h-5 text-gray-500" />
                  <p className="text-sm text-gray-600 font-medium">Code CPV</p>
                </div>
                <p className="text-gray-900 font-semibold">{market.cpv_code}</p>
              </div>
            )}
          </div>

          {market.description && (
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description du marché</h2>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {market.description}
                </div>
              </div>
            </div>
          )}

          {(market.url || market.dce_url) && (
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Documents et liens</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {market.url && (
                  <a
                    href={market.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-600 text-white rounded-lg">
                        <ExternalLink className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Annonce officielle</p>
                        <p className="text-sm text-gray-600">Consulter sur la plateforme</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
                {market.dce_url && (
                  <a
                    href={market.dce_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-6 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-600 text-white rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Dossier de consultation</p>
                        <p className="text-sm text-gray-600">Télécharger le DCE</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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
