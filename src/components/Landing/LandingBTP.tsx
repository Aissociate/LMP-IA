import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "../SEO/SEOHead";
import { StructuredData, createServiceSchema, createBreadcrumbSchema } from "../SEO/StructuredData";
import { FAQ, btpFAQs } from "../SEO/FAQ";

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

export const LandingBTP: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
      <SEOHead
        title="Marchés Publics BTP Réunion 974 | CINOR, TCO, CIREST | LeMarchéPublic.fr"
        description="Remportez les marchés publics BTP à La Réunion : CINOR, TCO, CIREST, Région, communes 974. Iris génère vos mémoires techniques et BPU automatiquement. Essai 7 jours gratuit."
        keywords="marchés publics BTP réunion, appels d'offres BTP 974, mémoire technique BTP, BPU BTP réunion, CINOR marchés, TCO marchés, CIREST marchés, travaux réunion"
        canonical="https://lemarchepublic.fr/btp"
      />
      <StructuredData data={[
        createServiceSchema({
          name: "Assistant IA Marchés Publics BTP La Réunion",
          description: "Génération automatique de mémoires techniques et BPU pour entreprises BTP réunionnaises. Veille 24/7 des appels d'offres BOAMP secteur BTP.",
          serviceType: "Logiciel SaaS - Marchés Publics BTP",
          areaServed: "La Réunion 974",
          audience: "Entreprises BTP, constructeurs, artisans du bâtiment"
        }),
        createBreadcrumbSchema([
          { name: "Accueil", url: "https://lemarchepublic.fr/" },
          { name: "BTP", url: "https://lemarchepublic.fr/btp" }
        ])
      ]} />
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-2">
          <div className="flex items-center flex-shrink-0">
            <img src="/image.png" alt="Le Marché Public.fr" className="h-16 md:h-24 lg:h-[120px] w-auto object-contain" />
          </div>
          <Button
            onClick={() => window.open('https://lmp.bolt.host/', '_blank')}
            className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-xs md:text-base px-3 py-2 md:px-6 md:py-3"
          >
            <span className="hidden md:inline">Générer mon 1er dossier technique</span>
            <span className="md:hidden">Démarrer</span>
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </header>

      {/* URGENCE BANNER */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#E06F00] py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white font-bold text-sm md:text-base">
            🔥 OFFRE RÉSERVÉE AUX NOUVEAUX UTILISATEURS BTP • Accès prioritaire
          </p>
        </div>
      </div>

      {/* HERO SECTION */}
      <Section className="pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <img
                src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Iris - Assistante experte BTP"
                className="w-20 h-20 rounded-full object-cover border-4 border-amber-400 shadow-lg"
              />
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-[#1e3a5f] px-4 py-2 rounded-full text-sm font-bold">
                <span className="text-xl">🚧</span>
                Iris - Spécialiste Marchés BTP
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              <span className="bg-gradient-to-r from-[#1e3a5f] to-[#2a5a8f] bg-clip-text text-transparent">Iris analyse vos DCE</span> et rédige vos <span className="text-amber-500">mémoires techniques</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Pendant que vous êtes sur vos chantiers, <span className="font-bold text-[#1e3a5f]">Iris travaille pour vous :</span> veille 24/7, analyse des critères, rédaction structurée.
            </p>

            <div className="bg-gradient-to-r from-[#1e3a5f]/10 to-[#2a5a8f]/10 border-l-4 border-amber-500 p-6 rounded-xl mb-8 shadow-lg">
              <p className="text-lg font-semibold text-gray-900">
                "Iris détecte tous les marchés de la Région, du Département et des 24 communes. Je calcule votre score de réussite avant même que vous ne perdiez du temps."
              </p>
              <p className="text-sm text-gray-600 mt-2 font-medium">— Iris, votre assistante marchés publics</p>
            </div>

            <Button
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-[#1e3a5f] text-lg px-8 py-4 font-bold"
              onClick={() => window.open('https://lmp.bolt.host/', '_blank')}
            >
              Démarrer mon test gratuit avec Iris
              <ArrowRight className="w-5 h-5" />
            </Button>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">✓</span>
                <span>Zéro logiciel à installer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-500 font-bold">✓</span>
                <span>Alertes WhatsApp</span>
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
            Dans le BTP, le gagnant n'est pas le moins cher.
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-gray-700">
            C'est celui qui coche le plus de <span className="text-[#F77F00]">critères de notation</span>.
          </p>
        </div>
      </Section>

      {/* STORY SECTION */}
      <Section className="py-16 bg-gradient-to-b from-white to-orange-50/30">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-xl border-l-4 border-[#F77F00]">
            <p className="text-xl md:text-2xl font-bold text-gray-900 mb-4 leading-relaxed">
              Nos clients BTP nous disent tous la même chose :
            </p>
            <p className="text-xl md:text-2xl font-semibold text-gray-700 italic mb-4">
              « Ils faisaient de super chantiers… mais des dossiers moyens. »
            </p>
            <p className="text-2xl md:text-3xl font-extrabold text-[#F77F00]">
              LMP a inversé l'équation.
            </p>
          </div>
        </div>
      </Section>

      {/* SECRET */}
      <Section className="py-16 bg-gradient-to-r from-[#F77F00] to-[#E06F00] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-white text-[#F77F00] px-6 py-3 rounded-full text-lg font-bold mb-8 shadow-lg">
            🚧 IMPACT IMMÉDIAT
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Notre assistant numérique lit vos pièces, détecte les incohérences (BPU compris)
          </h2>
          <p className="text-2xl md:text-3xl font-bold mb-12">
            et génère un mémoire calibré pour gagner.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-5xl mb-3">❌</div>
              <p className="text-xl font-bold mb-2">Repère les oublis</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-5xl mb-3">⚠️</div>
              <p className="text-xl font-bold mb-2">Détecte les erreurs</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-xl font-bold mb-2">Identifie les points faibles</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl border border-white/20">
              <div className="text-5xl mb-3">🛡️</div>
              <p className="text-xl font-bold mb-2">Prévient les non-conformités</p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <p className="text-lg font-semibold">
              Analyse DCE + BPU • Cohérence garantie • Export Word/PDF
            </p>
          </div>
        </div>
      </Section>

      {/* OFFER STACK */}
      <Section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-orange-100 text-[#F77F00] px-6 py-3 rounded-full text-lg font-bold mb-6">
              🎁 AVEC VOTRE ACCÈS
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
              Tout ce dont vous avez besoin :
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
                <span className="text-lg font-bold text-gray-900">Analyse DCE + BPU</span>
              </div>
              <p className="text-sm text-gray-600">Détection des incohérences</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎯</span>
                <span className="text-lg font-bold text-gray-900">Score GO/NO-GO intelligent</span>
              </div>
              <p className="text-sm text-gray-600">Sachez si vous devez candidater</p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl shadow-md border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">🎓</span>
                <span className="text-lg font-bold text-gray-900">Support + formations</span>
              </div>
              <p className="text-sm text-gray-600">Accompagnement complet inclus</p>
            </div>
          </div>

          <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 mb-8">
            <p className="text-lg font-semibold text-gray-900 text-center">
              📥 Export Word/PDF • ⚡ Résultat en 48h • 🔒 Sans CB
            </p>
          </div>

          <div className="text-center">
            <Button
              className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-lg px-10 py-5 mb-4"
              onClick={() => window.open('https://lmp.bolt.host/', '_blank')}
            >
              Laisser Iris rédiger mon premier mémoire
              <ArrowRight className="w-5 h-5" />
            </Button>
            <p className="text-base font-bold text-[#F77F00] bg-orange-100 py-2 px-6 rounded-full inline-block">
              🔥 Accès prioritaire aux nouvelles entreprises BTP
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
            Une solution puissante pour gagner plus de marchés BTP à La Réunion (974)
          </p>
        </div>
        <Carousel />
      </Section>

      <FAQ items={btpFAQs} title="Questions Fréquentes - Marchés Publics BTP Réunion" />

      {/* Footer CTA */}
      <Section className="py-12 bg-white border-t border-gray-200">
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-6">
            Prêt à gagner des points sur vos prochains marchés BTP ?
          </h3>
          <Button
            className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-lg px-10 py-5"
            onClick={() => window.open('https://lmp.bolt.host/', '_blank')}
          >
            Recruter Iris pour mon prochain marché
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </Section>
    </div>
  );
};
