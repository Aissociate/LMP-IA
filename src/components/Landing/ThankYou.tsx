import { useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Mail, Clock } from 'lucide-react';
import { useEffect } from 'react';
import { SEOHead } from '../SEO/SEOHead';
import { FacebookPixelEvents } from '../../lib/analytics';

export function ThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    FacebookPixelEvents.Lead({
      content_name: 'Thank You Page',
      value: 0,
      currency: 'EUR'
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <SEOHead
        title="Merci pour votre demande - LeMarchéPublic.fr"
        description="Votre demande a bien été reçue. Notre équipe vous contactera rapidement pour vous accompagner dans vos marchés publics."
        canonical="https://lemarchepublic.fr/merci"
      />

      <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Merci pour votre demande !
          </h1>

          <div className="w-24 h-1 bg-gradient-to-r from-[#F77F00] to-[#D62828] mx-auto mb-8 rounded-full"></div>

          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Votre demande a bien été enregistrée et sera traitée dans les plus brefs délais.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
            <div className="bg-blue-50 rounded-xl p-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email de confirmation</h3>
              <p className="text-sm text-gray-600">
                Vous recevrez un email de confirmation dans quelques instants
              </p>
            </div>

            <div className="bg-orange-50 rounded-xl p-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#F77F00]" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Réponse rapide</h3>
              <p className="text-sm text-gray-600">
                Notre équipe vous contactera sous 24-48h ouvrées
              </p>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Suivi personnalisé</h3>
              <p className="text-sm text-gray-600">
                Un conseiller dédié analysera votre besoin
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-orange-50 rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              En attendant notre réponse
            </h2>
            <div className="text-left max-w-2xl mx-auto space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#F77F00] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <p className="text-gray-700">
                  Vérifiez votre boîte mail (et vos spams) pour notre email de confirmation
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#F77F00] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <p className="text-gray-700">
                  Préparez vos documents (KBIS, derniers marchés remportés, etc.)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-[#F77F00] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <p className="text-gray-700">
                  Consultez notre démo vidéo pour découvrir toutes les fonctionnalités
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F77F00] to-[#E06F00] text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </button>

            <a
              href="mailto:contact@lemarchepublic.fr"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 border-2 border-gray-300 rounded-xl font-semibold hover:border-[#F77F00] hover:text-[#F77F00] transition-all duration-200"
            >
              <Mail className="w-5 h-5" />
              Nous contacter directement
            </a>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-2">
              Une question urgente ?
            </p>
            <p className="text-lg font-semibold text-gray-900">
              <a
                href="mailto:contact@lemarchepublic.fr"
                className="text-[#F77F00] hover:text-[#E06F00] transition-colors"
              >
                contact@lemarchepublic.fr
              </a>
            </p>
            <p className="text-gray-600 mt-2">
              📍 36 chemin de l'état major, Saint-Denis, La Réunion 974
            </p>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            En soumettant votre demande, vous acceptez nos{' '}
            <button
              onClick={() => navigate('/cgv')}
              className="text-[#F77F00] hover:underline"
            >
              conditions générales de vente
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
