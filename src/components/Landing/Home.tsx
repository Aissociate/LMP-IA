import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Hammer, HardHat, Sparkles, TrendingUp, Clock, Target, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { useState, useEffect } from 'react';
import { initAnalytics, trackClick } from '../../lib/analytics';
import { MarketModelComparison } from './MarketModelComparison';

const Button = ({ children, onClick, className = "", variant = "primary" }: { children: React.ReactNode; onClick: () => void; className?: string; variant?: "primary" | "secondary" | "outline" }) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105";
  const variants = {
    primary: "bg-[#F77F00] text-white hover:bg-[#E06F00] shadow-lg hover:shadow-xl",
    secondary: "bg-white text-[#F77F00] border-2 border-[#F77F00] hover:bg-[#F77F00] hover:text-white shadow-md",
    outline: "bg-transparent text-gray-700 border-2 border-gray-300 hover:border-[#F77F00] hover:text-[#F77F00]"
  };

  return (
    <button onClick={onClick} className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Section = ({ children, className = "", id = "" }: { children: React.ReactNode; className?: string; id?: string }) => (
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
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo1.png" alt="Le Marché Public.fr" className="h-[120px] w-auto" />
          </div>
          <Button
            onClick={() => {
              trackClick('home', 'cta', 'header_demo');
              window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe';
            }}
            variant="primary"
          >
            💰 Augmenter mon CA
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <Section className="pt-20 pb-16 sm:pt-32 sm:pb-24">
        <div className="text-center">
          {/* Video Section */}
          <div className="mb-12 max-w-4xl mx-auto">
            <video
              className="w-full rounded-2xl shadow-2xl"
              controls
              autoPlay
              muted
              loop
              playsInline
            >
              <source src="https://storage.googleapis.com/msgsndr/Khh3gHoXw8rbmLrz89s4/media/6924ceb137de76697febb126.mp4" type="video/mp4" />
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>

          <div className="inline-flex items-center gap-2 bg-orange-100 text-[#F77F00] px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-4 h-4" />
            L'IA qui transforme vos réponses aux marchés publics
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="bg-gradient-to-r from-gray-900 via-[#F77F00] to-gray-900 bg-clip-text text-transparent">
              Arrêtez de perdre des marchés
            </span>
            <br />
            <span className="text-gray-900">à cause de la paperasse.</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Chaque jour, des entreprises comme la vôtre perdent des opportunités parce que répondre aux appels d'offres publics prend trop de temps, coûte trop cher, et demande trop d'énergie.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1200">
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'hero_demo');
                window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe';
              }}
              variant="primary"
              className="text-lg px-8 py-4"
            >
              🚀 Je veux gagner plus de marchés
            </Button>
            <Button
              onClick={() => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              className="text-lg px-8 py-4"
            >
              Découvrir comment
            </Button>
          </div>

          <p className="text-sm text-gray-500">
            ⚡ Réponse en 2h • 🎯 Premiers résultats sous 48h • 💼 +30% de taux de réussite en moyenne
          </p>
        </div>
      </Section>

      {/* CAROUSEL SECTION */}
      <Section className="py-16 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Découvrez l'interface
          </h2>
          <p className="text-lg text-gray-600">
            Une solution intuitive et puissante pour gagner plus de marchés
          </p>
        </div>
        <Carousel />
      </Section>

      {/* EMOTIONAL STATS */}
      <Section className="py-16 bg-gradient-to-r from-[#F77F00] to-[#E06F00] text-white -mx-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-5xl font-extrabold mb-2">73%</div>
            <p className="text-white/90 text-lg">des PME renoncent aux marchés publics</p>
            <p className="text-white/70 text-sm mt-2">Trop complexe, trop long, trop incertain</p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-900">
            <div className="text-5xl font-extrabold mb-2">120h</div>
            <p className="text-white/90 text-lg">perdues par an en moyenne</p>
            <p className="text-white/70 text-sm mt-2">À remplir des formulaires et rédiger des mémoires</p>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1100">
            <div className="text-5xl font-extrabold mb-2">48%</div>
            <p className="text-white/90 text-lg">de marchés en plus possibles</p>
            <p className="text-white/70 text-sm mt-2">Avec une vraie stratégie et les bons outils</p>
          </div>
        </div>
      </Section>

      {/* PAIN POINTS */}
      <Section className="py-20">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Vous reconnaissez-vous ?
          </h2>
          <p className="text-xl text-gray-600">
            Ces frustrations quotidiennes qui vous empêchent de développer votre activité
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
                <span>L'IA remplit les formulaires à votre place</span>
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
                <span>Collaboration équipe + IA pour maximiser vos chances</span>
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
            <p className="text-sm text-gray-500">Électricien, 8 salariés</p>
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
            <p className="text-sm text-gray-500">Dirigeante PME BTP, 45 salariés</p>
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
            <p className="text-sm text-gray-500">Maçon indépendant</p>
          </div>
        </div>
      </Section>

      {/* MARKET MODEL COMPARISON */}
      <Section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <MarketModelComparison />
      </Section>

      {/* FINAL CTA */}
      <Section className="py-20">
        <div className="bg-gradient-to-r from-[#F77F00] to-[#E06F00] rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Prêt à transformer votre activité ?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Plus de 500 entreprises ont déjà fait le choix de gagner plus de marchés et de reprendre le contrôle de leur développement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'final_demo');
                window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe';
              }}
              variant="secondary"
              className="text-lg px-8 py-4"
            >
              🚀 Obtenir ma démo personnalisée (2h)
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-sm text-white/90">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Réponse sous 2h</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span>Premiers résultats sous 48h</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>+30% de taux de réussite</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">© 2025 Le Marché Public.fr - Tous droits réservés</p>
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
