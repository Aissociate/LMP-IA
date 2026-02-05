import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Zap,
  Target,
  TrendingUp,
  Clock,
  Shield,
  Users,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Star,
  Award,
  BarChart3
} from "lucide-react";
import { Button } from '../ui/Button';
import { Section } from '../ui/Section';

const Carousel = () => {
  const images = ['/caroussel-1.png', '/caroussel-2.png', '/caroussel-3.png', '/caroussel-5.png', '/caroussel-6.png', '/caroussel-7.png', '/caroussel-8.png'];
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
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-100 group max-w-5xl mx-auto">
      <img
        src={images[currentIndex]}
        alt={`Aperçu ${currentIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-500"
      />
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-2 h-2 rounded-full transition-all ${
              idx === currentIndex ? 'bg-white w-8' : 'bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export function HomeIris() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section - Style LinkedIn Premium */}
      <Section className="py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            {/* Badge Premium */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-full border border-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-900">Rejoignez 500+ entrepreneurs qui gagnent leurs marchés</span>
            </div>

            {/* Titre accrocheur - Style Neil Patel */}
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              J'ai transformé la <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">prospection de marchés publics</span> en avantage compétitif
            </h1>

            {/* Sous-titre émotionnel - Style Alex Hormozi */}
            <p className="text-xl text-gray-600 leading-relaxed">
              Pendant que mes concurrents passent des heures à chercher des marchés,
              <strong className="text-gray-900"> j'utilise Iris pour identifier, analyser et remporter les opportunités qui comptent vraiment</strong>.
              En 7 jours, vous verrez la différence.
            </p>

            {/* Social Proof */}
            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white" />
                ))}
              </div>
              <div className="text-sm">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600">4.9/5 • Plus de 500 utilisateurs actifs</p>
              </div>
            </div>

            {/* CTA Principal - Style Russell Brunson */}
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/signup')}
                variant="primary"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-4 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <span>Commencer mon essai gratuit de 7 jours</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
              <p className="text-sm text-gray-500">
                ✓ Aucune carte bancaire requise pour démarrer • ✓ Accès immédiat à toutes les fonctionnalités
              </p>
            </div>
          </div>

          {/* Visuel */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-3xl blur-3xl opacity-20" />
            <Carousel />
          </div>
        </div>
      </Section>

      {/* Section Problème/Solution - Style Alex Hormozi */}
      <Section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Voici pourquoi vous perdez des marchés
              <br />
              <span className="text-red-600">(et comment j'ai résolu ce problème)</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 text-left">
            {/* Avant */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
                <h3 className="text-2xl font-bold text-red-900">AVANT Iris</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Je passais 10h/semaine à chercher des marchés",
                  "Je manquais les meilleures opportunités",
                  "Je répondais à tout sans stratégie",
                  "Mes mémoires techniques manquaient d'impact",
                  "Mon taux de réussite stagnait à 15%"
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-700">
                    <span className="text-red-600 font-bold">×</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Après */}
            <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-green-900">APRÈS Iris</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Je trouve les marchés qualifiés en 15 minutes",
                  "L'IA me notifie des opportunités parfaites",
                  "Je cible les marchés à fort ROI uniquement",
                  "Mes mémoires sont générées en 1 clic",
                  "Mon taux de réussite a bondi à 42%"
                ].map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-gray-800 font-medium">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl p-8">
            <p className="text-2xl font-bold">
              Le coût réel de ne PAS utiliser Iris ?
              <span className="block mt-2">Un marché à 50 000€ perdu = 250 mois d'abonnement 💰</span>
            </p>
          </div>
        </div>
      </Section>

      {/* Méthode/Process - Style Value Ladder */}
      <Section className="py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Ma méthode en 4 étapes pour <span className="text-orange-600">gagner plus de marchés</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Le système exact que j'utilise chaque jour pour identifier et remporter les marchés les plus rentables
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: Target,
              step: "ÉTAPE 1",
              title: "Je cible",
              description: "L'IA scanne 50 000+ marchés et me propose uniquement ceux qui matchent mon expertise",
              color: "from-blue-500 to-blue-600"
            },
            {
              icon: Zap,
              step: "ÉTAPE 2",
              title: "J'analyse",
              description: "L'assistant GO/NO-GO évalue mes chances de succès et le ROI potentiel en temps réel",
              color: "from-purple-500 to-purple-600"
            },
            {
              icon: Award,
              step: "ÉTAPE 3",
              title: "Je produis",
              description: "Je génère un mémoire technique professionnel en 1 clic au lieu de 3 jours de rédaction",
              color: "from-orange-500 to-orange-600"
            },
            {
              icon: TrendingUp,
              step: "ÉTAPE 4",
              title: "Je gagne",
              description: "Je soumets des réponses de qualité supérieure et je multiplie mes chances de succès",
              color: "from-green-500 to-green-600"
            }
          ].map((item, idx) => (
            <div key={idx} className="relative group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-gray-100 hover:border-orange-300 h-full">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-xs font-bold text-orange-600 mb-2">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
              {idx < 3 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-orange-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* ROI Calculator - Style Alex Hormozi */}
      <Section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Voici ce qu'Iris m'a <span className="text-orange-400">vraiment rapporté</span>
            </h2>
            <p className="text-xl text-gray-300">
              Les chiffres que je partage avec mes prospects pour les convaincre
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                metric: "42%",
                label: "Taux de réussite",
                detail: "vs 15% avant",
                icon: TrendingUp
              },
              {
                metric: "23h",
                label: "Économisées/mois",
                detail: "Sur la prospection",
                icon: Clock
              },
              {
                metric: "320K€",
                label: "CA additionnel",
                detail: "En 6 mois d'utilisation",
                icon: BarChart3
              }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all">
                <stat.icon className="w-12 h-12 text-orange-400 mb-4" />
                <div className="text-5xl font-bold text-white mb-2">{stat.metric}</div>
                <div className="text-xl font-semibold text-gray-200 mb-1">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-center">
            <p className="text-2xl font-bold mb-4">
              Pour 199€/mois, Iris ne m'a rapporté qu'UN SEUL marché de 50K€
            </p>
            <p className="text-xl text-orange-100">
              ROI : 25 000% • Retour sur investissement en moins de 30 jours
            </p>
          </div>
        </div>
      </Section>

      {/* Fonctionnalités - Style Benefit Driven */}
      <Section className="py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Tout ce dont vous avez besoin pour <span className="text-orange-600">dominer votre marché</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Target,
              title: "Veille Intelligente",
              description: "Recevez uniquement les marchés qui correspondent à votre ADN d'entreprise. Plus de temps perdu sur des opportunités inadaptées."
            },
            {
              icon: Sparkles,
              title: "IA Analyse GO/NO-GO",
              description: "Sachez instantanément si un marché vaut votre temps. L'IA calcule vos chances et le ROI potentiel avant même de lire le DCE."
            },
            {
              icon: Award,
              title: "Mémoires Techniques IA",
              description: "Générez des mémoires professionnels en 1 clic. Ce qui prenait 3 jours se fait maintenant en 15 minutes avec une qualité supérieure."
            },
            {
              icon: Shield,
              title: "Coffre-Fort Sécurisé",
              description: "Stockez tous vos documents sensibles avec un chiffrement de niveau bancaire. Accessible 24/7, même sur mobile."
            },
            {
              icon: Users,
              title: "Multi-Utilisateurs",
              description: "Collaborez avec votre équipe en temps réel. Partagez les marchés, assignez les tâches, suivez l'avancement."
            },
            {
              icon: BarChart3,
              title: "Analytics & Reporting",
              description: "Suivez vos performances, identifiez vos points forts et optimisez votre stratégie de réponse aux marchés."
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-gray-100 hover:border-orange-300">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4">
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA Final - Style Urgence */}
      <Section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
        <div className="max-w-4xl mx-auto text-center text-white space-y-8">
          <h2 className="text-4xl lg:text-5xl font-bold">
            Vous avez deux options aujourd'hui
          </h2>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <div className="text-2xl font-bold mb-4">❌ Option 1</div>
              <p className="text-white/90 text-lg">
                Continuer comme avant. Passer des heures sur la prospection. Manquer les meilleures opportunités.
                Voir vos concurrents gagner les marchés que vous auriez pu remporter.
              </p>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-xl p-6 border-2 border-white/40 shadow-2xl">
              <div className="text-2xl font-bold mb-4">✓ Option 2</div>
              <p className="text-white text-lg font-medium">
                Rejoindre les 500+ entrepreneurs qui utilisent Iris pour gagner plus de marchés, plus rapidement.
                Tester gratuitement pendant 7 jours. Sans risque. Sans engagement.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <Button
              onClick={() => navigate('/signup')}
              className="bg-white text-orange-600 hover:bg-gray-100 px-12 py-5 text-xl font-bold shadow-2xl hover:scale-105 transform transition-all"
            >
              <span>Je commence mon essai gratuit maintenant</span>
              <ArrowRight className="w-6 h-6" />
            </Button>
            <p className="text-white/90 text-lg">
              ✓ Accès immédiat • ✓ Aucune CB requise • ✓ 7 jours pour tout tester
            </p>
            <p className="text-white/70 text-sm">
              Rejoignez les 47 entrepreneurs qui ont créé leur compte cette semaine
            </p>
          </div>
        </div>
      </Section>

      {/* Footer Simple */}
      <Section className="py-8 bg-slate-900 text-white">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-400">
            © 2026 Iris - Expert IA en Marchés Publics • Tous droits réservés
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <button onClick={() => navigate('/mentions-legales')} className="hover:text-white transition-colors">
              Mentions légales
            </button>
            <button onClick={() => navigate('/cgv')} className="hover:text-white transition-colors">
              CGV
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
