interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
  reasoning?: {
    effort?: 'low' | 'medium' | 'high';
    max_tokens?: number;
    enabled?: boolean;
    exclude?: boolean;
  };
}

interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class OpenRouterService {
  private aiGenerationUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-generation`;
  private documentAnalysisUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/document-analysis`;

  private async getAuthToken(): Promise<string> {
    const { supabase } = await import('./supabase');
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Non authentifié');
    }

    return session.access_token;
  }

  async generateContent(
    prompt: string,
    systemPrompt?: string,
    options?: {
      model?: string;
      temperature?: number;
      maxTokens?: number;
      topP?: number;
    }
  ): Promise<string> {
    try {
      console.log('[OpenRouter] Appel à l\'API de génération');
      console.log(`[OpenRouter] Prompt: ${prompt.length} caractères`);

      const token = await this.getAuthToken();

      const response = await fetch(this.aiGenerationUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          systemPrompt,
          model: options?.model,
          temperature: options?.temperature,
          maxTokens: options?.maxTokens,
          topP: options?.topP
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Erreur lors de la génération');
      }

      const data = await response.json();
      console.log(`[OpenRouter] Génération réussie: ${data.content.length} caractères`);

      return data.content;

    } catch (error) {
      console.error('Erreur lors de la génération IA:', error);

      let errorMessage = 'Erreur inconnue lors de la génération IA';

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      throw new Error(`Génération IA échouée: ${errorMessage}`);
    }
  }

  async analyzeDocument(documentContent: string, documentName: string): Promise<string> {
    try {
      console.log('[OpenRouter] Appel à l\'API d\'analyse de documents');
      console.log(`[OpenRouter] Document: ${documentName}`);
      console.log(`[OpenRouter] Contenu: ${documentContent.length} caractères`);

      const token = await this.getAuthToken();

      const response = await fetch(this.documentAnalysisUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentContent,
          documentName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Erreur lors de l\'analyse');
      }

      const data = await response.json();
      console.log(`[OpenRouter] Analyse réussie: ${data.analysis.length} caractères`);

      return data.analysis;

    } catch (error) {
      console.error('[OpenRouter] Erreur lors de l\'analyse du document:', error);
      throw error;
    }
  }

  async generateTechnicalMemorySection(
    sectionTitle: string,
    prompt: string,
    marketContext?: string,
    useMarketPro: boolean = false
  ): Promise<string> {
    const model = useMarketPro
      ? 'google/gemini-2.5-pro'
      : 'google/gemini-2.5-flash-lite-preview-09-2025';

    const systemPrompt = `Tu es un expert en rédaction de mémoires techniques pour les marchés publics.
    Tu dois rédiger du contenu professionnel, structuré et convaincant pour la section "${sectionTitle}".

    Le contenu doit être :
    - Professionnel et adapté au contexte des marchés publics
    - Structuré avec des titres et sous-titres
    - Convaincant et mettant en valeur l'expertise
    - Concret avec des exemples et références
    - Respectueux des codes et normes du secteur public`;

    const userPrompt = `${marketContext ? `Contexte du marché: ${marketContext}\n\n` : ''}${prompt}`;

    const memoryOptions = {
      model,
      maxTokens: 100000
    };

    return this.generateContent(userPrompt, systemPrompt, memoryOptions);
  }
}

export const openRouterService = new OpenRouterService();
