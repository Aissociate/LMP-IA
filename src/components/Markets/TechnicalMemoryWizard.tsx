import React, { useState } from 'react';
import { X, BookOpen, Download, Building, Target, Cog as Cogs, Calendar, Users, Award, Shield, Euro, Zap, FileText, BarChart3, AlertTriangle, Lock, Leaf, RefreshCw, FolderOpen, CheckCircle, Settings, ChevronLeft, ChevronRight, Database, Sparkles, Wand2, RotateCcw, Save, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Section } from '../../types/technicalMemory';
import { ContextService } from '../../services/contextService';
import { LogService } from '../../services/logService';
import { SectionService } from '../../services/sectionService';
import { AIGenerationService } from '../../services/aiGenerationService';
import { ContextControls } from '../TechnicalMemory/ContextControls';
import { LogsPanel } from '../TechnicalMemory/LogsPanel';
import { SectionsList } from '../TechnicalMemory/SectionsList';
import { PromptEditor } from '../TechnicalMemory/PromptEditor';
import { SectionEditor } from '../TechnicalMemory/SectionEditor';
import { DocumentGenerationService } from '../../services/documentGenerationService';
import { PDFGenerationService } from '../../services/pdfGenerationService';
import { useSubscription } from '../../hooks/useSubscription';
import { SubscriptionLimitBanner, UpsellModal } from '../Common';
import { useTheme } from '../../hooks/useTheme';
import { ImageLibraryModal } from '../TechnicalMemory/ImageLibraryModal';

interface TechnicalMemoryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  marketId: string;
  marketTitle: string;
}

const defaultSections: Omit<Section, 'content' | 'isEditing' | 'isGenerating'>[] = [
  {
    id: 'page_garde',
    title: '0. Page de garde',
    icon: FileText,
    defaultPrompt: `Rédige une page de garde professionnelle pour ce mémoire technique incluant :
- Titre du marché
- Référence de la consultation
- Nom du pouvoir adjudicateur
- Informations de l'entreprise candidate
- Date et version du document`
  },
  {
    id: 'lettre_engagement',
    title: '1. Lettre d\'engagement & résumé exécutif',
    icon: BarChart3,
    defaultPrompt: `Rédige une lettre d'engagement synthétique présentant :
- Les engagements clés sur les délais, qualité, sécurité
- La valeur ajoutée de notre offre
- Une synthèse des risques majeurs et des parades
- Les bénéfices de notre approche`
  },
  {
    id: 'comprehension_besoin',
    title: '2. Compréhension du besoin',
    icon: Target,
    defaultPrompt: `Démontre notre compréhension du besoin en détaillant :
- Le contexte et les objectifs de l'acheteur
- Les contraintes de site identifiées
- Nos hypothèses techniques
- Le périmètre fonctionnel attendu`
  },
  {
    id: 'organisation_gouvernance',
    title: '3. Organisation & gouvernance',
    icon: Building,
    defaultPrompt: `Décris notre organisation projet :
- Organigramme de l'équipe projet
- Matrice RACI des responsabilités
- Instances de pilotage et gouvernance
- Circuit des visas et décisions`
  },
  {
    id: 'methodologie_execution',
    title: '4. Méthodologie d\'exécution',
    icon: Cogs,
    defaultPrompt: `Détaille notre méthodologie d'exécution :
- Phases de préparation et installation
- Méthodologie d'exécution par work packages
- Autocontrôles et points d'arrêt
- Traçabilité et documentation`
  },
  {
    id: 'moyens_humains_materiels',
    title: '5. Moyens humains & matériels',
    icon: Users,
    defaultPrompt: `Présente nos moyens déployés :
- Équipe par phase d'exécution
- Plan d'affectation des ressources
- Matériels et engins mobilisés
- Laboratoires et moyens d'essais`
  },
  {
    id: 'planification_phasage',
    title: '6. Planification & phasage',
    icon: Calendar,
    defaultPrompt: `Expose notre planification :
- Planning directeur et jalons majeurs
- Phasage par zones ou tranches
- Gestion des coactivités
- Pilotage des délais et aléas`
  },
  {
    id: 'qualite_smq',
    title: '7. Qualité (SMQ)',
    icon: Award,
    defaultPrompt: `Décris notre système qualité :
- Plan Qualité Projet
- Procédures de contrôle et réception
- Gestion des non-conformités
- Management des changements`
  },
  {
    id: 'securite_sante',
    title: '8. Sécurité & santé (SSE)',
    icon: Shield,
    defaultPrompt: `Présente notre approche sécurité :
- Analyse des risques et plan de prévention
- Procédures d'accueil et de formation
- Protections collectives et individuelles
- Suivi des indicateurs sécurité`
  },
  {
    id: 'environnement_rse_risques',
    title: '9. Environnement, RSE & Risques',
    icon: Leaf,
    defaultPrompt: `Présente notre approche environnementale et gestion des risques :
- Gestion des déchets et impact carbone
- Protection de la biodiversité et clauses sociales
- Analyse des risques et mesures préventives
- Opportunités d'optimisation`
  },
  {
    id: 'gestion_documentaire',
    title: '10. Gestion documentaire',
    icon: FolderOpen,
    defaultPrompt: `Présente notre gestion documentaire :
- Système GED et workflow
- Livrables par phase
- DOE numérique
- Archivage et traçabilité`
  },
  {
    id: 'engagements_kpi',
    title: '11. Engagements & KPI',
    icon: BarChart3,
    defaultPrompt: `Définit nos engagements chiffrés :
- KPI de délais et productivité
- Indicateurs sécurité et environnement
- Objectifs sociaux et satisfaction
- Modalités de reporting`
  },
  {
    id: 'annexes',
    title: '12. Annexes',
    icon: FolderOpen,
    defaultPrompt: `Compile les annexes techniques :
- CV et habilitations de l'équipe
- Plans et phasages détaillés
- Modes opératoires
- Certificats et attestations`
  }
];

