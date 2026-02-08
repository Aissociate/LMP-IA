import React, { useState } from 'react';
import {
  GraduationCap,
  Play,
  Clock,
  CheckCircle,
  ChevronRight,
  BookOpen,
  FileText,
  Search,
  Shield,
  MessageSquare,
  Lock,
  Settings,
  Lightbulb,
  Target,
  Zap
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  duration: string;
  videoSrc?: string;
  steps: string[];
  tips: string[];
}

const modules: Module[] = [
  {
    id: 'getting-started',
    title: 'Prise en main de la plateforme',
    description: 'Decouvrez les fonctionnalites principales et apprenez a naviguer efficacement dans l\'interface.',
    icon: Play,
    duration: '5 min',
    videoSrc: '/demo_lemarchepublic.mp4',
    steps: [
      'Connexion et premiere configuration de votre profil',
      'Navigation dans le tableau de bord et les menus',
      'Personnalisation de vos preferences'
    ],
    tips: [
      'Completez votre profil entreprise pour des resultats de recherche plus pertinents',
      'Activez les notifications pour ne manquer aucune opportunite'
    ]
  },
  {
    id: 'market-search',
    title: 'Recherche de marches publics',
    description: 'Maitrisez les outils de recherche avancee pour trouver les appels d\'offres pertinents.',
    icon: Search,
    duration: '8 min',
    steps: [
      'Utiliser les filtres par secteur, localisation et montant',
      'Configurer des recherches sauvegardees',
      'Analyser les resultats avec l\'IA',
      'Exporter les resultats de recherche'
    ],
    tips: [
      'Combinez plusieurs filtres pour affiner vos resultats',
      'Utilisez les mots-cles CPV pour des recherches tres precises'
    ]
  },
  {
    id: 'market-sentinel',
    title: 'Market Sentinel - Surveillance automatique',
    description: 'Configurez des alertes intelligentes pour etre notifie des nouveaux marches correspondant a vos criteres.',
    icon: Shield,
    duration: '6 min',
    steps: [
      'Creer une alerte de surveillance personnalisee',
      'Definir les criteres de detection (mots-cles, secteurs, zones)',
      'Configurer la frequence des notifications',
      'Gerer et modifier vos alertes actives'
    ],
    tips: [
      'Creez des alertes specifiques plutot qu\'une seule alerte trop large',
      'Verifiez regulierement vos detections pour affiner les criteres'
    ]
  },
  {
    id: 'market-management',
    title: 'Gestion de vos marches',
    description: 'Organisez et suivez vos candidatures depuis la creation jusqu\'au resultat final.',
    icon: FileText,
    duration: '7 min',
    steps: [
      'Creer un nouveau marche dans votre portefeuille',
      'Ajouter et analyser les documents du DCE',
      'Suivre l\'avancement de votre candidature',
      'Mettre a jour le statut (soumis, gagne, perdu)'
    ],
    tips: [
      'Importez les documents du DCE des que possible pour beneficier de l\'analyse IA',
      'Utilisez les statuts pour un suivi precis de votre pipeline'
    ]
  },
  {
    id: 'technical-memory',
    title: 'Memoire technique IA',
    description: 'Generez des memoires techniques professionnelles grace a l\'intelligence artificielle.',
    icon: BookOpen,
    duration: '10 min',
    steps: [
      'Selectionner un marche et lancer la generation',
      'Configurer les sections de la memoire technique',
      'Personnaliser le contenu genere par l\'IA',
      'Ajouter vos references et images',
      'Exporter en PDF ou DOCX'
    ],
    tips: [
      'Plus votre base de connaissances est riche, meilleurs seront les resultats',
      'Relisez et adaptez toujours le contenu genere avant soumission'
    ]
  },
  {
    id: 'ai-assistant',
    title: 'Assistant IA',
    description: 'Exploitez l\'assistant conversationnel pour obtenir des reponses instantanees sur les marches publics.',
    icon: MessageSquare,
    duration: '5 min',
    steps: [
      'Poser des questions sur la reglementation',
      'Demander de l\'aide pour rediger des sections specifiques',
      'Analyser des clauses de documents',
      'Obtenir des conseils strategiques'
    ],
    tips: [
      'Soyez precis dans vos questions pour de meilleures reponses',
      'L\'assistant connait le contexte de vos marches en cours'
    ]
  },
  {
    id: 'secure-vault',
    title: 'Coffre-Fort numerique',
    description: 'Stockez en securite vos documents sensibles et informations confidentielles.',
    icon: Lock,
    duration: '4 min',
    steps: [
      'Ajouter des documents au coffre-fort',
      'Organiser par categories',
      'Gerer les acces et permissions',
      'Recuperer un document stocke'
    ],
    tips: [
      'Stockez vos attestations et certifications pour un acces rapide',
      'Les documents du coffre-fort sont chiffres et securises'
    ]
  },
  {
    id: 'settings-optimization',
    title: 'Optimiser vos parametres',
    description: 'Configurez la plateforme pour maximiser votre productivite au quotidien.',
    icon: Settings,
    duration: '5 min',
    steps: [
      'Configurer votre profil entreprise complet',
      'Alimenter la base de connaissances',
      'Parametrer les notifications et digests',
      'Gerer les webhooks et integrations'
    ],
    tips: [
      'Une base de connaissances complete ameliore considerablement la qualite des generations IA',
      'Les digests email vous permettent de rester informe sans vous connecter'
    ]
  }
];

