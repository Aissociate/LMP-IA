import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GenerationRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

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
    enabled?: boolean;
    exclude?: boolean;
  };
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

    const token = authHeader.replace('Bearer ', '');

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const isServiceRoleCall = token === serviceRoleKey;

    if (!isServiceRoleCall) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        serviceRoleKey
      );

      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        console.error('[AI-Generation] Auth error:', authError);
        return new Response(
          JSON.stringify({ error: 'Invalid authorization', details: authError?.message }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      serviceRoleKey
    );

    const body: GenerationRequest = await req.json();

    if (!body.prompt || typeof body.prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: settings } = await supabase
      .from('admin_settings')
      .select('setting_key, setting_value')
      .in('setting_key', [
        'selected_ai_model',
        'temperature',
        'max_tokens',
        'top_p',
        'reasoning_effort',
        'reasoning_enabled',
        'reasoning_exclude'
      ]);

    const settingsMap = settings?.reduce((acc, setting) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {} as Record<string, any>) || {};

    const reasoningEnabled = settingsMap.reasoning_enabled !== undefined ? settingsMap.reasoning_enabled : true;
    let reasoning = undefined;

    if (reasoningEnabled) {
      reasoning = {
        effort: settingsMap.reasoning_effort || 'medium',
        enabled: true,
        exclude: settingsMap.reasoning_exclude !== undefined ? settingsMap.reasoning_exclude : false
      };
    }

    const messages: OpenRouterMessage[] = [];

    if (body.systemPrompt) {
      messages.push({
        role: 'system',
        content: body.systemPrompt
      });
    }

    messages.push({
      role: 'user',
      content: body.prompt
    });

    // Utiliser le modèle sélectionné par l'admin ou celui passé en paramètre
    const selectedModel = body.model ?? settingsMap.selected_ai_model ?? 'openai/gpt-3.5-turbo';

    // Model-specific max token limits on OpenRouter
    const modelMaxTokens: Record<string, number> = {
      'google/gemini-2.5-pro-exp-03-25': 180000,
      'google/gemini-2.5-pro': 180000,
      'google/gemini-2.5-flash-lite-preview-09-2025': 180000,
      'google/gemini-2.0-flash-001': 180000,
      'google/gemini-2.0-flash-thinking-exp-01-21': 180000,
      'anthropic/claude-3.5-sonnet': 8000,
      'anthropic/claude-3-opus': 4096,
      'openai/gpt-4': 8192,
      'openai/gpt-4-turbo': 4096,
      'openai/o1': 100000,
      'openai/o1-mini': 65536,
    };

    // Get the max tokens from settings or body
    let requestedMaxTokens = body.maxTokens ?? settingsMap.max_tokens ?? 100000;

    // Apply model-specific limit if it exists
    const modelLimit = modelMaxTokens[selectedModel];
    if (modelLimit && requestedMaxTokens > modelLimit) {
      console.log(`[AI-Generation] Limiting max_tokens from ${requestedMaxTokens} to ${modelLimit} for model ${selectedModel}`);
      requestedMaxTokens = modelLimit;
    }

    const requestData: OpenRouterRequest = {
      model: selectedModel,
      messages,
      temperature: body.temperature ?? settingsMap.temperature ?? 0.7,
      max_tokens: requestedMaxTokens,
      top_p: body.topP ?? settingsMap.top_p ?? 1.0,
      stream: false,
      reasoning
    };

    let apiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!apiKey) {
      const { data: secretRow } = await supabase
        .from('admin_secrets')
        .select('secret_value')
        .eq('secret_key', 'openrouter_api_key')
        .maybeSingle();
      apiKey = secretRow?.secret_value || '';
    }
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured. Set it in Admin > AI Configuration.');
    }

    console.log('[AI-Generation] Making request to OpenRouter');
    console.log(`[AI-Generation] Model: ${selectedModel}`);
    console.log(`[AI-Generation] Prompt length: ${body.prompt.length} chars`);

    let response;
    let lastError;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[AI-Generation] Attempt ${attempt}/${maxRetries}`);

        response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': Deno.env.get('SUPABASE_URL') ?? '',
            'X-Title': 'Mon marché Public.fr AI Generation'
          },
          body: JSON.stringify(requestData)
        });

        if (response.ok) {
          break;
        }

        const errorText = await response.text();
        lastError = errorText;

        console.error(`[AI-Generation] Attempt ${attempt} failed: ${response.status} - ${errorText}`);

        if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`[AI-Generation] Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);

      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        lastError = error;
        const waitTime = Math.pow(2, attempt) * 1000;
        console.log(`[AI-Generation] Network error, waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    if (!response || !response.ok) {
      throw new Error(`OpenRouter API error after ${maxRetries} attempts: ${lastError}`);
    }

    const data = await response.json();

    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response from AI');
    }

    const content = data.choices[0].message.content;

    console.log('[AI-Generation] Success');
    console.log(`[AI-Generation] Generated: ${content.length} chars`);
    console.log(`[AI-Generation] Tokens used: ${data.usage?.total_tokens || 0}`);

    return new Response(
      JSON.stringify({
        content,
        usage: data.usage
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[AI-Generation] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'AI generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});