interface MarketContext {
  id: string;
  title: string;
  reference: string;
  client: string;
  budget: number;
  deadline: string;
  status: string;
  description?: string;
  documents?: MarketDocument[];
}

interface MarketDocument {
  id: string;
  name: string;
  file_size: number;
  file_type?: string;
  analysis_status: string;
  extracted_content?: string;
  analysis_result?: string;
  created_at: string;
}

interface KnowledgeContext {
  id: string;
  name: string;
  file_size: number;
  content?: string;
  extraction_error?: string;
}

export class ContextService {
  private static instance: ContextService;

  static getInstance(): ContextService {
    if (!ContextService.instance) {
      ContextService.instance = new ContextService();
    }
    return ContextService.instance;
  }

  async loadMarketContext(marketId: string, supabase: any): Promise<MarketContext | null> {
    try {
      const { data: market, error } = await supabase
        .from('markets')
        .select('*, global_memory_prompt')
        .eq('id', marketId)
        .single();

      if (error) {
        throw new Error(`Erreur chargement marché: ${error.message}`);
      }

      // Log du prompt global si présent
      if (market.global_memory_prompt) {
        console.log(`[ContextService] 🌐 Prompt global détecté: ${market.global_memory_prompt.length} caractères`);
      }
      // Charger également les documents du marché avec leur contenu et analyses
      const { data: documents, error: documentsError } = await supabase
        .from('market_documents')
        .select('id, name, file_size, file_type, analysis_status, extracted_content, analysis_result, created_at')
        .eq('market_id', marketId)
        .order('created_at', { ascending: false });

      if (documentsError) {
        console.warn('Erreur lors du chargement des documents:', documentsError);
      }

      return {
        ...market,
        documents: documents || []
      };
    } catch (error) {
      console.error('Erreur lors du chargement du contexte marché:', error);
      return null;
    }
  }

  async loadImageAssets(userId: string, supabase: any): Promise<any[]> {
    try {
      const { data: assets, error } = await supabase
        .from('report_assets')
        .select('id, name, ai_description, file_url')
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Erreur chargement images: ${error.message}`);
      }

      if (!assets || assets.length === 0) {
        return [];
      }

      console.log(`[ContextService] 🖼️ ${assets.length} images chargées pour contexte`);
      assets.forEach(asset => {
        console.log(`[ContextService]   📷 ${asset.name}: ${asset.ai_description ? 'avec description IA' : 'sans description'}`);
      });

      return assets;
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
      return [];
    }
  }

  async loadKnowledgeContext(userId: string, supabase: any): Promise<KnowledgeContext[]> {
    try {
      const { data: knowledge, error } = await supabase
        .from('knowledge_files')
        .select('id, name, file_size, extracted_content, extraction_status, extraction_error')
        .eq('user_id', userId)
        .eq('extraction_status', 'completed'); // Seulement les fichiers avec contenu extrait

      if (error) {
        throw new Error(`Erreur chargement base de connaissance: ${error.message}`);
      }

      if (!knowledge || knowledge.length === 0) {
        return [];
      }

      // Utiliser directement le contenu extrait stocké en base
      const knowledgeWithContent = knowledge.map(doc => ({
        id: doc.id,
        name: doc.name,
        file_size: doc.file_size,
        content: doc.extracted_content || '', // Contenu déjà extrait
        extraction_error: doc.extraction_error
      }));

      console.log(`[ContextService] ✅ ${knowledgeWithContent.length} documents chargés depuis la base`);
      knowledgeWithContent.forEach(doc => {
        console.log(`[ContextService]   📄 ${doc.name}: ${Math.round((doc.content?.length || 0) / 1000)}k caractères`);
      });

      return knowledgeWithContent;
    } catch (error) {
      console.error('Erreur lors du chargement de la base de connaissance:', error);
      return [];
    }
  }

  buildContextualPrompt(
    basePrompt: string,
    sectionTitle: string,
    marketContext: MarketContext | null,
    knowledgeContext: KnowledgeContext[],
    useMarketContext: boolean,
    useKnowledgeContext: boolean,
    imageAssets: any[] = []
  ): string {
    let contextualPrompt = `# ${sectionTitle}\n\n`;
    
    if (useMarketContext && marketContext) {
      const marketInfo = `
CONTEXTE DU MARCHÉ :
- Titre : ${marketContext.title}
- Référence : ${marketContext.reference}
- Client : ${marketContext.client}
- Budget : ${marketContext.budget ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(marketContext.budget) : 'Non spécifié'}
- Échéance : ${new Date(marketContext.deadline).toLocaleDateString('fr-FR')}
- Statut : ${marketContext.status}
${marketContext.description ? `- Description : ${marketContext.description}` : ''}

${marketContext.documents && marketContext.documents.length > 0 ? `
DOCUMENTS DU MARCHÉ ANALYSÉS :
${marketContext.documents.map(doc => {
  let docInfo = `- ${doc.name} (${Math.round(doc.file_size / 1024)} KB)`;
  if (doc.analysis_result) {
    docInfo += `\n  Analyse IA : ${doc.analysis_result}`;
  }
  if (doc.extracted_content) {
    docInfo += `\n  Extrait : ${doc.extracted_content}`;
  }
  return docInfo;
}).join('\n\n')}
` : ''}

`;
      contextualPrompt = marketInfo + contextualPrompt;
    }
    
    if (useKnowledgeContext && knowledgeContext.length > 0) {
      // Filtrer uniquement les documents avec du contenu extrait avec succès
      const validKnowledgeContext = knowledgeContext.filter(doc => 
        doc.content && doc.content.trim().length > 50 // Minimum 50 caractères pour être utile
      );
      
      if (validKnowledgeContext.length === 0) {
        // Pas de documents valides, ne pas inclure de section knowledge
        contextualPrompt += basePrompt;
        return contextualPrompt;
      }
      
      const knowledgeInfo = `
BASE DE CONNAISSANCE ENTREPRISE :
${validKnowledgeContext.map(doc => {
  return `## Document: ${doc.name} (${Math.round(doc.file_size / 1024)} KB)\n**Contenu:**\n${doc.content}\n\n`;
}).join('\n')}

**INSTRUCTIONS:** Utilisez le contenu de ces documents pour personnaliser le mémoire technique avec notre expertise, nos méthodes spécifiques, nos références projets et notre savoir-faire. Adaptez le vocabulaire et les approches selon notre style d'entreprise.

`;
      contextualPrompt = knowledgeInfo + contextualPrompt;
    }

    if (imageAssets.length > 0) {
      const validAssets = imageAssets.filter(asset => asset.ai_description);

      if (validAssets.length > 0) {
        const imageInfo = `
BIBLIOTHÈQUE D'IMAGES DISPONIBLES :
${validAssets.map(asset => {
  return `## Image: ${asset.name}
**Description:** ${asset.ai_description}
**Code d'insertion:** ![${asset.name}](asset:${asset.id})
`;
}).join('\n')}

**INSTRUCTIONS POUR LES IMAGES:**
- Si une image de cette bibliothèque illustre parfaitement le sujet de cette section, INSÉREZ son code d'insertion dans le contenu généré.
- Placez l'image à l'endroit le plus pertinent du texte (par exemple après un paragraphe qu'elle illustre).
- N'insérez des images QUE si elles sont vraiment pertinentes pour cette section spécifique.
- Utilisez UNIQUEMENT les codes d'insertion fournis ci-dessus (format: ![nom](asset:id)).

`;
        contextualPrompt = imageInfo + contextualPrompt;
      }
    }

    contextualPrompt += basePrompt;
    return contextualPrompt;
  }
}