export const Formation: React.FC = () => {
  const { isDark } = useTheme();
  const [activeModule, setActiveModule] = useState<string>(modules[0].id);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const currentModule = modules.find(m => m.id === activeModule) || modules[0];

  const toggleComplete = (moduleId: string) => {
    setCompletedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const progress = Math.round((completedModules.size / modules.length) * 100);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-3">
            <div className={`p-3 rounded-xl ${isDark ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
              <GraduationCap className={`w-7 h-7 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Formation
              </h1>
              <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Maitrisez toutes les fonctionnalites de la plateforme
              </p>
            </div>
          </div>

          <div className={`mt-6 rounded-xl border p-4 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Progression globale
              </span>
              <span className={`text-sm font-semibold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                {completedModules.size}/{modules.length} modules
              </span>
            </div>
            <div className={`w-full h-2.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div
                className="h-2.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Modules de formation
                </h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {modules.map((mod) => {
                  const Icon = mod.icon;
                  const isActive = activeModule === mod.id;
                  const isCompleted = completedModules.has(mod.id);

                  return (
                    <button
                      key={mod.id}
                      onClick={() => setActiveModule(mod.id)}
                      className={`w-full flex items-center gap-3 p-4 text-left transition-all duration-200 ${
                        isActive
                          ? isDark
                            ? 'bg-orange-500/10 border-l-2 border-l-orange-500'
                            : 'bg-orange-50 border-l-2 border-l-orange-500'
                          : isDark
                            ? 'hover:bg-gray-750 border-l-2 border-l-transparent'
                            : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        isCompleted
                          ? isDark ? 'bg-green-500/10' : 'bg-green-50'
                          : isActive
                            ? isDark ? 'bg-orange-500/20' : 'bg-orange-100'
                            : isDark ? 'bg-gray-700' : 'bg-gray-100'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                        ) : (
                          <Icon className={`w-4 h-4 ${
                            isActive
                              ? isDark ? 'text-orange-400' : 'text-orange-600'
                              : isDark ? 'text-gray-400' : 'text-gray-500'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium truncate ${
                          isActive
                            ? isDark ? 'text-orange-400' : 'text-orange-700'
                            : isDark ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {mod.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className={`w-3 h-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {mod.duration}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 flex-shrink-0 ${
                        isActive
                          ? isDark ? 'text-orange-400' : 'text-orange-600'
                          : isDark ? 'text-gray-600' : 'text-gray-300'
                      }`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isDark ? 'bg-orange-500/10' : 'bg-orange-50'}`}>
                      <currentModule.icon className={`w-6 h-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {currentModule.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {currentModule.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleComplete(currentModule.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      completedModules.has(currentModule.id)
                        ? isDark
                          ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                          : 'bg-green-50 text-green-700 hover:bg-green-100'
                        : isDark
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {completedModules.has(currentModule.id) ? 'Termine' : 'Marquer comme termine'}
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {currentModule.description}
                </p>

                {currentModule.videoSrc && (
                  <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
                    <video
                      className="w-full aspect-video"
                      controls
                      preload="metadata"
                      key={currentModule.videoSrc}
                    >
                      <source src={currentModule.videoSrc} type="video/mp4" />
                      Votre navigateur ne supporte pas la lecture de videos.
                    </video>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Target className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Etapes a suivre
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {currentModule.steps.map((step, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-750' : 'bg-gray-50'}`}
                      >
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {index + 1}
                        </div>
                        <span className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {step}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {currentModule.tips.length > 0 && (
                  <div className={`rounded-xl p-5 ${isDark ? 'bg-amber-500/5 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                      <h3 className={`text-base font-semibold ${isDark ? 'text-amber-400' : 'text-amber-800'}`}>
                        Astuces
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {currentModule.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Zap className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-amber-500' : 'text-amber-500'}`} />
                          <span className={`text-sm leading-relaxed ${isDark ? 'text-amber-200/80' : 'text-amber-900'}`}>
                            {tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
