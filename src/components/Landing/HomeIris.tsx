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
            <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full border border-orange-200">
              <Sparkles className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">L'assistant IA des marches publics</span>
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

          <div className="mt-10 bg-white/10 rounded-2xl p-6 text-center border border-white/10">
            <p className="text-lg text-gray-200 leading-relaxed">
              "Honnement, je ne pensais pas qu'un outil pouvait changer autant ma facon de travailler. Avant, la reponse aux AO c'etait ma bete noire.
              Maintenant c'est presque devenu agreable."
            </p>
            <p className="mt-3 text-sm text-orange-400 font-semibold">-- Un utilisateur Iris, artisan electricien a La Reunion</p>
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
