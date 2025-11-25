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

export const LandingPME: React.FC = () => {
  const navigate = useNavigate();

  React.useEffect(() => {
    document.title = "Marchés Publics PME Réunion 974 | CINOR, TCO, CIREST, Région | Le Marché Public.fr";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Gagnez les marchés publics PME à La Réunion : CINOR, TCO, CIREST, Région Réunion, communes 974. IA pour dossiers techniques optimisés.');
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
            💼 Optimiser mon CA
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* HERO SECTION */}
      <Section id="hero" className="py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              L'IA stratégique qui fait gagner les appels d'offres de votre PME.
            </h1>
            <p className="mt-6 text-lg text-gray-600 md:text-xl">
              Le Marché Public.fr équipe les dirigeants de PME d'une IA capable d'analyser, rédiger et optimiser chaque réponse marché public, pour gagner plus souvent, plus vite et avec moins de ressources.
            </p>
            <div className="mt-10 flex flex-col items-center lg:items-start gap-3 sm:flex-row">
              <Button
                className="bg-[#F77F00] text-white hover:bg-[#F77F00]/90"
                onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
              >
                💰 Doubler mon taux de réussite
              </Button>
              <Button
                className="border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
                onClick={() => document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Découvrir la méthode
              </Button>
            </div>
            <p className="mt-5 text-sm text-gray-500">Entretien stratégique 30 min • Réponse sous 4h • ROI mesurable dès J+30</p>
          </div>
          <Carousel />
        </div>
      </Section>

      {/* PROBLEME */}
      <Section id="problem" className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Votre PME perd des marchés… sans comprendre pourquoi ?</h2>
          <p className="mt-6 text-gray-300 text-lg">
            Vous avez la compétence, les références et les équipes. Mais vos concurrents, souvent plus gros, ont un service achats, des experts marchés et du temps. Vous, non. Le Marché Public.fr change cet équilibre.
          </p>
          <p className="mt-4 text-[#F77F00] font-medium">Transformez vos réponses marchés en avantage concurrentiel durable.</p>
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
          <h2 className="text-3xl font-bold sm:text-4xl">Votre direction marchés publics, propulsée par IA.</h2>
          <p className="mt-4 text-gray-600 text-lg">
            Le Marché Public.fr centralise votre savoir-faire, anticipe les attentes des acheteurs publics et rédige des dossiers techniques optimisés. Chaque marché devient une opportunité mesurable, pas un pari administratif.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: "📊", title: "Veille marchés Réunion automatique", desc: "Repérez en temps réel les marchés CINOR, TCO, CIREST, Région et communes 974 qui correspondent à votre positionnement et votre secteur d'activité." },
            { icon: "🧾", title: "Analyse IA des documents", desc: "L'IA lit et interprète chaque CCTP et RC, identifie les risques et critères clés de notation." },
            { icon: "👨‍🏫", title: "Accompagnement stratégique dédié", desc: "Un consultant expert vous forme, audite vos dossiers clés et vous conseille mensuellement sur votre stratégie marchés publics pour maximiser vos résultats." },
            { icon: "✍️", title: "Argumentaire adapté au contexte 974", desc: "Des mémoires techniques alignés avec votre ADN d'entreprise réunionnaise et validés par des experts marchés publics locaux." }
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
            💼 Optimiser mon développement <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Section>

      {/* PROCESS */}
      <Section id="process" className="py-20 bg-[#FAFAFA]">
        <h2 className="text-center text-3xl font-bold sm:text-4xl">Pilotez vos réponses marchés comme un grand groupe</h2>
        <div className="mt-12 grid max-w-4xl mx-auto grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4 text-center">
          {[
            { step: 1, title: "Chargez vos anciens dossiers", desc: "LMP apprend votre ton, vos méthodes et vos réussites." },
            { step: 2, title: "Sélectionnez vos marchés clés", desc: "L'IA détecte les appels d'offres qui correspondent à votre stratégie commerciale." },
            { step: 3, title: "Recevez un dossier optimisé", desc: "Mémoires, BPU, notes techniques : personnalisés, cohérents et prêts à être déposés." },
            { step: 4, title: "Analysez vos performances", desc: "Suivi des scores, comparatifs concurrents et suggestions d'amélioration." }
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
            💼 Optimiser mon développement <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Section>

      {/* AUTHORITY */}
      <Section id="authority" className="py-20">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Créée avec des experts marchés publics pour dirigeants exigeants</h2>
          <p className="mt-6 text-gray-600 text-lg">
            Co-développée avec des <strong>dizaines d'experts métiers</strong> ayant plus de 25 ans d'expertise dans les collectivités et les marchés publics, Le Marché Public.fr allie précision juridique et stratégie commerciale. Une IA pragmatique, pas académique.
          </p>
          <div className="mt-8">
            <Button
              className="bg-[#F77F00] text-white hover:bg-[#F77F00]/90"
              onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
            >
              Rencontrer l'équipe <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Section>

      {/* USE CASES */}
      <Section id="usecases" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-3xl font-bold sm:text-4xl mb-4">Cas d'usage concrets</h2>
          <p className="text-center text-gray-600 text-lg mb-12 max-w-3xl mx-auto">
            Des PME de toutes tailles utilisent Le Marché Public.fr pour gagner plus de marchés publics
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border-2 border-gray-100 rounded-3xl hover:border-[#F77F00] transition-all hover:shadow-lg">
              <div className="text-4xl mb-4">🏢</div>
              <h3 className="text-xl font-bold mb-3">ESN Régionale</h3>
              <p className="text-gray-600 mb-4">Une ESN de 45 personnes cherchait à diversifier son portefeuille client vers le secteur public.</p>
              <div className="bg-[#F77F00]/10 p-4 rounded-xl">
                <p className="text-sm font-semibold text-[#F77F00]">Résultat : +150% de marchés remportés en 6 mois</p>
              </div>
            </div>
            <div className="p-8 border-2 border-gray-100 rounded-3xl hover:border-[#F77F00] transition-all hover:shadow-lg">
              <div className="text-4xl mb-4">🔧</div>
              <h3 className="text-xl font-bold mb-3">Bureau d'Études Techniques</h3>
              <p className="text-gray-600 mb-4">Un bureau d'études de 30 personnes perdait du temps sur des dossiers mal ciblés.</p>
              <div className="bg-[#F77F00]/10 p-4 rounded-xl">
                <p className="text-sm font-semibold text-[#F77F00]">Résultat : 40h/mois économisées, taux de réussite x2</p>
              </div>
            </div>
            <div className="p-8 border-2 border-gray-100 rounded-3xl hover:border-[#F77F00] transition-all hover:shadow-lg">
              <div className="text-4xl mb-4">🌱</div>
              <h3 className="text-xl font-bold mb-3">PME Transition Énergétique</h3>
              <p className="text-gray-600 mb-4">Startup de 15 personnes souhaitant accélérer sur les marchés publics d'énergie renouvelable.</p>
              <div className="bg-[#F77F00]/10 p-4 rounded-xl">
                <p className="text-sm font-semibold text-[#F77F00]">Résultat : Premier marché public remporté en 3 semaines</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* TESTIMONIALS */}
      <Section id="testimonials" className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-center text-3xl font-bold sm:text-4xl mb-4">Ils nous font confiance à travers la France</h2>
          <p className="text-center text-gray-600 text-lg mb-16 max-w-3xl mx-auto">
            Des dirigeants de PME partagent leur expérience avec Le Marché Public.fr
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#F77F00] text-xl">★</span>
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "LMP a transformé notre approche des marchés publics. Nous répondons à 3x plus d'appels d'offres avec le même effectif."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  SC
                </div>
                <div>
                  <p className="font-semibold">Sophie Chen</p>
                  <p className="text-sm text-gray-500">Directrice - Lyon (69)</p>
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
                "L'IA comprend vraiment nos métiers. Les mémoires techniques sont d'une qualité professionnelle impressionnante."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  JM
                </div>
                <div>
                  <p className="font-semibold">Jean Martin</p>
                  <p className="text-sm text-gray-500">PDG - Nantes (44)</p>
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
                "ROI incroyable. On a rentabilisé l'investissement dès le premier marché remporté. Un outil indispensable."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  MD
                </div>
                <div>
                  <p className="font-semibold">Marie Dubois</p>
                  <p className="text-sm text-gray-500">DG - Toulouse (31)</p>
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
                "Enfin une solution qui parle notre langage ! La veille automatique nous fait gagner un temps précieux."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  PL
                </div>
                <div>
                  <p className="font-semibold">Pierre Lefèvre</p>
                  <p className="text-sm text-gray-500">Directeur Général - Bordeaux (33)</p>
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
                "Nos dossiers sont maintenant au niveau des grands groupes. L'accompagnement de l'équipe est exceptionnel."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  AB
                </div>
                <div>
                  <p className="font-semibold">Amina Benali</p>
                  <p className="text-sm text-gray-500">CEO - Strasbourg (67)</p>
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
                "Nous avons doublé notre chiffre d'affaires sur les marchés publics en 1 an. Un vrai game changer."
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F77F00] to-orange-600 flex items-center justify-center text-white font-bold">
                  TR
                </div>
                <div>
                  <p className="font-semibold">Thomas Rousseau</p>
                  <p className="text-sm text-gray-500">Président - Lille (59)</p>
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

      {/* VALUE PROPOSITION */}
      <Section id="pricing" className="py-20 bg-[#F5FBFF] text-center">
        <h2 className="text-3xl font-bold sm:text-4xl">Un retour sur investissement mesurable dès le premier marché</h2>
        <p className="mt-4 text-gray-600 text-lg max-w-3xl mx-auto">
          L'équivalent d'un service marchés complet pour moins qu'un seul dossier sous-traité. Vous économisez du temps, de l'argent et vous augmentez vos taux de victoire.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button
            className="bg-[#F77F00] text-white hover:bg-[#F77F00]/90"
            onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
          >
            🎯 Gagner plus de marchés maintenant
          </Button>
          <Button
            className="border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
            onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
          >
            Planifier un entretien
          </Button>
        </div>
        <p className="mt-5 text-sm text-gray-500">Accompagnement sur mesure pour dirigeants PME.</p>
      </Section>

      {/* CTA FINAL */}
      <Section id="cta" className="py-20 bg-[#F77F00] text-white text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl">Prenez un avantage décisif sur vos concurrents.</h2>
        <p className="mt-4 text-white/90 text-lg max-w-2xl mx-auto">
          Les marchés publics sont un levier de croissance sous-exploité. Avec Le Marché Public.fr, transformez-les en moteur stratégique et augmentez la valeur de votre entreprise.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:justify-center">
          <Button
            className="bg-white text-[#F77F00] hover:bg-white/90"
            onClick={() => window.location.href = 'https://api.leadconnectorhq.com/widget/form/u3CAIFPf7Jb64jzwWzSe'}
          >
            🚀 Audit gratuit + stratégie (réponse 4h)
          </Button>
          <Button
            className="border border-white/30 bg-transparent text-white hover:bg-white/10"
            onClick={() => document.getElementById('solution')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Découvrir la stratégie LMP
          </Button>
        </div>
      </Section>

      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Le Marché Public.fr — L'IA des PME qui gagnent leurs marchés publics.</p>
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
