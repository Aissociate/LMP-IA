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

export const LandingPME: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "Marchés Publics PME Réunion 974 | CINOR, TCO, CIREST, Région | Le Marché Public.fr";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Gagnez les marchés publics PME à La Réunion : CINOR, TCO, CIREST, Région Réunion, communes 974. IA pour dossiers techniques optimisés.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo1.png" alt="Le Marché Public.fr" className="h-[120px] w-auto" />
          </div>
          <Button
            onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/wJUtQv8tF6XLSswJ2vf0'}
            className="bg-[#F77F00] text-white hover:bg-[#E06F00]"
          >
            💼 Optimiser mon CA
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* URGENCE BANNER */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#E06F00] py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white font-bold text-sm md:text-base">
            🎁 Places limitées pour l'accompagnement trimestriel • 1 Mémoire Technique Offert
          </p>
        </div>
      </div>

      {/* HERO SECTION */}
      <Section className="pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-[#F77F00] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="text-xl">🎁</span>
              1 mémoire offert pour commencer
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Vous répondez aux marchés publics… <span className="text-[#F77F00]">mais vos concurrents gagnent</span> ?
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Voilà pourquoi.
            </p>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-[#F77F00] p-6 rounded-xl mb-8 shadow-lg">
              <p className="text-lg font-semibold text-gray-900">
                Les PME utilisant LMP constatent en moyenne<br/>
                <span className="text-2xl text-[#F77F00] font-bold">+30% de réussite</span><br/>
                grâce à un système structuré et automatisé.
              </p>
            </div>

            <Button
              className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-lg px-8 py-4"
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/wJUtQv8tF6XLSswJ2vf0'}
            >
              👉 Je teste gratuitement
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
            La plupart des PME n'échouent pas par manque de qualité…
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-gray-700">
            Mais par <span className="text-[#F77F00]">absence de méthode</span>.
          </p>
        </div>
      </Section>

      {/* STORY SECTION */}
      <Section className="py-16 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border-l-4 border-[#F77F00]">
            <p className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
              Nos utilisateurs sont passés d'un taux de réussite imprévisible
            </p>
            <p className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
              À un système clair :
            </p>
            <p className="text-2xl md:text-3xl font-extrabold text-[#F77F00]">
              Quels marchés viser, comment optimiser, comment gagner.
            </p>
          </div>
        </div>
      </Section>

      {/* SECRET */}
      <Section className="py-16 bg-gradient-to-r from-[#F77F00] to-[#E06F00] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-white text-[#F77F00] px-6 py-3 rounded-full text-lg font-bold mb-8 shadow-lg">
            🔥 LE SECRET
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            LMP n'est pas une IA qui écrit.
          </h2>
          <p className="text-2xl md:text-3xl font-bold mb-12">
            C'est un copilote qui analyse les critères de notation<br/>et optimise chaque section.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-xl font-bold mb-2">Market Sentinel</p>
              <p className="text-sm text-white/90">Score GO/NO-GO intelligent</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-5xl mb-3">🧠</div>
              <p className="text-xl font-bold mb-2">Market Light/Pro</p>
              <p className="text-sm text-white/90">Mémoire IA avancé optimisé</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-5xl mb-3">⚡</div>
              <p className="text-xl font-bold mb-2">Assistant IA</p>
              <p className="text-sm text-white/90">Analyse des pièces en 1 clic</p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <p className="text-lg font-semibold">
              Export Word/PDF • Analyse DCE/BPU • Formations incluses
            </p>
          </div>
        </div>
      </Section>

      {/* OFFER STACK */}
      <Section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-orange-100 text-[#F77F00] px-6 py-3 rounded-full text-lg font-bold mb-6">
              🎁 OFFRE PME
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
              Aujourd'hui, vous obtenez :
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">✅</span>
                <span className="text-lg font-bold text-gray-900">1 mémoire offert</span>
              </div>
              <p className="text-sm text-gray-600">Testez sans engagement</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">📊</span>
                <span className="text-lg font-bold text-gray-900">Analyse DCE complète</span>
              </div>
              <p className="text-sm text-gray-600">Critères de notation décodés</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <span className="text-lg font-bold text-gray-900">Score GO/NO-GO illimité</span>
              </div>
              <p className="text-sm text-gray-600">Plan PME uniquement</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">👥</span>
                <span className="text-lg font-bold text-gray-900">Espace équipe</span>
              </div>
              <p className="text-sm text-gray-600">Formations + collaboration</p>
            </div>
          </div>

          <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 mb-8">
            <p className="text-lg font-semibold text-gray-900 text-center">
              📥 Export Word/PDF • ⚡ Point de contact trimestriel • 🔒 Sans CB
            </p>
          </div>

          <div className="text-center">
            <Button
              className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-lg px-10 py-5 mb-4"
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/wJUtQv8tF6XLSswJ2vf0'}
            >
              👉 Je teste gratuitement
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-base font-bold text-[#F77F00] bg-orange-100 py-2 px-6 rounded-full inline-block">
              ⏳ Places limitées pour l'accompagnement trimestriel
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
            Une solution puissante pour gagner plus de marchés PME à La Réunion
          </p>
        </div>
        <Carousel />
      </Section>

      {/* Footer CTA */}
      <Section className="py-12 bg-white border-t border-gray-200">
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
            Prêt à structurer votre méthode marchés publics ?
          </h3>
          <Button
            className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-lg px-10 py-5"
            onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/wJUtQv8tF6XLSswJ2vf0'}
          >
            👉 Je teste gratuitement
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </Section>
    </div>
  );
};
