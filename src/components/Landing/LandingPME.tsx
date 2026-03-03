import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEOHead } from "../SEO/SEOHead";
import { StructuredData, createServiceSchema, createBreadcrumbSchema } from "../SEO/StructuredData";
import { FAQ, pmeFAQs } from "../SEO/FAQ";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/30 to-white">
      <SEOHead
        title="Assistant IA Marchés Publics PME Réunion 974 | LeMarchéPublic.fr"
        description="Gagnez plus de marchés publics PME à La Réunion avec Iris : veille 24/7, alertes instantanées, analyse juridique, génération automatique de mémoires techniques. Essai 7 jours gratuit."
        keywords="marchés publics PME réunion, appels d'offres PME 974, assistant numérique PME, veille marchés publics, alertes BOAMP réunion, mémoire technique PME"
        canonical="https://lemarchepublic.fr/pme"
      />
      <StructuredData data={[
        createServiceSchema({
          name: "Assistant IA Marchés Publics PME La Réunion",
          description: "Plateforme IA de veille et génération de documents pour PME réunionnaises souhaitant remporter plus de marchés publics.",
          serviceType: "Logiciel SaaS - Marchés Publics PME",
          areaServed: "La Réunion 974",
          audience: "PME, TPE, petites et moyennes entreprises de La Réunion"
        }),
        createBreadcrumbSchema([
          { name: "Accueil", url: "https://lemarchepublic.fr/" },
          { name: "PME", url: "https://lemarchepublic.fr/pme" }
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
            <span className="hidden md:inline">Activer mon assistant numérique 7 jours</span>
            <span className="md:hidden">Essai 7j gratuit</span>
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </header>

      {/* URGENCE BANNER */}
      <div className="bg-gradient-to-r from-[#F77F00] to-[#E06F00] py-3">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white font-bold text-sm md:text-base">
            🎁 OFFRE PME : 7 jours d'accès complet gratuit • Sans carte bancaire
          </p>
        </div>
      </div>

      {/* HERO SECTION */}
      <Section className="pt-16 pb-12 sm:pt-20 sm:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-100 text-[#F77F00] px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <span className="text-xl">🎁</span>
              7 jours d'accès complet gratuit
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              PME : votre <span className="text-[#F77F00]">assistant numérique</span> surveille, analyse et prépare vos dossiers
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-8">
              Vous avez les compétences. Il vous manque <span className="font-bold text-[#F77F00]">une méthode structurée et automatisée</span>.
            </p>

            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-l-4 border-[#F77F00] p-6 rounded-xl mb-8 shadow-lg">
              <p className="text-lg font-semibold text-gray-900">
                Les PME qui utilisent un assistant numérique constatent en moyenne<br/>
                <span className="text-2xl text-[#F77F00] font-bold">+30% de réussite</span><br/>
                grâce à un système structuré et automatisé.
              </p>
            </div>

            <Button
              className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-lg px-8 py-4"
              onClick={() => window.open('https://lmp.bolt.host/', '_blank')}
            >
              Recruter Iris pour 7 jours gratuits
              <ArrowRight className="w-5 h-5" />
            </Button>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Sans CB</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Accès complet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>Annulez quand vous voulez</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <Carousel />
          </div>
        </div>
      </Section>

      {/* BIG PICTURE */}
      <Section className="py-16 bg-white border-y border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            La plupart des PME n'échouent pas par manque de qualité…
          </h2>
          <p className="text-2xl md:text-3xl font-bold text-gray-700">
            Mais par <span className="text-[#F77F00]">manque de méthode et d'outils</span>.
          </p>
        </div>
      </Section>

      {/* 8 FONCTIONNALITÉS */}
      <Section className="py-16 bg-gradient-to-b from-white to-orange-50/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900">
            Votre assistant numérique complet
          </h2>
          <p className="text-lg text-gray-600">
            8 fonctionnalités pour automatiser de A à Z
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📡</div>
            <h3 className="font-bold text-gray-900 mb-2">Veille 24/7</h3>
            <p className="text-sm text-gray-600">BOAMP nationale + 100% marchés Réunion 974</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="font-bold text-gray-900 mb-2">Alertes multi-canal</h3>
            <p className="text-sm text-gray-600">Mail, SMS, WhatsApp instantanés</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="font-bold text-gray-900 mb-2">Analyse marché</h3>
            <p className="text-sm text-gray-600">Score GO/NO-GO automatique</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="font-bold text-gray-900 mb-2">Analyse pièces</h3>
            <p className="text-sm text-gray-600">DCE décrypté en 2 minutes</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="font-bold text-gray-900 mb-2">Vérifications juridiques</h3>
            <p className="text-sm text-gray-600">Conformité garantie</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="font-bold text-gray-900 mb-2">Mémoires techniques</h3>
            <p className="text-sm text-gray-600">Générés en 15 minutes</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="font-bold text-gray-900 mb-2">Génération BPU</h3>
            <p className="text-sm text-gray-600">Calculé et vérifié</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="font-bold text-gray-900 mb-2">Coffre-fort</h3>
            <p className="text-sm text-gray-600">Documents sécurisés</p>
          </div>
        </div>
      </Section>

      {/* TRANSFORMATION */}
      <Section className="py-16 bg-gradient-to-r from-[#F77F00] to-[#E06F00] text-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-block bg-white text-[#F77F00] px-6 py-3 rounded-full text-lg font-bold mb-8 shadow-lg">
            🔥 LA TRANSFORMATION
          </div>

          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            De la réactivité… à l'anticipation
          </h2>
          <p className="text-2xl md:text-3xl font-bold mb-12">
            Votre assistant surveille, analyse, alerte et prépare.<br/>Vous validez et gagnez.
          </p>

          <div className="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-white/20">
            <p className="text-lg font-semibold">
              Système complet • Données sécurisées • Support inclus
            </p>
          </div>
        </div>
      </Section>

      <FAQ items={pmeFAQs} title="Questions Fréquentes - Marchés Publics PME Réunion" />

      {/* CTA FINAL */}
      <Section className="py-16 bg-white">
        <div className="text-center max-w-4xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">
            Prêt à automatiser votre veille et génération de dossiers ?
          </h3>
          <Button
            className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-lg px-10 py-5 mb-6"
            onClick={() => window.open('https://lmp.bolt.host/', '_blank')}
          >
            Je teste l'assistant complet 7 jours
            <ArrowRight className="w-5 h-5" />
          </Button>
          <p className="text-gray-600">Sans carte bancaire • Annulez quand vous voulez</p>
        </div>
      </Section>
    </div>
  );
};
