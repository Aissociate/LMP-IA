import { supabase } from '../lib/supabase';

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
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

      if (!apiKey) {
        throw new Error('OpenRouter API key not configured');
      }

      const { data: modelSettings } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'ai_model')
        .single();

      const model = modelSettings?.setting_value || 'openai/gpt-4o-mini';

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Mémoire Technique AI'
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyse cette image et génère une description détaillée en français. La description doit inclure:
- Les éléments principaux visibles
- Les couleurs dominantes
- Le contexte ou l'environnement
- L'utilité ou le propos de l'image
- Tous les détails techniques pertinents

Sois précis et factuel. Cette description servira de contexte pour aider une IA à comprendre l'image lors de la rédaction de documents techniques.`
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const description = data.choices?.[0]?.message?.content || '';

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
