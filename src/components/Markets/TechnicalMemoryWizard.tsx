import React, { useState } from 'react';
import { X, BookOpen, Download, Building, Target, Cog as Cogs, Calendar, Users, Award, Shield, Euro, Zap, FileText, BarChart3, AlertTriangle, Lock, Leaf, RefreshCw, FolderOpen, CheckCircle, Settings, ChevronLeft, ChevronRight, Database, Sparkles, Wand2, RotateCcw, Save, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { Section } from '../../types/technicalMemory';
import { ContextService, CompanyProfileContext, UserProfileContext } from '../../services/contextService';
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
    id: 'qsse',
    title: '7. QSSE (Qualité, Sécurité, Santé, Environnement)',
    icon: Shield,
    defaultPrompt: `Présente notre démarche QSSE intégrée :
- Plan Qualité et contrôles
- Sécurité : analyse des risques et prévention
- Environnement : déchets, carbone, biodiversité
- RSE et clauses sociales`
  },
  {
    id: 'gestion_documentaire',
    title: '8. Gestion documentaire',
    icon: FolderOpen,
    defaultPrompt: `Présente notre gestion documentaire :
- Système GED et workflow
- Livrables par phase
- DOE numérique
- Archivage et traçabilité`
  },
  {
    id: 'engagements_kpi',
    title: '9. Engagements & KPI',
    icon: BarChart3,
    defaultPrompt: `Définit nos engagements chiffrés :
- KPI de délais et productivité
- Indicateurs sécurité et environnement
- Objectifs sociaux et satisfaction
- Modalités de reporting`
  },
  {
    id: 'annexes',
    title: '10. Annexes',
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
  
  const contextService = ContextService.getInstance();
  const logService = LogService.getInstance();
  const sectionService = SectionService.getInstance();
  const aiGenerationService = AIGenerationService.getInstance();
  const documentGenerationService = DocumentGenerationService.getInstance();
  const pdfGenerationService = PDFGenerationService.getInstance();
  
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
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [pendingExportType, setPendingExportType] = useState<'word' | 'pdf' | null>(null);

  // Subscription state
  const [subscriptionInfo, setSubscriptionInfo] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [canCreateMemory, setCanCreateMemory] = useState(false);

  // Contextes
  const [marketContext, setMarketContext] = useState<any>(null);
  const [knowledgeContext, setKnowledgeContext] = useState<any[]>([]);
  const [imageAssets, setImageAssets] = useState<any[]>([]);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileContext | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileContext | null>(null);
  const [useMarketContext, setUseMarketContext] = useState(true);
  const [useKnowledgeContext, setUseKnowledgeContext] = useState(true);
  const [contextLoading, setContextLoading] = useState(true);
  const [sectionsLoading, setSectionsLoading] = useState(false);

  const [adminPrompts, setAdminPrompts] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const unsubscribe = logService.subscribe(setLogs);

    const currentSection = sections.find(s => s.id === activeSection);
    if (currentSection) {
      const savedSectionPrompt = localStorage.getItem(`section-prompt-${marketId}-${activeSection}`);
      const adminSectionPrompt = adminPrompts[activeSection];
      setCustomPrompt(savedSectionPrompt || adminSectionPrompt || currentSection.defaultPrompt);
    }

    return unsubscribe;
  }, [activeSection, sections, adminPrompts]);

  React.useEffect(() => {
    if (isOpen) {
      if (user && user.id) {
        checkSubscription();
        loadContexts();
        loadExistingSections();
        loadAdminPromptsData();
        const savedGlobalPrompt = localStorage.getItem(`global-prompt-${marketId}`);
        if (savedGlobalPrompt) {
          setGlobalPrompt(savedGlobalPrompt);
        }
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
            checkSubscription();
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
        .select('id, title, content, created_at')
        .eq('market_id', marketId);

      if (error) {
        logService.addLog(`❌ Erreur chargement sections: ${error.message}`);
        throw error;
      }

      if (existingSections && existingSections.length > 0) {
        logService.addLog(`✅ ${existingSections.length} sections trouvées en base`);
        
        // Mettre à jour les sections avec le contenu sauvegardé
        setSections(prev => prev.map(section => {
          const existingSection = existingSections.find(es => es.title === section.title);
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

  const loadAdminPromptsData = async () => {
    try {
      aiGenerationService.clearPromptsCache();
      const prompts = await aiGenerationService.loadAdminPrompts();
      setAdminPrompts(prompts);
    } catch (error) {
      console.error('Error loading admin prompts:', error);
    }
  };

  const checkSubscription = async () => {
    setLoadingSubscription(true);
    try {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('user_id', user!.id)
        .single();

      if (profile?.is_admin) {
        setCanCreateMemory(true);
        setSubscriptionInfo({ type: 'admin' });
        setLoadingSubscription(false);
        return;
      }

      const { data: subscription } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .single();

      if (!subscription) {
        setCanCreateMemory(false);
        setSubscriptionInfo({ type: 'none' });
        setLoadingSubscription(false);
        return;
      }

      const { data: memoriesThisMonth } = await supabase
        .from('memo_sections')
        .select('market_id')
        .eq('user_id', user!.id)
        .gte('created_at', subscription.current_period_start)
        .lt('created_at', subscription.current_period_end);

      const uniqueMarkets = new Set(memoriesThisMonth?.map(m => m.market_id) || []).size;
      const limit = subscription.plan.monthly_memories_limit;

      setCanCreateMemory(uniqueMarkets < limit);
      setSubscriptionInfo({
        type: 'subscription',
        planName: subscription.plan.name,
        used: uniqueMarkets,
        limit: limit,
        remaining: limit - uniqueMarkets
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setCanCreateMemory(false);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const loadContexts = async () => {
    setContextLoading(true);
    logService.addLog('Chargement des contextes...');

    try {
      const [context, profile, uProfile] = await Promise.all([
        contextService.loadMarketContext(marketId, supabase),
        contextService.loadCompanyProfile(user!.id, supabase),
        contextService.loadUserProfile(user!.id, supabase)
      ]);

      setMarketContext(context);
      setCompanyProfile(profile);
      setUserProfile(uProfile);

      if (profile?.company_name) {
        logService.addLog(`Profil entreprise chargé: ${profile.company_name}`);
        if (profile.certifications?.length > 0) {
          logService.addLog(`   ${profile.certifications.length} certifications`);
        }
        if (profile.reference_projects?.length > 0) {
          logService.addLog(`   ${profile.reference_projects.length} projets de référence`);
        }
      } else {
        logService.addLog('Aucun profil entreprise trouvé - les informations entreprise ne seront pas incluses');
      }

      if (uProfile?.full_name) {
        logService.addLog(`Profil utilisateur chargé: ${uProfile.full_name}`);
        if (uProfile.expertise_areas?.length > 0) {
          logService.addLog(`   Expertises: ${uProfile.expertise_areas.join(', ')}`);
        }
      }

      logService.addLog('Contexte marché chargé');

      if (context?.global_memory_prompt && !localStorage.getItem(`global-prompt-${marketId}`)) {
        setGlobalPrompt(context.global_memory_prompt);
        logService.addLog(`Prompt global du marché chargé (${context.global_memory_prompt.length} caractères)`);
      }

      if (useKnowledgeContext) {
        const knowledgeCtx = await contextService.loadKnowledgeContext(user!.id, supabase);
        setKnowledgeContext(knowledgeCtx);
        logService.addLog(`Base de connaissances chargée (${knowledgeCtx.length} documents)`);
      }

      const assets = await contextService.loadImageAssets(user!.id, supabase);
      setImageAssets(assets);
      logService.addLog(`Images chargées (${assets.length} images)`);

      if (context) {
        setTimeout(() => analyzeIdealFormat(), 100);
      }
    } catch (error) {
      logService.addLog(`Erreur chargement contextes: ${(error as Error).message}`);
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
        useMarketPro: false,
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

    await handleSectionUpdate(sectionId, { isGenerating: true });

    try {
      const generatedContent = await aiGenerationService.generateSectionContent({
        sectionId,
        sectionTitle: section.title,
        useMarketPro: false,
        prompt: customPrompt,
        globalPrompt,
        marketContext,
        knowledgeContext,
        imageAssets,
        companyProfile,
        userProfile,
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
          useMarketPro: false,
          marketContext,
          knowledgeContext,
          imageAssets,
          companyProfile,
          userProfile,
          useMarketContext,
          useKnowledgeContext,
          marketTitle
        },
        handleSectionUpdate
      );


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
          useMarketPro: false,
          marketContext,
          knowledgeContext,
          imageAssets,
          companyProfile,
          userProfile,
          useMarketContext,
          useKnowledgeContext,
          marketTitle
        },
        handleSectionUpdate
      );

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

      // Créer ou récupérer le mémoire technique
      logService.addLog('🔍 Vérification du mémoire technique...');
      let memoryId: string;

      const { data: existingMemory } = await supabase
        .from('technical_memories')
        .select('id')
        .eq('market_id', marketId)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (existingMemory) {
        memoryId = existingMemory.id;
        logService.addLog('✓ Mémoire technique existant trouvé');
      } else {
        logService.addLog('📝 Création du mémoire technique...');
        const { data: newMemory, error: memoryError } = await supabase
          .from('technical_memories')
          .insert({
            market_id: marketId,
            user_id: user!.id,
            title: marketTitle,
            status: 'draft'
          })
          .select('id')
          .single();

        if (memoryError) {
          logService.addLog(`❌ Erreur création mémoire: ${memoryError.message}`);
          throw memoryError;
        }

        memoryId = newMemory.id;
        logService.addLog('✅ Mémoire technique créé');
      }

      // Vérifier les sections existantes
      logService.addLog('🔍 Vérification des sections existantes...');
      const { data: existingSections, error: checkError } = await supabase
        .from('memo_sections')
        .select('id, title')
        .eq('market_id', marketId);

      if (checkError) {
        logService.addLog(`❌ Erreur vérification: ${checkError.message}`);
        throw checkError;
      }

      logService.addLog(`✓ ${existingSections?.length || 0} sections trouvées en base`);

      // Identifier les sections à insérer ou mettre à jour
      const existingSectionTitles = new Set(existingSections?.map(s => s.title) || []);
      const sectionsToInsert = sectionsWithContent.filter(s => !existingSectionTitles.has(s.title));
      const sectionsToUpdate = sectionsWithContent.filter(s => existingSectionTitles.has(s.title));

      // Insérer les nouvelles sections
      if (sectionsToInsert.length > 0) {
        logService.addLog(`📝 Insertion de ${sectionsToInsert.length} nouvelles sections...`);

        const insertData = sectionsToInsert.map((section, index) => ({
          memory_id: memoryId,
          market_id: marketId,
          user_id: user!.id,
          title: section.title,
          content: section.content,
          order_index: index,
          is_generated: true
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
              content: section.content,
              updated_at: new Date().toISOString()
            })
            .eq('market_id', marketId)
            .eq('title', section.title);

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

    // Afficher le disclaimer avant l'export
    setPendingExportType('word');
    setShowDisclaimerModal(true);
  };

  const executeExportWord = async () => {
    setExportingWord(true);
    try {
      const sectionsWithContent = sectionService.getCompletedSections(sections);
      await documentGenerationService.generateWordDocument({
        marketTitle,
        marketReference: marketContext?.reference,
        client: marketContext?.client,
        sections: sectionsWithContent
      });

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

    // Afficher le disclaimer avant l'export
    setPendingExportType('pdf');
    setShowDisclaimerModal(true);
  };

  const executeExportPDF = async () => {
    setExportingPDF(true);
    try {
      const sectionsWithContent = sectionService.getCompletedSections(sections);
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

  const handleAcceptDisclaimer = async () => {
    setShowDisclaimerModal(false);

    if (pendingExportType === 'word') {
      await executeExportWord();
    } else if (pendingExportType === 'pdf') {
      await executeExportPDF();
    }

    setPendingExportType(null);
  };

  const handleCancelDisclaimer = () => {
    setShowDisclaimerModal(false);
    setPendingExportType(null);
  };

  const getFreeSectionsRemaining = () => 999;
  const getAvailableCredits = () => 999;

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col transition-colors duration-200 relative`}>

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

          {/* Bandeau d'abonnement */}
          {!loadingSubscription && !canCreateMemory && subscriptionInfo && (
            <div className={`mt-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'} flex items-center gap-2`}>
              <Lock className="w-4 h-4 text-red-600" />
              <div className="flex-1">
                {subscriptionInfo.type === 'none' ? (
                  <span className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    ⚠️ <strong>Aucun abonnement actif.</strong> Contactez un administrateur pour créer des mémoires techniques.
                  </span>
                ) : subscriptionInfo.type === 'subscription' ? (
                  <span className={`text-sm ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                    ⚠️ <strong>Limite mensuelle atteinte :</strong> {subscriptionInfo.used}/{subscriptionInfo.limit} mémoires utilisés.
                    Votre plan <strong>{subscriptionInfo.planName}</strong> ne permet plus de créer de nouveaux mémoires ce mois-ci.
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {!loadingSubscription && canCreateMemory && subscriptionInfo?.type === 'subscription' && (
            <div className={`mt-2 px-3 py-2 rounded-lg border ${isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'} flex items-center gap-2`}>
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className={`text-xs ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                Plan <strong>{subscriptionInfo.planName}</strong> : {subscriptionInfo.remaining} mémoire(s) restant(s) ce mois
              </span>
            </div>
          )}

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
                    disabled={generatingAll || isBlocked || !canCreateMemory}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 shadow-sm ${
                      isBlocked || !canCreateMemory
                        ? 'bg-gray-400 text-white'
                        : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white'
                    }`}
                    title={!canCreateMemory ? 'Abonnement requis pour générer' : `Générer toutes les sections vides (${emptySections.length})`}
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
                  disabled={currentSection?.isGenerating || !customPrompt.trim() || isBlocked || !canCreateMemory}
                  className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium transition-all disabled:opacity-50 shadow-sm ${
                    isBlocked || !canCreateMemory
                      ? 'bg-gray-400 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                  }`}
                  title={!canCreateMemory ? 'Abonnement requis pour générer' : ''}
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
                          const adminSectionPrompt = adminPrompts[currentSection.id];
                          setCustomPrompt(adminSectionPrompt || currentSection.defaultPrompt);
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

        {/* Modal de disclaimer pour export */}
        {showDisclaimerModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4">
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-2xl max-w-2xl w-full border-2 overflow-hidden`}>
              {/* Header */}
              <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Décharge de responsabilité
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Veuillez lire attentivement avant de télécharger
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
                <div className={`space-y-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20 border border-orange-800/30' : 'bg-orange-50 border border-orange-200'}`}>
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      Important
                    </p>
                    <p>
                      Le contenu généré par l'intelligence artificielle est fourni à titre informatif et comme base de travail.
                      Il nécessite une relecture attentive et des modifications de votre part.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <p className="font-semibold">Avant d'envoyer ce document, vous devez :</p>
                    <ul className="space-y-2 ml-4">
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}></span>
                        <span>Relire intégralement le contenu pour vérifier sa pertinence et son exactitude</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}></span>
                        <span>Vérifier que toutes les informations correspondent à votre contexte spécifique</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}></span>
                        <span>Adapter et personnaliser le contenu selon vos besoins</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}></span>
                        <span>Corriger toute erreur ou incohérence</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0 ${isDark ? 'bg-blue-400' : 'bg-blue-600'}`}></span>
                        <span>Faire valider le document par une personne compétente</span>
                      </li>
                    </ul>
                  </div>

                  <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                    <p className="text-xs leading-relaxed">
                      <strong>Limitation de responsabilité :</strong> MonMarchéPublic.fr et ses services ne peuvent être tenus responsables
                      de l'utilisation des documents générés. L'utilisateur est seul responsable du contenu final soumis aux autorités adjudicatrices.
                      L'IA peut produire des erreurs, des informations obsolètes ou inappropriées. Une validation humaine est indispensable.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'} flex justify-end gap-3`}>
                <button
                  onClick={handleCancelDisclaimer}
                  className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isDark
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  }`}
                >
                  Annuler
                </button>
                <button
                  onClick={handleAcceptDisclaimer}
                  className="px-5 py-2.5 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  J'accepte les conditions
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