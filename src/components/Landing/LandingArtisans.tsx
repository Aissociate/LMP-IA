import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Button = ({ className = "", children, onClick, ...props }: any) => (
  <button
    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 font-semibold shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

const Section = ({ id, className = "", children }: any) => (
  <section id={id} className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</section>
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
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-100 group">
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

export const LandingArtisans: React.FC = () => {
  const navigate = useNavigate();

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
            💰 Gagner plus de marchés
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* URGENCE BANNER */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 py-3 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-white font-bold text-sm md:text-base">
            🔥 OFFRE DE LANCEMENT : -50% sur votre abonnement jusqu'au 31 décembre 2024 🔥
          </p>
        </div>
      </div>

      {/* HERO SECTION - FULL WIDTH */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-red-500 text-white px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg">
                <span className="text-2xl">🔥</span>
                Offre limitée — Plus que 48h
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-8">
                Vous travaillez <span className="text-[#F77F00]">trop</span> pour perdre des marchés publics
              </h1>

              <p className="text-xl md:text-2xl font-semibold text-gray-300 mb-8">
                Que vous pourriez gagner en <span className="text-[#F77F00] font-bold">10 minutes</span>
              </p>

              <div className="bg-blue-600 border-l-8 border-blue-400 p-6 rounded-lg mb-8 shadow-xl">
                <p className="text-xl font-bold">
                  ✓ Plus de 500 entreprises<br/>
                  ✓ 2000 mémoires générés<br/>
                  ✓ +30% de réussite constaté
                </p>
              </div>

              <Button
                className="bg-[#F77F00] text-white hover:bg-[#E06F00] text-2xl px-12 py-6 shadow-2xl transform hover:scale-105 transition-all w-full lg:w-auto"
                onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
              >
                👉 Je veux mon 1er mémoire offert
                <ArrowRight className="w-6 h-6" />
              </Button>

              <p className="mt-4 text-sm text-gray-400">Sans CB • Sans engagement • Résultat en 48h</p>
            </div>

            <div className="relative">
              <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-[#F77F00]">
                <iframe
                  src="https://www.facebook.com/plugins/video.php?height=304&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1347758950405127%2F&show_text=false&width=560&t=0"
                  className="w-full h-full"
                  style={{ border: 'none', overflow: 'hidden' }}
                  scrolling="no"
                  frameBorder="0"
                  allowFullScreen={true}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BIG DOMINO - FULL WIDTH */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight">
              Ce n'est pas les marchés publics qui sont <span className="text-[#F77F00]">compliqués</span>
            </h2>
            <p className="text-3xl md:text-4xl font-bold text-gray-700">
              C'est la manière dont on vous apprend à y répondre.
            </p>
          </div>
        </div>
      </div>

      {/* STORY SECTION - FULL WIDTH */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white p-10 md:p-16 rounded-3xl shadow-2xl border-l-8 border-[#F77F00]">
              <p className="text-2xl md:text-3xl font-bold text-gray-900 italic mb-6 leading-relaxed">
                "Des dizaines d'artisans nous ont dit :<br/>
                <span className="text-red-600">'J'ai arrêté les marchés, trop prise de tête.'</span>
              </p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900 leading-relaxed">
                Après LMP ?<br/>
                <span className="text-green-600">Ils déposent 3 fois plus de dossiers…</span><br/>
                <span className="text-[#F77F00]">sans sacrifier leurs soirées.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SECRET - FULL WIDTH */}
      <div className="bg-gradient-to-br from-[#F77F00] via-orange-500 to-[#F77F00] text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-white text-[#F77F00] px-8 py-4 rounded-full text-2xl font-black mb-8 shadow-xl">
              🔥 LE SECRET
            </div>

            <h2 className="text-4xl md:text-5xl font-black mb-12">
              Une IA qui lit le DCE ET rédige votre mémoire complet
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/30">
                <div className="text-6xl mb-4">🚫</div>
                <p className="text-2xl font-bold">Vous n'interprétez rien</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/30">
                <div className="text-6xl mb-4">✍️</div>
                <p className="text-2xl font-bold">Vous ne rédigez rien</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/30">
                <div className="text-6xl mb-4">👆</div>
                <p className="text-2xl font-bold">Vous cliquez</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/30">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-2xl font-bold">Ça sort</p>
              </div>
            </div>

            <div className="bg-white text-gray-900 p-8 rounded-2xl shadow-2xl">
              <p className="text-2xl font-bold">
                GO/NO-GO inclus + Export instantané Word/PDF
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* OFFER STACK - FULL WIDTH */}
      <div className="bg-gradient-to-br from-green-600 via-green-500 to-green-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block bg-white text-green-600 px-8 py-4 rounded-full text-2xl font-black mb-6 shadow-xl">
                🎁 OFFRE DE LANCEMENT
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-4">
                Aujourd'hui, vous obtenez :
              </h2>
              <p className="text-2xl font-bold text-green-100">
                -50% sur tous les abonnements jusqu'au 31/12/2024
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/30">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">✅</span>
                  <span className="text-2xl font-bold">1 mémoire gratuit</span>
                </div>
                <p className="text-lg text-green-100">Sans carte bancaire</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/30">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">✅</span>
                  <span className="text-2xl font-bold">Score GO/NO-GO</span>
                </div>
                <p className="text-lg text-green-100">Sachez si vous devez candidater</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/30">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">✅</span>
                  <span className="text-2xl font-bold">Analyse DCE/BPU</span>
                </div>
                <p className="text-lg text-green-100">L'IA décode tout pour vous</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl border-2 border-white/30">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-4xl">✅</span>
                  <span className="text-2xl font-bold">Support + Formations</span>
                </div>
                <p className="text-lg text-green-100">On vous accompagne de A à Z</p>
              </div>
            </div>

            <div className="text-center">
              <Button
                className="bg-white text-green-600 hover:bg-gray-100 text-2xl px-12 py-6 shadow-2xl transform hover:scale-105 transition-all"
                onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
              >
                👉 Je profite de l'offre maintenant
                <ArrowRight className="w-6 h-6" />
              </Button>
              <p className="mt-6 text-xl font-bold animate-pulse">
                ⏳ Plus que 48h pour profiter de -50%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PROBLEME */}
      <Section id="problem" className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Vous perdez des marchés publics à La Réunion faute de temps ?</h2>
          <p className="mt-6 text-gray-300 text-lg">
            Vous êtes sur vos chantiers à Saint-Denis, Saint-Pierre ou Le Port, mais les appels d'offres CINOR, TCO, CIREST et des communes 974 demandent des heures de paperasse. Résultat ? Vos concurrents mieux organisés raflent les marchés pendant que vous travaillez.
          </p>
          <p className="mt-4 text-[#F77F00] font-medium">Le Marché Public.fr s'occupe du papier réunionnais. Vous, du métier.</p>
          <div className="mt-8">
            <Button
              className="bg-[#F77F00] text-white hover:bg-[#F77F00]/90"
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
            >
              Voir la solution <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* SOLUTION */}
      <Section id="solution" className="py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Votre assistant marchés publics spécial Réunion 974</h2>
          <p className="mt-4 text-gray-600 text-lg">
            Le Marché Public.fr automatise les tâches les plus lourdes : veille CINOR, TCO, CIREST et communes 974, lecture des DCE, rédaction du mémoire technique adapté au contexte réunionnais. Simple, rapide et efficace.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "🔍", title: "Veille automatique Réunion 974", desc: "L'IA trouve pour vous les marchés CINOR, TCO, CIREST et communes qui correspondent à votre métier d'artisan." },
            { icon: "📄", title: "Lecture DCE simplifiée", desc: "LMP lit les documents des collectivités réunionnaises pour vous et vous explique ce qu'il faut faire, sans jargon." },
            { icon: "✍️", title: "Rédaction adaptée 974", desc: "Le mémoire technique est rédigé pour vous, adapté à votre entreprise artisanale réunionnaise et aux spécificités locales." },
            { icon: "🤝", title: "Aide humaine disponible", desc: "Un expert vous explique comment ça marche, répond à vos questions et vous aide sur vos premiers dossiers. Accessible par téléphone ou visio." }
          ].map((item, i) => (
            <div key={i} className="p-6 border rounded-3xl shadow-sm hover:shadow-md transition text-left">
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button
            className="bg-[#F77F00] text-white hover:bg-[#F77F00]/90"
            onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
          >
            ⚡ Augmenter mon CA maintenant <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Section>

      {/* PROCESS */}
      <Section id="process" className="py-20 bg-[#FAFAFA]">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Comment ça marche ?</h2>
        <div className="mt-12 grid max-w-4xl mx-auto grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 text-center">
          {[
            { step: 1, title: "Connectez votre entreprise", desc: "Vos infos, vos devis, vos références – tout ce que vous avez déjà." },
            { step: 2, title: "Choisissez un marché", desc: "LMP lit le dossier pour vous et détecte les points clés." },
            { step: 3, title: "L'IA prépare votre dossier", desc: "Elle rédige les parties techniques et remplit les formulaires automatiquement." },
            { step: 4, title: "Vous vérifiez et déposez", desc: "Quelques clics et votre marché est prêt. Simple comme bonjour." }
          ].map((s, i) => (
            <div key={i} className="p-6 border rounded-3xl bg-white">
              <div className="text-[#F77F00] font-bold text-2xl">{s.step}</div>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button
            className="bg-[#F77F00] text-white hover:bg-[#F77F00]/90"
            onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
          >
            💼 Je réserve ma démo <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Section>

      {/* AUTORITE */}
      <Section id="authority" className="py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Une solution validée par des experts marchés publics</h2>
          <p className="mt-6 text-gray-600 text-lg">
            Le Marché Public.fr a été co-développée avec des <strong>dizaines d'experts métiers</strong> ayant plus de 25 ans d'expertise dans les collectivités et les marchés publics. Résultat : une IA vraiment utile, pensée pour la réalité du terrain.
          </p>
          <div className="mt-8">
            <Button
              className="bg-[#F77F00] text-white hover:bg-[#F77F00]/90"
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
            >
              En savoir plus <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* USE CASES */}
      <Section id="usecases" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl font-bold sm:text-4xl mb-4">Des artisans réunionnais qui réussissent</h2>
          <p className="text-center text-gray-600 text-lg mb-12 max-w-3xl mx-auto">
            Des artisans et TPE de La Réunion utilisent LMP pour gagner plus de marchés CINOR, TCO, CIREST et communes 974
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border-2 border-gray-100 rounded-3xl hover:border-[#F77F00] transition-all hover:shadow-lg">
              <div className="text-4xl mb-4">🔨</div>
              <h3 className="text-xl font-bold mb-3">Entreprise de Maçonnerie</h3>
              <p className="text-gray-600 mb-4">Un maçon indépendant avec 2 employés voulait répondre aux appels d'offres des communes.</p>
              <div className="bg-[#F77F00]/10 p-4 rounded-xl">
                <p className="text-sm font-semibold text-[#F77F00]">Résultat : 4 marchés remportés la première année</p>
              </div>
            </div>
            <div className="p-8 border-2 border-gray-100 rounded-3xl hover:border-[#F77F00] transition-all hover:shadow-lg">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold mb-3">Électricien TPE</h3>
              <p className="text-gray-600 mb-4">Une entreprise d'électricité de 5 personnes cherchait à diversifier ses clients.</p>
              <div className="bg-[#F77F00]/10 p-4 rounded-xl">
                <p className="text-sm font-semibold text-[#F77F00]">Résultat : 30% de CA en plus grâce aux marchés publics</p>
              </div>
            </div>
            <div className="p-8 border-2 border-gray-100 rounded-3xl hover:border-[#F77F00] transition-all hover:shadow-lg">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-bold mb-3">Entreprise de Peinture</h3>
              <p className="text-gray-600 mb-4">Un peintre entrepreneur qui voulait des chantiers plus réguliers et mieux payés.</p>
              <div className="bg-[#F77F00]/10 p-4 rounded-xl">
                <p className="text-sm font-semibold text-[#F77F00]">Résultat : Planning rempli 6 mois à l'avance</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section id="testimonials" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-3xl font-bold sm:text-4xl mb-4">Ils gagnent leurs marchés partout en France</h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-3xl mx-auto">
            Des artisans partagent leur expérience avec Le Marché Public.fr
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#F77F00] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "Je gagnais jamais les appels d'offres avant. Maintenant j'en décroche 2-3 par an sans me prendre la tête !"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  LC
                </div>
                <div>
                  <p className="font-semibold">Luc Carpentier</p>
                  <p className="text-sm text-gray-500">Maçon - Angers (49)</p>
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
                "LMP m'a fait gagner un temps fou. Plus besoin de passer mes soirées sur les dossiers administratifs."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  SD
                </div>
                <div>
                  <p className="font-semibold">Sarah Durand</p>
                  <p className="text-sm text-gray-500">Électricienne - Rennes (35)</p>
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
                "Franchement, je pensais que c'était trop compliqué pour moi. L'IA fait tout le travail difficile !"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  MB
                </div>
                <div>
                  <p className="font-semibold">Marc Bernard</p>
                  <p className="text-sm text-gray-500">Plombier - Tours (37)</p>
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
                "Les marchés publics me permettent maintenant de prévoir mon activité 6 mois à l'avance. Génial !"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  AK
                </div>
                <div>
                  <p className="font-semibold">Ahmed Karim</p>
                  <p className="text-sm text-gray-500">Peintre - Marseille (13)</p>
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
                "J'avais peur de me lancer mais avec LMP c'est vraiment accessible. Je recommande à tous mes collègues."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  CL
                </div>
                <div>
                  <p className="font-semibold">Céline Legrand</p>
                  <p className="text-sm text-gray-500">Menuisière - Dijon (21)</p>
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
                "LMP c'est comme avoir un assistant administratif qui travaille pour moi 24/7. Le prix est imbattable."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  VG
                </div>
                <div>
                  <p className="font-semibold">Vincent Garnier</p>
                  <p className="text-sm text-gray-500">Couvreur - Caen (14)</p>
                </div>
              </div>
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
            <button
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
            >
              Commencer
            </button>
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
            <button
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 bg-white text-[#F77F00] border-2 border-[#F77F00] hover:bg-[#F77F00] hover:text-white"
            >
              Commencer
            </button>
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
            <button
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 font-semibold shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
            >
              Commencer
            </button>
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

      {/* PRIX */}
      <Section id="pricing" className="py-20 bg-[#F5FBFF] text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Moins cher qu'un consultant, plus rapide qu'un humain.</h2>
        <p className="mt-4 text-gray-600 text-lg max-w-3xl mx-auto">
          Le Marché Public.fr coûte moins cher qu'un seul dossier sous-traité. Vous économisez des heures et augmentez vos chances de gagner – sans embaucher, sans stress.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            className="bg-[#F77F00] text-white hover:bg-[#F77F00]/90"
            onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
          >
            ⚡ Décrocher mon prochain marché
          </Button>
          <Button
            className="border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
            onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
          >
            Demander un devis
          </Button>
        </div>
        <p className="mt-5 text-sm text-white/80">Premier marché remporté en moyenne sous 2 semaines</p>
      </Section>

      {/* CTA FINAL */}
      <Section id="cta" className="py-20 bg-[#F77F00] text-white text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Arrêtez de subir la paperasse. Concentrez-vous sur votre métier.</h2>
        <p className="mt-4 text-white/90 text-lg max-w-2xl mx-auto">
          Le Marché Public.fr vous libère du stress administratif et vous aide à décrocher plus de marchés, simplement et efficacement.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
          <Button
            className="bg-white text-[#F77F00] hover:bg-white/90"
            onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
          >
            🚀 Voir ma démo maintenant
          </Button>
          <Button
            className="border border-white/30 bg-transparent text-white hover:bg-white/10"
            onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Voir une démonstration
          </Button>
        </div>
      </Section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <p>© {new Date().getFullYear()} Le Marché Public.fr — L'IA des artisans qui gagnent leurs marchés publics.</p>
              <a href="/cgv" className="hover:text-[#F77F00] transition-colors">
                CGV
              </a>
            </div>
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
