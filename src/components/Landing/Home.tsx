import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Hammer, HardHat, Sparkles, TrendingUp, Clock, Target, ChevronLeft, ChevronRight, Mail, Search, MapPin, Briefcase, Award, Users, Heart, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { initAnalytics, trackClick } from '../../lib/analytics';
import { MarketModelComparison } from './MarketModelComparison';

const Button = ({ children, onClick, className = "", variant = "primary" }: { children: React.ReactNode; onClick: () => void; className?: string; variant?: "primary" | "secondary" | "outline" }) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105";
  const defaultSize = "px-6 py-3";
  const variants = {
    primary: "bg-[#F77F00] text-white hover:bg-[#E06F00] shadow-lg hover:shadow-xl",
    secondary: "bg-white text-[#F77F00] border-2 border-[#F77F00] hover:bg-[#F77F00] hover:text-white shadow-md",
    outline: "bg-transparent text-gray-700 border-2 border-gray-300 hover:border-[#F77F00] hover:text-[#F77F00]"
  };

  const sizeClasses = className.includes('px-') || className.includes('py-') ? '' : defaultSize;

  return (
    <button onClick={onClick} className={`${baseClasses} ${sizeClasses} ${variants[variant]} ${className}`}>
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
            <span className="hidden sm:inline">Recruter Iris 7 jours gratuits</span>
            <span className="sm:hidden">Recruter Iris</span>
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <Section className="pt-20 pb-16 sm:pt-32 sm:pb-24 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://storage.googleapis.com/msgsndr/Khh3gHoXw8rbmLrz89s4/media/6978a15c00336c6d64d341bb.jpg)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f]/90 via-[#2a5a8f]/85 to-[#1e3a5f]/90"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-[#1e3a5f] px-6 py-3 rounded-full text-sm font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-lg">
            <Sparkles className="w-5 h-5" />
            Recrutez Iris gratuitement pendant 7 jours
          </div>

          <div className="flex justify-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-600">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <img
                src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Iris - Votre nouvelle collaboratrice experte en marchés publics"
                className="relative w-32 h-32 rounded-full object-cover border-4 border-amber-400 shadow-2xl"
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              Recrutez Iris,
            </span>
            <br />
            <span className="text-white">votre nouvelle collaboratrice experte</span>
            <br />
            <span className="text-white/90">en marchés publics réunionnais</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 px-4">
            Pendant que vous gérez vos chantiers, <span className="font-bold text-amber-400">Iris scanne 100% des sources 24/7</span>, analyse les DCE de 200 pages et rédige vos premiers jets de mémoires techniques.
            <br />
            <span className="text-lg font-semibold text-amber-300 mt-2 block">Plus qu'un outil, c'est votre nouveau bras droit stratégique.</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12 text-left px-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl mb-3">👁️</div>
              <div className="text-xl font-bold text-amber-400 mb-2">Vision Totale</div>
              <div className="text-sm text-white/90">"Je surveille chaque jour la Région, le Département et les 24 communes pour vous. Rien ne m'échappe."</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl mb-3">🧠</div>
              <div className="text-xl font-bold text-amber-400 mb-2">Intelligence Critique</div>
              <div className="text-sm text-white/90">"Je ne me contente pas de vous alerter. Je calcule votre score de réussite avant que vous ne perdiez une seule heure."</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <div className="text-4xl mb-3">✍️</div>
              <div className="text-xl font-bold text-amber-400 mb-2">Plume Administrative</div>
              <div className="text-sm text-white/90">"Donnez-moi un DCE, je vous rends un mémoire technique structuré et un BPU cohérent. Vous n'avez plus qu'à valider."</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1200">
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'hero_trial');
                navigate('/capture-lead');
              }}
              variant="primary"
              className="text-lg px-10 py-5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-[#1e3a5f] font-bold shadow-2xl"
            >
              Démarrer mon essai gratuit avec Iris
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              className="text-lg px-10 py-5 border-2 border-amber-400 text-white hover:bg-amber-400/20"
            >
              Voir Iris analyser un DCE
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80 items-center">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xl font-bold">✓</span>
              <span className="font-medium">Disponible immédiatement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xl font-bold">✓</span>
              <span className="font-medium">Formation incluse</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xl font-bold">✓</span>
              <span className="font-medium">Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 text-lg">✓</span>
              <span>Résiliation en 1 clic</span>
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
              Explorez dès maintenant les opportunités qu'Iris surveille pour vous dans le 974
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
                Voir tous les marchés qu'Iris surveille
                <ArrowRight className="w-5 h-5" />
              </Button>

              <p className="text-sm text-gray-600 text-center mt-2">
                Accès gratuit aux consultations en cours • Mise à jour quotidienne par Iris
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* TRUST INDICATORS */}
      <Section className="py-12 bg-white border-y border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[#F77F00] mb-2">100+</div>
            <div className="text-sm text-gray-600">Entreprises accompagnées par Iris</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F77F00] mb-2">24/7</div>
            <div className="text-sm text-gray-600">Iris veille pour vous</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F77F00] mb-2">150+</div>
            <div className="text-sm text-gray-600">Marchés remportés avec Iris</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#F77F00] mb-2">4.8/5</div>
            <div className="text-sm text-gray-600">Satisfaction employeurs</div>
          </div>
        </div>
      </Section>

      {/* CV D'IRIS */}
      <Section id="profil-iris" className="py-20 bg-gradient-to-br from-blue-50 to-orange-50">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Briefcase className="w-4 h-4" />
            Profil de votre future collaboratrice
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Qui est Iris ?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez les compétences et l'expérience de votre nouvelle assistante spécialisée en marchés publics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Photo et infos principales */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-2xl p-8 text-center sticky top-24">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full blur-xl opacity-30"></div>
                <img
                  src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Iris - Assistante marchés publics"
                  className="relative w-40 h-40 rounded-full object-cover border-4 border-amber-400 shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-white"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Iris</h3>
              <p className="text-amber-600 font-semibold mb-4">Assistante Marchés Publics</p>
              <p className="text-sm text-gray-600 mb-6">Spécialisée La Réunion (974)</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Disponibilité</span>
                  <span className="font-bold text-green-600">24/7</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Expérience</span>
                  <span className="font-bold text-gray-900">Expert</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Localisation</span>
                  <span className="font-bold text-gray-900">974</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  trackClick('home', 'cta', 'cv_trial');
                  navigate('/capture-lead');
                }}
                variant="primary"
                className="w-full"
              >
                Recruter Iris
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Compétences et expérience */}
          <div className="lg:col-span-2 space-y-6">
            {/* Compétences clés */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-amber-600" />
                <h3 className="text-2xl font-bold text-gray-900">Compétences Clés</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="font-bold text-blue-900 mb-2">🔍 Veille Intelligente</div>
                  <div className="text-sm text-blue-700">Surveillance 24/7 de toutes les sources réunionnaises. Région, Département, 24 communes, intercommunalités.</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                  <div className="font-bold text-green-900 mb-2">🎯 Analyse GO/NO-GO</div>
                  <div className="text-sm text-green-700">Calcul de score de réussite (Sentinel) basé sur critères techniques, financiers et stratégiques.</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl">
                  <div className="font-bold text-amber-900 mb-2">📝 Rédaction Administrative</div>
                  <div className="text-sm text-amber-700">Rédaction automatique de mémoires techniques structurés à partir des DCE.</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="font-bold text-purple-900 mb-2">💰 Analyse Financière</div>
                  <div className="text-sm text-purple-700">Vérification et mise en cohérence des BPU. Détection d'anomalies de prix.</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                  <div className="font-bold text-orange-900 mb-2">🏛️ Référencement GO</div>
                  <div className="text-sm text-orange-700">Création de profil entreprise visible par les donneurs d'ordre du 974.</div>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-4 rounded-xl">
                  <div className="font-bold text-teal-900 mb-2">📂 Gestion Documentaire</div>
                  <div className="text-sm text-teal-700">Coffre-fort numérique sécurisé. Centralisation de tous vos documents.</div>
                </div>
              </div>
            </div>

            {/* Expérience et réalisations */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-amber-600" />
                <h3 className="text-2xl font-bold text-gray-900">Expérience & Réalisations</h3>
              </div>
              <div className="space-y-4">
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <div className="font-bold text-gray-900 mb-1">150+ marchés remportés en 2025</div>
                  <div className="text-sm text-gray-600">Accompagnement de 100+ entreprises réunionnaises vers le succès</div>
                </div>
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="font-bold text-gray-900 mb-1">100% de couverture territoriale</div>
                  <div className="text-sm text-gray-600">Surveillance exhaustive : Région, Département, 24 communes, 5 intercos</div>
                </div>
                <div className="border-l-4 border-amber-500 pl-4 py-2">
                  <div className="font-bold text-gray-900 mb-1">Gain de temps moyen : 15h par marché</div>
                  <div className="text-sm text-gray-600">Passage de 10-20h à 15 minutes par mémoire technique</div>
                </div>
                <div className="border-l-4 border-purple-500 pl-4 py-2">
                  <div className="font-bold text-gray-900 mb-1">Taux de satisfaction : 4.8/5</div>
                  <div className="text-sm text-gray-600">Noté par les entreprises utilisatrices du 974</div>
                </div>
              </div>
            </div>

            {/* Soft skills */}
            <div className="bg-white rounded-3xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-amber-600" />
                <h3 className="text-2xl font-bold text-gray-900">Qualités Professionnelles</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">⚡</div>
                  <div className="font-bold text-gray-900 mb-1">Réactivité</div>
                  <div className="text-sm text-gray-600">Disponible 24/7, réponse instantanée</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🎯</div>
                  <div className="font-bold text-gray-900 mb-1">Précision</div>
                  <div className="text-sm text-gray-600">Zéro erreur dans les BPU</div>
                </div>
                <div className="text-center p-4">
                  <div className="text-3xl mb-2">🤝</div>
                  <div className="font-bold text-gray-900 mb-1">Fiabilité</div>
                  <div className="text-sm text-gray-600">Aucune opportunité manquée</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* DEMO VIDEO */}
      <Section id="demo-video" className="py-20 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Iris en action : analyse complète d'un DCE
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Regardez comment Iris analyse un dossier de consultation de 200 pages et produit un mémoire technique en quelques minutes
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-12">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900 aspect-video">
            <video
              src="/demo_lemarchepublic.mp4"
              controls
              className="w-full h-full"
              poster="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1200"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        </div>

        <Carousel />
      </Section>

      {/* AVANT / APRÈS */}
      <Section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Avant / Après avoir recruté Iris
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Voyez concrètement comment votre quotidien change avec Iris à vos côtés
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* AVANT */}
          <div className="bg-white rounded-3xl shadow-xl p-8 border-2 border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <span className="text-2xl">😰</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-600">Sans Iris</h3>
                <p className="text-sm text-gray-600">La réalité du quotidien</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                <span className="text-red-500 mt-1">✗</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Opportunités manquées</div>
                  <div className="text-sm text-gray-600">Vous ratez 80% des marchés publiés dans le 974 par manque de temps</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                <span className="text-red-500 mt-1">✗</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">10-20h par mémoire</div>
                  <div className="text-sm text-gray-600">Vous passez des soirées et week-ends entiers à rédiger</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                <span className="text-red-500 mt-1">✗</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Erreurs coûteuses</div>
                  <div className="text-sm text-gray-600">BPU incohérents, critères mal compris, pénalités oubliées</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                <span className="text-red-500 mt-1">✗</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Stress permanent</div>
                  <div className="text-sm text-gray-600">Peur de rater un appel d'offres important, deadlines impossibles</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                <span className="text-red-500 mt-1">✗</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Invisible des donneurs d'ordre</div>
                  <div className="text-sm text-gray-600">Les collectivités ne vous connaissent pas, vous êtes hors radar</div>
                </div>
              </div>
            </div>
          </div>

          {/* APRÈS */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl shadow-xl p-8 border-2 border-green-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-full">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-green-600">Avec Iris</h3>
                <p className="text-sm text-gray-600">Votre nouveau quotidien</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Zéro opportunité manquée</div>
                  <div className="text-sm text-gray-600">Iris surveille 100% des sources 24/7. Vous êtes alerté sur tout dans le 974</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">15 minutes par mémoire</div>
                  <div className="text-sm text-gray-600">Iris rédige le premier jet. Vous n'avez plus qu'à personnaliser et valider</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">BPU sécurisés, zéro erreur</div>
                  <div className="text-sm text-gray-600">Iris vérifie la cohérence, détecte les anomalies, vous protège des pièges</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Sérénité totale</div>
                  <div className="text-sm text-gray-600">Vous dormez tranquille. Iris ne dort jamais et vous alerte instantanément</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Référencé auprès des collectivités</div>
                  <div className="text-sm text-gray-600">Les donneurs d'ordre vous trouvent et vous contactent directement</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-block bg-gradient-to-r from-amber-100 to-yellow-100 p-8 rounded-2xl border-2 border-amber-300 max-w-2xl">
            <div className="text-4xl mb-4">💡</div>
            <p className="text-lg font-bold text-gray-900 mb-2">
              Le vrai coût, c'est de ne PAS recruter Iris
            </p>
            <p className="text-gray-700">
              Chaque semaine sans Iris = opportunités ratées, heures perdues, stress inutile.
              <br />
              <span className="text-amber-600 font-bold">Un seul marché gagné grâce à Iris rembourse des mois d'abonnement.</span>
            </p>
          </div>
        </div>
      </Section>

      {/* TARIFS - MODE RECRUTEMENT */}
      <Section id="tarifs" className="py-20 bg-white">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="text-xl">💼</span>
            Choisissez le contrat d'Iris qui vous convient
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Recrutez Iris selon vos besoins
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            <strong>Toutes les formules incluent</strong> : veille 974 illimitée, analyse GO/NO-GO, assistant IA, référencement collectivités, coffre-fort et exports
          </p>
          <p className="text-lg text-gray-500">
            Seul le nombre de <strong>mémoires techniques générés automatiquement</strong> varie selon le contrat
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {/* IRIS À L'ESSAI */}
          <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl">
            <div className="text-center mb-4">
              <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
                PÉRIODE D'ESSAI
              </div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">0€</div>
              <div className="text-gray-500 text-xs mb-3">7 jours gratuits</div>
              <div className="text-lg font-bold">Iris à l'Essai</div>
              <div className="text-xs text-gray-500 mt-1">Testez avant de recruter</div>
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
                <span className="text-gray-400 mt-0.5 flex-shrink-0">−</span>
                <span className="text-gray-500">Mémoires techniques non inclus durant l'essai</span>
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
              Démarrer l'essai
            </Button>
          </div>

          {/* IRIS TEMPS PARTIEL */}
          <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-orange-200 hover:border-orange-400 transition-all hover:shadow-xl">
            <div className="text-center mb-4">
              <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
                CONTRAT TEMPS PARTIEL
              </div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">199€</div>
              <div className="text-gray-500 text-xs mb-3">HT / mois</div>
              <div className="text-lg font-bold">Iris Temps Partiel</div>
              <div className="text-xs text-gray-500 mt-1">1-2 réponses par mois</div>
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
              Recruter Iris Temps Partiel
            </Button>
          </div>

          {/* IRIS TEMPS COMPLET - RECOMMANDÉ */}
          <div className="bg-gradient-to-br from-gray-500 to-gray-700 rounded-3xl shadow-2xl p-6 border-2 border-gray-500 transform md:scale-105 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-gray-700 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ RECOMMANDÉ
            </div>
            <div className="text-center mb-4 text-white">
              <div className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                CONTRAT TEMPS COMPLET
              </div>
              <div className="text-4xl font-extrabold mb-1">349€</div>
              <div className="text-white/80 text-xs mb-3">HT / mois</div>
              <div className="text-lg font-bold">Iris Temps Complet</div>
              <div className="text-xs text-white/80 mt-1">2-3 réponses par mois</div>
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
              Recruter Iris Temps Complet
            </Button>
          </div>

          {/* IRIS + HEURES SUPP */}
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl shadow-xl p-6 border-2 border-yellow-500 hover:shadow-2xl transition-all">
            <div className="text-center mb-4">
              <div className="inline-block bg-yellow-900/30 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
                + HEURES SUPPLÉMENTAIRES
              </div>
              <div className="text-4xl font-extrabold text-gray-900 mb-1">649€</div>
              <div className="text-gray-700 text-xs mb-3">HT / mois</div>
              <div className="text-lg font-bold text-gray-900">Iris + Heures Supp</div>
              <div className="text-xs text-gray-700 mt-1">5+ réponses par mois</div>
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
              Recruter Iris + Heures Supp
            </Button>
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-orange-50 p-8 rounded-2xl border-2 border-orange-200">
            <h3 className="font-bold text-gray-900 mb-4 text-xl">💡 Pourquoi un coût aussi accessible ?</h3>
            <p className="text-sm text-gray-700 mb-3">
              <strong>Imaginez embaucher une experte</strong> qui surveille 100% des marchés 974, analyse les DCE, rédige vos mémoires, vérifie vos BPU et vous réfère auprès des collectivités...
            </p>
            <p className="text-sm text-gray-700 mb-4">
              <strong>Un tel profil coûterait 3000-4000€/mois minimum en CDI.</strong> Avec Iris, vous avez cette expertise pour <span className="text-[#F77F00] font-bold">moins de 350€/mois</span>, disponible 24/7, sans congés ni RTT.
            </p>
            <div className="bg-white p-4 rounded-xl border border-orange-300">
              <p className="text-sm text-gray-900 font-semibold mb-2">🚀 ROI immédiat</p>
              <p className="text-sm text-gray-700">
                <strong>Avant :</strong> 10-20h par mémoire, opportunités ratées, erreurs BPU<br/>
                <strong>Maintenant :</strong> 15 minutes par mémoire, aucune opportunité ratée 974, BPU sécurisé
              </p>
              <p className="text-xs text-[#F77F00] mt-3 font-bold">
                Un seul marché gagné grâce à Iris rembourse des mois de son contrat
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
            <div className="text-sm text-gray-600">Iris vous accompagne dès J1</div>
          </div>
        </div>
      </Section>

      {/* TÉMOIGNAGES AVEC PHOTOS */}
      <Section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ils ont recruté Iris et ne regrettent rien
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez comment Iris a transformé leur quotidien
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Marc, dirigeant BTP"
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
              />
              <div>
                <div className="font-bold text-gray-900">Marc D.</div>
                <div className="text-sm text-gray-600">Dirigeant BTP, Saint-Denis</div>
                <div className="text-amber-500 text-sm">★★★★★</div>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "Avant Iris, je ratais 8 marchés sur 10 par manque de temps. Maintenant, je réponds à tous ceux qui m'intéressent. Elle m'a fait gagner 3 marchés en 2 mois. ROI incroyable."
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Sophie, gérante PME"
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
              />
              <div>
                <div className="font-bold text-gray-900">Sophie L.</div>
                <div className="text-sm text-gray-600">Gérante PME, Le Port</div>
                <div className="text-amber-500 text-sm">★★★★★</div>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "Je passais mes week-ends à rédiger des mémoires. Avec Iris, c'est 15 minutes et c'est fait. J'ai retrouvé ma vie perso et ma boîte cartonne. Je ne peux plus m'en passer."
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=200"
                alt="Jean, artisan"
                className="w-16 h-16 rounded-full object-cover border-2 border-amber-400"
              />
              <div>
                <div className="font-bold text-gray-900">Jean P.</div>
                <div className="text-sm text-gray-600">Artisan, Saint-Pierre</div>
                <div className="text-amber-500 text-sm">★★★★★</div>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "En solo, je ne pouvais pas suivre les appels d'offres. Iris fait le boulot d'une assistante à temps complet pour 350€/mois. C'est juste fou comme outil."
            </p>
          </div>
        </div>
      </Section>

      {/* COMPARAISON MODÈLES */}
      <MarketModelComparison />

      {/* FINAL CTA */}
      <Section className="py-20">
        <div className="bg-gradient-to-r from-[#F77F00] to-[#E06F00] rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <div className="flex justify-center mb-8">
            <img
              src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="Iris vous attend"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
            />
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Prêt à recruter Iris dans votre équipe ?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Plus de 100 entreprises réunionnaises ont déjà fait le choix de recruter Iris. Elles ne la licencieraient pour rien au monde.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'final_trial');
                navigate('/capture-lead');
              }}
              variant="secondary"
              className="text-lg px-10 py-5 bg-white text-[#F77F00] hover:bg-gray-100 shadow-2xl"
            >
              Recruter Iris - 7 jours gratuits
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Disponible immédiatement</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Sans engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Sans carte bancaire</span>
            </div>
          </div>
        </div>
      </Section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Le Marché Public</h3>
              <p className="text-gray-400 text-sm">
                Iris, votre assistante experte en marchés publics réunionnais
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" onClick={() => navigate('/landing-btp')} className="hover:text-white">Pour le BTP</a></li>
                <li><a href="#" onClick={() => navigate('/landing-artisans')} className="hover:text-white">Pour les Artisans</a></li>
                <li><a href="#" onClick={() => navigate('/landing-pme')} className="hover:text-white">Pour les PME</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" onClick={() => navigate('/mentions-legales')} className="hover:text-white">Mentions légales</a></li>
                <li><a href="#" onClick={() => navigate('/cgv')} className="hover:text-white">CGV</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>contact@lemarchepublic.fr</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 Le Marché Public. Tous droits réservés. Iris est une marque déposée.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
