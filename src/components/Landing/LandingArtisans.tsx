import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Button = ({ className = "", children, onClick, ...props }: any) => (
  <button
    className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

const Section = ({ id, className = "", children }: any) => (
  <section id={id} className={`w-full ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

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
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-100 group">
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

export const LandingArtisans: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "Marchés Publics Artisans Réunion 974 | CINOR, TCO, CIREST | Le Marché Public.fr";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Gagnez les marchés publics artisans à La Réunion : CINOR, TCO, CIREST, communes 974. Mémoires générés automatiquement en quelques clics.');
    }
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
            onClick={() => navigate('/capture-lead')}
            className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-xs md:text-base px-3 py-2 md:px-6 md:py-3"
          >
            <span className="hidden md:inline">Je veux gagner des marchés 974</span>
            <span className="md:hidden">Essai gratuit</span>
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </header>

      {/* URGENCE BANNER */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#E06F00] py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white font-bold text-sm md:text-base">
            🎁 OFFRE DE LANCEMENT : 1 Réponse à un Marché OFFERTE • Limitée aux 5 premiers artisans
          </p>
        </div>
      </div>

      {/* HERO SECTION */}
      <Section className="pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-[#F77F00] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="text-xl">🎁</span>
              Plus que 5 places disponibles
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Artisans Réunion : arrêtez de <span className="text-[#F77F00]">perdre du temps</span> sur les dossiers
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Générez vos mémoires techniques CINOR, TCO, CIREST en <span className="font-bold text-[#F77F00]">15 minutes chrono</span>
            </p>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-[#F77F00] p-6 rounded-xl mb-8 shadow-lg">
              <p className="text-lg font-semibold text-gray-900">
                ✓ Plus de <span className="text-[#F77F00] font-bold">500 entreprises</span><br/>
                ✓ <span className="text-[#F77F00] font-bold">2000 mémoires</span> générés<br/>
                ✓ <span className="text-[#F77F00] font-bold">+30%</span> de réussite constaté
              </p>
            </div>

            <div className="bg-gradient-to-r from-[#F77F00] to-[#E06F00] p-6 rounded-xl mb-6 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">🎁</span>
                <p className="text-xl font-bold text-white">OFFRE DE LANCEMENT</p>
              </div>
              <p className="text-lg font-semibold text-white mb-2">
                1 Réponse à un Marché Complète OFFERTE
              </p>
              <p className="text-orange-100 text-sm">
                (Valeur : 199€ HT) • Limitée aux 5 premiers artisans
              </p>
            </div>

            <Button
              className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-lg px-8 py-4"
              onClick={() => navigate('/capture-lead')}
            >
              J'obtiens mon mémoire gratuit maintenant
              <ArrowRight className="w-5 h-5" />
            </Button>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Sans CB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Résultat en 48h</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <Carousel />
          </div>
        </div>
      </Section>

      {/* BIG DOMINO */}
      <Section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            Vous êtes <span className="text-[#F77F00]">compétent</span>.
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-gray-700">
            Mais il vous manque <span className="text-[#F77F00]">une seule chose</span> : du temps.
          </p>
        </div>
      </Section>

      {/* STORY SECTION */}
      <Section className="py-16 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border-l-4 border-[#F77F00]">
            <p className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
              Certains de nos clients ont même <span className="text-[#F77F00]">arrêté de répondre aux marchés</span>
            </p>
            <p className="text-xl md:text-2xl font-semibold text-gray-700 italic mb-4">
              « parce que ça prenait trop de temps pour trop peu de résultats. »
            </p>
            <p className="text-2xl md:text-3xl font-extrabold text-[#F77F00]">
              Aujourd'hui, ils y retournent.
            </p>
          </div>
        </div>
      </Section>

      {/* SECRET */}
      <Section className="py-16 bg-gradient-to-r from-[#F77F00] to-[#E06F00] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-white text-[#F77F00] px-6 py-3 rounded-full text-lg font-bold mb-8 shadow-lg">
            ✨ LE SECRET
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Vous cliquez. Ça sort.
          </h2>
          <p className="text-2xl md:text-3xl font-bold mb-12">
            C'est aussi simple que ça.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-5xl mb-3">📝</div>
              <p className="text-xl font-bold mb-2">Vous saisissez</p>
              <p className="text-sm text-white/90">Les infos de base du marché</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-5xl mb-3">⚡</div>
              <p className="text-xl font-bold mb-2">L'assistant analyse</p>
              <p className="text-sm text-white/90">DCE, BPU et critères</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-5xl mb-3">🎁</div>
              <p className="text-xl font-bold mb-2">Vous exportez</p>
              <p className="text-sm text-white/90">Votre mémoire en Word/PDF</p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <p className="text-lg font-semibold">
              + Veille automatique • + Score GO/NO-GO • + Assistant numérique
            </p>
          </div>
        </div>
      </Section>

      {/* OFFER STACK */}
      <Section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-orange-100 text-[#F77F00] px-6 py-3 rounded-full text-lg font-bold mb-6">
              🎁 VOTRE OFFRE
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
              Aujourd'hui vous obtenez :
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✅</span>
                <span className="text-lg font-bold text-gray-900">Veille marchés automatique</span>
              </div>
              <p className="text-sm text-gray-600">Les marchés viennent à vous</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <span className="text-lg font-bold text-gray-900">Score GO/NO-GO</span>
              </div>
              <p className="text-sm text-gray-600">Décidez en 2 minutes</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🧠</span>
                <span className="text-lg font-bold text-gray-900">Génération automatique</span>
              </div>
              <p className="text-sm text-gray-600">Mémoires en quelques clics</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🤖</span>
                <span className="text-lg font-bold text-gray-900">Assistant numérique</span>
              </div>
              <p className="text-sm text-gray-600">Pose tes questions au DCE</p>
            </div>
          </div>

          <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 mb-8">
            <p className="text-lg font-semibold text-gray-900 text-center">
              📥 Export Word/PDF • ⚡ Support inclus • 🔒 Sans CB
            </p>
          </div>

          <div className="text-center">
            <Button
              className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-lg px-10 py-5 mb-4"
              onClick={() => navigate('/capture-lead')}
            >
              🎁 Je réserve ma place maintenant
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-base font-bold text-[#F77F00] bg-orange-100 py-2 px-6 rounded-full inline-block">
              ⏳ Plus que 5 places disponibles
            </p>
          </div>
        </div>
      </Section>

      {/* CAROUSEL SECTION */}
      <Section className="py-16 bg-gradient-to-b from-orange-50/30 to-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
            Découvrez l'interface
          </h2>
          <p className="text-lg text-gray-600">
            Une solution intuitive pour gagner plus de marchés artisans à La Réunion
          </p>
        </div>
        <Carousel />
      </Section>

      {/* Footer CTA */}
      <Section className="py-12 bg-white border-t border-gray-200">
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
            Prêt à répondre aux marchés publics de La Réunion en 15 minutes ?
          </h3>
          <Button
            className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-lg px-10 py-5"
            onClick={() => navigate('/capture-lead')}
          >
            Je teste gratuitement sur mon prochain marché
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </Section>
    </div>
  );
};
