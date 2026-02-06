import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Shield,
  Sparkles,
  Star,
  Award,
  BarChart3,
  FileText,
  Bell
} from "lucide-react";
import { Carousel } from '../ui/Carousel';

const TESTIMONIAL_PHOTOS = {
  marc: "https://images.pexels.com/photos/5490276/pexels-photo-5490276.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  sophie: "https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop",
  jeanpierre: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop"
};

const TEAM_PHOTOS = {
  founder: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
  cofounder: "https://images.pexels.com/photos/3756681/pexels-photo-3756681.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop",
  cto: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
};

export function HomeIris() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/logo1.png" alt="Iris" className="h-10 w-auto" />
            <span className="font-bold text-xl text-gray-900">Iris</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#methode" className="hover:text-gray-900 transition-colors">Comment ça marche</a>
            <a href="#resultats" className="hover:text-gray-900 transition-colors">Résultats</a>
            <a href="#fonctionnalites" className="hover:text-gray-900 transition-colors">Fonctionnalités</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/mmp')}
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors px-4 py-2"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="text-sm font-bold bg-gray-900 text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-all"
            >
              Essai gratuit
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
                <img
                  src="https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
                  alt="Iris - Assistante IA"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm font-medium text-gray-700">Iris, votre assistante IA</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1]">
              J'ai arrêté de courir après les marchés.
              <span className="block text-gray-900 mt-2 underline decoration-4 decoration-gray-900 underline-offset-8">Maintenant, ils viennent à moi.</span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
              Avant, je passais mes lundis matin à éplucher le BOAMP. Je ratais des opportunités, je répondais à des marchés trop gros ou trop loin.
              <strong className="text-gray-900"> Depuis qu'Iris fait le travail pour moi, je reçois uniquement les marchés que je peux gagner.</strong>
            </p>

            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-3">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-700 text-xs font-bold">
                    {['M','S','J','A','L'][i-1]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">Rejoint par 127+ entrepreneurs</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all"
              >
                Tester gratuitement pendant 7 jours
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/mmp')}
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-lg font-semibold hover:border-gray-900 transition-all"
              >
                J'ai déjà un compte
              </button>
            </div>
            <p className="text-sm text-gray-500">Sans carte bancaire. Sans engagement.</p>
          </div>

          <div className="relative">
            <Carousel className="relative max-w-full" />
          </div>
        </div>
      </section>

      {/* Le vrai probleme */}
      <section className="bg-white py-16 lg:py-24 border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Soyons honnêtes : répondre aux marchés publics, c'était mon enfer
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Je sais exactement ce que vous vivez. J'y suis passé. Ça m'a pris des années à comprendre qu'il y avait une meilleure façon de faire.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-400 mb-6">Avant</h3>
              <ul className="space-y-4">
                {[
                  "Des heures à chercher les bons marchés sur le BOAMP",
                  "Je découvrais des appels d'offres la veille de la date limite",
                  "Je répondais à tout, même aux marchés que je ne pouvais pas gagner",
                  "3 jours pour rédiger un mémoire technique moyen",
                  "Résultat : beaucoup d'efforts, peu de marchés gagnés"
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-base text-gray-600">
                    <span className="text-gray-300 mt-1 font-bold">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Maintenant</h3>
              <ul className="space-y-4">
                {[
                  "Je reçois chaque matin les marchés qui me correspondent",
                  "L'IA me dit si ça vaut le coup d'y répondre, ou pas",
                  "Je me concentre uniquement sur les opportunités rentables",
                  "Mon mémoire technique est généré en 15 minutes",
                  "Je réponds mieux, plus vite, et je gagne plus souvent"
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-base text-gray-900 font-medium">
                    <CheckCircle className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-16 bg-gray-900 text-white rounded-xl p-8 text-center">
            <p className="text-xl font-semibold">
              Un seul marché gagné rembourse des années d'abonnement.
            </p>
          </div>
        </div>
      </section>

      {/* Methode en 4 etapes */}
      <section id="methode" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Concrètement, voici comment je fais maintenant
            </h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              4 étapes. 15 minutes le matin. Et je passe à autre chose.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Bell,
                step: "1",
                title: "Je reçois mes alertes",
                description: "Chaque matin, Iris me notifie les nouveaux marchés qui correspondent à mon activité, ma zone, mon chiffre d'affaires."
              },
              {
                icon: Target,
                step: "2",
                title: "Je filtre en 1 clic",
                description: "L'assistant GO/NO-GO me dit si le marché est pour moi. Montant, délai, concurrence... tout est analysé."
              },
              {
                icon: FileText,
                step: "3",
                title: "Je génère mon mémoire",
                description: "L'IA rédige un mémoire technique adapté au marché, à mon entreprise et au cahier des charges. Je n'ai plus qu'à relire."
              },
              {
                icon: Award,
                step: "4",
                title: "Je dépose et je gagne",
                description: "Mon dossier est complet, professionnel, et déposé en avance. Mes chances de succès ont triplé."
              }
            ].map((item, idx) => (
              <div key={idx} className="relative">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 mb-2">ÉTAPE {item.step}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-base text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resultats concrets */}
      <section id="resultats" className="py-16 lg:py-24 bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ce que ça a changé pour moi
            </h2>
            <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
              Pas de promesses en l'air. Juste mes chiffres depuis que j'utilise Iris au quotidien.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 mb-16">
            {[
              {
                metric: "x3",
                label: "marchés gagnés",
                detail: "Par rapport à l'année précédente"
              },
              {
                metric: "2h",
                label: "au lieu de 2 jours",
                detail: "Pour un mémoire technique complet"
              },
              {
                metric: "0",
                label: "opportunité ratée",
                detail: "Grâce aux alertes automatiques"
              }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl font-bold text-white mb-2">{stat.metric}</div>
                <div className="text-lg font-semibold text-white mb-1">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.detail}</div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-12">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              <img
                src={TESTIMONIAL_PHOTOS.marc}
                alt="Marc Dubois"
                className="w-16 h-16 rounded-full object-cover mb-6"
              />
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                "Honnêtement, je ne pensais pas qu'un outil pouvait changer autant ma façon de travailler. Avant, la réponse aux AO c'était ma bête noire.
                Maintenant c'est presque devenu agréable."
              </p>
              <p className="text-base text-white font-semibold">Marc Dubois</p>
              <p className="text-sm text-gray-500">Artisan électricien • La Réunion</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalites */}
      <section id="fonctionnalites" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Tout ce qu'il faut pour répondre sereinement
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Pas de gadget. Juste les outils dont j'avais vraiment besoin.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
            {[
              {
                icon: Bell,
                title: "Veille sur mesure",
                description: "Recevez les marchés qui correspondent à votre métier, votre zone géographique et votre capacité. Rien de plus, rien de moins."
              },
              {
                icon: Sparkles,
                title: "Analyse GO/NO-GO",
                description: "L'IA évalue chaque marché : est-ce que ça vaut le coup d'y passer du temps ? Réponse en 10 secondes."
              },
              {
                icon: FileText,
                title: "Mémoire technique IA",
                description: "Générez un mémoire technique adapté à chaque marché. L'IA connaît votre entreprise et s'adapte au DCE."
              },
              {
                icon: Shield,
                title: "Coffre-fort documents",
                description: "Tous vos documents administratifs stockés en sécurité. Kbis, attestations, références... tout est prêt quand vous en avez besoin."
              },
              {
                icon: Zap,
                title: "Export Word & PDF",
                description: "Téléchargez vos mémoires dans le format que vous voulez. Prêt à déposer sur la plateforme de l'acheteur."
              },
              {
                icon: BarChart3,
                title: "Suivi des candidatures",
                description: "Gardez un œil sur toutes vos réponses en cours. Plus de post-it ni de tableurs Excel qui se perdent."
              }
            ].map((feature, idx) => (
              <div key={idx} className="space-y-4">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Pricing */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Essai de 7 jours GRATUITS sans engagement
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez le plan qui correspond à votre rythme de réponse aux appels d'offres
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan BRONZE - Mi-temps */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Bronze</h3>
                  <p className="text-sm text-gray-500">Mi-temps</p>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">199€</span>
                  <span className="text-gray-600 text-lg">/mois</span>
                </div>
                <p className="text-sm text-gray-600">
                  Parfait pour démarrer et tester le marché public
                </p>
              </div>

              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Veille marchés illimitée</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">IA et GO/NO-GO illimités</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-900 font-semibold">1 mémoire technique / mois</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Export Word & PDF</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Support email</span>
                  </li>
                </ul>

                <button
                  onClick={() => navigate('/subscription')}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Commencer
                </button>
              </div>
            </div>

            {/* Plan ARGENT - Temps plein - POPULAIRE */}
            <div className="bg-gray-900 text-white rounded-lg overflow-hidden relative transform md:scale-105">
              <div className="absolute top-4 right-4 bg-white text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                POPULAIRE
              </div>
              <div className="p-8 border-b border-gray-800">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-1">Argent</h3>
                  <p className="text-sm text-gray-400">Temps plein</p>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold">349€</span>
                  <span className="text-gray-400 text-lg">/mois</span>
                </div>
                <p className="text-sm text-gray-400">
                  Pour les entreprises actives sur les marchés publics
                </p>
              </div>

              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Veille marchés illimitée</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">IA et GO/NO-GO illimités</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white font-semibold">2 mémoires techniques / mois</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">Export Word & PDF</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-white font-semibold">Support prioritaire</span>
                  </li>
                </ul>

                <button
                  onClick={() => navigate('/subscription')}
                  className="w-full bg-white hover:bg-gray-100 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Commencer
                </button>
              </div>
            </div>

            {/* Plan OR - Heures supplémentaires */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-8 border-b border-gray-100">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Or</h3>
                  <p className="text-sm text-gray-500">Heures sup</p>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-gray-900">649€</span>
                  <span className="text-gray-600 text-lg">/mois</span>
                </div>
                <p className="text-sm text-gray-600">
                  Pour maximiser votre activité marchés publics
                </p>
              </div>

              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Veille marchés illimitée</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">IA et GO/NO-GO illimités</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-900 font-semibold">5 mémoires techniques / mois</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Export Word & PDF</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-900 font-semibold">Support VIP</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-900 font-semibold">Accompagnement personnalisé</span>
                  </li>
                </ul>

                <button
                  onClick={() => navigate('/subscription')}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-lg transition-all"
                >
                  Commencer
                </button>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-gray-600">
              7 jours d'essai gratuit • Sans carte bancaire • Sans engagement
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 lg:py-32 bg-gray-900 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-bold leading-tight mb-8">
            Si j'avais su que ça existait, j'aurais commencé bien plus tôt
          </h2>
          <p className="text-xl text-gray-400 mb-12 leading-relaxed">
            Chaque semaine sans Iris, ce sont des marchés que vous ne voyez pas, des opportunités qui passent, et du temps que vous ne récupérerez pas.
          </p>

          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-10 py-4 rounded-lg text-lg font-semibold transition-all"
          >
            Tester gratuitement pendant 7 jours
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-6 text-sm text-gray-500">
            Sans carte bancaire • Sans engagement
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo1.png" alt="Iris" className="h-8 w-auto brightness-200" />
            <span className="text-sm text-gray-400">© 2026 Iris - Expert IA en Marches Publics</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <button onClick={() => navigate('/mentions-legales')} className="hover:text-white transition-colors">
              Mentions légales
            </button>
            <button onClick={() => navigate('/cgv')} className="hover:text-white transition-colors">
              CGV
            </button>
            <button onClick={() => navigate('/mmp')} className="hover:text-white transition-colors">
              Connexion
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
