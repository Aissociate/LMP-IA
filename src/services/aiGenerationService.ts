import { openRouterService } from '../lib/openrouter';
import { LogService } from './logService';
import { ContextService } from './contextService';

interface GenerationParams {
  sectionId: string;
  sectionTitle: string;
  prompt: string;
  globalPrompt?: string;
  marketContext: any;
  knowledgeContext: any[];
  imageAssets?: any[];
  useMarketContext: boolean;
  useKnowledgeContext: boolean;
  marketTitle: string;
  useMarketPro?: boolean;
}

export class AIGenerationService {
  private static instance: AIGenerationService;
  private logService: LogService;
  private contextService: ContextService;

  constructor() {
    this.logService = LogService.getInstance();
    this.contextService = ContextService.getInstance();
  }

  static getInstance(): AIGenerationService {
    if (!AIGenerationService.instance) {
      AIGenerationService.instance = new AIGenerationService();
    }
    return AIGenerationService.instance;
  }

  async generateSectionContent(params: GenerationParams): Promise<string> {
    const {
      sectionId,
      sectionTitle,
      prompt,
      globalPrompt,
      marketContext,
      knowledgeContext,
      imageAssets = [],
      useMarketContext,
      useKnowledgeContext,
      marketTitle,
      useMarketPro = false
    } = params;

    this.logService.addLog(`🚀 Génération de la section: ${sectionTitle}`);
    this.logService.addLog(`🤖 Modèle IA: Modèle sélectionné par l'admin`);
    this.logService.addLog(`📊 Configuration: Utilisation du modèle configuré dans les paramètres`);
    this.logService.addLog(`🎛️ Contextes utilisés:`);
    this.logService.addLog(`   📋 Marché: ${useMarketContext && marketContext ? '✅ OUI' : '❌ NON'}`);
    this.logService.addLog(`   🧠 Base connaissance: ${useKnowledgeContext && knowledgeContext.length > 0 ? `✅ OUI (${knowledgeContext.length} docs)` : '❌ NON'}`);
    this.logService.addLog(`   🖼️ Images disponibles: ${imageAssets.length > 0 ? `✅ OUI (${imageAssets.length} images)` : '❌ NON'}`);

    try {
      // Combiner le prompt global avec le prompt spécifique de la section
      const finalPrompt = this.buildFinalPrompt(globalPrompt, prompt, sectionTitle);
      this.logService.addLog(`📝 Prompt final: ${finalPrompt.length} caractères`);
      if (globalPrompt) {
        this.logService.addLog(`🌐 Prompt global appliqué: ${globalPrompt.length} caractères`);
      }

      const contextualPrompt = this.contextService.buildContextualPrompt(
        finalPrompt,
        sectionTitle,
        marketContext,
        knowledgeContext,
        useMarketContext,
        useKnowledgeContext,
        imageAssets
      );

      this.logService.addLog('🤖 Envoi vers l\'IA...');
      const generatedContent = await openRouterService.generateTechnicalMemorySection(
        sectionTitle,
        contextualPrompt,
        marketContext ? `Marché: ${marketContext.title}` : `Marché: ${marketTitle}`,
        useMarketPro
      );

      this.logService.addLog(`✅ Contenu généré: ${generatedContent.length} caractères`);
      this.logService.addLog(`🎉 Section "${sectionTitle}" terminée avec succès!`);
      
      return generatedContent;
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.logService.addLog(`❌ Erreur génération: ${errorMessage}`);
      
      return `# Erreur de génération

Une erreur s'est produite lors de la génération du contenu : ${errorMessage}

Veuillez vérifier votre configuration IA ou réessayer plus tard.`;
    }
  }

  private buildFinalPrompt(globalPrompt?: string, sectionPrompt?: string, sectionTitle?: string): string {
    let finalPrompt = '';
    
    if (globalPrompt && globalPrompt.trim()) {
      finalPrompt += `# Instructions générales pour le mémoire technique\n\n${globalPrompt.trim()}\n\n`;
      finalPrompt += `---\n\n`;
    }
    
    if (sectionTitle) {
      finalPrompt += `# Section: ${sectionTitle}\n\n`;
    }
    
    if (sectionPrompt && sectionPrompt.trim()) {
      finalPrompt += `## Instructions spécifiques pour cette section\n\n${sectionPrompt.trim()}`;
    }
    
    return finalPrompt;
  }
  async generateAllSections(
    sections: any[],
    params: Omit<GenerationParams, 'sectionId' | 'sectionTitle' | 'prompt'> & { globalPrompt?: string; useMarketPro?: boolean },
    onSectionUpdate: (sectionId: string, updates: any) => Promise<void>
  ): Promise<void> {
    const sectionsToGenerate = sections.filter(section => !section.content);
    if (sectionsToGenerate.length === 0) return;

    this.logService.addLog(`🔥 Génération EN PARALLÈLE de ${sectionsToGenerate.length} sections avec le modèle admin${params.globalPrompt ? ' et prompt global' : ''}`);

    // Générer toutes les sections EN PARALLÈLE
    const generationPromises = sectionsToGenerate.map(async (section, index) => {
      this.logService.addLog(`📋 Démarrage ${index + 1}/${sectionsToGenerate.length}: ${section.title}`);

      try {
        const generatedContent = await this.generateSectionContent({
          ...params,
          sectionId: section.id,
          sectionTitle: section.title,
          prompt: section.defaultPrompt,
          globalPrompt: params.globalPrompt,
          useMarketPro: params.useMarketPro || false
        });

        this.logService.addLog(`✅ ${section.title} terminé (${generatedContent.length} caractères)`);
        await onSectionUpdate(section.id, { content: generatedContent, isGenerating: false });

        return { success: true, sectionTitle: section.title };
      } catch (error) {
        this.logService.addLog(`❌ Erreur ${section.title}: ${(error as Error).message}`);

        const errorContent = `# ${section.title}

## Erreur de génération

Une erreur s'est produite lors de la génération automatique de cette section.

Veuillez vérifier votre configuration IA ou générer cette section individuellement.`;

        await onSectionUpdate(section.id, { content: errorContent, isGenerating: false });

        return { success: false, sectionTitle: section.title, error: (error as Error).message };
      }
    });

    // Attendre que toutes les sections soient générées
    const results = await Promise.all(generationPromises);

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    this.logService.addLog(`🎊 Génération parallèle terminée! ✅ ${successCount} succès, ❌ ${errorCount} erreurs`);
  }
}