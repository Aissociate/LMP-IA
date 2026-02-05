import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Hammer, HardHat, Sparkles, TrendingUp, Clock, Target, ChevronLeft, ChevronRight, Mail, Search, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { initAnalytics, trackClick } from '../../lib/analytics';
import { MarketModelComparison } from './MarketModelComparison';
import { Button } from '../ui/Button';
import { Section } from '../ui/Section';

const Carousel = () => {
  const images = ['/caroussel 1.png', '/caroussel 2.png', '/caroussel 3.png', '/caroussel 5.png', '/caroussel 6.png', '/caroussel 7.png', '/caroussel 8.png'];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-100 group max-w-4xl mx-auto">
      <img
        src={images[currentIndex]}
        alt={`Screenshot ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    return initAnalytics('home');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-2">
          <div className="flex items-center flex-shrink-0">
            <img src="/logo1.png" alt="Le Marché Public.fr" className="h-16 md:h-24 lg:h-[120px] w-auto object-contain" />
          </div>
          <Button
            onClick={() => {
              trackClick('home', 'cta', 'header_trial');
              navigate('/capture-lead');
            }}
            variant="primary"
            className="text-xs md:text-base px-3 py-2 md:px-6 md:py-3"
          >
            <span className="hidden sm:inline">Essai gratuit 7 jours</span>
            <span className="sm:hidden">Essai gratuit</span>
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <Section className="pt-20 pb-16 sm:pt-32 sm:pb-24 relative">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://storage.googleapis.com/msgsndr/Khh3gHoXw8rbmLrz89s4/media/6978a15c00336c6d64d341bb.jpg)'
          }}
        >
          <div className="absolute inset-0 bg-white/65"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-[#F77F00] px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-4 h-4" />
            Essai gratuit 7 jours
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="bg-gradient-to-r from-gray-900 via-[#F77F00] to-gray-900 bg-clip-text text-transparent">
              Gagnez plus de marchés publics
            </span>
            <br />
            <span className="text-gray-900">à La Réunion 974 avec votre assistant numérique</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Veille exhaustive 24/7 des marchés publics réunionnais, alertes instantanées, génération automatique de mémoires techniques et référencement auprès des collectivités locales.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12 text-left">
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl mb-2">📡</div>
              <div className="text-sm font-semibold text-gray-900">Veille 24/7</div>
              <div className="text-xs text-gray-600">BOAMP nationale + Réunion 974</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl mb-2">📱</div>
              <div className="text-sm font-semibold text-gray-900">Alertes multi-canal</div>
              <div className="text-xs text-gray-600">Mail, SMS, WhatsApp</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl mb-2">⚖️</div>
              <div className="text-sm font-semibold text-gray-900">Analyse juridique</div>
              <div className="text-xs text-gray-600">Conformité garantie</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl mb-2">🔐</div>
              <div className="text-sm font-semibold text-gray-900">Coffre-fort</div>
              <div className="text-xs text-gray-600">Documents sécurisés</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1200">
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'hero_trial');
                navigate('/capture-lead');
              }}
              variant="primary"
              className="text-lg px-8 py-4"
            >
              Démarrer mes 7 jours gratuits
            </Button>
            <Button
              onClick={() => document.getElementById('fonctionnalites')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              className="text-lg px-8 py-4"
            >
              Découvrir les fonctionnalités
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 items-center">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>7 jours d'accès complet gratuit</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Accès à toutes les fonctionnalités</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Annulez quand vous voulez</span>
            </div>
          </div>
        </div>
      </Section>

      {/* SEARCH MARKETS SECTION */}
      <Section className="py-16 bg-gradient-to-br from-[#F77F00] to-[#E06F00]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Découvrez les marchés publics à La Réunion
            </h2>
            <p className="text-lg text-white/90">
              Explorez dès maintenant les opportunités disponibles dans le 974
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-gray-700 mb-4">
                <MapPin className="w-6 h-6 text-[#F77F00]" />
                <span className="font-semibold text-lg">Marchés publics actifs à La Réunion</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="font-bold text-blue-900 mb-1">CINOR, TCO, CIREST</div>
                  <div className="text-sm text-blue-700">Intercommunalités du Nord et de l'Est</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="font-bold text-blue-900 mb-1">CIVIS, CASUD</div>
                  <div className="text-sm text-blue-700">Intercommunalités du Sud et de l'Ouest</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="font-bold text-blue-900 mb-1">Région Réunion</div>
                  <div className="text-sm text-blue-700">Marchés régionaux et départementaux</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <div className="font-bold text-blue-900 mb-1">24 Communes du 974</div>
                  <div className="text-sm text-blue-700">Saint-Denis, Saint-Pierre, Le Port...</div>
                </div>
              </div>

              <Button
                onClick={() => {
                  trackClick('home', 'navigation', 'search_markets_reunion');
                  navigate('/marchepublics/974');
                }}
                variant="primary"
                className="w-full text-lg"
              >
                <Search className="w-5 h-5" />
                Voir tous les marchés publics réunionnais
                <ArrowRight className="w-5 h-5" />
              </Button>

              <p className="text-sm text-gray-600 text-center mt-2">
                Accès gratuit aux consultations en cours • Mise à jour quotidienne
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* TRUST INDICATORS */}
      <Section className="py-12 bg-white border-y border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[#F77F00] mb-2">100</div>
            <div className="text-sm text-gray-600">Entreprises utilisatrices</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F77F00] mb-2">+ 200</div>
            <div className="text-sm text-gray-600">Marchés actifs à La Réunion</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F77F00] mb-2">150+</div>
            <div className="text-sm text-gray-600">Marchés remportés en 2025</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F77F00] mb-2">4.8/5</div>
            <div className="text-sm text-gray-600">Note utilisateurs</div>
          </div>
        </div>
      </Section>

      {/* VIDEO DEMO SECTION */}
      <Section className="py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Découvrez l'interface en vidéo
          </h2>
          <p className="text-lg text-gray-600">
            Une solution intuitive et puissante pour gagner plus de marchés
          </p>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
            <div className="aspect-video">
              <iframe
                src="https://www.facebook.com/plugins/video.php?height=304&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1347758950405127%2F&show_text=false&width=560&t=0"
                className="w-full h-full"
                style={{ border: 'none', overflow: 'hidden' }}
                scrolling="no"
                frameBorder="0"
                allowFullScreen={true}
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* REUNION BENEFITS */}
      <Section className="py-16 bg-gradient-to-r from-[#F77F00] to-[#E06F00] text-white -mx-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Pourquoi la veille locale réunionnaise change tout
          </h2>
          <p className="text-lg text-white/90 max-w-3xl mx-auto">
            À La Réunion, les opportunités sont là mais difficiles à suivre. Notre solution surveille tous les acteurs publics locaux 24/7.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-5xl font-extrabold mb-2">100%</div>
            <p className="text-white/90 text-lg">des marchés publics du 974 surveillés</p>
            <p className="text-white/70 text-sm mt-2">CINOR, TCO, CIREST, CIVIS, CASUD, Région, 24 communes</p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-900">
            <div className="text-5xl font-extrabold mb-2">24/7</div>
            <p className="text-white/90 text-lg">Veille automatique en temps réel</p>
            <p className="text-white/70 text-sm mt-2">Ne ratez plus aucune opportunité locale, soyez alerté en premier</p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1100">
            <div className="text-5xl font-extrabold mb-2">+48%</div>
            <p className="text-white/90 text-lg">de marchés réunionnais en plus détectés</p>
            <p className="text-white/70 text-sm mt-2">Grâce à notre couverture exhaustive des collectivités locales</p>
          </div>
        </div>

        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="font-bold text-xl mb-4 text-center">🏝️ Spécificités La Réunion</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <div className="font-semibold">Sources locales multiples</div>
                  <div className="text-white/80">5 EPCI + 24 communes + Région + Département</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <div className="font-semibold">Délais adaptés au contexte insulaire</div>
                  <div className="text-white/80">Alertes anticipées pour préparer vos dossiers</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <div className="font-semibold">Référencement collectivités locales</div>
                  <div className="text-white/80">Visibilité auprès des acheteurs publics réunionnais</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">✓</span>
                <div>
                  <div className="font-semibold">Conformité réglementaire locale</div>
                  <div className="text-white/80">Critères spécifiques DOM-TOM intégrés</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* FONCTIONNALITÉS DÉTAILLÉES */}
      <Section id="fonctionnalites" className="py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Votre assistant numérique complet pour les marchés publics réunionnais
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            9 fonctionnalités professionnelles qui automatisent tout le processus : de la veille locale 974 au référencement auprès des collectivités
          </p>
        </div>

        <div className="space-y-16 max-w-6xl mx-auto">
          {/* Veille Marchés */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">📡</span>
                Inclus dans tous les plans
              </div>
              <h3 className="text-3xl font-bold mb-4">1. Surveillance 24/7 exhaustive</h3>
              <p className="text-lg text-gray-600 mb-6">
                Ne ratez plus jamais une opportunité : BOAMP national + 100% des marchés Réunion 974.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>BOAMP nationale</strong> + focus exhaustif La Réunion</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>CINOR, TCO, CIREST, CIVIS, CASUD, Région</strong>, toutes communes 974</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Actualisation en temps réel, <strong>24h/24, 7j/7</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Paramétrage fin par secteur, montant, type</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4 text-center">📡</div>
                <div className="text-center text-gray-700 font-semibold">Surveillance en cours</div>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Marchés détectés aujourd'hui</span>
                    <span className="font-bold text-green-600">12 nouveaux</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zone prioritaire</span>
                    <span className="font-bold">Réunion (974)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Veille active</span>
                    <span className="font-bold text-green-600">● LIVE</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alertes Multi-Canal */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4 text-center">📱</div>
                <div className="text-center text-gray-700 font-semibold mb-4">Nouveau marché détecté !</div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="bg-blue-50 p-2 rounded flex items-center gap-2">
                    <span>📧</span>
                    <span>Email envoyé</span>
                  </div>
                  <div className="bg-blue-50 p-2 rounded flex items-center gap-2">
                    <span>📱</span>
                    <span>SMS envoyé</span>
                  </div>
                  <div className="bg-blue-50 p-2 rounded flex items-center gap-2">
                    <span>💬</span>
                    <span>WhatsApp envoyé</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">📱</span>
                Inclus dans tous les plans
              </div>
              <h3 className="text-3xl font-bold mb-4">2. Alertes instantanées multi-canal</h3>
              <p className="text-lg text-gray-600 mb-6">
                Soyez informé immédiatement par Email, SMS ou WhatsApp dès qu'un marché correspond à vos critères.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Email professionnel</strong> avec résumé détaillé</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>SMS instantané</strong> pour les marchés prioritaires</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>WhatsApp Business</strong> avec lien direct</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Personnalisation complète des alertes</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Market Sentinel */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold">Marché analysé</span>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">85/100 GO</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Points forts :</div>
                    <ul className="text-gray-600 space-y-1 text-xs">
                      <li>• Correspond à vos zones d'intervention</li>
                      <li>• Budget adapté à votre capacité</li>
                      <li>• Critères techniques maîtrisés</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Recommandation :</div>
                    <div className="text-[#F77F00] font-semibold text-xs">📝 Répondre en priorité</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-[#F77F00] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">🎯</span>
                Inclus pour tous
              </div>
              <h3 className="text-3xl font-bold mb-4">3. Analyse intelligente du marché</h3>
              <p className="text-lg text-gray-600 mb-6">
                En 30 secondes, sachez si vous devez répondre ou passer votre chemin.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Score de pertinence</strong> automatique de 0 à 100</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Statut clair</strong> : 🟢 GO / 🟡 Conditionnel / 🔴 NO-GO</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Analyse complète</strong> expliquant pourquoi répondre ou pas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Estimation du niveau de concurrence</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Analyse des pièces */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-sm font-semibold text-gray-700 mb-4">📄 Analyse DCE</div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="bg-gray-50 p-2 rounded">✓ Méthodologie : 40% du score</div>
                  <div className="bg-gray-50 p-2 rounded">✓ Moyens techniques : 30%</div>
                  <div className="bg-gray-50 p-2 rounded">✓ Prix : 30%</div>
                  <div className="bg-yellow-50 p-2 rounded border border-yellow-200">⚠️ Clause pénalités page 47</div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">📄</span>
                Inclus dans tous les plans
              </div>
              <h3 className="text-3xl font-bold mb-4">4. Analyse des pièces et stratégie</h3>
              <p className="text-lg text-gray-600 mb-6">
                Votre assistant lit le DCE de 200 pages et vous dit l'essentiel en 2 minutes.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Extraction des critères</strong> de notation et pondération</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Identification des points</strong> de vigilance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Détection des incohérences</strong> dans le DCE/BPU</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Stratégie optimale pour maximiser votre score</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Vérifications juridiques */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">⚖️</span>
                Inclus dans tous les plans
              </div>
              <h3 className="text-3xl font-bold mb-4">5. Vérifications juridiques automatiques</h3>
              <p className="text-lg text-gray-600 mb-6">
                Conformité garantie avec le droit des marchés publics et le Code de la commande publique.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Conformité Code commande publique</strong> française</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Détection des clauses</strong> illégales ou ambiguës</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Alerte obligations légales</strong> spécifiques</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Conseil sur les recours possibles</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4 text-center">⚖️</div>
                <div className="text-center text-gray-700 font-semibold mb-4">Analyse juridique</div>
                <div className="space-y-2 text-xs">
                  <div className="bg-green-50 p-2 rounded border border-green-200">
                    ✅ Conformité générale OK
                  </div>
                  <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                    ⚠️ Délai court : 21 jours (légal mais serré)
                  </div>
                  <div className="bg-green-50 p-2 rounded border border-green-200">
                    ✅ Critères de notation conformes
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Génération Mémoires */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-sm font-semibold text-gray-700 mb-4">Mémoire technique généré</div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="bg-gray-50 p-2 rounded">1. Présentation entreprise ✓</div>
                  <div className="bg-gray-50 p-2 rounded">2. Moyens humains ✓</div>
                  <div className="bg-gray-50 p-2 rounded">3. Moyens matériels ✓</div>
                  <div className="bg-gray-50 p-2 rounded">4. Méthodologie ✓</div>
                  <div className="bg-gray-50 p-2 rounded">5. Démarche QSE ✓</div>
                  <div className="bg-gray-50 p-2 rounded">6. Planning prévisionnel ✓</div>
                </div>
                <div className="mt-4 text-center">
                  <span className="text-green-600 font-semibold text-sm">✓ Prêt en 15 minutes</span>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">📝</span>
                Inclus dans tous les plans
              </div>
              <h3 className="text-3xl font-bold mb-4">6. Génération automatique mémoires techniques</h3>
              <p className="text-lg text-gray-600 mb-6">
                De la page blanche à un mémoire complet en 15 minutes. Économisez 10 à 20h de travail par dossier.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Génération intelligente</strong> à partir du DCE et vos infos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Structure complète</strong> : présentation, moyens, méthodologie, QSE</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Argumentaire adapté</strong> aux critères de notation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Export Word / PDF</strong> en un clic</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Personnalisation complète</strong> selon vos besoins</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Génération BPU */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">💰</span>
                Inclus dans tous les plans
              </div>
              <h3 className="text-3xl font-bold mb-4">7. Génération automatique du BPU</h3>
              <p className="text-lg text-gray-600 mb-6">
                Le BPU calculé et vérifié automatiquement. Fini les erreurs qui coûtent des milliers d'euros.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Génération automatique</strong> à partir du DCE</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Calcul selon vos coûts</strong> et marges habituels</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Détection d'incohérences</strong> (quantités, unités)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Export Excel compatible plateformes de dématérialisation</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4 text-center">💰</div>
                <div className="text-center text-gray-700 font-semibold mb-4">BPU généré</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between bg-gray-50 p-2 rounded">
                    <span>Lignes traitées</span>
                    <span className="font-bold">234/234</span>
                  </div>
                  <div className="flex justify-between bg-green-50 p-2 rounded">
                    <span>Vérifications</span>
                    <span className="font-bold text-green-600">✓ OK</span>
                  </div>
                  <div className="flex justify-between bg-yellow-50 p-2 rounded border border-yellow-200">
                    <span>Alertes</span>
                    <span className="font-bold text-yellow-600">⚠️ 2 points</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coffre-fort */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4 text-center">🔐</div>
                <div className="text-center text-gray-700 font-semibold mb-4">Mes documents</div>
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="bg-gray-50 p-2 rounded flex justify-between">
                    <span>📄 Kbis</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded flex justify-between">
                    <span>📄 Assurance RCD</span>
                    <span className="text-yellow-600">⚠️ Expire 30j</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded flex justify-between">
                    <span>📄 Attestations fiscales</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded flex justify-between">
                    <span>📄 Certifications ISO</span>
                    <span className="text-green-600">✓</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">🔐</span>
                Inclus dans tous les plans
              </div>
              <h3 className="text-3xl font-bold mb-4">8. Coffre-fort numérique sécurisé</h3>
              <p className="text-lg text-gray-600 mb-6">
                Tous vos documents administratifs centralisés, sécurisés et réutilisables automatiquement.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Stockage chiffré</strong> Kbis, attestations, certifications...</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Accès instantané</strong> depuis n'importe où</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Alertes d'expiration</strong> 30 jours avant</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Insertion automatique dans vos dossiers</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Référencement collectivités */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">🏛️</span>
                Inclus dans tous les plans
              </div>
              <h3 className="text-3xl font-bold mb-4">9. Référencement auprès des collectivités</h3>
              <p className="text-lg text-gray-600 mb-6">
                Augmentez votre visibilité auprès des acheteurs publics réunionnais et recevez des consultations directes.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Profil entreprise visible</strong> par les collectivités du 974</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Catalogue compétences</strong> : domaines, certifications, références</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Notifications de sourcing</strong> quand une collectivité cherche votre profil</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Mise en avant automatique</strong> sur les marchés correspondants</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Accès direct aux acheteurs publics locaux</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4 text-center">🏛️</div>
                <div className="text-center text-gray-700 font-semibold mb-4">Votre profil entreprise</div>
                <div className="space-y-3 text-xs text-gray-700">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="font-semibold mb-1">Visible par :</div>
                    <div className="text-gray-600">
                      • CINOR, TCO, CIREST, CIVIS, CASUD<br/>
                      • 24 communes du 974<br/>
                      • Région et Département
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="font-semibold mb-1">Vos avantages :</div>
                    <div className="text-gray-600">
                      ✓ Être trouvé par les collectivités<br/>
                      ✓ Recevoir des consultations ciblées<br/>
                      ✓ Augmenter votre notoriété locale
                    </div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="font-semibold text-[#F77F00]">🎯 Sourcing actif</div>
                    <div className="text-gray-600 mt-1">Les collectivités cherchent activement des prestataires qualifiés</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* PAIN POINTS */}
      <Section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Le problème aujourd'hui
          </h2>
          <p className="text-xl text-gray-600">
            Ces obstacles qui vous empêchent de répondre à plus de marchés
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">😤</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">La paperasse vous épuise</h3>
            <p className="text-gray-600">
              Vous passez vos soirées et weekends à remplir des formulaires administratifs au lieu de vous concentrer sur votre métier et votre famille.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💸</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Vous perdez de l'argent</h3>
            <p className="text-gray-600">
              Chaque appel d'offres raté, c'est du CA qui part chez la concurrence. Et vous savez que vous auriez pu faire mieux.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">⏰</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">Le temps vous manque</h3>
            <p className="text-gray-600">
              Entre gérer vos chantiers actuels et prospecter de nouveaux marchés, vous ne savez plus où donner de la tête.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">😰</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">L'incertitude vous freine</h3>
            <p className="text-gray-600">
              Vous hésitez à répondre : est-ce que ça vaut le coup ? Est-ce que je vais y arriver ? Et si je rate encore ?
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-2xl font-semibold text-gray-900 mb-6">
            Et si tout devenait plus simple ?
          </p>
          <Button
            onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
            variant="primary"
            className="text-lg"
          >
            Voir la solution
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </Section>

      {/* SOLUTION - CHOOSE YOUR PATH */}
      <Section id="solutions" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Une solution pensée pour vous
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Le Marché Public.fr s'adapte à votre profil et vos besoins. Quelle est votre situation ?
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* ARTISANS */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-transparent hover:border-[#F77F00] transition-all hover:shadow-2xl transform hover:-translate-y-2 duration-300">
            <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Hammer className="w-8 h-8 text-[#F77F00]" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Artisans & TPE</h3>
            <p className="text-gray-600 mb-6">
              Vous êtes artisan, chef d'une petite équipe ? Vous voulez des marchés publics sans la galère administrative ?
            </p>
            <ul className="space-y-3 mb-8 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Interface ultra-simple, aucune compétence technique</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>L'assistant numérique remplit les formulaires à votre place</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Premiers marchés décrocheés en 48h</span>
              </li>
            </ul>
            <Button
              onClick={() => {
                trackClick('home', 'navigation', 'artisans_landing');
                navigate('/landing/artisans');
              }}
              variant="primary"
              className="w-full"
            >
              💪 Solution Artisans
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* BTP */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-transparent hover:border-[#F77F00] transition-all hover:shadow-2xl transform hover:-translate-y-2 duration-300">
            <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <HardHat className="w-8 h-8 text-[#F77F00]" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Entreprises BTP</h3>
            <p className="text-gray-600 mb-6">
              Vous gérez des chantiers, des équipes, des devis ? Vous voulez multiplier vos appels d'offres gagnants ?
            </p>
            <ul className="space-y-3 mb-8 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Mémoires techniques générés automatiquement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Bibliothèque de plans et documents réutilisables</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>+40% de taux de réussite constaté</span>
              </li>
            </ul>
            <Button
              onClick={() => {
                trackClick('home', 'navigation', 'btp_landing');
                navigate('/landing/btp');
              }}
              variant="primary"
              className="w-full"
            >
              🏗️ Solution BTP
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* PME */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-transparent hover:border-[#F77F00] transition-all hover:shadow-2xl transform hover:-translate-y-2 duration-300">
            <div className="bg-orange-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Building2 className="w-8 h-8 text-[#F77F00]" />
            </div>
            <h3 className="text-2xl font-bold mb-4">PME & Dirigeants</h3>
            <p className="text-gray-600 mb-6">
              Vous dirigez une PME ? Vous voulez une stratégie gagnante sur les marchés publics avec un ROI mesurable ?
            </p>
            <ul className="space-y-3 mb-8 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Analyse stratégique de chaque opportunité</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Collaboration équipe + assistant numérique pour maximiser vos chances</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>ROI mesurable dès le premier mois</span>
              </li>
            </ul>
            <Button
              onClick={() => {
                trackClick('home', 'navigation', 'pme_landing');
                navigate('/landing/pme');
              }}
              variant="primary"
              className="w-full"
            >
              📊 Solution PME
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* TRANSFORMATION PROMISE */}
      <Section className="py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
              Imaginez votre quotidien dans 30 jours
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-red-600">❌ Avant</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">•</span>
                  <span className="text-gray-700">Vous passez vos soirées sur la paperasse</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">•</span>
                  <span className="text-gray-700">Vous hésitez à répondre aux appels d'offres</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">•</span>
                  <span className="text-gray-700">Votre taux de réussite stagne à 10-15%</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">•</span>
                  <span className="text-gray-700">Vous laissez passer des opportunités</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">•</span>
                  <span className="text-gray-700">Le stress et la frustration s'accumulent</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-bold mb-6 text-green-600">✅ Après</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Vous répondez en quelques heures au lieu de jours</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Vous candidatez à 3x plus d'appels d'offres</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Votre taux de réussite grimpe à +30%</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Vous développez votre CA sereinement</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-gray-700">Vous retrouvez du temps pour votre métier</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* SOCIAL PROOF */}
      <Section className="py-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ils ont franchi le pas
          </h2>
          <p className="text-xl text-gray-600">
            Et ne regrettent pas leur décision
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#F77F00] text-xl">★</span>
              ))}
            </div>
            <p className="text-gray-700 mb-4 italic">
              "J'ai remporté 3 marchés en 2 mois. Avant, je passais des semaines sur les dossiers. Maintenant, c'est réglé en quelques heures."
            </p>
            <p className="font-semibold text-gray-900">Marc D.</p>
            <p className="text-sm text-gray-500">Électricien, 8 salariés - La Réunion</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#F77F00] text-xl">★</span>
              ))}
            </div>
            <p className="text-gray-700 mb-4 italic">
              "Le ROI est incroyable. On a multiplié par 2 notre CA sur les marchés publics en 6 mois. Et on a enfin du temps pour nos équipes."
            </p>
            <p className="font-semibold text-gray-900">Sophie L.</p>
            <p className="text-sm text-gray-500">Dirigeante PME BTP, 45 salariés - Mayotte</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-[#F77F00] text-xl">★</span>
              ))}
            </div>
            <p className="text-gray-700 mb-4 italic">
              "Franchement, je ne pensais pas que c'était possible. Fini les nuits blanches à remplir des formulaires. Je recommande à tous mes confrères."
            </p>
            <p className="font-semibold text-gray-900">Jean-Pierre M.</p>
            <p className="text-sm text-gray-500">Maçon indépendant - La Réunion</p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-6 py-3 rounded-xl border border-green-200">
            <span className="text-2xl">🏆</span>
            <div className="text-left">
              <div className="font-bold">Plus de 150 marchés remportés</div>
              <div className="text-sm">par nos utilisateurs en 2024</div>
            </div>
          </div>
        </div>
      </Section>

      {/* PRICING */}
      <Section id="tarifs" className="py-20 bg-white">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="text-xl">🎁</span>
            7 jours d'essai gratuit - Sans carte bancaire
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Tarifs Simples, Fonctionnalités Illimitées
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            <strong>Accès illimité</strong> à la veille 974, l'analyse GO/NO-GO, l'assistant IA, le référencement collectivités et bien plus
          </p>
          <p className="text-lg text-gray-500">
            Seul le nombre de <strong>mémoires techniques générées automatiquement</strong> varie selon votre plan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {/* ESSAI GRATUIT */}
          <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl">
            <div className="text-center mb-4">
              <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
                DÉCOUVERTE
              </div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">0€</div>
              <div className="text-gray-500 text-xs mb-3">7 jours d'essai</div>
              <div className="text-lg font-bold">Plan ESSAI</div>
            </div>
            <ul className="space-y-2 mb-6 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🔎 <strong>Veille marchés 974 illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🎯 <strong>Analyse GO/NO-GO illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🤖 <strong>Assistant IA illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🏛️ <strong>Référencement collectivités illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>📂 <strong>Coffre-fort numérique illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>📨 <strong>Export Word / PDF illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🔍 <strong>Recherche BOAMP illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5 flex-shrink-0">✗</span>
                <span className="text-gray-500">🧠 Mémoires techniques non disponibles</span>
              </li>
            </ul>
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'pricing_trial');
                navigate('/capture-lead');
              }}
              variant="outline"
              className="w-full text-sm py-2"
            >
              Démarrer l'essai gratuit
            </Button>
          </div>

          {/* BRONZE */}
          <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-xl">
            <div className="text-center mb-4">
              <div className="text-4xl font-extrabold text-gray-900 mb-1">199€</div>
              <div className="text-gray-500 text-xs mb-3">HT / mois</div>
              <div className="text-lg font-bold">Plan BRONZE</div>
            </div>
            <ul className="space-y-2 mb-6 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🔎 <strong>Veille marchés 974 illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🎯 <strong>Analyse GO/NO-GO illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🤖 <strong>Assistant IA illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🏛️ <strong>Référencement collectivités illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>📂 <strong>Coffre-fort numérique illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>📨 <strong>Export Word / PDF illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🔍 <strong>Recherche BOAMP illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-0.5 flex-shrink-0">★</span>
                <span className="font-bold text-orange-600">🧠 1 mémoire technique IA / mois</span>
              </li>
            </ul>
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'pricing_bronze');
                navigate('/capture-lead');
              }}
              variant="outline"
              className="w-full text-sm py-2"
            >
              Choisir BRONZE
            </Button>
          </div>

          {/* ARGENT - RECOMMANDÉ */}
          <div className="bg-gradient-to-br from-gray-500 to-gray-700 rounded-3xl shadow-2xl p-6 border-2 border-gray-500 transform md:scale-105 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-gray-700 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ RECOMMANDÉ
            </div>
            <div className="text-center mb-4 text-white">
              <div className="text-4xl font-extrabold mb-1">349€</div>
              <div className="text-white/80 text-xs mb-3">HT / mois</div>
              <div className="text-lg font-bold">Plan ARGENT</div>
            </div>
            <ul className="space-y-2 mb-6 text-xs text-white">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>🔎 <strong>Veille marchés 974 illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>🎯 <strong>Analyse GO/NO-GO illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>🤖 <strong>Assistant IA illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>🏛️ <strong>Référencement collectivités illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>📂 <strong>Coffre-fort numérique illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>📨 <strong>Export Word / PDF illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>🔍 <strong>Recherche BOAMP illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">★</span>
                <span className="font-bold">🧠 2 mémoires techniques IA / mois</span>
              </li>
            </ul>
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'pricing_argent');
                navigate('/capture-lead');
              }}
              variant="secondary"
              className="w-full text-sm py-2"
            >
              Choisir ARGENT
            </Button>
          </div>

          {/* OR */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl shadow-xl p-6 border-2 border-yellow-500 hover:shadow-2xl transition-all">
            <div className="text-center mb-4">
              <div className="text-4xl font-extrabold text-gray-900 mb-1">649€</div>
              <div className="text-gray-700 text-xs mb-3">HT / mois</div>
              <div className="text-lg font-bold text-gray-900">Plan OR</div>
            </div>
            <ul className="space-y-2 mb-6 text-xs text-gray-900">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>🔎 <strong>Veille marchés 974 illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>🎯 <strong>Analyse GO/NO-GO illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>🤖 <strong>Assistant IA illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>🏛️ <strong>Référencement collectivités illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>📂 <strong>Coffre-fort numérique illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>📨 <strong>Export Word / PDF illimité</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>🔍 <strong>Recherche BOAMP illimitée</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-700 mt-0.5 flex-shrink-0">★</span>
                <span className="font-bold text-yellow-900">🧠 5 mémoires techniques IA / mois</span>
              </li>
            </ul>
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'pricing_or');
                navigate('/capture-lead');
              }}
              variant="outline"
              className="w-full text-sm py-2 bg-white hover:bg-gray-50"
            >
              Choisir OR
            </Button>
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-orange-50 p-8 rounded-2xl border-2 border-orange-200">
            <h3 className="font-bold text-gray-900 mb-4 text-xl">💡 Pourquoi un tarif si accessible ?</h3>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Accès illimité à toutes les fonctionnalités :</strong> veille 974, analyse GO/NO-GO, assistant IA, recherche BOAMP, référencement collectivités, coffre-fort, exports... <strong className="text-[#F77F00]">Sans limite d'utilisation !</strong>
            </p>
            <p className="text-sm text-gray-700 mb-4">
              <strong>Seul le nombre de mémoires techniques varie</strong> selon votre plan. Vous ne payez que pour la génération automatique de vos mémoires, tout le reste est illimité.
            </p>
            <div className="bg-white p-4 rounded-xl border border-orange-300">
              <p className="text-sm text-gray-900 font-semibold mb-2">🚀 ROI immédiat</p>
              <p className="text-sm text-gray-700">
                <strong>Avant :</strong> 10-20h par mémoire, opportunités ratées, erreurs BPU<br/>
                <strong>Maintenant :</strong> 15 minutes par mémoire, aucune opportunité ratée 974, BPU sécurisé
              </p>
              <p className="text-xs text-[#F77F00] mt-3 font-bold">
                Un seul marché gagné rembourse des mois d'abonnement
              </p>
            </div>
          </div>
        </div>

        {/* REASSURANCE BADGES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md text-center border border-gray-100">
            <div className="text-3xl mb-3">🔒</div>
            <div className="font-bold text-gray-900 mb-2">Données sécurisées</div>
            <div className="text-sm text-gray-600">Hébergement français conforme RGPD</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center border border-gray-100">
            <div className="text-3xl mb-3">✓</div>
            <div className="font-bold text-gray-900 mb-2">Sans engagement</div>
            <div className="text-sm text-gray-600">Résiliable à tout moment en 1 clic</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center border border-gray-100">
            <div className="text-3xl mb-3">💳</div>
            <div className="font-bold text-gray-900 mb-2">7 jours gratuits</div>
            <div className="text-sm text-gray-600">Essai complet sans CB</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md text-center border border-gray-100">
            <div className="text-3xl mb-3">🎓</div>
            <div className="font-bold text-gray-900 mb-2">Formation incluse</div>
            <div className="text-sm text-gray-600">Vidéos et support pour démarrer</div>
          </div>
        </div>
      </Section>

      {/* FINAL CTA */}
      <Section className="py-20">
        <div className="bg-gradient-to-r from-[#F77F00] to-[#E06F00] rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Prêt à gagner plus de marchés publics à La Réunion ?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Plus de 500 entreprises réunionnaises ont déjà fait le choix de multiplier leurs réponses et leur taux de réussite dans le 974.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'final_trial');
                navigate('/capture-lead');
              }}
              variant="secondary"
              className="text-lg px-8 py-4"
            >
              Démarrer mes 7 jours gratuits
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/90 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Accès immédiat</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span>7 jours d'essai complet</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>Toutes les fonctionnalités incluses</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-sm">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
              <div className="font-semibold">✓ 7 jours gratuits</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
              <div className="font-semibold">✓ Sans carte bancaire</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
              <div className="font-semibold">✓ Sans engagement</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
              <div className="font-semibold">✓ Annulation en 1 clic</div>
            </div>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section className="py-20 bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Questions fréquentes
          </h2>
          <p className="text-xl text-gray-600">
            Tout ce que vous devez savoir avant de vous lancer
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-lg text-gray-900 mb-3">🎁 Comment fonctionne l'essai gratuit de 7 jours ?</h3>
            <p className="text-gray-700">Vous bénéficiez d'un accès complet à toutes les fonctionnalités pendant 7 jours pour tester la plateforme. À l'issue de cette période, vous choisissez librement si vous souhaitez continuer avec un abonnement payant.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-lg text-gray-900 mb-3">🔄 Puis-je résilier à tout moment ?</h3>
            <p className="text-gray-700">Oui, tous nos plans sont sans engagement. Vous pouvez résilier en 1 clic depuis votre espace client, à tout moment. Aucune justification n'est demandée.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-lg text-gray-900 mb-3">🔒 Mes données sont-elles sécurisées ?</h3>
            <p className="text-gray-700">Oui, vos données sont hébergées en France sur des serveurs conformes RGPD. Nous ne partageons jamais vos informations avec des tiers. Vous restez propriétaire de tous vos documents et mémoires.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-lg text-gray-900 mb-3">⏱️ Combien de temps pour générer un mémoire ?</h3>
            <p className="text-gray-700">La génération prend entre 5 et 15 minutes selon la complexité du marché. Vous recevez une notification quand c'est prêt. Vous pouvez ensuite personnaliser le mémoire à votre guise.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-lg text-gray-900 mb-3">🎓 Y a-t-il une formation pour débuter ?</h3>
            <p className="text-gray-700">Oui, nous fournissons des vidéos de formation complètes pour maîtriser l'outil rapidement. De plus, notre support est disponible pour répondre à toutes vos questions.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-lg text-gray-900 mb-3">💰 Que se passe-t-il si je n'utilise pas tous mes mémoires du mois ?</h3>
            <p className="text-gray-700">Les mémoires non utilisés ne sont pas reportés au mois suivant. Si vous avez besoin de plus de mémoires ponctuellement, vous pouvez en acheter à l'unité (299€ HT/mémoire supplémentaire).</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="font-bold text-lg text-gray-900 mb-3">🏆 Puis-je vraiment gagner plus de marchés ?</h3>
            <p className="text-gray-700">Nos 100 entreprises utilisatrices ont déjà remporté plus de 150 marchés en 2025. La clé du succès ? Répondre à plus d'appels d'offres grâce au gain de temps, avec des mémoires mieux structurés et parfaitement alignés sur les critères de notation des acheteurs publics.</p>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p className="text-gray-400">© 2025 Le Marché Public.fr - Tous droits réservés</p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a href="/cgv" className="text-gray-400 hover:text-[#F77F00] transition-colors text-sm">
                  CGV
                </a>
                <span className="text-gray-600">•</span>
                <a href="/mentions-legales" className="text-gray-400 hover:text-[#F77F00] transition-colors text-sm">
                  Mentions Légales & Confidentialité
                </a>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="mailto:contact@lemarchepublic.fr"
                className="text-gray-400 hover:text-[#F77F00] transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                contact@lemarchepublic.fr
              </a>
              <a
                href="https://www.linkedin.com/company/mmpfr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#F77F00] transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