export const TechnicalMemoryWizard: React.FC<TechnicalMemoryWizardProps> = ({
  isOpen,
  onClose,
  marketId,
  marketTitle
}) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const {
    subscription,
    plan,
    canCreateTechnicalMemory,
    canGenerateSection,
    getAvailableCredits,
    getFreeSectionsRemaining,
    incrementSectionUsage,
    useMemoryCredit,
    hasMarketPro,
    getRemainingMemories,
    incrementMemoryUsage,
    loading: subscriptionLoading
  } = useSubscription();
  
  const contextService = ContextService.getInstance();
  const logService = LogService.getInstance();
  const sectionService = SectionService.getInstance();
  const aiGenerationService = AIGenerationService.getInstance();
  const documentGenerationService = DocumentGenerationService.getInstance();
  const pdfGenerationService = PDFGenerationService.getInstance();
  
  const [showUpsellModal, setShowUpsellModal] = useState(false);
  const [sections, setSections] = useState<Section[]>(
    defaultSections.map(section => ({
      ...section,
      content: '',
      isEditing: false,
      isGenerating: false,
      isEnabled: true // Toutes les sections sont activées par défaut
    }))
  );
  const [activeSection, setActiveSection] = useState<string>('page_garde');
  const [showSectionSelector, setShowSectionSelector] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [generatingAll, setGeneratingAll] = useState(false);
  const [logs, setLogs] = useState<string[]>(logService.getLogs());
  const [showLogs, setShowLogs] = useState(false);
  const [exportingWord, setExportingWord] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [saving, setSaving] = useState(false);
  const [globalPrompt, setGlobalPrompt] = useState('');
  const [showGlobalPromptModal, setShowGlobalPromptModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [globalPromptSaved, setGlobalPromptSaved] = useState(true);
  const [showImageLibrary, setShowImageLibrary] = useState(false);
  const [idealFormat, setIdealFormat] = useState<string>('');
  const [loadingIdealFormat, setLoadingIdealFormat] = useState(false);

  // Contextes
  const [marketContext, setMarketContext] = useState<any>(null);
  const [knowledgeContext, setKnowledgeContext] = useState<any[]>([]);
  const [imageAssets, setImageAssets] = useState<any[]>([]);
  const [useMarketContext, setUseMarketContext] = useState(true);
  const [useKnowledgeContext, setUseKnowledgeContext] = useState(true);
  const [contextLoading, setContextLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  React.useEffect(() => {
    // S'abonner aux logs
    const unsubscribe = logService.subscribe(setLogs);
    
    const currentSection = sections.find(s => s.id === activeSection);
    if (currentSection) {
      // Charger le prompt sauvegardé ou utiliser le prompt par défaut
      const savedSectionPrompt = localStorage.getItem(`section-prompt-${marketId}-${activeSection}`);
      setCustomPrompt(savedSectionPrompt || currentSection.defaultPrompt);
    }
    
    return unsubscribe;
  }, [activeSection, sections]);

  React.useEffect(() => {
    if (isOpen) {
      if (user && user.id) {
        loadContexts();
        loadExistingSections();
        // Charger le prompt global depuis localStorage
        const savedGlobalPrompt = localStorage.getItem(`global-prompt-${marketId}`);
        if (savedGlobalPrompt) {
          setGlobalPrompt(savedGlobalPrompt);
        }
        // Charger le prompt de section depuis localStorage
        const savedSectionPrompt = localStorage.getItem(`section-prompt-${marketId}-${activeSection}`);
        if (savedSectionPrompt) {
          setCustomPrompt(savedSectionPrompt);
        }
        // Charger la sélection des sections depuis localStorage
        const savedEnabledSections = localStorage.getItem(`enabled-sections-${marketId}`);
        if (savedEnabledSections) {
          const enabledIds = JSON.parse(savedEnabledSections);
          setSections(prev => prev.map(s => ({
            ...s,
            isEnabled: enabledIds.includes(s.id)
          })));
        }
      } else {
        // Réessayer après un court délai si l'utilisateur n'est pas encore chargé
        const timer = setTimeout(() => {
          if (user && user.id) {
            loadContexts();
            loadExistingSections();
          }
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, marketId, user]);

  // Changer la section active par défaut vers la première section
  React.useEffect(() => {
    if (sections.length > 0) {
      setActiveSection(sections[0].id);
    }
  }, []);

  const loadExistingSections = async () => {
    setSectionsLoading(true);
    logService.addLog('🔄 Chargement des sections sauvegardées...');
    
    try {
      const { data: existingSections, error } = await supabase
        .from('memo_sections')
        .select('section_id, section_title, content, generated_at')
        .eq('market_id', marketId);

      if (error) {
        logService.addLog(`❌ Erreur chargement sections: ${error.message}`);
        throw error;
      }

      if (existingSections && existingSections.length > 0) {
        logService.addLog(`✅ ${existingSections.length} sections trouvées en base`);
        
        // Mettre à jour les sections avec le contenu sauvegardé
        setSections(prev => prev.map(section => {
          const existingSection = existingSections.find(es => es.section_id === section.id);
          if (existingSection) {
            logService.addLog(`   📄 Section "${section.title}" restaurée (${Math.round(existingSection.content.length / 1000)}k chars)`);
            return {
              ...section,
              content: existingSection.content
            };
          }
          return section;
        }));
      } else {
        logService.addLog('📝 Aucune section sauvegardée pour ce marché');
      }
    } catch (error) {
      logService.addLog(`❌ Erreur lors du chargement des sections: ${(error as Error).message}`);
    } finally {
      setSectionsLoading(false);
    }
  };

  const loadContexts = async () => {
    setContextLoading(true);
    logService.addLog('🔄 Chargement des contextes...');

    try {
      // Toujours charger le contexte du marché (nécessaire pour l'analyse du format)
      const context = await contextService.loadMarketContext(marketId, supabase);
      setMarketContext(context);
      logService.addLog('✅ Contexte marché chargé');

      // Charger le contexte de la base de connaissances
      if (useKnowledgeContext) {
        const knowledgeCtx = await contextService.loadKnowledgeContext(user!.id, supabase);
        setKnowledgeContext(knowledgeCtx);
        logService.addLog(`✅ Base de connaissances chargée (${knowledgeCtx.length} documents)`);
      }

      // Charger les images disponibles
      const assets = await contextService.loadImageAssets(user!.id, supabase);
      setImageAssets(assets);
      logService.addLog(`✅ Images chargées (${assets.length} images)`);

      // Déclencher l'analyse du format idéal après le chargement du contexte
      if (context) {
        setTimeout(() => analyzeIdealFormat(), 100);
      }
    } catch (error) {
      logService.addLog(`❌ Erreur chargement contextes: ${(error as Error).message}`);
    } finally {
      setContextLoading(false);
    }
  };

  const analyzeIdealFormat = async () => {
    if (!marketContext) {
      console.log('No market context available for format analysis');
      setIdealFormat('Aucune information de marché disponible pour analyser le format de réponse.');
      return;
    }

    setLoadingIdealFormat(true);
    logService.addLog('🔍 Analyse du format de réponse idéal...');

    try {
      const response = await aiGenerationService.generateSectionContent({
        sectionId: 'ideal_format_analysis',
        sectionTitle: 'Analyse du format de réponse idéal',
        useMarketPro: hasMarketPro ? hasMarketPro() : false,
        prompt: `Analyse le contexte du marché et réponds de manière concise et directe à cette question:

Quel est le format de réponse idéale pour ce marché ?

Consignes:
- Réponse en 2-3 phrases maximum
- Si des informations précises sont disponibles (nombre de pages, sections requises, format), les mentionner
- Si aucune information n'est disponible, dire clairement "Aucune information spécifique sur le format de réponse n'est disponible dans les documents."
- Être factuel et concis`,
        globalPrompt: '',
        marketContext,
        knowledgeContext: [],
        imageAssets: [],
        useMarketContext: true,
        useKnowledgeContext: false,
        marketTitle
      });

      setIdealFormat(response);
      logService.addLog('✅ Format de réponse idéal analysé');
    } catch (error) {
      console.error('Error analyzing ideal format:', error);
      logService.addLog(`❌ Erreur analyse format: ${(error as Error).message}`);
      setIdealFormat('Erreur lors de l\'analyse du format de réponse.');
    } finally {
      setLoadingIdealFormat(false);
    }
  };

  const handleSectionUpdate = async (sectionId: string, updates: Partial<Section>) => {
    setSections(prev => sectionService.updateSection(prev, sectionId, updates));
    
    // Sauvegarder en base si le contenu a changé
    if (updates.content !== undefined) {
      try {
        const section = sections.find(s => s.id === sectionId);
        if (section) {
          await supabase
            .from('memo_sections')
            .upsert({
              market_id: marketId,
              section_id: sectionId,
              section_title: section.title,
              content: updates.content,
              updated_at: new Date().toISOString()
            }, { onConflict: 'market_id,section_id' });
        }
      } catch (error) {
        console.error('Error saving section:', error);
      }
    }
  };

  const handleGenerateSection = async (sectionId: string) => {
    const section = sectionService.getSectionById(sections, sectionId);
    if (!section) return;

    // Vérifier si l'utilisateur peut générer une section
    if (!canGenerateSection()) {
      setShowUpsellModal(true);
      return;
    }

    // Incrémenter l'usage de sections
    const freeSections = getFreeSectionsRemaining();
    if (freeSections > 0) {
      await incrementSectionUsage();
    }

    await handleSectionUpdate(sectionId, { isGenerating: true });

    try {
      const generatedContent = await aiGenerationService.generateSectionContent({
        sectionId,
        sectionTitle: section.title,
        useMarketPro: hasMarketPro ? hasMarketPro() : false,
        prompt: customPrompt,
        globalPrompt,
        marketContext,
        knowledgeContext,
        imageAssets,
        useMarketContext,
        useKnowledgeContext,
        marketTitle
      });

      await handleSectionUpdate(sectionId, {
        content: generatedContent,
        isGenerating: false
      });

      // Émettre un événement pour mettre à jour le dashboard
      window.dispatchEvent(new CustomEvent('straticia:memory-generated', {
        detail: { marketId, sectionId }
      }));

    } catch (error) {
      await handleSectionUpdate(sectionId, { isGenerating: false });
      console.error('Error generating section:', error);
    }
  };

  const handleGenerateAll = async () => {
    setGeneratingAll(true);

    // Marquer toutes les sections vides comme en cours de génération
    const updatedSections = sectionService.markAllEmptySectionsAsGenerating(sections);
    setSections(updatedSections);

    try {
      await aiGenerationService.generateAllSections(
        sections,
        {
          globalPrompt,
          useMarketPro: hasMarketPro ? hasMarketPro() : false,
          marketContext,
          knowledgeContext,
          imageAssets,
          useMarketContext,
          useKnowledgeContext,
          marketTitle
        },
        handleSectionUpdate
      );

      // Incrémenter l'usage pour les nouvelles sections générées
      const emptySections = sectionService.getEmptySections(sections);
      if (emptySections.length > 0) {
        await incrementMemoryUsage();
      }

    } catch (error) {
      console.error('Error generating all sections:', error);
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleRegenerateAll = async () => {
    if (!confirm('Voulez-vous vraiment regénérer TOUTES les sections ? Le contenu actuel sera remplacé.')) {
      return;
    }

    setGeneratingAll(true);

    // Marquer TOUTES les sections comme en cours de génération et vider leur contenu
    const updatedSections = sections.map(section => ({
      ...section,
      isGenerating: true,
      content: ''
    }));
    setSections(updatedSections);

    try {
      await aiGenerationService.generateAllSections(
        updatedSections,
        {
          globalPrompt,
          useMarketPro: hasMarketPro ? hasMarketPro() : false,
          marketContext,
          knowledgeContext,
          imageAssets,
          useMarketContext,
          useKnowledgeContext,
          marketTitle
        },
        handleSectionUpdate
      );

      // Incrémenter l'usage pour toutes les sections régénérées
      await incrementMemoryUsage();

    } catch (error) {
      console.error('Error regenerating all sections:', error);
    } finally {
      setGeneratingAll(false);
    }
  };

  const handleSaveMemory = async () => {
    if (!user?.id) {
      alert('Utilisateur non connecté');
      return;
    }

    const sectionsWithContent = sectionService.getCompletedSections(sections);
    if (sectionsWithContent.length === 0) {
      alert('Aucune section avec du contenu à sauvegarder');
      return;
    }

    setSaving(true);
    logService.clearLogs();
    setShowLogs(true);

    try {
      logService.addLog('💾 Début de la sauvegarde du mémoire technique...');

      // Vérifier les sections existantes
      logService.addLog('🔍 Vérification des sections existantes...');
      const { data: existingSections, error: checkError } = await supabase
        .from('memo_sections')
        .select('section_id')
        .eq('market_id', marketId);

      if (checkError) {
        logService.addLog(`❌ Erreur vérification: ${checkError.message}`);
        throw checkError;
      }

      logService.addLog(`✓ ${existingSections?.length || 0} sections trouvées en base`);

      // Identifier les sections à insérer ou mettre à jour
      const existingSectionIds = new Set(existingSections?.map(s => s.section_id) || []);
      const sectionsToInsert = sectionsWithContent.filter(s => !existingSectionIds.has(s.id));
      const sectionsToUpdate = sectionsWithContent.filter(s => existingSectionIds.has(s.id));

      // Insérer les nouvelles sections
      if (sectionsToInsert.length > 0) {
        logService.addLog(`📝 Insertion de ${sectionsToInsert.length} nouvelles sections...`);

        const insertData = sectionsToInsert.map(section => ({
          market_id: marketId,
          section_id: section.id,
          section_title: section.title,
          content: section.content,
          generated_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase
          .from('memo_sections')
          .insert(insertData);

        if (insertError) {
          logService.addLog(`❌ Erreur insertion: ${insertError.message}`);
          throw insertError;
        }

        logService.addLog(`✅ ${sectionsToInsert.length} sections insérées`);
      }

      // Mettre à jour les sections existantes
      if (sectionsToUpdate.length > 0) {
        logService.addLog(`🔄 Mise à jour de ${sectionsToUpdate.length} sections...`);

        for (const section of sectionsToUpdate) {
          const { error: updateError } = await supabase
            .from('memo_sections')
            .update({
              section_title: section.title,
              content: section.content,
              updated_at: new Date().toISOString()
            })
            .eq('market_id', marketId)
            .eq('section_id', section.id);

          if (updateError) {
            logService.addLog(`❌ Erreur mise à jour section ${section.title}: ${updateError.message}`);
            throw updateError;
          }
        }

        logService.addLog(`✅ ${sectionsToUpdate.length} sections mises à jour`);
      }

      logService.addLog(`✅ Sauvegarde terminée: ${sectionsWithContent.length} sections au total`);
      logService.addLog('💡 Le mémoire technique est maintenant disponible pour les documents économiques');

      alert('Mémoire technique sauvegardé avec succès');
    } catch (error) {
      console.error('Error saving memory:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      logService.addLog(`❌ Erreur: ${errorMessage}`);
      alert(`Erreur lors de la sauvegarde: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleExportWord = async () => {
    const sectionsWithContent = sectionService.getCompletedSections(sections);
    if (sectionsWithContent.length === 0) {
      alert('Aucune section avec du contenu à exporter');
      return;
    }

    setExportingWord(true);
    try {
      await documentGenerationService.generateWordDocument({
        marketTitle,
        marketReference: marketContext?.reference,
        client: marketContext?.client,
        sections: sectionsWithContent
      });

      if (incrementMemoryUsage && getRemainingMemories && getRemainingMemories() >= 0) {
        await incrementMemoryUsage();
        logService.addLog('✅ Crédit mémoire décrémenté après export Word');
      }
    } catch (error) {
      console.error('Error exporting Word:', error);
      alert(`Erreur lors de l'export Word: ${(error as Error).message}`);
    } finally {
      setExportingWord(false);
    }
  };

  const handleExportPDF = async () => {
    const sectionsWithContent = sectionService.getCompletedSections(sections);
    if (sectionsWithContent.length === 0) {
      alert('Aucune section avec du contenu à exporter');
      return;
    }

    setExportingPDF(true);
    try {
      await pdfGenerationService.generatePDF({
        marketTitle,
        marketReference: marketContext?.reference,
        client: marketContext?.client,
        sections: sectionsWithContent
      });

      if (incrementMemoryUsage && getRemainingMemories && getRemainingMemories() >= 0) {
        await incrementMemoryUsage();
        logService.addLog('✅ Crédit mémoire décrémenté après export PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert(`Erreur lors de l'export PDF: ${(error as Error).message}`);
    } finally {
      setExportingPDF(false);
    }
  };

  const currentSection = sectionService.getSectionById(sections, activeSection);
  const enabledSections = sections.filter(s => s.isEnabled !== false);
  const completedSections = sectionService.getCompletedSections(enabledSections);
  const emptySections = sectionService.getEmptySections(enabledSections);
  const isBlocked = false;
  const freeSectionsLeft = getFreeSectionsRemaining();
  const creditsAvailable = getAvailableCredits();

  const handleToggleSection = (sectionId: string) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, isEnabled: !s.isEnabled } : s
    ));
  };

  const getEnabledSectionNumber = (sectionId: string): number => {
    let count = 0;
    for (const section of sections) {
      if (section.isEnabled !== false) {
        if (section.id === sectionId) {
          return count;
        }
        count++;
      }
    }
    return count;
  };

  if (!isOpen) return null;

  return (
    <>
      <UpsellModal
        isOpen={showUpsellModal}
        onClose={() => setShowUpsellModal(false)}
        currentPlan={plan?.name || 'Freemium'}
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col transition-colors duration-200 relative`}>
        {/* Bannière d'abonnement et modèle */}
        {!subscriptionLoading && (
          <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                {hasMarketPro && hasMarketPro() ? (
                  <div className="flex items-center gap-2 bg-purple-100 border border-purple-300 px-3 py-1.5 rounded-lg">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span className="text-purple-900 font-semibold">Mode Premium</span>
                    <span className="text-purple-700 text-xs">IA avancée</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-orange-100 border border-orange-300 px-3 py-1.5 rounded-lg">
                    <Zap className="w-4 h-4 text-orange-600" />
                    <span className="text-orange-900 font-semibold">Mode Standard</span>
                    <span className="text-orange-700 text-xs">IA rapide</span>
                  </div>
                )}
                {getRemainingMemories && (
                  <span className="text-blue-700">
                    <strong>{getRemainingMemories() === -1 ? '∞' : getRemainingMemories()}</strong> mémoires {getRemainingMemories() === -1 ? '' : 'restantes ce mois'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!hasMarketPro?.() && (
                  <button
                    onClick={() => setShowUpsellModal(true)}
                    className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                  >
                    <Sparkles className="w-4 h-4" />
                    Passer en Premium
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className={`px-4 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Mémoire technique</h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{marketTitle}</p>
              </div>
            </div>

          <div className="flex items-center gap-4">
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full`}>
              {completedSections.length}/{enabledSections.length} sections complétées
            </div>

            <button
              onClick={() => setShowSectionSelector(true)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              title="Sélectionner les sections à inclure"
            >
              <CheckCircle className="w-4 h-4" />
              Sections ({enabledSections.length}/{sections.length})
            </button>

            {/* Bouton bibliothèque d'images */}
            <button
              onClick={() => setShowImageLibrary(true)}
              className={`${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} p-2 rounded-lg transition-colors`}
              title="Bibliothèque d'assets"
            >
              <Image className="w-4 h-4" />
            </button>

            {/* Bouton de sauvegarde */}
            <button
              onClick={handleSaveMemory}
              disabled={saving || completedSections.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              title="Enregistrer le mémoire technique pour les documents économiques"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm font-medium">Enregistrer</span>
            </button>

            {/* Boutons d'export */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportWord}
                disabled={exportingWord || completedSections.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                title="Export Word"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleExportPDF}
                disabled={exportingPDF || completedSections.length === 0}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                title="Export PDF"
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>

            <LogsPanel
              logs={logs}
              showLogs={showLogs}
              onToggleLogs={() => setShowLogs(!showLogs)}
              onClearLogs={() => logService.clearLogs()}
            />

            <button
              onClick={onClose}
              className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors p-1`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          </div>

          {/* Format idéal - Bandeau informatif */}
          {loadingIdealFormat && (
            <div className={`mt-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} flex items-center gap-2`}>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                Analyse du format de réponse idéal...
              </span>
            </div>
          )}

          {!loadingIdealFormat && idealFormat && (
            <div className={`mt-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start gap-2">
                <Sparkles className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <div className="flex-1">
                  <p className={`text-xs font-medium ${isDark ? 'text-blue-300' : 'text-blue-900'} mb-1`}>
                    Format de réponse idéal :
                  </p>
                  <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                    {idealFormat}
                  </p>
                </div>
                <button
                  onClick={analyzeIdealFormat}
                  className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-blue-800' : 'hover:bg-blue-100'}`}
                  title="Régénérer l'analyse"
                >
                  <RefreshCw className={`w-3 h-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contenu principal */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar des sections */}
          <div className={`${sidebarCollapsed ? 'w-12' : 'w-72'} transition-all duration-300`}>
            {sidebarCollapsed ? (
              <div className={`h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-r p-2 flex flex-col items-center gap-2`}>
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className={`p-2 rounded ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'} transition-colors`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {sections.filter(s => s.isEnabled !== false).map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;
                  const hasContent = section.content.length > 0;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`p-2.5 rounded transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg'
                          : hasContent
                          ? isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-600'
                          : section.isGenerating
                          ? isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-600'
                          : isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }`}
                      title={section.title}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className={`h-full ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border-r overflow-y-auto`}>
                <div className="p-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Sections</h3>
                    <button
                      onClick={() => setSidebarCollapsed(true)}
                      className={`p-1.5 rounded ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'} transition-colors`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  <SectionsList
                    sections={sections.filter(s => s.isEnabled !== false)}
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Zone principale */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* En-tête de section avec actions */}
            <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50/50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {currentSection && (
                    <>
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                        <currentSection.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {currentSection.title}
                        </h3>
                        {currentSection.content && (
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {Math.round(currentSection.content.length / 1000)} k caractères
                          </p>
                        )}
                      </div>
                    </>
                  )}
                  {currentSection?.isGenerating && (
                    <div className="flex items-center gap-2 ml-4">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      <span className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Génération en cours...</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions principales */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowGlobalPromptModal(true)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isDark ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-orange-500' : 'border-gray-300 bg-white text-gray-700 hover:bg-orange-50 hover:border-orange-400'}`}
                  title="Prompt global du mémoire"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Prompt global</span>
                </button>

                <button
                  onClick={() => setShowPromptModal(true)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isDark ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:border-purple-500' : 'border-gray-300 bg-white text-gray-700 hover:bg-purple-50 hover:border-purple-400'}`}
                  title="Prompt de cette section"
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Prompt section</span>
                  <div className={`px-2 py-0.5 rounded-full text-xs ${isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
                    {Math.round(customPrompt.length / 100) || 1}k
                  </div>
                </button>

                <button
                  onClick={() => setShowContextModal(true)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${isDark ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                  title="Contextes"
                >
                  <Database className="w-4 h-4" />
                  <span className="text-sm font-medium">Contextes</span>
                </button>

                <div className="flex-1"></div>

                {emptySections.length > 0 && (
                  <button
                    onClick={handleGenerateAll}
                    disabled={generatingAll || isBlocked}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 shadow-sm ${
                      isBlocked
                        ? 'bg-gray-400 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                    }`}
                    title={`Générer toutes les sections vides (${emptySections.length})`}
                  >
                    {isBlocked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Bloqué</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className={`w-4 h-4 ${generatingAll ? 'animate-spin' : ''}`} />
                        <span>{generatingAll ? `Génération ${sections.filter(s => s.isGenerating).length}/${emptySections.length}` : `Générer tout (${emptySections.length})`}</span>
                      </>
                    )}
                  </button>
                )}

                {emptySections.length === 0 && sections.some(s => s.content) && (
                  <button
                    onClick={handleRegenerateAll}
                    disabled={generatingAll || isBlocked}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 shadow-sm ${
                      isBlocked
                        ? 'bg-gray-400 text-white'
                        : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
                    }`}
                    title="Regénérer toutes les sections"
                  >
                    {isBlocked ? (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Bloqué</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className={`w-4 h-4 ${generatingAll ? 'animate-spin' : ''}`} />
                        <span>{generatingAll ? `Régénération ${sections.filter(s => s.isGenerating).length}/${sections.length}` : 'Regénérer tout'}</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => handleGenerateSection(activeSection)}
                  disabled={currentSection?.isGenerating || !customPrompt.trim() || isBlocked}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all disabled:opacity-50 shadow-sm ${
                    isBlocked
                      ? 'bg-gray-400 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                  }`}
                >
                  {isBlocked ? (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Bloqué</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className={`w-4 h-4 ${currentSection?.isGenerating ? 'animate-spin' : ''}`} />
                      <span>{currentSection?.isGenerating ? 'Génération...' : 'Générer cette section'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Zone de contenu maximisée */}
            {currentSection && (
              <div className="flex-1 overflow-hidden">
                <SectionEditor
                  section={currentSection}
                  onToggleEdit={() => handleSectionUpdate(activeSection, { isEditing: !currentSection.isEditing })}
                  onContentChange={(content) => handleSectionUpdate(activeSection, { content })}
                />
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {showPromptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Prompt de section: {currentSection?.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Instructions spécifiques pour cette section uniquement
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Instructions spécifiques pour cette section
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={10}
                    className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none font-mono text-sm`}
                    placeholder="Instructions spécifiques pour cette section (ex: style, détails particuliers, format...)"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {customPrompt.length} caractères
                      {customPrompt.length > 500 && (
                        <span className="ml-2 text-purple-600">• Prompt détaillé</span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        if (currentSection) {
                          setCustomPrompt(currentSection.defaultPrompt);
                        }
                      }}
                      className={`text-xs px-2 py-1 rounded transition-colors flex items-center gap-1 ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                    >
                      <RotateCcw className="w-3 h-3" />
                      Réinitialiser
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowPromptModal(false)}
                    className={`px-3 py-2 text-sm ${isDark ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'} rounded transition-colors`}
                  >
                    Fermer
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem(`section-prompt-${marketId}-${activeSection}`, customPrompt);
                      setShowPromptModal(false);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
                  >
                    <Save className="w-3 h-3" />
                    Enregistrer
                  </button>
                  <button
                    onClick={() => {
                      setShowPromptModal(false);
                      handleGenerateSection(activeSection);
                    }}
                    disabled={currentSection?.isGenerating || !customPrompt.trim() || isBlocked}
                    className={`text-sm font-medium px-4 py-2 rounded flex items-center gap-2 transition-colors disabled:opacity-50 ${
                      isBlocked 
                        ? 'bg-gray-400 text-white'
                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                    }`}
                  >
                    <Wand2 className="w-3 h-3" />
                    Générer cette section
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showContextModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 max-w-md w-full mx-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Contextes</h3>
                <button
                  onClick={() => setShowContextModal(false)}
                  className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ContextControls
                marketContext={marketContext}
                knowledgeContext={knowledgeContext}
                useMarketContext={useMarketContext}
                useKnowledgeContext={useKnowledgeContext}
                onToggleMarketContext={setUseMarketContext}
                onToggleKnowledgeContext={setUseKnowledgeContext}
                contextLoading={contextLoading}
              />
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowContextModal(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {showGlobalPromptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 max-w-2xl w-full mx-4`}>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Prompt global du mémoire</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Instructions générales appliquées à TOUTES les sections du mémoire
                  </p>
                </div>
              </div>
              <div className={`mb-4 p-3 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <p className={`text-xs ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  💡 <strong>Différence :</strong> Le prompt global s'applique à toutes les sections, 
                  tandis que le prompt de section ne concerne qu'une section spécifique.
                </p>
              </div>
              <textarea
                value={globalPrompt}
                onChange={(e) => {
                  setGlobalPrompt(e.target.value);
                  setGlobalPromptSaved(false);
                }}
                rows={6}
                className={`w-full px-4 py-3 border ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none`}
                placeholder="Instructions générales pour tout le mémoire (ex: ton professionnel, style d'entreprise, approche méthodologique...)"
              />
              <div className="flex justify-between items-center mt-2">
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {globalPrompt.length} caractères • Appliqué à toutes les sections
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowGlobalPromptModal(false)}
                  className={`px-3 py-2 text-sm ${isDark ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-700 bg-gray-200 hover:bg-gray-300'} rounded`}
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem(`global-prompt-${marketId}`, globalPrompt);
                    setGlobalPromptSaved(true);
                    setShowGlobalPromptModal(false);
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded text-sm flex items-center gap-1"
                >
                  <Save className="w-3 h-3" />
                  Enregistrer global
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bibliothèque d'images */}
        <ImageLibraryModal
          isOpen={showImageLibrary}
          onClose={() => setShowImageLibrary(false)}
          onInsertImage={(imageCode) => {
            const currentSection = sections.find(s => s.id === activeSection);
            if (currentSection && currentSection.isEditing) {
              const updatedContent = currentSection.content + '\n\n' + imageCode;
              setSections(sections.map(s =>
                s.id === activeSection
                  ? { ...s, content: updatedContent }
                  : s
              ));
            }
            setShowImageLibrary(false);
          }}
        />

        {/* Modal de sélection des sections */}
        {showSectionSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Sélection des sections
                  </h3>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Cochez les sections à inclure dans le mémoire technique. La numérotation s'adaptera automatiquement.
                  </p>
                </div>
                <button
                  onClick={() => setShowSectionSelector(false)}
                  className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => setSections(sections.map(s => ({ ...s, isEnabled: true })))}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                  Tout sélectionner
                </button>
                <button
                  onClick={() => setSections(sections.map(s => ({ ...s, isEnabled: false })))}
                  className={`px-3 py-2 text-sm rounded-lg transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Tout désélectionner
                </button>
              </div>

              <div className="space-y-2">
                {sections.map((section, index) => {
                  const Icon = section.icon;
                  const isEnabled = section.isEnabled !== false;
                  const enabledNumber = getEnabledSectionNumber(section.id);

                  return (
                    <div
                      key={section.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isEnabled
                          ? isDark
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-blue-300 bg-blue-50'
                          : isDark
                          ? 'border-gray-700 bg-gray-800/50 opacity-60'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        onChange={() => handleToggleSection(section.id)}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                        isEnabled
                          ? 'bg-blue-600 text-white'
                          : isDark
                          ? 'bg-gray-700 text-gray-500'
                          : 'bg-gray-200 text-gray-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium ${
                          isEnabled
                            ? isDark ? 'text-white' : 'text-gray-900'
                            : isDark ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {isEnabled ? `${enabledNumber}.` : ''} {section.title.replace(/^\d+\.\s*/, '')}
                        </div>
                        {section.content && (
                          <div className={`text-xs mt-1 ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {Math.round(section.content.length / 1000)}k caractères
                          </div>
                        )}
                      </div>
                      {isEnabled && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={`mt-6 p-4 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
                <div className="flex items-start gap-2">
                  <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                      Numérotation automatique
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      La numérotation des sections sera automatiquement mise à jour dans les exports (Word, PDF) en fonction de votre sélection.
                      Les sections désactivées n'apparaîtront pas dans les documents générés.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowSectionSelector(false)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem(`enabled-sections-${marketId}`, JSON.stringify(
                      sections.filter(s => s.isEnabled !== false).map(s => s.id)
                    ));
                    setShowSectionSelector(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Enregistrer la sélection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};