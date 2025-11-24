import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface AnalysisRequest {
  documentContent: string;
  documentName: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: AnalysisRequest = await req.json();

    if (!body.documentContent || typeof body.documentContent !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Document content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!body.documentName || typeof body.documentName !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Document name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Document-Analysis] Starting analysis');
    console.log(`[Document-Analysis] Document: ${body.documentName}`);
    console.log(`[Document-Analysis] Content length: ${body.documentContent.length} chars`);

    const { data: prompts } = await supabase
      .from('admin_prompts')
      .select('prompt_content')
      .eq('prompt_type', 'document_analysis')
      .eq('is_active', true)
      .limit(1);

    let systemPrompt = '';
    if (prompts && prompts.length > 0) {
      systemPrompt = prompts[0].prompt_content;
    } else {
      systemPrompt = `Tu es un expert en analyse de documents de marchés publics.
Analyse le document fourni et extrais les informations clés suivantes :
- Budget estimé ou montant
- Délais d'exécution
- Critères techniques importants
- Pénalités ou clauses particulières
- Recommandations pour la réponse

Présente l'analyse de manière structurée et professionnelle.`;
    }

    const aiGenerationUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-generation`;

    // Limiter la taille du contenu si nécessaire (max ~100k caractères)
    const maxContentLength = 100000;
    const truncatedContent = body.documentContent.length > maxContentLength
      ? body.documentContent.substring(0, maxContentLength) + '\n\n[...contenu tronqué...]'
      : body.documentContent;

    console.log(`[Document-Analysis] Content length after truncation: ${truncatedContent.length} chars`);

    const analysisResponse = await fetch(aiGenerationUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: truncatedContent,
        systemPrompt,
        model: 'google/gemini-2.5-flash-lite-preview-09-2025',
        maxTokens: 32000
      })
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('[Document-Analysis] AI generation error:', errorText);
      console.error('[Document-Analysis] Status:', analysisResponse.status);

      let errorDetails = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.details || errorJson.error || errorText;
      } catch (e) {
        // errorText n'est pas du JSON
      }

      throw new Error(`AI generation failed (${analysisResponse.status}): ${errorDetails}`);
    }

    const result = await analysisResponse.json();

    console.log('[Document-Analysis] Analysis completed');
    console.log(`[Document-Analysis] Result length: ${result.content.length} chars`);

    return new Response(
      JSON.stringify({
        analysis: result.content,
        usage: result.usage
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[Document-Analysis] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Document analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});