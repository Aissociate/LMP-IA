import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Hammer, HardHat, Sparkles, TrendingUp, Clock, Target, Mail, Search, MapPin, Briefcase, Award, Users, Heart, CheckCircle, Bell, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { initAnalytics, trackClick } from '../../lib/analytics';
import { MarketModelComparison } from './MarketModelComparison';

const VARIANTES = [
  {
    id: 'A',
    titre: 'Recrutez Iris, votre nouvelle collaboratrice',
    soustitre: 'experte en marchés publics réunionnais',
    description: 'Pendant que vous gérez vos chantiers, Iris scanne 100% des sources 24/7, analyse les DCE de 200 pages et rédige vos premiers jets de mémoires techniques.'
  },
  {
    id: 'B',
    titre: 'Embauchez Iris pour 349€/mois',
    soustitre: 'au lieu de 3500€ pour une assistante classique',
    description: 'Iris surveille tous les marchés 974, analyse les DCE, rédige vos mémoires et ne prend jamais de congés. Disponible 24/7 sans RTT ni absences.'
  },
  {
    id: 'C',
    titre: 'Iris : Votre bras droit stratégique',
    soustitre: 'spécialisé marchés publics La Réunion',
    description: 'Elle détecte chaque opportunité dans le 974, calcule votre score GO/NO-GO et rédige vos mémoires techniques. Vous ne faites que valider et envoyer.'
  }
];

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

