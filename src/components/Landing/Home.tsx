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
          <div className="inline-flex items-center gap-2 bg-orange-100 text-[#F77F00] px-4 py-2 rounded-full text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Sparkles className="w-4 h-4" />
            Votre copilote IA pour gagner du temps ET des marchés publics
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="bg-gradient-to-r from-gray-900 via-[#F77F00] to-gray-900 bg-clip-text text-transparent">
              Ne partez plus jamais de zéro
            </span>
            <br />
            <span className="text-gray-900">sur vos mémoires techniques</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            LeMarchéPublic.fr combine veille intelligente, score GO/NO-GO, génération automatique de mémoires et assistant IA pour vos marchés et BPU.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-12 text-left">
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl mb-2">🔍</div>
              <div className="text-sm font-semibold text-gray-900">Veille marchés</div>
              <div className="text-xs text-gray-600">Les marchés viennent à vous</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl mb-2">🎯</div>
              <div className="text-sm font-semibold text-gray-900">Score GO/NO-GO</div>
              <div className="text-xs text-gray-600">Décidez vite et bien</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl mb-2">🧠</div>
              <div className="text-sm font-semibold text-gray-900">Mémoires IA</div>
              <div className="text-xs text-gray-600">Générés en quelques clics</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md">
              <div className="text-2xl mb-2">🤖</div>
              <div className="text-sm font-semibold text-gray-900">Assistant IA</div>
              <div className="text-xs text-gray-600">Interrogez DCE & BPU</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1200">
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'hero_demo');
                window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe';
              }}
              variant="primary"
              className="text-lg px-8 py-4"
            >
              🎁 Tester gratuitement - 1 mémoire offert
            </Button>
            <Button
              onClick={() => document.getElementById('fonctionnalites')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              className="text-lg px-8 py-4"
            >
              Voir les fonctionnalités
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 items-center">
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Résultats en 48h</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Résiliable à tout moment</span>
            </div>
          </div>
        </div>
      </Section>

      {/* TRUST INDICATORS */}
      <Section className="py-12 bg-white border-y border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[#F77F00] mb-2">500+</div>
            <div className="text-sm text-gray-600">Entreprises utilisatrices</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F77F00] mb-2">2000+</div>
            <div className="text-sm text-gray-600">Mémoires générés</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F77F00] mb-2">+30%</div>
            <div className="text-sm text-gray-600">Taux de réussite moyen</div>
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
            Découvrez l'interface
          </h2>
          <p className="text-lg text-gray-600">
            Une solution intuitive et puissante pour gagner plus de marchés
          </p>
        </div>
        <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-2xl bg-black">
          <video
            controls
            autoPlay
            muted
            loop
            playsInline
            className="w-full aspect-video"
            style={{ minHeight: '400px' }}
          >
            <source src="https://storage.googleapis.com/msgsndr/Khh3gHoXw8rbmLrz89s4/media/6926384f76cd823d57d4746d.mp4" type="video/mp4" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        </div>
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

      {/* FONCTIONNALITÉS DÉTAILLÉES */}
      <Section id="fonctionnalites" className="py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Un système complet pour vos marchés publics
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            4 outils puissants qui travaillent ensemble pour vous faire gagner du temps et des marchés
          </p>
        </div>

        <div className="space-y-16 max-w-6xl mx-auto">
          {/* Veille Marchés */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">🔍</span>
                Inclus dans tous les plans
              </div>
              <h3 className="text-3xl font-bold mb-4">1. Veille marchés intégrée</h3>
              <p className="text-lg text-gray-600 mb-6">
                Vous ne cherchez plus les marchés : ils viennent à vous.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Paramétrage par secteur, zone géographique et type de marché</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Liste de marchés détectés directement dans votre espace</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Actualisation continue en temps réel</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-4xl mb-4 text-center">🔍</div>
                <div className="text-center text-gray-700 font-semibold">Veille automatique</div>
                <div className="mt-4 space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Marchés détectés</span>
                    <span className="font-bold text-green-600">24 nouveaux</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Zone</span>
                    <span className="font-bold">Réunion (974)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Secteur</span>
                    <span className="font-bold">BTP / Travaux</span>
                  </div>
                </div>
              </div>
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
              <h3 className="text-3xl font-bold mb-4">2. Score GO / NO-GO avec Market Sentinel</h3>
              <p className="text-lg text-gray-600 mb-6">
                Décidez vite avant d'y passer des heures.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Score de pertinence</strong> de 0 à 100 pour chaque marché</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Statut clair</strong> : 🟢 GO / 🟡 Conditionnel / 🔴 NO-GO</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700"><strong>Analyse IA</strong> expliquant pourquoi répondre ou pas</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Mémoires IA */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">🧠</span>
                Market Light & Market Pro
              </div>
              <h3 className="text-3xl font-bold mb-4">3. Génération de mémoires techniques</h3>
              <p className="text-lg text-gray-600 mb-6">
                L'IA qui vous évite la page blanche et structure votre réponse.
              </p>
              <div className="space-y-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="font-bold text-blue-900 mb-2">🔹 Market Light (inclus)</div>
                  <p className="text-sm text-gray-700">Brouillon structuré généré automatiquement à partir du DCE et de vos infos. Parfait pour gagner du temps.</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="font-bold text-purple-900 mb-2">🔸 Market Pro (+99€/mois)</div>
                  <p className="text-sm text-gray-700">Version avancée avec argumentaire poussé, exploitation fine des critères de notation, style percutant orienté "score".</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Sections standard pré-remplies (présentation, moyens, méthodologie, QSE...)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Export Word / PDF en un clic</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl">
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
                  <span className="text-green-600 font-semibold text-sm">✓ Prêt à être personnalisé</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assistant IA */}
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="text-sm font-semibold text-gray-700 mb-4">💬 Assistant IA</div>
                <div className="space-y-3 text-xs">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="font-semibold text-gray-900 mb-1">Vous :</div>
                    <div className="text-gray-600">"Quels sont les critères les plus pondérés ?"</div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="font-semibold text-blue-900 mb-1">IA :</div>
                    <div className="text-gray-700">"Les critères principaux sont : méthodologie (40%), moyens techniques (30%), prix (30%)"</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                <span className="text-xl">🤖</span>
                Inclus dans tous les plans
              </div>
              <h3 className="text-3xl font-bold mb-4">4. Assistant IA Marchés & BPU</h3>
              <p className="text-lg text-gray-600 mb-6">
                Posez vos questions comme à un collaborateur expert.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Interrogez le DCE, les pièces du marché, la grille de notation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Analysez les lignes du BPU, détectez les incohérences</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  <span className="text-gray-700">Gagnez du temps sur la compréhension et la vérification</span>
                </li>
              </ul>
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
            1 mémoire IA offert pour commencer
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Nos abonnements
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Tous nos plans incluent <strong>veille marchés, GO/NO-GO et assistant IA</strong>
          </p>
          <p className="text-lg text-gray-500">
            Vous choisissez simplement combien de mémoires IA vous voulez par mois
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          {/* SOLO */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-200 hover:border-[#F77F00] transition-all hover:shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-4xl font-extrabold text-gray-900 mb-2">199€</div>
              <div className="text-gray-500 text-sm">HT / mois</div>
              <div className="text-xl font-bold mt-4">Plan SOLO</div>
              <div className="text-sm text-gray-600">1 Marché / Mois</div>
            </div>
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>🔎 Veille marchés incluse</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>🎯 Score GO/NO-GO</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>🤖 Assistant IA Marchés & BPU</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>🧠 1 mémoire Market Light / mois</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>📂 Espace client & historique</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>🎓 Formations vidéo</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>📨 Export Word / PDF</span>
              </li>
            </ul>
            <div className="text-xs text-gray-500 mb-4 space-y-1">
              <div>⚙️ Market Pro : +99€/mois</div>
              <div>💼 Booster Expert 4h : +590€/mémoire</div>
            </div>
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'pricing_solo');
                window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe';
              }}
              variant="outline"
              className="w-full"
            >
              Commencer
            </Button>
          </div>

          {/* PME - RECOMMANDÉ */}
          <div className="bg-gradient-to-br from-[#F77F00] to-[#E06F00] rounded-3xl shadow-2xl p-8 border-2 border-[#F77F00] transform scale-105 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-[#F77F00] px-4 py-1 rounded-full text-sm font-bold shadow-lg">
              ⭐ Recommandé
            </div>
            <div className="text-center mb-6 text-white">
              <div className="text-4xl font-extrabold mb-2">349€</div>
              <div className="text-white/80 text-sm">HT / mois</div>
              <div className="text-xl font-bold mt-4">Plan PME</div>
              <div className="text-sm text-white/90">2 Marchés / Mois</div>
            </div>
            <ul className="space-y-3 mb-8 text-sm text-white">
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>🔎 Veille marchés incluse</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>🎯 GO/NO-GO illimité</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>🤖 Assistant IA Marchés & BPU</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>🧠 2 mémoires Market Light / mois</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>📊 Espace client complet</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>🚀 Priorité de génération vs SOLO</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5">✓</span>
                <span>📞 1 point de contact trimestriel</span>
              </li>
            </ul>
            <div className="text-xs text-white/70 mb-4 space-y-1">
              <div>⚙️ Market Pro : +99€/mois</div>
              <div>💼 Booster Expert 4h : +590€/mémoire</div>
            </div>
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'pricing_pme');
                window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe';
              }}
              variant="secondary"
              className="w-full"
            >
              Commencer
            </Button>
          </div>

          {/* PROJETEUR */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-gray-200 hover:border-[#F77F00] transition-all hover:shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-4xl font-extrabold text-gray-900 mb-2">849€</div>
              <div className="text-gray-500 text-sm">HT / mois</div>
              <div className="text-xl font-bold mt-4">Plan PROJETEUR</div>
              <div className="text-sm text-gray-600">5 Marchés / Mois</div>
            </div>
            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>🔎 Veille marchés incluse</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>🎯 GO/NO-GO illimité</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>🤖 Assistant IA illimité</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>🧠 5 mémoires Market Light / mois</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>📊 Historique détaillé</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>🚀 Priorité maximale</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>📆 1 point de suivi mensuel</span>
              </li>
            </ul>
            <div className="text-xs text-gray-500 mb-4 space-y-1">
              <div>⚙️ Market Pro : +99€/mois</div>
              <div>🧠 Booster Senior 3j : +2490€/marché</div>
            </div>
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'pricing_projeteur');
                window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe';
              }}
              variant="outline"
              className="w-full"
            >
              Commencer
            </Button>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="bg-blue-50 p-6 rounded-2xl">
            <h3 className="font-bold text-gray-900 mb-3">💡 Pourquoi ça a du sens financièrement</h3>
            <p className="text-sm text-gray-700 mb-3">
              Sans nous : 10 à 20h par mémoire, décisions "au feeling", risques d'erreurs dans le BPU
            </p>
            <p className="text-sm text-gray-700">
              <strong>Avec LeMarchéPublic.fr :</strong> la veille vous présente les bons marchés, le GO/NO-GO aide à décider rapidement, l'IA génère vos mémoires, l'assistant sécurise le BPU. <strong className="text-[#F77F00]">Un seul marché gagné peut amortir plusieurs mois d'abonnement.</strong>
            </p>
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
            <div className="font-bold text-gray-900 mb-2">Essai gratuit</div>
            <div className="text-sm text-gray-600">1 mémoire offert sans CB</div>
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
              🚀 Obtenir ma démo personnalisée
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/90 mb-8">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>Réponse rapide</span>
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

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-sm">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
              <div className="font-semibold">✓ Sans engagement</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
              <div className="font-semibold">✓ Sans carte bancaire</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
              <div className="font-semibold">✓ Résiliable en 1 clic</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
              <div className="font-semibold">✓ Support inclus</div>
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
            <h3 className="font-bold text-lg text-gray-900 mb-3">💳 Dois-je fournir ma carte bancaire pour l'essai gratuit ?</h3>
            <p className="text-gray-700">Non, absolument pas. Vous pouvez tester gratuitement avec 1 mémoire offert sans aucune carte bancaire. Vous ne payez que si vous décidez de continuer.</p>
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
            <p className="text-gray-700">Nos utilisateurs constatent en moyenne +30% de taux de réussite. Pourquoi ? Parce qu'ils répondent à plus d'appels d'offres (grâce au gain de temps), avec des mémoires mieux structurés et plus alignés sur les critères de notation.</p>
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
