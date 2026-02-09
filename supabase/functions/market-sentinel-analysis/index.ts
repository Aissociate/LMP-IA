import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Market {
  id: string;
  reference: string;
  title: string;
  client: string;
  description: string;
  deadline: string;
  amount?: number;
  location: string;
  publicationDate: string;
  procedureType: string;
  serviceType: string;
  url: string;
}

interface AnalysisRequest {
  market: Market;
  alert_id?: string;
  user_context?: {
    company_name?: string;
    activity_sectors?: string[];
    expertise_areas?: string[];
    geographical_zones?: string[];
    knowledge_base?: {
      total_files: number;
      categories: string[];
      documents_content: string;
    };
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { market, alert_id, user_context }: AnalysisRequest = await req.json();

    const contextInfo = user_context ? `
Contexte utilisateur:
- Entreprise: ${user_context.company_name || 'Non spécifié'}
- Secteurs d'activité: ${user_context.activity_sectors?.join(', ') || 'Non spécifié'}
- Domaines d'expertise: ${user_context.expertise_areas?.join(', ') || 'Non spécifié'}
- Zones géographiques: ${user_context.geographical_zones?.join(', ') || 'Non spécifié'}
` : '';

    const knowledgeBaseContent = user_context?.knowledge_base?.documents_content || '';

    const prompt = `Tu es un expert en analyse de marchés publics. Analyse le marché suivant et fournis un score de pertinence détaillé.

${contextInfo}

Marché à analyser:
- Titre: ${market.title}
- Client: ${market.client}
- Description: ${market.description}
- Localisation: ${market.location}
- Montant: ${market.amount ? market.amount.toLocaleString() + ' €' : 'Non spécifié'}
- Date limite: ${market.deadline}
- Type de procédure: ${market.procedureType}
- Type de service: ${market.serviceType}

${knowledgeBaseContent ? `
=== BASE DE CONNAISSANCE DE L'UTILISATEUR ===

Utilise les documents suivants pour évaluer la capacité de l'entreprise à répondre au marché:

${knowledgeBaseContent}

=== FIN DE LA BASE DE CONNAISSANCE ===
` : ''}

Fournis ton analyse au format JSON suivant:
{
  "relevance_score": <score de 0 à 100>,
  "score_category": "<go|conditional|no_go>",
  "ai_recommendation": "<respond|ignore|request_expert|order_memory>",
  "ai_reasoning": "<explication concise de ta recommandation en 2-3 phrases>",
  "key_strengths": ["<point fort 1>", "<point fort 2>", "<point fort 3>"],
  "key_risks": ["<risque 1>", "<risque 2>"]
}

Critères de scoring:
- 80-100 (GO): Marché hautement pertinent, bon match avec le profil, opportunité forte
- 60-79 (CONDITIONAL): Marché intéressant mais avec des réserves ou conditions à vérifier
- 0-59 (NO-GO): Marché peu pertinent, faible match avec le profil

Recommandations:
- respond: Fort potentiel, à traiter en priorité
- request_expert: Besoin d'une analyse experte avant de décider
- order_memory: Marché complexe nécessitant un mémoire technique détaillé
- ignore: Marché non pertinent

Réponds UNIQUEMENT avec le JSON, sans texte additionnel.`;

    console.log("[market-sentinel] Calling ai-generation edge function...");

    const aiGenerationUrl = `${supabaseUrl}/functions/v1/ai-generation`;
    const aiResponse = await fetch(aiGenerationUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseServiceKey}`,
        "Content-Type": "application/json",
        "apikey": supabaseServiceKey,
      },
      body: JSON.stringify({
        prompt,
        temperature: 0.3,
        maxTokens: 2000
      })
    });

    if (!aiResponse.ok) {
      const errorBody = await aiResponse.text();
      console.error("[market-sentinel] ai-generation error:", errorBody);
      throw new Error(`AI generation failed: ${aiResponse.status} - ${errorBody}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.content;

    console.log("[market-sentinel] AI response received:", aiContent.length, "chars");

    const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response");
    }

    const analysis = JSON.parse(jsonMatch[0]);

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: insertedData, error: insertError } = await adminClient
      .from('market_relevance_scores')
      .insert({
        user_id: user.id,
        market_id: market.id,
        alert_id: alert_id || null,
        market_title: market.title,
        market_reference: market.reference,
        market_description: market.description,
        market_amount: market.amount || null,
        market_location: market.location,
        market_deadline: market.deadline,
        market_url: market.url,
        relevance_score: analysis.relevance_score,
        score_category: analysis.score_category,
        ai_recommendation: analysis.ai_recommendation,
        ai_reasoning: analysis.ai_reasoning,
        key_strengths: analysis.key_strengths || [],
        key_risks: analysis.key_risks || [],
        is_read: false,
        is_archived: false
      })
      .select()
      .maybeSingle();

    if (insertError) {
      throw new Error(`Failed to insert score: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: insertedData
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (error) {
    console.error("Error in market-sentinel-analysis:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
