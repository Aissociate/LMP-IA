import { supabase } from '../lib/supabase';
import { openRouterService } from '../lib/openrouter';

export class ImageDescriptionService {
  private static instance: ImageDescriptionService;

  private constructor() {}

  static getInstance(): ImageDescriptionService {
    if (!ImageDescriptionService.instance) {
      ImageDescriptionService.instance = new ImageDescriptionService();
    }
    return ImageDescriptionService.instance;
  }

  async generateImageDescription(imageUrl: string, assetId: string): Promise<string> {
    try {
      const prompt = `Analyse cette image accessible à l'URL suivante: ${imageUrl}

Génère une description détaillée en français. La description doit inclure:
- Les éléments principaux visibles
- Les couleurs dominantes
- Le contexte ou l'environnement
- L'utilité ou le propos de l'image
- Tous les détails techniques pertinents

Sois précis et factuel. Cette description servira de contexte pour aider une IA à comprendre l'image lors de la rédaction de documents techniques.`;

      const systemPrompt = `Tu es un expert en analyse d'images pour la rédaction de documents techniques. Tu décris les images de manière précise et factuelle en français.`;

      const description = await openRouterService.generateContent(
        prompt,
        systemPrompt,
        {
          temperature: 0.3,
          maxTokens: 500
        }
      );

      if (description) {
        await supabase
          .from('report_assets')
          .update({ ai_description: description })
          .eq('id', assetId);
      }

      return description;
    } catch (error) {
      console.error('Error generating image description:', error);
      throw error;
    }
  }
}
