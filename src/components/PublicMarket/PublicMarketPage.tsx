import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { MarketDetails } from './MarketDetails';
import { FreeTrialModal } from './FreeTrialModal';
import { SEOHead } from '../SEO/SEOHead';
import { Loader2, AlertCircle } from 'lucide-react';

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
  seo_title: string;
  seo_description: string;
}

export function PublicMarketPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [market, setMarket] = useState<Market | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchMarket = async () => {
      if (!slug) {
        setError('Slug manquant');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('public_markets')
          .select('*')
          .eq('slug', slug)
          .eq('is_public', true)
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          setError('Marché non trouvé ou non disponible');
        } else {
          setMarket(data);
        }
      } catch (err: any) {
        console.error('Error fetching market:', err);
        setError('Erreur lors du chargement du marché');
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du marché...</p>
        </div>
      </div>
    );
  }

  if (error || !market) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Marché introuvable</h1>
          <p className="text-gray-600 mb-6">
            {error || 'Ce marché n\'existe pas ou n\'est plus disponible.'}
          </p>
          <button
            onClick={() => navigate('/marchepublics/974')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voir tous les marchés
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={market.seo_title}
        description={market.seo_description}
        canonical={`/marchepublics/974/${slug}`}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/marchepublics/974" className="flex items-center space-x-3">
                <img src="/logo1.png" alt="Logo" className="h-10" />
              </Link>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Essai gratuit
              </button>
            </div>
          </div>
        </div>

        <MarketDetails market={market} />

        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-3">
              Ne manquez plus aucune opportunité
            </h2>
            <p className="text-blue-100 mb-6 text-lg">
              Recevez automatiquement les nouveaux marchés qui correspondent à votre activité
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              Essayez gratuitement pendant 7 jours
            </button>
          </div>
        </div>

        <FreeTrialModal isOpen={showModal} onClose={() => setShowModal(false)} />
      </div>
    </>
  );
}
