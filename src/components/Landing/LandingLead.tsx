import React, { useState, useEffect } from "react";
import { ArrowRight, CheckCircle, FileText, BarChart3, Target, MessageSquare, X, Upload, Sparkles, Zap, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MarketModelComparison } from "./MarketModelComparison";

const Button = ({ className = "", children, onClick, ...props }: any) => (
  <button
    className={`group inline-flex items-center justify-center gap-3 rounded-2xl px-8 py-4 font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-offset-2 ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

const Section = ({ className = "", children }: any) => (
  <section className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-24 ${className}`}>{children}</section>
);

const Card = ({ className = "", children, hover = true }: any) => (
  <div className={`backdrop-blur-sm bg-white/80 rounded-3xl p-8 border border-gray-200/50 shadow-xl ${hover ? 'transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:bg-white' : ''} ${className}`}>
    {children}
  </div>
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
    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-100 group max-w-4xl mx-auto">
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

const LeadForm = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [formData, setFormData] = useState({
    lastName: "",
    firstName: "",
    company: "",
    email: "",
    phone: "",
    sector: "",
    marketReference: "",
    files: [] as File[]
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-10 relative shadow-2xl animate-in zoom-in-95 duration-300">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:rotate-90"
        >
          <X className="w-6 h-6" />
        </button>

        {submitted ? (
          <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Demande envoyée !</h3>
            <p className="text-gray-600 text-lg">
              Vous recevrez votre mémoire technique + BPU sous 48h ouvrées.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Demandez votre mémoire + BPU offerts</h3>
              <p className="text-gray-600">Remplissez le formulaire et recevez votre analyse sous 48h</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Nom *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Prénom *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Entreprise *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Secteur d'activité *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: BTP, Services, Informatique..."
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Référence du marché visé</label>
                <input
                  type="text"
                  placeholder="Ex: BOAMP 24-123456"
                  value={formData.marketReference}
                  onChange={(e) => setFormData({ ...formData, marketReference: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">DCE + BPU (si disponible) *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-500 transition-all cursor-pointer bg-gray-50 hover:bg-orange-50">
                  <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-gray-600 font-medium">Déposez vos fichiers ou cliquez pour parcourir</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, XLS, XLSX</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    onChange={(e) => setFormData({ ...formData, files: Array.from(e.target.files || []) })}
                    className="hidden"
                  />
                </div>
                {formData.files.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    {formData.files.length} fichier(s) sélectionné(s)
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
              >
                Envoyer ma demande
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>

              <p className="text-xs text-gray-500 text-center leading-relaxed">
                En soumettant ce formulaire, vous acceptez d'être contacté par LeMarchéPublic.fr
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export const LandingLead: React.FC = () => {
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleCTAClick = () => {
    window.location.href = 'https://api.leadconnectorhq.com/widget/form/wJUtQv8tF6XLSswJ2vf0';
  };

  React.useEffect(() => {
    document.title = "Mémoire Technique + BPU Offerts | Test Gratuit IA Marchés Publics | LeMarchéPublic.fr";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Testez gratuitement notre IA spécialisée marchés publics : 1 mémoire technique + 1 BPU générés sur votre prochain marché. Sans CB. Sans engagement.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:64px_64px]"></div>

      <LeadForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 border-b border-gray-200/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-center">
            <div className="flex items-center gap-3 cursor-pointer transition-transform hover:scale-105" onClick={() => navigate("/")}>
              <img src="/logo1.png" alt="Logo" className="h-12 w-auto" />
            </div>
          </div>
        </div>
      </nav>

      <div className="relative">
        <Section className="pt-32 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-full mb-8 font-semibold text-sm">
            <Sparkles className="w-4 h-4" />
            Offre de lancement
          </div>
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            <span className="block bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 bg-clip-text text-transparent">
              1 mémoire technique
            </span>
            <span className="block text-gray-900 mt-2">+ BPU générés par IA</span>
            <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent text-5xl mt-4">
              (offert)
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-700 mb-4 max-w-4xl mx-auto leading-relaxed font-medium">
            Testez gratuitement l'IA de LeMarchéPublic.fr :<br />
            elle lit votre DCE, génère un mémoire technique structuré, prépare votre BPU
          </p>
          <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
            et vous donne un premier avis <span className="font-bold text-green-600">GO</span> / <span className="font-bold text-red-600">NO-GO</span> en moins de 48h.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Aucun CB</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Aucun engagement</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold">Juste un vrai marché</span>
            </div>
          </div>
          <Button
            onClick={handleCTAClick}
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 shadow-2xl"
          >
            <Sparkles className="w-6 h-6" />
            Je veux mon mémoire + BPU offerts
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </Button>

          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
              <video
                className="w-full h-full object-contain"
                controls
                preload="metadata"
                poster="/Design sans titre (10).png"
              >
                <source src="https://wfsbzxjhrcuytjqyojjn.supabase.co/storage/v1/object/public/marketing-videos/hero-video.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
            </div>
            <p className="text-center text-gray-600 mt-4 text-lg font-medium">
              🎬 Découvrez comment LeMarchéPublic.fr génère automatiquement vos mémoires techniques
            </p>
          </div>
        </Section>

        <Section>
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
            <h2 className="text-4xl font-bold mb-12 text-center text-gray-900">
              Vous perdez encore trop de temps<br />sur chaque appel d'offres ?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                "Des DCE lourds à lire, des exigences floues, des grilles de notation complexes…",
                "Des mémoires techniques à recommencer presque à zéro à chaque nouvelle consultation.",
                "Un BPU qui demande des vérifications à n'en plus finir pour éviter les erreurs.",
                "La sensation de jouer votre temps et votre énergie à pile ou face sur chaque marché.",
                "Pendant ce temps, des marchés passent… simplement parce que vous n'avez pas le temps de monter le dossier."
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/60 rounded-2xl">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <p className="text-lg text-gray-800 font-medium leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        <Section>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              L'IA qui génère votre mémoire,<br />prépare votre BPU et vous aide à décider
            </h2>
            <p className="text-2xl text-gray-700 font-medium">
              Avec l'IA de LeMarchéPublic.fr, vous testez sur un vrai marché :
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            <Card className="bg-gradient-to-br from-orange-50 to-red-50">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">LMP Light</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">Notre IA spécialisée marchés publics qui :</p>
              <ul className="space-y-3">
                {["lit votre DCE", "génère un mémoire technique structuré", "prépare votre BPU cohérent"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-800 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Avis GO / NO-GO</h3>
              <p className="text-gray-700 leading-relaxed">
                Un premier regard expert sur la pertinence du marché pour votre entreprise.
                Gagnez du temps en vous concentrant sur les bons marchés.
              </p>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Assistant IA</h3>
              <p className="text-gray-700 mb-6 leading-relaxed">Posez vos questions en langage naturel :</p>
              <div className="space-y-2 text-sm italic text-gray-600">
                <p>"Qu'attend l'acheteur sur la méthodologie ?"</p>
                <p>"Quels critères sont les plus pondérés ?"</p>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <div className="inline-block p-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl text-white mb-8">
              <p className="text-3xl font-bold mb-2">L'IA fait le gros du travail.</p>
              <p className="text-xl">Vous gardez la décision finale et les ajustements stratégiques.</p>
            </div>
          </div>

          <div className="text-center mb-12">
            <Button
              onClick={handleCTAClick}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
            >
              Je veux tester l'IA sur mon prochain marché
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="mt-12">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-900">
              Découvrez l'interface en vidéo
            </h3>
            <a
              href="https://storage.googleapis.com/msgsndr/Khh3gHoXw8rbmLrz89s4/media/6926384f76cd823d57d4746d.mp4"
              target="_blank"
              rel="noopener noreferrer"
              className="relative block rounded-2xl overflow-hidden shadow-2xl group cursor-pointer"
            >
              <img
                src="/caroussel 6.png"
                alt="Miniature vidéo démo"
                className="w-full aspect-video object-cover"
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="w-20 h-20 bg-[#F77F00] group-hover:bg-[#E06F00] rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-2xl">
                  <svg className="w-10 h-10 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
            </a>
          </div>
        </Section>

        <Section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]"></div>
          <div className="relative">
            <h2 className="text-4xl font-bold mb-12 text-center">
              Ce que vous recevez gratuitement
            </h2>
            <p className="text-2xl mb-16 text-center text-gray-300">
              Concrètement, sur 1 marché réel, vous obtenez :
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {[
                { icon: FileText, title: "Un mémoire technique IA (LMP Light)", desc: "Structure complète, sections clés rédigées, base de travail prête à être relue et adaptée.", color: "from-orange-500 to-red-600" },
                { icon: BarChart3, title: "Un BPU préparé par IA", desc: "Pré-rempli là où c'est possible, structuré, cohérent et prêt à être affiné par vos équipes.", color: "from-green-500 to-emerald-600" },
                { icon: Target, title: "Un mini avis GO / NO-GO", desc: "Un premier regard sur la pertinence du marché pour votre entreprise.", color: "from-purple-500 to-pink-600" },
                { icon: MessageSquare, title: "Un accès découverte à l'assistant IA", desc: "Pour interroger le DCE et le BPU en langage naturel sur ce marché.", color: "from-blue-500 to-cyan-600" }
              ].map(({ icon: Icon, title, desc, color }, i) => (
                <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/15">
                  <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-6`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{title}</h3>
                  <p className="text-gray-300 leading-relaxed">{desc}</p>
                </Card>
              ))}
            </div>

            <p className="text-2xl font-bold text-center text-orange-400">
              Le tout, offert, sur un appel d'offres que vous choisissez.
            </p>
          </div>
        </Section>

        <Section>
          <h2 className="text-5xl font-black mb-8 text-center bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Comment ça marche ?
          </h2>
          <p className="text-3xl text-center mb-20 text-gray-700 font-bold">3 étapes simples</p>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: "1", title: "Vous remplissez le formulaire", items: ["Vos coordonnées", "Votre secteur", "Le DCE (+ BPU si disponible)"], color: "from-orange-500 to-red-600" },
              { num: "2", title: "Notre IA travaille pour vous", items: ["Lecture du DCE", "Génération du mémoire", "Préparation du BPU", "Calcul GO / NO-GO"], color: "from-purple-500 to-pink-600" },
              { num: "3", title: "Vous recevez votre pack", items: ["Mémoire IA (brouillon pro)", "BPU préparé", "Avis GO / NO-GO", "Accès assistant IA"], color: "from-green-500 to-emerald-600" }
            ].map(({ num, title, items, color }, i) => (
              <div key={i} className="text-center">
                <div className={`w-20 h-20 bg-gradient-to-br ${color} text-white rounded-3xl flex items-center justify-center text-4xl font-black mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-transform`}>
                  {num}
                </div>
                <h3 className="text-2xl font-bold mb-6 text-gray-900">{title}</h3>
                <Card hover={false} className="text-left">
                  <ul className="space-y-3">
                    {items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 font-medium">{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Button
              onClick={handleCTAClick}
              className="bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700"
            >
              Je demande mon mémoire + BPU IA offerts
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </Section>

        <Section>
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Où est le piège ?</h2>
              <p className="text-2xl text-orange-400 font-semibold">
                Pourquoi c'est gratuit (et ce que nous en attendons)
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-8 text-lg mb-12">
              <p className="leading-relaxed">
                Nous savons qu'il est difficile de faire confiance à une nouvelle solution, surtout quand on parle de marchés publics.
              </p>
              <p className="leading-relaxed">
                Plutôt que de vous promettre monts et merveilles, nous préférons vous laisser voir par vous-même :
              </p>

              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  "Vous testez l'IA sur un marché réel",
                  "Vous voyez le temps gagné sur le mémoire et le BPU",
                  "Vous jugez la qualité de la base de travail"
                ].map((text, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                    <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
                    <p className="font-medium">{text}</p>
                  </div>
                ))}
              </div>

              <div className="bg-orange-500/20 rounded-2xl p-8 border-2 border-orange-500/50">
                <p className="font-semibold text-2xl mb-6 text-orange-400">Ensuite, à vous de décider :</p>
                <div className="grid sm:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <p className="text-orange-400 font-bold mb-2">Plan SOLO</p>
                    <p className="text-3xl font-black mb-1">199€</p>
                    <p className="text-sm text-gray-300">1 marché / mois</p>
                  </div>
                  <div className="bg-orange-500/30 rounded-xl p-4 border-2 border-orange-400">
                    <div className="inline-block px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded mb-2">RECOMMANDÉ</div>
                    <p className="text-orange-400 font-bold mb-2">Plan PME</p>
                    <p className="text-3xl font-black mb-1">349€</p>
                    <p className="text-sm text-gray-300">2 marchés / mois</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                    <p className="text-orange-400 font-bold mb-2">Plan PROJETEUR</p>
                    <p className="text-3xl font-black mb-1">849€</p>
                    <p className="text-sm text-gray-300">5 marchés / mois</p>
                  </div>
                </div>
                <p className="text-center text-sm text-gray-300">Tous les plans incluent : Veille marchés • GO/NO-GO • Assistant IA • Espace client</p>
                <div className="mt-6 pt-6 border-t border-white/20">
                  <p className="text-lg font-semibold mb-3 text-orange-400">Options à la carte :</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span>Booster Expert 4h : +590€ / mémoire</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ArrowRight className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                      <span>Booster Expert Senior 3 jours : +2490€ / marché stratégique</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-red-500/20 rounded-2xl p-6 border-2 border-red-500/50 text-center">
                <X className="w-10 h-10 text-red-400 mx-auto mb-2" />
                <p className="font-bold">Pas de carte bancaire</p>
              </div>
              <div className="bg-red-500/20 rounded-2xl p-6 border-2 border-red-500/50 text-center">
                <X className="w-10 h-10 text-red-400 mx-auto mb-2" />
                <p className="font-bold">Pas d'engagement</p>
              </div>
              <div className="bg-green-500/20 rounded-2xl p-6 border-2 border-green-500/50 text-center">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p className="font-bold">Juste un test concret</p>
              </div>
            </div>
          </Card>
        </Section>

        <Section>
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Nos abonnements LeMarchéPublic IA
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Tous nos plans incluent veille marchés, GO / NO-GO et assistant IA Marchés.<br />
              <span className="font-bold">Vous choisissez simplement combien de mémoires IA vous voulez par mois.</span>
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <Card className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-bold mb-4">
                  SOLO
                </div>
                <p className="text-5xl font-black mb-2 text-gray-900">199€</p>
                <p className="text-gray-600 font-medium">HT / mois</p>
                <p className="text-sm text-gray-500 mt-2">1 Marché / Mois</p>
              </div>
              <p className="text-center text-gray-600 mb-6 italic">Pour les structures qui se lancent</p>
              <ul className="space-y-3">
                {[
                  "Veille marchés incluse",
                  "Score GO / NO-GO",
                  "Assistant IA Marchés & BPU",
                  "1 mémoire IA / mois",
                  "Espace client & historique",
                  "Formations vidéo",
                  "Export Word / PDF"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">Options :</p>
                <p className="text-xs text-gray-500">IA Premium +99€ • Expert 4h +590€ • Senior 3j +2490€</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-400 relative transform scale-105 shadow-2xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full text-sm font-bold shadow-lg">
                  ⭐ RECOMMANDÉ
                </div>
              </div>
              <div className="text-center mb-6 mt-4">
                <div className="inline-block px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-bold mb-4">
                  PME
                </div>
                <p className="text-5xl font-black mb-2 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">349€</p>
                <p className="text-gray-600 font-medium">HT / mois</p>
                <p className="text-sm text-gray-500 mt-2">2 Marchés / Mois</p>
              </div>
              <p className="text-center text-gray-600 mb-6 italic">Pour les PME qui répondent régulièrement</p>
              <ul className="space-y-3">
                {[
                  "Veille marchés incluse",
                  "GO / NO-GO sur tous les marchés",
                  "Assistant IA Marchés & BPU",
                  "2 mémoires IA / mois",
                  "Espace client & historique complet",
                  "Priorité de génération vs SOLO",
                  "1 point de contact trimestriel"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-orange-200">
                <p className="text-xs font-semibold text-orange-600 mb-2">Options :</p>
                <p className="text-xs text-gray-600">Market Pro +99€ • Expert 4h +590€ • Senior 3j +2490€</p>
              </div>
              <div className="mt-4 p-3 bg-orange-100 rounded-xl">
                <p className="text-xs text-orange-900 font-medium">💡 Rentabilisé dès qu'un marché gagné couvre quelques mois</p>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-300">
              <div className="text-center mb-6">
                <div className="inline-block px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-bold mb-4">
                  PROJETEUR
                </div>
                <p className="text-5xl font-black mb-2 text-gray-900">849€</p>
                <p className="text-gray-600 font-medium">HT / mois</p>
                <p className="text-sm text-gray-500 mt-2">5 Marchés / Mois</p>
              </div>
              <p className="text-center text-gray-600 mb-6 italic">Pour ceux qui vivent des marchés publics</p>
              <ul className="space-y-3">
                {[
                  "Veille marchés incluse",
                  "GO / NO-GO sur tous les marchés",
                  "Assistant IA illimité",
                  "5 mémoires IA / mois",
                  "Espace client + historique détaillé",
                  "Priorité maximale",
                  "1 point de suivi mensuel"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-red-200">
                <p className="text-xs font-semibold text-red-600 mb-2">Options :</p>
                <p className="text-xs text-gray-600">Market Pro +99€ • Expert 4h +590€ • Senior 3j +2490€</p>
              </div>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">Options à la carte</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl p-6">
                <p className="text-lg font-bold mb-2 text-gray-900">Mémoire supplémentaire</p>
                <p className="text-3xl font-black mb-3 text-blue-600">299€</p>
                <p className="text-sm text-gray-600 mb-4">HT / mémoire</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Pic d'activité ponctuel</li>
                  <li>• Même qualité, même process</li>
                  <li>• Activable à tout moment</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <p className="text-lg font-bold mb-2 text-gray-900">Booster Expert 4h</p>
                <p className="text-3xl font-black mb-3 text-purple-600">590€</p>
                <p className="text-sm text-gray-600 mb-4">HT / mémoire</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Relecture approfondie</li>
                  <li>• Renforcement arguments</li>
                  <li>• Alignement grille notation</li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-6">
                <p className="text-lg font-bold mb-2 text-gray-900">Expert Senior 3 jours</p>
                <p className="text-3xl font-black mb-3 text-orange-600">2490€</p>
                <p className="text-sm text-gray-600 mb-4">HT / marché stratégique</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Expert dédié 3 jours</li>
                  <li>• Aller-retours illimités</li>
                  <li>• Conseils stratégiques</li>
                </ul>
              </div>
            </div>
          </Card>

          <div className="mt-16">
            <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white text-center">
              <h3 className="text-3xl font-bold mb-6">Pourquoi ça a du sens financièrement ?</h3>
              <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div>
                  <p className="text-red-400 font-bold mb-4 text-xl">❌ Sans nous :</p>
                  <ul className="space-y-3 text-left text-gray-300">
                    <li>• 10 à 20h par mémoire</li>
                    <li>• Décisions "au feeling"</li>
                    <li>• Risques d'oublis dans le BPU</li>
                    <li>• Marchés qui passent faute de temps</li>
                  </ul>
                </div>
                <div>
                  <p className="text-green-400 font-bold mb-4 text-xl">✅ Avec LeMarchéPublic.fr :</p>
                  <ul className="space-y-3 text-left text-gray-300">
                    <li>• Veille automatique des bons marchés</li>
                    <li>• GO / NO-GO pour décider vite</li>
                    <li>• Mémoires générés par IA</li>
                    <li>• 1 marché gagné = plusieurs mois amortis</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        <Section className="bg-gradient-to-b from-white to-orange-50">
          <MarketModelComparison />
        </Section>

        <Section>
          <h2 className="text-4xl font-bold mb-16 text-center text-gray-900">Pour qui ?</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-900">
                  Ce test est fait pour vous si…
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Vous répondez (ou envisagez de répondre) aux marchés publics",
                  "Vous avez déjà perdu des heures sur un mémoire technique ou un BPU",
                  "Vous voulez voir ce qu'une IA spécialisée peut faire avant d'engager un budget"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-800 font-medium text-lg">{text}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center">
                  <X className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-red-900">
                  Ce test n'est pas fait pour vous si…
                </h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Vous ne traitez aucun appel d'offres",
                  "Vous cherchez un consultant 3 jours gratuit : ici, vous recevez une base IA professionnelle, pas un accompagnement premium offert"
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    <span className="text-gray-800 font-medium text-lg">{text}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Section>

        <Section className="text-center">
          <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-0">
            <Sparkles className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-5xl font-black mb-6 leading-tight">
              Ne passez pas 20 heures<br />sur votre prochain marché<br />avant d'avoir vu ça
            </h2>
            <p className="text-2xl mb-4 font-medium">
              Laissez notre IA vous montrer ce qu'elle sait faire :
            </p>
            <p className="text-3xl font-bold mb-8">
              1 mémoire technique + 1 BPU préparés sur un marché réel, offerts.
            </p>
            <p className="text-xl mb-12 text-orange-100">
              Vous verrez immédiatement si LeMarchéPublic.fr peut vous faire gagner du temps…<br />
              et des marchés.
            </p>
            <Button
              onClick={handleCTAClick}
              className="bg-white text-orange-600 hover:bg-gray-100"
            >
              <Clock className="w-6 h-6" />
              Je veux mon mémoire + BPU générés par IA (offerts)
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        </Section>
      </div>

      <footer className="bg-gray-900 text-white py-16 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img src="/logo1.png" alt="Logo" className="h-12 w-auto mx-auto mb-4" />
            <p className="text-gray-400">
              © 2025 LeMarchéPublic.fr - Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
