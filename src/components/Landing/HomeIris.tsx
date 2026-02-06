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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <img src="/logo1.png" alt="Iris" className="h-10 w-auto" />
            <span className="font-bold text-xl text-gray-900">Iris</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#methode" className="hover:text-orange-600 transition-colors">Comment ca marche</a>
            <a href="#resultats" className="hover:text-orange-600 transition-colors">Resultats</a>
            <a href="#fonctionnalites" className="hover:text-orange-600 transition-colors">Fonctionnalites</a>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/mmp')}
              className="text-sm font-semibold text-gray-700 hover:text-orange-600 transition-colors px-4 py-2"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="text-sm font-bold bg-gradient-to-r from-orange-600 to-red-600 text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all hover:scale-105"
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
            <div className="flex items-center gap-4 flex-wrap">
              <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">L'assistant IA des marches publics</span>
              </div>
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-orange-200">
                  <img
                    src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
                    alt="Iris AI Assistant"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-orange-500 to-red-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1]">
              J'ai arrete de courir apres les marches.
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600 mt-2">Maintenant, ce sont eux qui viennent a moi.</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              Avant, je passais mes lundis matin a eplucher le BOAMP. Je ratais des opportunites, je repondais a des marches trop gros ou trop loin.
              <strong className="text-gray-800"> Depuis que j'utilise Iris, je recois chaque matin les marches qui me correspondent vraiment.</strong>
              Le reste, c'est de l'IA.
            </p>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[
                  'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-teal-500', 'bg-rose-500'
                ].map((color, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full ${color} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>
                    {['M','S','J','A','L'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">Utilise par des artisans, PME et bureaux d'etude</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/signup')}
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-7 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-[1.03]"
              >
                Tester gratuitement pendant 7 jours
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/mmp')}
                className="inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-700 px-7 py-4 rounded-xl font-semibold hover:border-orange-400 hover:text-orange-600 transition-all"
              >
                J'ai deja un compte
              </button>
            </div>
            <p className="text-sm text-gray-400">Sans carte bancaire. Sans engagement.</p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-orange-200 to-red-200 rounded-3xl blur-3xl opacity-30" />
            <Carousel className="relative max-w-full" />
          </div>
        </div>
      </section>

      {/* Le vrai probleme */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Soyons honnetes : repondre aux marches publics, c'est epuisant
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Je le sais parce que je suis passe par la. Et j'en ai eu marre.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-7 border border-red-100 shadow-sm">
              <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-sm font-bold">X</span>
                Ce que je vivais avant
              </h3>
              <ul className="space-y-3">
                {[
                  "Des heures a chercher les bons marches sur le BOAMP",
                  "Je decouvrais des appels d'offres la veille de la date limite",
                  "Je repondais a tout, meme aux marches que je ne pouvais pas gagner",
                  "3 jours pour rediger un memoire technique moyen",
                  "Resultat : beaucoup d'efforts, peu de marches gagnes"
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-700">
                    <span className="text-red-400 mt-0.5">--</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-7 border-2 border-green-200 shadow-md">
              <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Ce qui a change avec Iris
              </h3>
              <ul className="space-y-3">
                {[
                  "Je recois chaque matin les marches qui me correspondent",
                  "L'IA me dit si ca vaut le coup d'y repondre, ou pas",
                  "Je me concentre uniquement sur les opportunites rentables",
                  "Mon memoire technique est genere en 15 minutes",
                  "Je reponds mieux, plus vite, et je gagne plus souvent"
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-gray-800 font-medium">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl p-6 text-center">
            <p className="text-lg font-semibold">
              Un seul marche gagne rembourse des annees d'abonnement.
              <span className="block text-orange-100 mt-1 text-base font-normal">Combien de marches passent sous votre radar chaque semaine ?</span>
            </p>
          </div>
        </div>
      </section>

      {/* Methode en 4 etapes */}
      <section id="methode" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Concretement, voici comment je fais maintenant
            </h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              4 etapes. 15 minutes le matin. Et je passe a autre chose.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Bell,
                step: "1",
                title: "Je recois mes alertes",
                description: "Chaque matin, Iris me notifie les nouveaux marches qui correspondent a mon activite, ma zone, mon chiffre d'affaires.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Target,
                step: "2",
                title: "Je filtre en 1 clic",
                description: "L'assistant GO/NO-GO me dit si le marche est pour moi. Montant, delai, concurrence... tout est analyse.",
                color: "from-teal-500 to-teal-600"
              },
              {
                icon: FileText,
                step: "3",
                title: "Je genere mon memoire",
                description: "L'IA redige un memoire technique adapte au marche, a mon entreprise et au cahier des charges. Je n'ai plus qu'a relire.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: Award,
                step: "4",
                title: "Je depose et je gagne",
                description: "Mon dossier est complet, professionnel, et depose en avance. Mes chances de succes ont triple.",
                color: "from-green-500 to-green-600"
              }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border border-gray-100 hover:border-orange-200 h-full">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="text-xs font-bold text-orange-600 mb-1">ETAPE {item.step}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resultats concrets */}
      <section id="resultats" className="py-16 lg:py-24 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Ce que ca a change pour moi <span className="text-orange-400">(en vrai)</span>
            </h2>
            <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
              Pas de promesses en l'air. Juste les chiffres de mon activite depuis que j'utilise Iris au quotidien.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                metric: "x3",
                label: "marches gagnes",
                detail: "Par rapport a l'annee precedente",
                icon: TrendingUp
              },
              {
                metric: "2h",
                label: "au lieu de 2 jours",
                detail: "Pour un memoire technique complet",
                icon: Clock
              },
              {
                metric: "0",
                label: "opportunite ratee",
                detail: "Grace aux alertes automatiques",
                icon: BarChart3
              }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur rounded-2xl p-7 border border-white/10 hover:bg-white/10 transition-all">
                <stat.icon className="w-10 h-10 text-orange-400 mb-3" />
                <div className="text-4xl font-bold text-white mb-1">{stat.metric}</div>
                <div className="text-base font-semibold text-gray-200">{stat.label}</div>
                <div className="text-sm text-gray-400 mt-1">{stat.detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-white/10 rounded-2xl p-8 border border-white/10">
            <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
              <img
                src={TESTIMONIAL_PHOTOS.marc}
                alt="Marc Dubois"
                className="w-20 h-20 rounded-full object-cover border-4 border-white/20 shadow-lg mb-4"
              />
              <p className="text-lg text-gray-200 leading-relaxed mb-4">
                "Honnement, je ne pensais pas qu'un outil pouvait changer autant ma facon de travailler. Avant, la reponse aux AO c'etait ma bete noire.
                Maintenant c'est presque devenu agreable."
              </p>
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                ))}
              </div>
              <p className="text-base text-orange-400 font-bold">Marc Dubois</p>
              <p className="text-sm text-gray-400">Artisan électricien • La Réunion</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fonctionnalites */}
      <section id="fonctionnalites" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Tout ce qu'il faut pour <span className="text-orange-600">repondre sereinement</span>
            </h2>
            <p className="mt-3 text-lg text-gray-600">
              Pas de gadget. Juste les outils dont j'avais vraiment besoin.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Bell,
                title: "Veille sur mesure",
                description: "Recevez les marches qui correspondent a votre metier, votre zone geographique et votre capacite. Rien de plus, rien de moins."
              },
              {
                icon: Sparkles,
                title: "Analyse GO/NO-GO",
                description: "L'IA evalue chaque marche : est-ce que ca vaut le coup d'y passer du temps ? Reponse en 10 secondes."
              },
              {
                icon: FileText,
                title: "Memoire technique IA",
                description: "Generez un memoire technique adapte a chaque marche. L'IA connait votre entreprise et s'adapte au DCE."
              },
              {
                icon: Shield,
                title: "Coffre-fort documents",
                description: "Tous vos documents administratifs stockes en securite. Kbis, attestations, references... tout est pret quand vous en avez besoin."
              },
              {
                icon: Zap,
                title: "Export Word & PDF",
                description: "Telechargez vos memoires dans le format que vous voulez. Pret a deposer sur la plateforme de l'acheteur."
              },
              {
                icon: BarChart3,
                title: "Suivi des candidatures",
                description: "Gardez un oeil sur toutes vos reponses en cours. Plus de post-it ni de tableurs Excel qui se perdent."
              }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-gray-100 hover:border-orange-200">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Pricing */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Un tarif simple et <span className="text-orange-600">transparent</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choisissez le plan qui correspond à votre rythme de réponse aux appels d'offres
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan BRONZE - Mi-temps */}
            <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-8 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">Bronze</h3>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                    MI-TEMPS
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-extrabold text-gray-900">199€</span>
                  <span className="text-gray-600 text-lg">/mois</span>
                </div>
                <p className="text-sm text-gray-600">
                  Parfait pour démarrer et tester le marché public
                </p>
              </div>

              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Veille marchés illimitée</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">IA et GO/NO-GO illimités</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-semibold">1 mémoire technique / mois</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Export Word & PDF</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Support email</span>
                  </li>
                </ul>

                <button
                  onClick={() => navigate('/subscription')}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
                >
                  Commencer
                </button>
              </div>
            </div>

            {/* Plan ARGENT - Temps plein - POPULAIRE */}
            <div className="bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all border-2 border-blue-500 overflow-hidden relative transform md:scale-105">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
                POPULAIRE
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 border-b border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">Argent</h3>
                  <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                    TEMPS PLEIN
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-extrabold text-gray-900">349€</span>
                  <span className="text-gray-600 text-lg">/mois</span>
                </div>
                <p className="text-sm text-gray-600">
                  Pour les entreprises actives sur les marchés publics
                </p>
              </div>

              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Veille marchés illimitée</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">IA et GO/NO-GO illimités</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-semibold">2 mémoires techniques / mois</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Export Word & PDF</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-semibold">Support prioritaire</span>
                  </li>
                </ul>

                <button
                  onClick={() => navigate('/subscription')}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
                >
                  Commencer
                </button>
              </div>
            </div>

            {/* Plan OR - Heures supplémentaires */}
            <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all border-2 border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-2xl font-bold text-gray-900">Or</h3>
                  <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full">
                    HEURES SUP
                  </span>
                </div>
                <div className="mb-4">
                  <span className="text-5xl font-extrabold text-gray-900">649€</span>
                  <span className="text-gray-600 text-lg">/mois</span>
                </div>
                <p className="text-sm text-gray-600">
                  Pour maximiser votre activité marchés publics
                </p>
              </div>

              <div className="p-8">
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Veille marchés illimitée</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">IA et GO/NO-GO illimités</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-semibold">5 mémoires techniques / mois</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">Export Word & PDF</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-semibold">Support VIP</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-semibold">Accompagnement personnalisé</span>
                  </li>
                </ul>

                <button
                  onClick={() => navigate('/subscription')}
                  className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-105 hover:shadow-lg"
                >
                  Commencer
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-600 mb-4">
              7 jours d'essai gratuit • Sans carte bancaire • Sans engagement
            </p>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800 font-medium">Paiement sécurisé via Stripe</span>
            </div>
          </div>
        </div>
      </section>

      {/* Temoignages clients - Style LinkedIn */}
      <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ils ont transformé leur activité avec <span className="text-orange-600">Iris</span>
            </h2>
            <p className="text-lg text-gray-600">
              Des entrepreneurs réunionnais qui partagent leur expérience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-br from-orange-50 to-white p-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={TESTIMONIAL_PHOTOS.marc}
                    alt="Marc Dubois"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-3"
                  />
                  <h3 className="text-lg font-bold text-gray-900">Marc Dubois</h3>
                  <p className="text-sm text-gray-600 font-medium">Électricien</p>
                  <p className="text-xs text-gray-500 mt-1">8 salariés • La Réunion</p>
                  <div className="flex gap-0.5 justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 italic leading-relaxed text-center text-sm">
                  "J'ai remporté 3 marchés en 2 mois avec Iris. Avant, je passais des semaines sur les dossiers. Maintenant, c'est réglé en quelques heures."
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-br from-blue-50 to-white p-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={TESTIMONIAL_PHOTOS.sophie}
                    alt="Sophie Laurent"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-3"
                  />
                  <h3 className="text-lg font-bold text-gray-900">Sophie Laurent</h3>
                  <p className="text-sm text-gray-600 font-medium">Dirigeante PME BTP</p>
                  <p className="text-xs text-gray-500 mt-1">45 salariés • Mayotte</p>
                  <div className="flex gap-0.5 justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 italic leading-relaxed text-center text-sm">
                  "Le ROI est incroyable. On a multiplié par 2 notre CA sur les marchés publics en 6 mois. Et on a enfin du temps pour nos équipes."
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-br from-green-50 to-white p-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src={TESTIMONIAL_PHOTOS.jeanpierre}
                    alt="Jean-Pierre Martin"
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mb-3"
                  />
                  <h3 className="text-lg font-bold text-gray-900">Jean-Pierre Martin</h3>
                  <p className="text-sm text-gray-600 font-medium">Maçon indépendant</p>
                  <p className="text-xs text-gray-500 mt-1">La Réunion</p>
                  <div className="flex gap-0.5 justify-center mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 italic leading-relaxed text-center text-sm">
                  "Franchement, je ne pensais pas que c'était possible. Fini les nuits blanches à remplir des formulaires. Je recommande à tous mes confrères."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section equipe */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              L'équipe derrière <span className="text-orange-600">Iris</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Une équipe passionnée et expérimentée dédiée à votre réussite sur les marchés publics
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="relative mb-6 mx-auto w-48 h-48">
                <img
                  src={TEAM_PHOTOS.founder}
                  alt="Thomas Leroy"
                  className="w-full h-full rounded-2xl object-cover shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                  Fondateur
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Thomas Leroy</h3>
              <p className="text-orange-600 font-semibold mb-3">CEO & Co-fondateur</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                15 ans d'expérience dans les marchés publics. Ancien responsable des appels d'offres dans une PME BTP réunionnaise.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6 mx-auto w-48 h-48">
                <img
                  src={TEAM_PHOTOS.cofounder}
                  alt="Marie Fontaine"
                  className="w-full h-full rounded-2xl object-cover shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                  Co-fondatrice
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Marie Fontaine</h3>
              <p className="text-blue-600 font-semibold mb-3">COO & Stratégie</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Experte en transformation digitale et ancienne consultante pour les entreprises du secteur public à La Réunion.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6 mx-auto w-48 h-48">
                <img
                  src={TEAM_PHOTOS.cto}
                  alt="Julien Bernard"
                  className="w-full h-full rounded-2xl object-cover shadow-xl border-4 border-white group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute -bottom-3 -right-3 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                  CTO
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Julien Bernard</h3>
              <p className="text-green-600 font-semibold mb-3">Directeur Technique</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Ingénieur IA et expert en automatisation. 10 ans d'expérience dans le développement de solutions d'intelligence artificielle.
              </p>
            </div>
          </div>

          <div className="mt-14 max-w-4xl mx-auto bg-gradient-to-r from-orange-50 to-blue-50 rounded-2xl p-8 border-2 border-orange-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Notre Mission</h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                Simplifier l'accès aux marchés publics pour toutes les entreprises réunionnaises, des artisans aux PME.
                Nous croyons que chaque entreprise mérite sa chance de remporter des marchés publics, sans se perdre dans
                la complexité administrative.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-orange-600 to-red-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
            Si j'avais su que ca existait, j'aurais commence bien plus tot
          </h2>
          <p className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto leading-relaxed">
            Chaque semaine sans Iris, ce sont des marches que vous ne voyez pas, des opportunites qui passent, et du temps que vous ne recupererez pas. L'essai est gratuit. Le risque est a zero. Le seul regret, ce sera de ne pas avoir essaye plus tot.
          </p>

          <div className="mt-8 space-y-4">
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-10 py-4 rounded-xl text-lg font-bold shadow-2xl hover:scale-105 transition-all"
            >
              Je teste Iris gratuitement pendant 7 jours
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-orange-100 text-sm">
              Sans carte bancaire. Sans engagement. Acces immediat.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo1.png" alt="Iris" className="h-8 w-auto brightness-200" />
            <span className="text-sm text-gray-400">© 2026 Iris - Expert IA en Marches Publics</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <button onClick={() => navigate('/mentions-legales')} className="hover:text-white transition-colors">
              Mentions legales
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
