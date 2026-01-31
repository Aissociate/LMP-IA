import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Sparkles, Clock, Target, ChevronLeft, ChevronRight, MapPin, Briefcase, Eye, TrendingUp, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { initAnalytics, trackClick } from '../../lib/analytics';
import { MarketModelComparison } from './MarketModelComparison';
import { supabase } from '../../lib/supabase';

const Button = ({ children, onClick, className = "", variant = "primary" }: { children: React.ReactNode; onClick: () => void; className?: string; variant?: "primary" | "secondary" | "outline" }) => {
  const baseClasses = "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 transform hover:scale-105";
  const defaultSize = "px-6 py-3";
  const variants = {
    primary: "bg-linkedin-500 text-white hover:bg-linkedin-600 shadow-lg hover:shadow-xl",
    secondary: "bg-white text-linkedin-500 border-2 border-linkedin-500 hover:bg-linkedin-500 hover:text-white shadow-md",
    outline: "bg-transparent text-slate-700 border-2 border-slate-300 hover:border-linkedin-500 hover:text-linkedin-500"
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
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-slate-100 group max-w-4xl mx-auto">
      <img
        src={images[currentIndex]}
        alt={`Screenshot ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6 text-slate-800" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6 text-slate-800" />
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

interface Market {
  id: string;
  title: string;
  organisme?: string;
  date_limite_depot?: string;
  montant_estime?: number;
  created_at: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [recentMarkets, setRecentMarkets] = useState<Market[]>([]);

  useEffect(() => {
    initAnalytics('home');
    fetchRecentMarkets();
  }, []);

  const fetchRecentMarkets = async () => {
    try {
      const { data, error } = await supabase
        .from('manual_markets')
        .select('id, title, organisme, date_limite_depot, montant_estime, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      if (data) setRecentMarkets(data);
    } catch (error) {
      console.error('Error fetching markets:', error);
    }
  };

  return (
    <div className="min-h-screen bg-iris-bg">
      {/* Header */}
      <header className="bg-iris-card shadow-subtle sticky top-0 z-50 border-b border-iris-border">
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
            <span className="hidden sm:inline">Période d'essai 7 jours GRATUITE</span>
            <span className="sm:hidden">Essai gratuit</span>
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
          <div className="absolute inset-0 bg-gradient-to-br from-linkedin-700/95 via-linkedin-600/90 to-linkedin-800/95"></div>
        </div>

        <div className="text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-linkedin-500 to-linkedin-600 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg">
            <Sparkles className="w-5 h-5" />
            Période d'essai de 7 jours GRATUITS
          </div>

          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-linkedin-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <img
                src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="Iris - Votre future employée numérique"
                className="relative w-32 h-32 rounded-full object-cover border-4 border-linkedin-500 shadow-2xl"
              />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-white">
              Je m'appelle <span className="text-linkedin-300">Iris</span>,
            </span>
            <br />
            <span className="text-white">votre future employée numérique</span>
            <br />
            <span className="text-white/90">experte en marchés publics réunionnais</span>
          </h1>

          <p className="text-lg md:text-xl text-white/90 max-w-4xl mx-auto mb-12 leading-relaxed px-4">
            Pendant que vous faites tourner la boutique, <span className="font-bold text-linkedin-300">je scanne 100% des ressources 24/7</span>, j'analyse les DCE de 200 pages et je rédige vos premiers jets de mémoires techniques.
            <br />
            <span className="text-lg font-semibold text-linkedin-300 mt-2 block">Je suis votre nouveau bras droit stratégique.</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12 text-left px-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Eye className="w-10 h-10 text-linkedin-300 mb-3" />
              <div className="text-xl font-bold text-linkedin-300 mb-2">Vision Totale</div>
              <div className="text-sm text-white/90">Je surveille chaque jour la Région, le Département et les 24 communes pour vous. Rien ne m'échappe.</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Target className="w-10 h-10 text-linkedin-300 mb-3" />
              <div className="text-xl font-bold text-linkedin-300 mb-2">Intelligence Critique</div>
              <div className="text-sm text-white/90">Je ne me contente pas de vous alerter. Je calcule votre score de réussite avant que vous ne perdiez une seule heure.</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <Sparkles className="w-10 h-10 text-linkedin-300 mb-3" />
              <div className="text-xl font-bold text-linkedin-300 mb-2">Plume Administrative</div>
              <div className="text-sm text-white/90">Donnez-moi un DCE, je vous rends un mémoire technique structuré et un BPU cohérent. Vous n'avez plus qu'à valider.</div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'hero_trial');
                navigate('/capture-lead');
              }}
              variant="primary"
              className="text-lg px-10 py-5 bg-white text-linkedin-600 hover:bg-slate-100 font-bold shadow-2xl border-2 border-white"
            >
              Me prendre à l'essai gratuitement
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
              variant="outline"
              className="text-lg px-10 py-5 border-2 border-white text-white hover:bg-white/20"
            >
              Me voir en action
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/80 items-center">
            <div className="flex items-center gap-2">
              <span className="text-linkedin-300 text-xl font-bold">✓</span>
              <span className="font-medium">Disponible immédiatement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-linkedin-300 text-xl font-bold">✓</span>
              <span className="font-medium">Formation OPCO incluse</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-linkedin-300 text-xl font-bold">✓</span>
              <span className="font-medium">Travaille H24</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400 text-lg">✓</span>
              <span>Résiliation en 1 clic</span>
            </div>
          </div>
        </div>
      </Section>

      {/* RECENT MARKETS SECTION */}
      <Section className="py-16 bg-iris-card">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
              Les derniers marchés que j'ai trouvés
            </h2>
            <p className="text-lg text-slate-600">
              Je vous offre un accès gratuit à mes recherches en cours. Je mets la liste à jour quotidiennement.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {recentMarkets.length === 0 ? (
              <div className="bg-iris-bg rounded-lg p-8 text-center">
                <p className="text-slate-600">Chargement des derniers marchés...</p>
              </div>
            ) : (
              recentMarkets.map((market) => (
                <div key={market.id} className="bg-iris-bg border border-iris-border rounded-lg p-6 hover:shadow-card transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-linkedin-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 mb-1">{market.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">{market.organisme || 'Organisme public'}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {market.date_limite_depot && (
                          <span>📅 Échéance: {new Date(market.date_limite_depot).toLocaleDateString('fr-FR')}</span>
                        )}
                        {market.montant_estime && (
                          <span>💰 {market.montant_estime.toLocaleString('fr-FR')}€</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center">
            <Button
              onClick={() => {
                trackClick('home', 'navigation', 'search_markets_reunion');
                navigate('/marchepublics/974');
              }}
              variant="primary"
              className="text-lg"
            >
              <Search className="w-5 h-5" />
              Voir tous les marchés que je surveille
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Section>

      {/* TRUST INDICATORS */}
      <Section className="py-12 bg-white border-y border-iris-border">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-linkedin-500 mb-2">100+</div>
            <div className="text-sm text-slate-600">Entreprises accompagnées</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-linkedin-500 mb-2">24/7</div>
            <div className="text-sm text-slate-600">Je veille pour vous</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-linkedin-500 mb-2">105+</div>
            <div className="text-sm text-slate-600">Marchés que nous avons remportés</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-linkedin-500 mb-2">4.8/5</div>
            <div className="text-sm text-slate-600">La note de mes employeurs</div>
          </div>
        </div>
      </Section>

      {/* CV D'IRIS - Style LinkedIn */}
      <Section id="profil-iris" className="py-20 bg-iris-bg">
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <div className="bg-iris-card rounded-lg shadow-card overflow-hidden mb-6">
            {/* Banner */}
            <div className="h-32 bg-gradient-to-r from-linkedin-500 to-linkedin-600"></div>

            {/* Profile Section */}
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row gap-6 -mt-16">
                {/* Photo */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Iris"
                      className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                  </div>
                </div>

                {/* Info principale */}
                <div className="flex-1 pt-16 md:pt-0">
                  <h1 className="text-3xl font-bold text-slate-900 mb-1">Iris</h1>
                  <p className="text-xl text-slate-900 mb-1 font-bold">Assistante Marchés Publics</p>
                  <p className="text-base text-slate-700 mb-3">Spécialisée Intelligence Artificielle</p>
                  <p className="text-slate-600 mb-4">La Réunion (974) · <span className="text-linkedin-500 font-semibold">Disponible 24/7</span></p>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="text-sm text-slate-600">100+ entreprises accompagnées</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-sm text-slate-600">105+ marchés remportés</span>
                  </div>

                  <Button
                    onClick={() => {
                      trackClick('home', 'cta', 'cv_trial');
                      navigate('/capture-lead');
                    }}
                    className="bg-linkedin-500 hover:bg-linkedin-600 text-white px-6 py-2 rounded-full font-semibold"
                  >
                    Me prendre à l'essai gratuitement
                  </Button>
                </div>

                {/* Quick stats */}
                <div className="hidden lg:block flex-shrink-0 pt-16">
                  <div className="bg-iris-bg rounded-lg p-4 space-y-3 border border-iris-border">
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Disponibilité</div>
                      <div className="font-semibold text-green-600">24/7 Sans interruption</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Niveau d'expertise</div>
                      <div className="font-semibold text-slate-900">Expert Senior</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600 mb-1">Satisfaction client</div>
                      <div className="font-semibold text-slate-900">4.8/5 ⭐</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Rest of LinkedIn profile... */}
          {/* À propos */}
          <div className="bg-iris-card rounded-lg shadow-card p-6 mb-6 border border-iris-border">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">À propos</h2>
            <p className="text-slate-700 leading-relaxed">
              Bonjour, je m'appelle Iris. Je suis votre future employée numérique spécialisée dans les marchés publics réunionnais. Je travaille pour vous 24/7 : je surveille l'ensemble des sources du territoire (Région, Département, 24 communes, 5 intercommunalités), j'analyse les DCE et je rédige automatiquement vos mémoires techniques. Mon expertise couvre la veille intelligente, l'analyse GO/NO-GO, la rédaction administrative et la sécurisation financière des BPU.
            </p>
            <p className="text-slate-700 leading-relaxed mt-3">
              <strong className="text-slate-900">Ma mission :</strong> Vous faire gagner du temps, éviter les erreurs coûteuses et ne manquer aucune opportunité dans le 974.
            </p>
          </div>
        </div>
      </Section>

      {/* DEMO VIDEO */}
      <Section id="demo-video" className="py-20 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900">
            Voyez-moi en action
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Regardez comment j'analyse un dossier de consultation de 200 pages et produis un mémoire technique en quelques minutes
          </p>
        </div>

        <Carousel />
      </Section>

      {/* AVANT / APRÈS - IMPROVED DESIGN */}
      <Section className="py-20 bg-iris-bg">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900">
            Découvrez comment j'ai changé le quotidien de mes employeurs
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            La différence avant/après m'avoir recrutée
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* SANS MOI */}
          <div className="bg-iris-card rounded-2xl shadow-card p-8 border-2 border-red-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-red-100 p-3 rounded-full">
                <span className="text-2xl">😰</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-red-600">Sans moi</h3>
                <p className="text-sm text-slate-600">Votre quotidien actuel</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Opportunités manquées', desc: 'Vous ratez 80% des marchés publiés dans le 974 par manque de temps' },
                { title: '10-20h par mémoire', desc: 'Vous passez des soirées et week-ends entiers à rédiger' },
                { title: 'Erreurs coûteuses', desc: 'BPU incohérents, critères mal compris, pénalités oubliées' },
                { title: 'Stress permanent', desc: 'Peur de rater un appel d\'offres important, deadlines impossibles' },
                { title: 'Invisible des GO', desc: 'Les collectivités ne vous connaissent pas, vous êtes hors radar' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                  <span className="text-red-500 mt-1 text-xl">✗</span>
                  <div>
                    <div className="font-bold text-slate-900 mb-1">{item.title}</div>
                    <div className="text-sm text-slate-600">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AVEC MOI */}
          <div className="bg-gradient-to-br from-linkedin-50 to-linkedin-100 rounded-2xl shadow-card p-8 border-2 border-linkedin-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-linkedin-500 p-3 rounded-full">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-linkedin-600">Avec moi</h3>
                <p className="text-sm text-slate-600">Votre nouveau quotidien</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { title: 'Zéro opportunité manquée', desc: 'Je surveille 100% des sources 24/7. Vous êtes alerté sur tout dans le 974' },
                { title: '15 minutes par mémoire', desc: 'Je rédige le premier jet. Vous n\'avez plus qu\'à personnaliser et valider' },
                { title: 'BPU sécurisés, zéro erreur', desc: 'Je vérifie la cohérence, je détecte les anomalies, je vous protège des pièges' },
                { title: 'Sérénité totale', desc: 'Vous dormez tranquille. Je ne dors jamais et je vous alerte instantanément' },
                { title: 'Référencé auprès des GO', desc: 'Je vous rends visible. Les donneurs d\'ordre vous trouvent et vous contactent' }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-linkedin-300 shadow-sm">
                  <span className="text-linkedin-500 mt-1 text-xl">✓</span>
                  <div>
                    <div className="font-bold text-slate-900 mb-1">{item.title}</div>
                    <div className="text-sm text-slate-600">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-block bg-iris-card p-8 rounded-2xl border-2 border-linkedin-300 max-w-2xl shadow-card">
            <div className="text-4xl mb-4">💡</div>
            <p className="text-lg font-bold text-slate-900 mb-2">
              Le vrai coût, c'est de ne PAS me recruter
            </p>
            <p className="text-slate-700">
              Chaque semaine sans moi = opportunités ratées, heures perdues, stress inutile.
              <br />
              <span className="text-linkedin-600 font-bold">Un seul marché gagné grâce à moi rembourse des mois de mon contrat.</span>
            </p>
          </div>
        </div>
      </Section>

      {/* TARIFS - MODE STANDARD/ASSOCIÉ */}
      <Section id="tarifs" className="py-20 bg-iris-card">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-linkedin-500 text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-md">
            <Briefcase className="w-5 h-5" />
            Choisissez mon contrat selon vos besoins
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
            Prêts à me recruter dans votre équipe ?
          </h2>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto mb-4">
            <strong>Toutes mes formules incluent</strong> : veille 974 illimitée, analyse GO/NO-GO, assistant IA, référencement collectivités, coffre-fort et exports
          </p>
          <p className="text-lg text-slate-600">
            Seul le nombre de <strong>mémoires techniques que je génère automatiquement</strong> varie selon le contrat
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {/* ESSAI */}
          <div className="bg-iris-card rounded-3xl shadow-card p-6 border-2 border-linkedin-200 hover:border-linkedin-400 transition-all hover:shadow-xl">
            <div className="text-center mb-4">
              <div className="inline-block bg-linkedin-100 text-linkedin-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
                PÉRIODE D'ESSAI
              </div>
              <div className="text-4xl font-bold text-slate-900 mb-1">0€</div>
              <div className="text-sm text-slate-600 mb-3">7 jours gratuits</div>
              <div className="text-lg font-bold text-slate-900">Me tester gratuitement</div>
              <div className="text-xs text-slate-500 mt-1">Essai complet avec CB</div>
            </div>
            <ul className="space-y-2 mb-6 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>Veille 974 complète</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>Analyse GO/NO-GO</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>Assistant IA 24/7</span>
              </li>
            </ul>
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'pricing_trial');
                navigate('/capture-lead');
              }}
              className="w-full text-sm py-3 bg-linkedin-500 hover:bg-linkedin-600 text-white rounded-full font-semibold"
            >
              Période d'essai 7 jours GRATUITE
            </Button>
          </div>

          {/* CONTRAT EMPLOYÉ - Temps Partiel */}
          <div className="bg-iris-card rounded-3xl shadow-card p-6 border-2 border-slate-200 hover:border-slate-400 transition-all hover:shadow-xl">
            <div className="text-center mb-4">
              <div className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
                CONTRAT EMPLOYÉ
              </div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">199€</div>
              <div className="text-slate-500 text-xs mb-3">HT / mois</div>
              <div className="text-lg font-bold">Temps Partiel</div>
              <div className="text-xs text-slate-500 mt-1">1 mémoire IA / mois</div>
            </div>
            <ul className="space-y-2 mb-6 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>Tout illimité sauf mémoires</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-linkedin-500 mt-0.5 flex-shrink-0">★</span>
                <span className="font-bold text-linkedin-600">1 mémoire technique IA</span>
              </li>
            </ul>
            <Button
              onClick={() => navigate('/capture-lead')}
              variant="outline"
              className="w-full text-sm py-2"
            >
              Me recruter
            </Button>
          </div>

          {/* CONTRAT EMPLOYÉ - Temps Complet - RECOMMANDÉ */}
          <div className="bg-gradient-to-br from-linkedin-500 to-linkedin-700 rounded-3xl shadow-2xl p-6 border-2 border-linkedin-500 transform md:scale-105 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-linkedin-700 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              ⭐ RECOMMANDÉ
            </div>
            <div className="text-center mb-4 text-white">
              <div className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold mb-3">
                CONTRAT EMPLOYÉ
              </div>
              <div className="text-4xl font-extrabold mb-1">349€</div>
              <div className="text-white/80 text-xs mb-3">HT / mois</div>
              <div className="text-lg font-bold">Temps Complet</div>
              <div className="text-xs text-white/80 mt-1">2 mémoires IA / mois</div>
            </div>
            <ul className="space-y-2 mb-6 text-xs text-white">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>Tout illimité sauf mémoires</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">★</span>
                <span className="font-bold">2 mémoires techniques IA</span>
              </li>
            </ul>
            <Button
              onClick={() => navigate('/capture-lead')}
              variant="secondary"
              className="w-full text-sm py-2"
            >
              Me recruter
            </Button>
          </div>

          {/* HEURES SUPPLÉMENTAIRES */}
          <div className="bg-gradient-to-br from-iris-gold to-yellow-500 rounded-3xl shadow-xl p-6 border-2 border-yellow-500 hover:shadow-2xl transition-all">
            <div className="text-center mb-4">
              <div className="inline-block bg-yellow-900/30 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold mb-3">
                HEURES SUPPLÉMENTAIRES
              </div>
              <div className="text-4xl font-extrabold text-slate-900 mb-1">649€</div>
              <div className="text-slate-700 text-xs mb-3">HT / mois</div>
              <div className="text-lg font-bold text-slate-900">Illimité Premium</div>
              <div className="text-xs text-slate-700 mt-1">Mémoires illimités + modèles premium</div>
            </div>
            <ul className="space-y-2 mb-6 text-xs text-slate-900">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0">✓</span>
                <span>Tout illimité</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-700 mt-0.5 flex-shrink-0">★</span>
                <span className="font-bold text-yellow-900">Mémoires IA illimités + modèles premium</span>
              </li>
            </ul>
            <Button
              onClick={() => navigate('/capture-lead')}
              variant="outline"
              className="w-full text-sm py-2 bg-white hover:bg-slate-50"
            >
              Me recruter (Heures Supplémentaires)
            </Button>
          </div>
        </div>

        {/* REASSURANCE BADGES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          <div className="bg-iris-bg p-6 rounded-xl shadow-subtle text-center border border-iris-border">
            <div className="text-3xl mb-3">🔒</div>
            <div className="font-bold text-slate-900 mb-2">Données sécurisées</div>
            <div className="text-sm text-slate-600">Hébergement français RGPD</div>
          </div>
          <div className="bg-iris-bg p-6 rounded-xl shadow-subtle text-center border border-iris-border">
            <div className="text-3xl mb-3">✓</div>
            <div className="font-bold text-slate-900 mb-2">Sans engagement</div>
            <div className="text-sm text-slate-600">Résiliation en 1 clic</div>
          </div>
          <div className="bg-iris-bg p-6 rounded-xl shadow-subtle text-center border border-iris-border">
            <div className="text-3xl mb-3">⏰</div>
            <div className="font-bold text-slate-900 mb-2">Travaille H24</div>
            <div className="text-sm text-slate-600">7 jours gratuits avec CB</div>
          </div>
          <div className="bg-iris-bg p-6 rounded-xl shadow-subtle text-center border border-iris-border">
            <div className="text-3xl mb-3">🎓</div>
            <div className="font-bold text-slate-900 mb-2">Formation OPCO</div>
            <div className="text-sm text-slate-600">Financement formation inclus</div>
          </div>
        </div>
      </Section>

      {/* TÉMOIGNAGES */}
      <Section className="py-20 bg-iris-bg">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-slate-900">
            Ils m'ont fait confiance et ne regrettent rien
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Plus de 100 entreprises réunionnaises m'ont recrutée. Elles ne me licencieraient pour rien au monde.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[
            {
              name: 'Marc D.',
              role: 'Dirigeant BTP, Saint-Denis',
              img: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=200',
              quote: 'Avant Iris, je ratais 8 marchés sur 10 par manque de temps. Maintenant, je réponds à tous ceux qui m\'intéressent. Elle m\'a fait gagner 3 marchés en 2 mois.'
            },
            {
              name: 'Sophie L.',
              role: 'Gérante PME, Le Port',
              img: 'https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=200',
              quote: 'Je passais mes week-ends à rédiger des mémoires. Avec Iris, c\'est 15 minutes et c\'est fait. J\'ai retrouvé ma vie personnelle.'
            },
            {
              name: 'Jean P.',
              role: 'Artisan, Saint-Pierre',
              img: 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=200',
              quote: 'En solo, je ne pouvais pas suivre les appels d\'offres. Iris fait le boulot d\'une assistante à temps complet pour moins de 350€/mois.'
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-iris-card rounded-2xl shadow-card p-8 border border-iris-border">
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={testimonial.img}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-linkedin-500"
                />
                <div>
                  <div className="font-bold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-600">{testimonial.role}</div>
                  <div className="text-iris-gold text-sm">★★★★★</div>
                </div>
              </div>
              <p className="text-slate-700 italic">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
      </Section>

      {/* COMPARAISON MODÈLES */}
      <MarketModelComparison />

      {/* FINAL CTA */}
      <Section className="py-20">
        <div className="bg-gradient-to-r from-linkedin-500 to-linkedin-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
          <div className="flex justify-center mb-8">
            <img
              src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="Iris vous attend"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl"
            />
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Prêts à me recruter dans votre équipe ?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Plus de 100 entreprises réunionnaises m'ont déjà recrutée. Elles ne me licencieraient pour rien au monde.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'final_trial');
                navigate('/capture-lead');
              }}
              variant="secondary"
              className="text-lg px-10 py-5 bg-white text-linkedin-500 hover:bg-slate-100"
            >
              Période d'essai 7 jours GRATUITE
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-white/80">
            <span>✓ Sans engagement</span>
            <span>✓ Formation OPCO incluse</span>
            <span>✓ Travaille H24</span>
            <span>✓ Résiliation en 1 clic</span>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-400 mb-4">© 2024 Le Marché Public - Iris, votre employée numérique experte en marchés publics</p>
          <div className="flex justify-center gap-6 text-sm text-slate-400">
            <button onClick={() => navigate('/cgv')} className="hover:text-white transition-colors">CGV</button>
            <button onClick={() => navigate('/mentions-legales')} className="hover:text-white transition-colors">Mentions légales</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
