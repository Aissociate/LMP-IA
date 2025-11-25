import React, { useState, useEffect } from "react";
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Button = ({ className = "", children, onClick, ...props }: any) => (
  <button
    className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

const Section = ({ id, className = "", children }: any) => (
  <section id={id} className={`mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>
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
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-100 group max-w-5xl mx-auto">
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


export const LandingBTP: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "Marchés Publics BTP Réunion 974 | Communes, CINOR, TCO, CIREST | Le Marché Public.fr";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Remportez les marchés publics BTP à La Réunion : CINOR, TCO, CIREST, Région, communes 974. IA pour mémoires techniques gagnants.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1C1C1C] antialiased">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <img src="/logo1.png" alt="Le Marché Public.fr" className="h-[120px] w-auto" />
          </div>
          <Button
            onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
            className="bg-[#F77F00] text-white hover:bg-[#E06F00] focus:ring-[#F77F00]"
          >
            💰 Augmenter mon CA maintenant
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <Section className="py-16 sm:py-24">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span className="text-xl">🎁</span>
            1 mémoire IA offert pour commencer
          </div>
          <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700 mb-6">
            Remportez plus de marchés BTP à La Réunion
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-gray-600 text-xl mb-8">
            CINOR, TCO, CIREST, Région Réunion, communes 974 : L'IA qui génère vos mémoires techniques gagnants
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              className="bg-[#F77F00] text-white hover:bg-[#F77F00]/90 text-lg px-8 py-4"
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
            >
              🎁 Obtenir mon mémoire IA offert
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              className="border-2 border-gray-300 bg-white text-gray-900 hover:bg-gray-50 text-lg px-8 py-4"
              onClick={() => navigate('/login')}
            >
              Accéder à mon compte
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-12">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-white"
                  />
                ))}
              </div>
              <span>Plus de 50 entreprises BTP de La Réunion nous font confiance</span>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Résultat en 48h</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Carousel Section */}
      <Section className="py-16 bg-white max-w-7xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Découvrez l'interface
            </h2>
            <p className="text-gray-600 text-lg">
              Une solution puissante pour gagner plus de marchés BTP à La Réunion (974)
            </p>
          </div>
          <Carousel />
        </Section>


      {/* Problem Section */}
      <Section className="py-20 bg-gray-900 text-white max-w-7xl">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold sm:text-4xl mb-6">
              Vous perdez des marchés publics BTP à La Réunion face à des concurrents moins compétents ?
            </h2>
            <p className="text-gray-300 text-lg mb-4">
              Vos équipes sont sur les chantiers à Saint-Denis, Saint-Pierre ou Le Port, mais vous n'avez pas le temps de répondre aux appels d'offres du CINOR, TCO, CIREST ou de la Région Réunion. Résultat ? Vous passez à côté de contrats stratégiques pendant que vos concurrents, mieux organisés, raflent les marchés publics du 974.
            </p>
            <p className="text-[#F77F00] font-semibold text-xl">
              Le BTP ne pardonne pas les occasions manquées. Chaque marché perdu est un chantier de moins, un chiffre d'affaires en moins, une croissance qui stagne.
            </p>
          </div>
        </Section>


      {/* Features Section */}

        <Section className="py-20 bg-white max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Votre avantage concurrentiel pour dominer les appels d'offres BTP à La Réunion
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Le Marché Public.fr, c'est l'équivalent d'une équipe dédiée aux marchés publics du 974, disponible 24/7, qui connaît les spécificités réunionnaises et rédige des dossiers gagnants pour le CINOR, TCO, CIREST, Région et communes pendant que vous gérez vos chantiers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: "🎯",
                title: "Veille stratégique automatisée La Réunion",
                desc: "Notre IA scanne en continu les marchés du CINOR, TCO, CIREST, Région Réunion, communes 974, BOAMP et AWS pour détecter les opportunités BTP alignées avec votre activité. Plus jamais de marché réunionnais manqué par manque de temps."
              },
              {
                icon: "⚡",
                title: "Mémoires techniques adaptés aux collectivités 974",
                desc: "L'IA analyse les critères d'attribution, vos références réunionnaises et les attentes spécifiques du CINOR, TCO, CIREST, Région et communes pour générer des mémoires techniques percutants, conformes au contexte local et optimisés pour maximiser votre notation."
              },
              {
                icon: "👥",
                title: "Accompagnement expert dédié 974",
                desc: "Un expert marchés publics réunionnais vous accompagne dans la prise en main, analyse vos premiers dossiers avec vous et reste disponible pour optimiser votre stratégie. Vous n'êtes jamais seul face aux appels d'offres."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-md border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Pourquoi les entreprises BTP de La Réunion choisissent Le Marché Public.fr</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "Gain de temps massif",
                  desc: "Réduisez de 80% le temps passé sur la rédaction de dossiers. Concentrez-vous sur votre cœur de métier pendant que l'IA gère l'administratif."
                },
                {
                  title: "Accompagnement personnalisé continu",
                  desc: "Formation initiale sur mesure, revue stratégique mensuelle et support réactif par des experts qui connaissent les spécificités des marchés publics réunionnais."
                },
                {
                  title: "Taux de succès amélioré",
                  desc: "Des mémoires optimisés selon les critères de notation augmentent vos chances de remporter les marchés face à la concurrence."
                },
                {
                  title: "Expertise métier intégrée",
                  desc: "Nos consultants spécialisés BTP et marchés publics analysent vos dossiers stratégiques et vous conseillent sur les leviers d'amélioration. Un regard expert quand vous en avez besoin."
                },
                {
                  title: "Conformité garantie",
                  desc: "Respect scrupuleux du Code des marchés publics et des exigences administratives. Zéro risque de rejet pour vice de forme."
                },
                {
                  title: "Capitalisation de votre expertise",
                  desc: "L'IA apprend de vos succès passés pour reproduire ce qui fonctionne et corriger ce qui ne marche pas. Votre savoir-faire devient un actif stratégique."
                }
              ].map((benefit, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-green-600 mt-1" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">{benefit.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center bg-gray-50 rounded-3xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Résultat concret</h3>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto mb-6">
              En moyenne, nos clients BTP du 974 passent de 2-3 réponses par mois à 10-15 réponses qualitatives sur les marchés CINOR, TCO, CIREST, Région et communes, avec un taux de succès en augmentation de 35%. Plus de candidatures = plus de marchés réunionnais remportés = croissance accélérée.
            </p>
            <div className="flex justify-center gap-12 mb-8">
              <div>
                <div className="text-4xl font-bold text-[#F77F00]">80%</div>
                <div className="text-sm text-gray-600">temps économisé</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#F77F00]">+35%</div>
                <div className="text-sm text-gray-600">taux de réussite</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#F77F00]">5x</div>
                <div className="text-sm text-gray-600">plus de réponses</div>
              </div>
            </div>
            <Button
              className="bg-[#F77F00] text-white hover:bg-[#F77F00]/90"
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
            >
              Obtenir ma démonstration personnalisée <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Section>


      {/* PRICING */}
      <Section id="tarifs" className="py-20 bg-white max-w-7xl">
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
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
              className="w-full border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
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
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
              className="w-full bg-white text-[#F77F00] border-2 border-[#F77F00] hover:bg-[#F77F00] hover:text-white"
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
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
              className="w-full border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
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


      {/* USE CASES */}

        <Section className="py-20 bg-white max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">Cas d'usage BTP à La Réunion</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Des entreprises BTP réunionnaises de toutes tailles utilisent LMP pour gagner plus de marchés publics du 974
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border-2 border-gray-100 rounded-3xl hover:border-[#F77F00] transition-all hover:shadow-lg">
              <div className="text-4xl mb-4">🏗️</div>
              <h3 className="text-xl font-bold mb-3">Entreprise Générale du Bâtiment - Saint-Denis</h3>
              <p className="text-gray-600 mb-4">Une EGB de 80 salariés du Nord cherchait à augmenter sa part de marchés publics sur le CINOR et les communes.</p>
              <div className="bg-[#F77F00]/10 p-4 rounded-xl">
                <p className="text-sm font-semibold text-[#F77F00]">Résultat : +200% de marchés CINOR et communes remportés en 1 an</p>
              </div>
            </div>
            <div className="p-8 border-2 border-gray-100 rounded-3xl hover:border-[#F77F00] transition-all hover:shadow-lg">
              <div className="text-4xl mb-4">🔨</div>
              <h3 className="text-xl font-bold mb-3">PME Génie Civil - Le Port</h3>
              <p className="text-gray-600 mb-4">Une PME de 50 personnes du TCO spécialisée en travaux publics voulait systématiser ses réponses pour le TCO et la Région.</p>
              <div className="bg-[#F77F00]/10 p-4 rounded-xl">
                <p className="text-sm font-semibold text-[#F77F00]">Résultat : 60h/mois économisées, +45% CA sur marchés TCO et Région</p>
              </div>
            </div>
            <div className="p-8 border-2 border-gray-100 rounded-3xl hover:border-[#F77F00] transition-all hover:shadow-lg">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold mb-3">Entreprise Multi-techniques - Saint-Pierre</h3>
              <p className="text-gray-600 mb-4">Une ETI de 150 salariés du Sud souhaitait optimiser ses réponses aux grands marchés multi-lots du CIREST et de la Région.</p>
              <div className="bg-[#F77F00]/10 p-4 rounded-xl">
                <p className="text-sm font-semibold text-[#F77F00]">Résultat : Taux de réussite CIREST et Région passé de 15% à 28%</p>
              </div>
            </div>
          </div>
        </Section>


      {/* TESTIMONIALS */}

        <Section className="py-20 bg-gradient-to-b from-gray-50 to-white max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">Ils remportent leurs marchés publics à La Réunion</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Des dirigeants d'entreprises BTP réunionnaises témoignent de leur succès avec Le Marché Public.fr
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#F77F00] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "On a multiplié par 3 notre volume de réponses sur les marchés du CINOR sans recruter. LMP est devenu indispensable à notre développement."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  FB
                </div>
                <div>
                  <p className="font-semibold">François Bernard</p>
                  <p className="text-sm text-gray-500">Directeur Général - Saint-Denis (974)</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#F77F00] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "La qualité des mémoires techniques adaptés au TCO est impressionnante. On gagne maintenant face à des groupes métropolitains."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  CM
                </div>
                <div>
                  <p className="font-semibold">Caroline Mercier</p>
                  <p className="text-sm text-gray-500">Présidente - Le Port (974)</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#F77F00] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "Incroyable gain de temps. Mon équipe se concentre sur les chantiers pendant que l'IA gère les dossiers CIREST."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  JL
                </div>
                <div>
                  <p className="font-semibold">Jacques Leroy</p>
                  <p className="text-sm text-gray-500">PDG - Saint-Benoît (974)</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#F77F00] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "Notre taux de réussite sur les marchés de la Région Réunion a doublé en 8 mois. LMP analyse mieux les critères que notre ancien consultant."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  NG
                </div>
                <div>
                  <p className="font-semibold">Nadia Garcia</p>
                  <p className="text-sm text-gray-500">Directrice - Saint-Paul (974)</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#F77F00] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "Nous avons sécurisé notre pipeline de chantiers pour les 2 prochaines années grâce aux marchés TCO et CINOR gagnés avec LMP."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  DM
                </div>
                <div>
                  <p className="font-semibold">David Moreau</p>
                  <p className="text-sm text-gray-500">Gérant - Saint-Pierre (974)</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#F77F00] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "ROI exceptionnel. L'investissement est rentabilisé dès le premier marché communal gagné. Un must-have pour le BTP réunionnais."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  EL
                </div>
                <div>
                  <p className="font-semibold">Éric Lambert</p>
                  <p className="text-sm text-gray-500">Président - Saint-André (974)</p>
                </div>
              </div>
            </div>
          </div>
        </Section>


      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Le Marché Public.fr — L'IA des entreprises BTP réunionnaises qui gagnent leurs marchés publics 974 : CINOR, TCO, CIREST, Région, communes.</p>
            <div className="flex items-center gap-6">
              <a
                href="mailto:contact@lemarchepublic.fr"
                className="hover:text-[#F77F00] transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                contact@lemarchepublic.fr
              </a>
              <a
                href="https://www.linkedin.com/company/mmpfr"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#F77F00] transition-colors flex items-center gap-2"
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
};
