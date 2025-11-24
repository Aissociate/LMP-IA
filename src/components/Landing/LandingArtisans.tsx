import React, { useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MarketModelComparison } from "./MarketModelComparison";

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

      {/* HERO SECTION */}
      <Section id="hero" className="py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              Gagnez vos appels d'offres sans galérer avec la paperasse.
            </h1>
            <p className="mt-6 text-lg text-gray-600 md:text-xl">
              Le Marché Public.fr, l'IA pensée pour les artisans, lit les dossiers, remplit les formulaires et rédige les mémoires à votre place. Vous gagnez du temps, du calme, et plus de marchés.
            </p>
            <div className="mt-10 flex flex-col items-center lg:items-start gap-3 sm:flex-row">
              <Button
                className="bg-[#F77F00] text-white hover:bg-[#F77F00]/90"
                onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
              >
                💰 Je veux gagner plus de marchés
              </Button>
              <Button
                className="border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Voir comment ça marche
              </Button>
            </div>
            <p className="mt-5 text-sm text-gray-500">Réponse en 2h • Démo de 15 min • Premiers marchés en 48h</p>
          </div>
          <Carousel />
        </div>
      </Section>

      {/* PROBLEME */}
      <Section id="problem" className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Marre de perdre du temps avec les dossiers d'appels d'offres ?</h2>
          <p className="mt-6 text-gray-300 text-lg">
            Entre les documents à lire, les tableaux à remplir et les textes à rédiger, chaque marché devient une épreuve. Pendant ce temps, vous pourriez être sur vos chantiers ou avec vos clients.
          </p>
          <p className="mt-4 text-[#F77F00] font-medium">Le Marché Public.fr s'occupe du papier. Vous, du métier.</p>
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
          <h2 className="text-3xl font-bold sm:text-4xl">Votre assistant administratif intelligent</h2>
          <p className="mt-4 text-gray-600 text-lg">
            Le Marché Public.fr automatise les tâches les plus lourdes : recherche des marchés, lecture des dossiers, rédaction du mémoire technique, tout en s'adaptant à votre activité. Simple, rapide et efficace.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "🔍", title: "Veille automatique", desc: "L'IA trouve pour vous les marchés qui correspondent à votre métier et votre secteur." },
            { icon: "📄", title: "Lecture simplifiée", desc: "LMP lit les documents pour vous et vous explique ce qu'il faut faire, sans jargon." },
            { icon: "✍️", title: "Rédaction rapide", desc: "Le mémoire technique est rédigé pour vous, adapté à votre entreprise et votre façon de travailler." },
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
            💼 Je réserve ma démo (2h) <ArrowRight className="w-4 h-4" />
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
          <h2 className="text-center text-3xl font-bold sm:text-4xl mb-4">Des artisans qui réussissent</h2>
          <p className="text-center text-gray-600 text-lg mb-12 max-w-3xl mx-auto">
            Des artisans et petites entreprises utilisent LMP pour gagner plus de marchés
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

      {/* MARKET MODEL COMPARISON */}
      <Section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <MarketModelComparison />
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
            🚀 Voir ma démo maintenant (réponse 2h)
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
            <p>© {new Date().getFullYear()} Le Marché Public.fr — L'IA des artisans qui gagnent leurs marchés publics.</p>
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