export default function Home() {
  const navigate = useNavigate();
  const [copy] = useState(() => VARIANTES[Math.floor(Math.random() * VARIANTES.length)]);

  useEffect(() => {
    return initAnalytics('home');
  }, []);

  return (
    <div className="min-h-screen bg-iris-bg">
      {/* Header */}
      <header className="bg-iris-card shadow-subtle sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex justify-between items-center gap-2">
          <div className="flex items-center flex-shrink-0">
            <img src="/logo1.png" alt="Le Marché Public.fr" className="h-16 md:h-24 lg:h-[120px] w-auto object-contain" />
          </div>
          <Button
            onClick={() => {
              trackClick('home', 'cta', 'header_trial');
              window.open('https://lmp.bolt.host/', '_blank');
            }}
            variant="primary"
            className="text-xs md:text-base px-3 py-2 md:px-6 md:py-3 bg-linkedin-500 hover:bg-linkedin-600"
          >
            <span className="hidden sm:inline">Recruter Iris 7 jours gratuits</span>
            <span className="sm:hidden">Recruter Iris</span>
            <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
          </Button>
        </div>
      </header>

      {/* HERO SECTION - LinkedIn Style */}
      <Section className="pt-12 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-linkedin-50 text-linkedin-700 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-linkedin-200">
              <Sparkles className="w-4 h-4" />
              Essai gratuit 7 jours
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              {copy.titre}
              <br />
              <span className="text-linkedin-500">{copy.soustitre}</span>
            </h1>

            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {copy.description}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                onClick={() => {
                  trackClick('home', 'cta', `hero_trial_${copy.id}`);
                  window.open('https://lmp.bolt.host/', '_blank');
                }}
                variant="primary"
                className="text-lg px-8 py-4 bg-linkedin-500 hover:bg-linkedin-600 shadow-lg"
              >
                Recruter Iris gratuitement
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => document.getElementById('demo-video')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                className="text-lg px-8 py-4 border-2 border-gray-300 text-gray-700 hover:border-linkedin-500 hover:text-linkedin-500"
              >
                Voir la démo
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-linkedin-500" />
                <span>7 jours gratuits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-linkedin-500" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-linkedin-500" />
                <span>Formation incluse</span>
              </div>
            </div>
          </div>

          {/* Right Column - Widget Simulation Iris */}
          <div className="relative">
            <div className="bg-iris-card rounded-lg shadow-linkedin p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150"
                  alt="Iris"
                  className="w-16 h-16 rounded-full object-cover border-2 border-linkedin-500"
                />
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Iris</h3>
                  <p className="text-base font-semibold text-gray-900">Assistante IA • Experte Marchés Publics</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Disponible 24/7</span>
                  </div>
                </div>
              </div>

              <div className="bg-linkedin-50 rounded-lg p-4 mb-4 border border-linkedin-100">
                <div className="flex items-start gap-3">
                  <Bell className="w-5 h-5 text-linkedin-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      Nouveau dossier détecté pour vous
                    </p>
                    <div className="bg-white rounded p-3 shadow-sm border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-600" />
                          <span className="text-xs font-medium text-gray-900">Travaux voirie - Saint-Denis</span>
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">92% match</span>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">Budget : 450 000€ • Échéance : 14 jours</p>
                      <div className="flex gap-2">
                        <button className="text-xs bg-linkedin-500 text-white px-3 py-1 rounded font-medium hover:bg-linkedin-600 transition">
                          Analyser le DCE
                        </button>
                        <button className="text-xs border border-gray-300 text-gray-700 px-3 py-1 rounded font-medium hover:border-linkedin-500 hover:text-linkedin-500 transition">
                          Ignorer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xl font-bold text-linkedin-500">24/7</div>
                  <div className="text-xs text-gray-600">Veille active</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xl font-bold text-linkedin-500">100%</div>
                  <div className="text-xs text-gray-600">Sources 974</div>
                </div>
                <div className="bg-gray-50 rounded p-3">
                  <div className="text-xl font-bold text-linkedin-500">15min</div>
                  <div className="text-xs text-gray-600">Par mémoire</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-amber-400 text-gray-900 px-4 py-2 rounded-lg shadow-lg font-bold text-sm transform rotate-3">
              Preuve de concept en direct
            </div>
          </div>
        </div>
      </Section>

      {/* SEARCH MARKETS SECTION */}
      <Section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-iris-card rounded-lg shadow-linkedin border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-linkedin-50 text-linkedin-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-linkedin-200">
                <MapPin className="w-4 h-4" />
                Territoire 974
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Découvrez les marchés qu'Iris surveille
              </h2>
              <p className="text-lg text-gray-600">
                Accès gratuit aux consultations en cours à La Réunion
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-linkedin-50 p-4 rounded-lg border border-linkedin-100">
                <div className="font-bold text-gray-900 mb-1">CINOR, TCO, CIREST</div>
                <div className="text-sm text-gray-600">Intercommunalités Nord et Est</div>
              </div>
              <div className="bg-linkedin-50 p-4 rounded-lg border border-linkedin-100">
                <div className="font-bold text-gray-900 mb-1">CIVIS, CASUD</div>
                <div className="text-sm text-gray-600">Intercommunalités Sud et Ouest</div>
              </div>
              <div className="bg-linkedin-50 p-4 rounded-lg border border-linkedin-100">
                <div className="font-bold text-gray-900 mb-1">Région Réunion</div>
                <div className="text-sm text-gray-600">Marchés régionaux et départementaux</div>
              </div>
              <div className="bg-linkedin-50 p-4 rounded-lg border border-linkedin-100">
                <div className="font-bold text-gray-900 mb-1">24 Communes du 974</div>
                <div className="text-sm text-gray-600">Saint-Denis, Saint-Pierre, Le Port...</div>
              </div>
            </div>

            <Button
              onClick={() => {
                trackClick('home', 'navigation', 'search_markets_reunion');
                navigate('/marchepublics/974');
              }}
              variant="primary"
              className="w-full text-lg bg-linkedin-500 hover:bg-linkedin-600"
            >
              <Search className="w-5 h-5" />
              Voir tous les marchés surveillés par Iris
              <ArrowRight className="w-5 h-5" />
            </Button>

            <p className="text-sm text-gray-500 text-center mt-4">
              Mise à jour quotidienne • 100% des sources du territoire
            </p>
          </div>
        </div>
      </Section>

      {/* TRUST INDICATORS */}
      <Section className="py-12 bg-iris-bg">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-iris-card rounded-lg p-6 shadow-subtle border border-gray-200">
            <div className="text-4xl font-bold text-linkedin-500 mb-2">100+</div>
            <div className="text-sm text-gray-600 font-medium">Entreprises accompagnées</div>
          </div>
          <div className="bg-iris-card rounded-lg p-6 shadow-subtle border border-gray-200">
            <div className="text-4xl font-bold text-linkedin-500 mb-2">24/7</div>
            <div className="text-sm text-gray-600 font-medium">Veille active</div>
          </div>
          <div className="bg-iris-card rounded-lg p-6 shadow-subtle border border-gray-200">
            <div className="text-4xl font-bold text-linkedin-500 mb-2">150+</div>
            <div className="text-sm text-gray-600 font-medium">Marchés remportés</div>
          </div>
          <div className="bg-iris-card rounded-lg p-6 shadow-subtle border border-gray-200">
            <div className="text-4xl font-bold text-linkedin-500 mb-2">4.8/5</div>
            <div className="text-sm text-gray-600 font-medium">Satisfaction client</div>
          </div>
        </div>
      </Section>

      {/* CV D'IRIS - Style LinkedIn */}
      <Section id="profil-iris" className="py-20 bg-[#F3F2EF]">
        <div className="max-w-6xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            {/* Banner */}
            <div className="h-40 bg-gradient-to-r from-[#0A66C2] to-[#004182]"></div>

            {/* Profile Section */}
            <div className="px-6 pb-6">
              <div className="flex flex-col md:flex-row gap-6 -mt-20">
                {/* Photo */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <img
                      src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400"
                      alt="Iris - Assistante marchés publics"
                      className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="absolute bottom-2 right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white"></div>
                  </div>
                </div>

                {/* Info principale */}
                <div className="flex-1 pt-4 md:pt-0">
                  <h1 className="text-3xl font-bold text-white mb-1">Iris</h1>
                  <p className="text-2xl font-semibold text-white mb-12">Assistante IA • Experte Marchés Publics La Réunion</p>
                  <p className="text-base text-gray-700 mb-4">Saint-Denis (974) · <span className="text-[#0A66C2] font-semibold">Disponible 24/7</span></p>

                  <div className="flex flex-wrap gap-3 mb-4">
                    <span className="text-sm text-gray-600">100+ entreprises accompagnées</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-600">150+ marchés remportés</span>
                  </div>

                  <Button
                    onClick={() => {
                      trackClick('home', 'cta', 'cv_trial');
                      window.open('https://lmp.bolt.host/', '_blank');
                    }}
                    className="bg-[#0A66C2] hover:bg-[#004182] text-white px-6 py-2 rounded-full font-semibold"
                  >
                    Essayez-moi gratuitement
                  </Button>
                </div>

                {/* Quick stats - Desktop only */}
                <div className="hidden lg:block flex-shrink-0 pt-16">
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Disponibilité</div>
                      <div className="font-semibold text-green-600">24/7 Sans interruption</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Niveau d'expertise</div>
                      <div className="font-semibold text-gray-900">Expert Senior</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Satisfaction client</div>
                      <div className="font-semibold text-gray-900">4.8/5 ⭐</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* À propos */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">À propos</h2>
            <p className="text-gray-700 leading-relaxed">
              Bonjour, je suis Iris, votre assistante experte spécialisée dans les marchés publics réunionnais. Je surveille pour vous 24/7 l'ensemble des sources du territoire (Région, Département, 24 communes, 5 intercommunalités), j'analyse les DCE et je rédige automatiquement vos mémoires techniques. Mon expertise couvre la veille intelligente, l'analyse GO/NO-GO, la rédaction administrative et la sécurisation financière des BPU.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              <strong className="text-gray-900">Ma mission :</strong> Vous faire gagner du temps, éviter les erreurs coûteuses et ne manquer aucune opportunité dans le 974.
            </p>
          </div>

          {/* Expérience */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Expérience</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#0A66C2] rounded flex items-center justify-center text-white font-bold text-xl">
                    I
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">Assistante Marchés Publics IA</h3>
                  <p className="text-gray-700">Le Marché Public · Temps complet</p>
                  <p className="text-sm text-gray-600 mb-3">2024 - Présent · La Réunion (974)</p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>J'ai accompagné plus de 100 entreprises réunionnaises dans leurs réponses aux appels d'offres publics</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Je surveille 24/7 toutes les sources de marchés publics du 974 sans jamais en rater une</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>J'ai analysé et noté plus de 500 DCE avec mon système de score de pertinence (Market Sentinel)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>J'ai rédigé plus de 150 mémoires techniques qui ont contribué à des succès d'entreprises</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>Je fais gagner en moyenne 15h par marché aux entreprises que j'accompagne</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Compétences */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Compétences</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Veille Intelligente</h3>
                    <p className="text-sm text-gray-600">Je surveille automatiquement 24/7 · Couverture 100% du territoire · Alertes temps réel</p>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Maîtrise expert</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0A66C2] h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Analyse GO/NO-GO</h3>
                    <p className="text-sm text-gray-600">Je calcule un score de pertinence · J'analyse selon vos critères · Je recommande les meilleures opportunités</p>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Maîtrise expert</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0A66C2] h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-amber-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📝</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Rédaction Administrative</h3>
                    <p className="text-sm text-gray-600">Je rédige vos mémoires techniques · DC1 · Documents administratifs · Conformité garantie</p>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Maîtrise expert</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0A66C2] h-2 rounded-full" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">💰</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Analyse Financière</h3>
                    <p className="text-sm text-gray-600">Je vérifie vos BPU · Je détecte les anomalies · Je garantis la cohérence des prix · J'optimise vos offres</p>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Maîtrise expert</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0A66C2] h-2 rounded-full" style={{ width: '95%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Référencement Collectivités</h3>
                    <p className="text-sm text-gray-600">Je crée votre profil entreprise · Je vous rends visible auprès des donneurs d'ordre · Networking GO</p>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Maîtrise expert</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0A66C2] h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">📂</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Gestion Documentaire</h3>
                    <p className="text-sm text-gray-600">Je sécurise vos documents · J'organise votre coffre-fort · Je centralise tout · J'exporte selon vos besoins</p>
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 mb-1">Maîtrise expert</div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-[#0A66C2] h-2 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommandations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommandations</h2>

            <div className="space-y-6">
              <div className="border-l-4 border-[#0A66C2] pl-4">
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=100"
                    alt="Marc D."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">Marc D.</p>
                    <p className="text-sm text-gray-600">Dirigeant BTP · Saint-Denis</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Iris a transformé ma manière de travailler. Avant, je ratais 8 marchés sur 10 par manque de temps. Maintenant, je réponds à tous ceux qui m'intéressent. Elle m'a fait gagner 3 marchés en 2 mois. Le ROI est incroyable, je ne peux plus m'en passer."
                </p>
              </div>

              <div className="border-l-4 border-[#0A66C2] pl-4">
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src="https://images.pexels.com/photos/3184311/pexels-photo-3184311.jpeg?auto=compress&cs=tinysrgb&w=100"
                    alt="Sophie L."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">Sophie L.</p>
                    <p className="text-sm text-gray-600">Gérante PME · Le Port</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "Je passais mes week-ends à rédiger des mémoires techniques. Avec Iris, c'est 15 minutes et c'est fait. J'ai retrouvé ma vie personnelle et ma boîte cartonne. C'est tout simplement indispensable."
                </p>
              </div>

              <div className="border-l-4 border-[#0A66C2] pl-4">
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src="https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=100"
                    alt="Jean P."
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">Jean P.</p>
                    <p className="text-sm text-gray-600">Artisan · Saint-Pierre</p>
                  </div>
                </div>
                <p className="text-gray-700 italic">
                  "En solo, je ne pouvais pas suivre les appels d'offres. Iris fait le travail d'une assistante à temps complet pour 350€/mois. C'est tout simplement génial."
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* DEMO VIDEO */}
      <Section id="demo-video" className="py-20 bg-white">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Voyez-moi en action : analyse complète d'un DCE
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Regardez comment j'analyse un dossier de consultation de 200 pages et produis un mémoire technique en quelques minutes
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
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
      </Section>

      {/* AVANT / APRÈS */}
      <Section className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Avant / Après m'avoir recrutée
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Voyez concrètement comment votre quotidien change avec moi à vos côtés
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
                <h3 className="text-2xl font-bold text-red-600">Sans moi</h3>
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
                <h3 className="text-2xl font-bold text-green-600">Avec moi</h3>
                <p className="text-sm text-gray-600">Votre nouveau quotidien</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Zéro opportunité manquée</div>
                  <div className="text-sm text-gray-600">Je surveille 100% des sources 24/7. Vous êtes alerté sur tout dans le 974</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">15 minutes par mémoire</div>
                  <div className="text-sm text-gray-600">Je rédige le premier jet. Vous n'avez plus qu'à personnaliser et valider</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">BPU sécurisés, zéro erreur</div>
                  <div className="text-sm text-gray-600">Je vérifie la cohérence, je détecte les anomalies, je vous protège des pièges</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Sérénité totale</div>
                  <div className="text-sm text-gray-600">Vous dormez tranquille. Je ne dors jamais et je vous alerte instantanément</div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-green-200">
                <span className="text-green-500 mt-1">✓</span>
                <div>
                  <div className="font-bold text-gray-900 mb-1">Référencé auprès des collectivités</div>
                  <div className="text-sm text-gray-600">Je vous rends visible. Les donneurs d'ordre vous trouvent et vous contactent</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-block bg-gradient-to-r from-amber-100 to-yellow-100 p-8 rounded-2xl border-2 border-amber-300 max-w-2xl">
            <div className="text-4xl mb-4">💡</div>
            <p className="text-lg font-bold text-gray-900 mb-2">
              Le vrai coût, c'est de ne PAS me recruter
            </p>
            <p className="text-gray-700">
              Chaque semaine sans moi = opportunités ratées, heures perdues, stress inutile.
              <br />
              <span className="text-amber-600 font-bold">Un seul marché gagné grâce à moi rembourse des mois d'abonnement.</span>
            </p>
          </div>
        </div>
      </Section>

      {/* TARIFS - MODE RECRUTEMENT */}
      <Section id="tarifs" className="py-20 bg-[#F3F2EF]">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#0A66C2] text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-md">
            <Briefcase className="w-5 h-5" />
            Choisissez mon contrat selon vos besoins
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
            Recrutez-moi selon vos besoins
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-4">
            <strong>Toutes mes formules incluent</strong> : veille 974 illimitée, analyse GO/NO-GO, assistant IA, référencement collectivités, coffre-fort et exports
          </p>
          <p className="text-lg text-gray-600">
            Seul le nombre de <strong>mémoires techniques que je génère automatiquement</strong> varie selon le contrat
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {/* IRIS À L'ESSAI */}
          <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl">
            <div className="text-center mb-4">
              <div className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold mb-3">
                PÉRIODE D'ESSAI
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">0€</div>
              <div className="text-sm text-gray-600 mb-3">7 jours gratuits</div>
              <div className="text-lg font-bold text-gray-900">Essayez-moi gratuitement</div>
              <div className="text-xs text-gray-500 mt-1">Testez-moi avant de recruter</div>
            </div>
            <ul className="space-y-2 mb-6 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🔎 Je surveille tous les marchés du 974</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🎯 J'analyse tous vos DCE (GO/NO-GO)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🤖 Je réponds à vos questions 24/7</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🏛️ Je vous réfère auprès des collectivités</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>📂 Je sécurise tous vos documents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>📨 J'exporte tout en Word / PDF</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>🔍 Je cherche dans tout le BOAMP</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">−</span>
                <span className="text-gray-500">Mémoires techniques non inclus durant l'essai</span>
              </li>
            </ul>
            <Button
              onClick={() => {
                trackClick('home', 'cta', 'pricing_trial');
                window.open('https://lmp.bolt.host/', '_blank');
              }}
              className="w-full text-sm py-3 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full font-semibold"
            >
              Essayez-moi 7 jours
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
                window.open('https://lmp.bolt.host/', '_blank');
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
                window.open('https://lmp.bolt.host/', '_blank');
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
                window.open('https://lmp.bolt.host/', '_blank');
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
                window.open('https://lmp.bolt.host/', '_blank');
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
              <span>Formation incluse</span>
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
