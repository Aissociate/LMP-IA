import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { FreeTrialModal } from './FreeTrialModal';
import { SEOHead } from '../SEO/SEOHead';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Building2, ChevronLeft, ChevronRight, Loader2, Search, Package, Wrench, Settings, Grid3x3, List, SlidersHorizontal } from 'lucide-react';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'closing'>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'Travaux' | 'Fournitures' | 'Services'>('all');

  const getServiceIcon = (serviceType: string | null) => {
    switch (serviceType) {
      case 'Travaux':
        return <Wrench className="w-5 h-5" />;
      case 'Fournitures':
        return <Package className="w-5 h-5" />;
      case 'Services':
        return <Settings className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  const getStatusBadge = (deadline: string | null) => {
    const days = getDaysRemaining(deadline);
    if (!days || days <= 0) return { label: 'Échu', color: 'bg-gray-100 text-gray-700 border-gray-300' };
    if (days <= 7) return { label: `${days}j restants`, color: 'bg-red-50 text-red-700 border-red-200' };
    return { label: 'Ouvert', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  return (
    <>
      <SEOHead
        title="Tous les Marchés Publics de La Réunion 974 | Veille Automatique"
        description="Découvrez tous les marchés publics actifs à La Réunion (974). Surveillez automatiquement les nouvelles opportunités avec notre système d'alertes intelligent."
        canonical="/marchepublics/974"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-3">
                <img src="/logo1.png" alt="Logo" className="h-10" />
              </Link>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Essai gratuit
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white py-12 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Marchés Publics - La Réunion (974)
            </h1>
            <p className="text-lg text-orange-100 mb-6">
              Accédez aux opportunités de marchés publics à la Réunion
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-xl p-2 flex items-center max-w-3xl mx-auto">
              <Search className="w-5 h-5 text-gray-400 ml-3" />
              <input
                type="text"
                placeholder="Rechercher par mots-clés, organisme, secteur d'activité..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="flex-1 px-4 py-3 text-gray-900 outline-none"
              />
              <button className="bg-orange-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-orange-700 transition-colors">
                Rechercher
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Filters Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-900">Affiner votre recherche</h3>
              </div>
              <button
                onClick={() => {
                  setFilters({ serviceType: '', procedureType: '', minAmount: '', maxAmount: '' });
                  setSelectedType('all');
                  setSelectedStatus('all');
                  setCurrentPage(1);
                }}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Masquer les filtres
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Utilisez les filtres pour trouver les marchés qui vous correspondent
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Type de marché */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Type de marché</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="marketType"
                      checked={selectedType === 'Travaux'}
                      onChange={() => {
                        setSelectedType('Travaux');
                        setFilters({ ...filters, serviceType: 'Travaux' });
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">Travaux</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="marketType"
                      checked={selectedType === 'Fournitures'}
                      onChange={() => {
                        setSelectedType('Fournitures');
                        setFilters({ ...filters, serviceType: 'Fournitures' });
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">Fournitures</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="marketType"
                      checked={selectedType === 'Services'}
                      onChange={() => {
                        setSelectedType('Services');
                        setFilters({ ...filters, serviceType: 'Services' });
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">Services</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="marketType"
                      checked={selectedType === 'all'}
                      onChange={() => {
                        setSelectedType('all');
                        setFilters({ ...filters, serviceType: '' });
                        setCurrentPage(1);
                      }}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">Tous les types</span>
                  </label>
                </div>
              </div>

              {/* Statut du marché */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Statut du marché</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="marketStatus"
                      checked={selectedStatus === 'open'}
                      onChange={() => setSelectedStatus('open')}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">Ouvert</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="marketStatus"
                      checked={selectedStatus === 'closing'}
                      onChange={() => setSelectedStatus('closing')}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">En cours</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="marketStatus"
                      checked={selectedStatus === 'all'}
                      onChange={() => setSelectedStatus('all')}
                      className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-gray-700">Tous</span>
                  </label>
                </div>
              </div>

              {/* Localisation */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Localisation</h4>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                  <option>Toutes les communes</option>
                  <option>Saint-Denis</option>
                  <option>Saint-Paul</option>
                  <option>Saint-Pierre</option>
                  <option>Le Port</option>
                  <option>Saint-Benoît</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {totalCount} marché{totalCount > 1 ? 's' : ''} disponible{totalCount > 1 ? 's' : ''}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Page {currentPage} sur {totalPages}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Affichage :</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-orange-100 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
          ) : markets.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-600">Aucun marché ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <>
              <div className={`grid gap-6 mb-8 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {markets.map((market) => {
                  const daysRemaining = getDaysRemaining(market.deadline);
                  const statusBadge = getStatusBadge(market.deadline);

                  return (
                    <Link
                      key={market.id}
                      to={`/marchepublics/974/${market.slug}`}
                      className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all p-6 block group"
                    >
                      {/* Header with Icon and Status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-lg ${
                          market.service_type === 'Travaux' ? 'bg-orange-50 text-orange-600' :
                          market.service_type === 'Fournitures' ? 'bg-amber-50 text-amber-600' :
                          'bg-orange-50 text-orange-600'
                        }`}>
                          {getServiceIcon(market.service_type)}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {market.title}
                      </h3>

                      {/* Client */}
                      <div className="flex items-start space-x-2 text-gray-600 mb-2">
                        <Building2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm line-clamp-1">{market.client}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center space-x-2 text-gray-600 mb-4">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{market.location}</span>
                      </div>

                      {/* Amount */}
                      {market.amount && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-500">Montant estimé</span>
                          <p className="text-xl font-bold text-orange-600">
                            {formatAmount(market.amount)}
                          </p>
                        </div>
                      )}

                      {/* Deadline */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(market.deadline)}</span>
                        </div>
                        {daysRemaining !== null && daysRemaining > 0 && (
                          <div className="flex items-center space-x-1 text-gray-600">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">{daysRemaining}j restants</span>
                          </div>
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
