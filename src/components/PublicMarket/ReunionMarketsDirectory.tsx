import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { MarketHeader } from './MarketHeader';
import { FreeTrialModal } from './FreeTrialModal';
import { SEOHead } from '../SEO/SEOHead';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Building2, Euro, ChevronLeft, ChevronRight, Loader2, Search } from 'lucide-react';

interface Market {
  id: string;
  slug: string;
  title: string;
  client: string;
  description: string;
  deadline: string | null;
  amount: number | null;
  location: string;
  publication_date: string;
  procedure_type: string | null;
  service_type: string | null;
}

const ITEMS_PER_PAGE = 20;

export function ReunionMarketsDirectory() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    serviceType: '',
    procedureType: '',
    minAmount: '',
    maxAmount: '',
  });

  useEffect(() => {
    fetchMarkets();
  }, [currentPage, searchTerm, filters]);

  const fetchMarkets = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('public_markets')
        .select('*', { count: 'exact' })
        .eq('department', '974')
        .eq('is_public', true)
        .gte('deadline', new Date().toISOString())
        .order('publication_date', { ascending: false });

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,client.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      if (filters.serviceType) {
        query = query.eq('service_type', filters.serviceType);
      }

      if (filters.procedureType) {
        query = query.eq('procedure_type', filters.procedureType);
      }

      if (filters.minAmount) {
        query = query.gte('amount', parseFloat(filters.minAmount));
      }

      if (filters.maxAmount) {
        query = query.lte('amount', parseFloat(filters.maxAmount));
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error, count } = await query.range(from, to);

      if (error) throw error;

      setMarkets(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error fetching markets:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <>
      <SEOHead
        title="Tous les Marchés Publics de La Réunion 974 | Veille Automatique"
        description="Découvrez tous les marchés publics actifs à La Réunion (974). Surveillez automatiquement les nouvelles opportunités avec notre système d'alertes intelligent."
        canonical="/marchepublics/974"
      />

      <div className="min-h-screen bg-gray-50">
        <MarketHeader onCTAClick={() => setShowModal(true)} />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Marchés publics actifs à La Réunion
            </h2>
            <p className="text-gray-600">
              {totalCount} marché{totalCount > 1 ? 's' : ''} actuellement disponible{totalCount > 1 ? 's' : ''}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par titre, donneur d'ordre ou description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de service
                </label>
                <select
                  value={filters.serviceType}
                  onChange={(e) => {
                    setFilters({ ...filters, serviceType: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous</option>
                  <option value="Travaux">Travaux</option>
                  <option value="Fournitures">Fournitures</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de procédure
                </label>
                <select
                  value={filters.procedureType}
                  onChange={(e) => {
                    setFilters({ ...filters, procedureType: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous</option>
                  <option value="Procédure adaptée">Procédure adaptée</option>
                  <option value="Appel d'offres ouvert">Appel d'offres ouvert</option>
                  <option value="Appel d'offres restreint">Appel d'offres restreint</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant min (€)
                </label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => {
                    setFilters({ ...filters, minAmount: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Montant max (€)
                </label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => {
                    setFilters({ ...filters, maxAmount: e.target.value });
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Illimité"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : markets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-600">Aucun marché ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 mb-8">
                {markets.map((market) => {
                  const daysRemaining = getDaysRemaining(market.deadline);
                  return (
                    <Link
                      key={market.id}
                      to={`/marchepublics/974/${market.slug}`}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 block"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors flex-1">
                          {market.title}
                        </h3>
                        {daysRemaining !== null && (
                          <span className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                            daysRemaining < 7
                              ? 'bg-red-100 text-red-700'
                              : daysRemaining < 14
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {daysRemaining > 0 ? `${daysRemaining}j` : 'Expiré'}
                          </span>
                        )}
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Building2 className="w-4 h-4" />
                          <span className="text-sm">{market.client}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="text-sm">{market.location}</span>
                        </div>

                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">Date limite: {formatDate(market.deadline)}</span>
                        </div>

                        {market.amount && (
                          <div className="flex items-center space-x-2 text-gray-600">
                            <Euro className="w-4 h-4" />
                            <span className="text-sm">{formatAmount(market.amount)}</span>
                          </div>
                        )}
                      </div>

                      {market.description && (
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {market.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center space-x-3">
                        {market.service_type && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                            {market.service_type}
                          </span>
                        )}
                        {market.procedure_type && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {market.procedure_type}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <span className="text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <FreeTrialModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </>
  );
}
