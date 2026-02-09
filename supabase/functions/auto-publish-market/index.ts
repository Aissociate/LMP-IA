import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BLOTATO_API_URL = "https://backend.blotato.com/v2/posts";

const PLATFORM_CONFIG = {
  facebook: {
    accountId: "19719",
    pageId: "890439544151584",
    platform: "facebook" as const,
    targetType: "facebook" as const,
  },
  linkedin: {
    accountId: "12951",
    pageId: "104443151",
    platform: "linkedin" as const,
    targetType: "linkedin" as const,
  },
};

interface MarketData {
  id: string;
  reference?: string;
  title: string;
  client?: string;
  description?: string;
  deadline?: string;
  amount?: number;
  location?: string;
  publication_date?: string;
  procedure_type?: string;
  service_type?: string;
  cpv_code?: string;
  url?: string;
  department?: string;
  slug?: string;
  source?: string;
}

interface WebhookPayload {
  type: "INSERT";
  table: string;
  schema: string;
  record: MarketData;
}

function formatDeadline(deadline: string | undefined): string {
  if (!deadline) return "Non precise";
  const date = new Date(deadline);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatAmount(amount: number | undefined): string {
  if (!amount) return "";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildAIPrompt(market: MarketData): string {
  const parts = [
    `Titre: ${market.title}`,
    market.client ? `Donneur d'ordre: ${market.client}` : "",
    market.location ? `Localisation: ${market.location}` : "",
    market.department ? `Departement: ${market.department}` : "",
    market.reference ? `Reference: ${market.reference}` : "",
    market.service_type ? `Type: ${market.service_type}` : "",
    market.procedure_type ? `Procedure: ${market.procedure_type}` : "",
    market.amount ? `Montant: ${formatAmount(market.amount)}` : "",
    market.deadline ? `Date limite: ${formatDeadline(market.deadline)}` : "",
    market.description
      ? `Description: ${market.description.substring(0, 500)}`
      : "",
    market.url ? `Lien: ${market.url}` : "",
  ].filter(Boolean);

  return `Tu es un community manager expert en marches publics a La Reunion.
Genere un post professionnel et engageant pour les reseaux sociaux (Facebook et LinkedIn) a partir de ce marche public.

Donnees du marche:
${parts.join("\n")}

Regles OBLIGATOIRES:
- Utilise des emoticones pertinents (alerte, building, localisation, calendrier, lien, fleche, etc.)
- Commence par une accroche avec emoticone d'alerte
- Structure clairement: titre, donneur d'ordre, localisation, date limite, lien
- Termine par un CTA invitant a s'inscrire sur www.lemarchepublic.fr pour ne plus manquer aucun marche
- Ajoute des hashtags pertinents (#MarchePublic #LaReunion #AppelDOffres + hashtags specifiques au secteur)
- Maximum 280 mots
- Ton professionnel mais accessible
- Ne mets PAS de guillemets autour du texte genere
- Reponds UNIQUEMENT avec le texte du post, sans introduction ni explication`;
}

async function generateAIPost(
  market: MarketData,
  openRouterApiKey: string,
  supabaseUrl: string
): Promise<string> {
  const prompt = buildAIPrompt(market);

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openRouterApiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": supabaseUrl,
        "X-Title": "Le Marche Public - Auto Publish",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [
          {
            role: "system",
            content:
              "Tu es un community manager specialise dans les marches publics a La Reunion. Tu rediges des posts engageants pour Facebook et LinkedIn.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    throw new Error("No response from AI");
  }

  return data.choices[0].message.content.trim();
}

async function postToBlotato(
  apiKey: string,
  platform: "facebook" | "linkedin",
  text: string,
  marketUrl?: string
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const config = PLATFORM_CONFIG[platform];

  const target: Record<string, string> = {
    targetType: config.targetType,
    pageId: config.pageId,
  };

  if (platform === "facebook" && marketUrl) {
    target.link = marketUrl;
  }

  const payload = {
    post: {
      accountId: config.accountId,
      content: {
        text,
        mediaUrls: [],
        platform: config.platform,
      },
      target,
    },
  };

  const response = await fetch(BLOTATO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "blotato-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

async function sendErrorEmail(
  resendApiKey: string,
  emailFrom: string,
  marketTitle: string,
  errors: string[]
): Promise<void> {
  const errorList = errors.map((e) => `<li>${e}</li>`).join("");

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;background-color:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:20px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <tr><td style="background:#dc2626;padding:24px;text-align:center;">
          <h1 style="color:#fff;font-size:20px;margin:0;">Erreur Publication Automatique</h1>
        </td></tr>
        <tr><td style="padding:24px;">
          <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;margin-bottom:16px;border-radius:4px;">
            <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">La publication automatique a echoue pour :</p>
            <p style="margin:8px 0 0;font-size:16px;color:#111827;font-weight:700;">${marketTitle}</p>
          </div>
          <h3 style="color:#111827;font-size:14px;margin:16px 0 8px;">Erreurs rencontrees :</h3>
          <ul style="color:#dc2626;font-size:14px;line-height:1.8;">${errorList}</ul>
          <p style="color:#6b7280;font-size:12px;margin-top:16px;">Date : ${new Date().toLocaleString("fr-FR", { timeZone: "Indian/Reunion" })}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: ["contact@lemarchepublic.fr"],
      subject: `[ERREUR] Publication auto echouee - ${marketTitle.substring(0, 60)}`,
      html,
    }),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const blotatoApiKey = Deno.env.get("BLOTATO_API_KEY");
    const openRouterApiKey = Deno.env.get("OPENROUTER_API_KEY");
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const emailFrom =
      Deno.env.get("EMAIL_FROM") ||
      "Le Marche Public <onboarding@resend.dev>";

    if (!blotatoApiKey || !openRouterApiKey) {
      console.error(
        "[auto-publish] Missing required API keys (BLOTATO_API_KEY or OPENROUTER_API_KEY)"
      );
      return new Response(
        JSON.stringify({ error: "Missing required API keys" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();

    let market: MarketData;

    if (body.record) {
      market = body.record as MarketData;
    } else if (body.market) {
      market = body.market as MarketData;
    } else {
      market = body as MarketData;
    }

    if (!market.title) {
      return new Response(
        JSON.stringify({ error: "No market title found in payload" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `[auto-publish] Processing market: ${market.title} (${market.reference || "no ref"})`
    );

    let postText: string;
    try {
      postText = await generateAIPost(market, openRouterApiKey, supabaseUrl);
      console.log(
        `[auto-publish] AI generated post: ${postText.length} chars`
      );
    } catch (aiError) {
      console.error("[auto-publish] AI generation failed:", aiError);
      const fallbackParts = [
        "\u{1F6A8} NOUVEAU MARCHE PUBLIC \u{1F6A8}",
        "",
        `\u{1F4CB} ${market.title}`,
        market.client ? `\u{1F3E2} ${market.client}` : "",
        market.location ? `\u{1F4CD} ${market.location}` : "",
        market.deadline
          ? `\u{23F0} Date limite : ${formatDeadline(market.deadline)}`
          : "",
        market.amount
          ? `\u{1F4B0} Montant : ${formatAmount(market.amount)}`
          : "",
        market.url ? `\u{1F517} ${market.url}` : "",
        "",
        "\u{1F4A1} Ne manquez plus aucun marche public !",
        "\u{1F449} Inscrivez-vous sur www.lemarchepublic.fr",
        "",
        "#MarchePublic #AppelDOffres #LaReunion",
      ].filter(Boolean);
      postText = fallbackParts.join("\n");
    }

    const marketUrl =
      market.url ||
      (market.slug
        ? `https://www.lemarchepublic.fr/marches/${market.slug}`
        : undefined);

    const errors: string[] = [];
    const results: Record<string, unknown> = {};

    for (const platform of ["facebook", "linkedin"] as const) {
      try {
        const result = await postToBlotato(
          blotatoApiKey,
          platform,
          postText,
          marketUrl
        );
        results[platform] = result;

        if (!result.ok) {
          const errMsg = `${platform}: HTTP ${result.status} - ${JSON.stringify(result.data)}`;
          errors.push(errMsg);
          console.error(`[auto-publish] ${errMsg}`);
        } else {
          console.log(
            `[auto-publish] ${platform} published successfully`
          );
        }
      } catch (err) {
        const errMsg = `${platform}: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(errMsg);
        console.error(`[auto-publish] ${errMsg}`);
      }
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    await supabase.from("market_social_posts").insert({
      market_id: market.id,
      market_table: body.table || "unknown",
      market_title: market.title,
      post_text: postText,
      facebook_result: results.facebook || null,
      linkedin_result: results.linkedin || null,
      has_errors: errors.length > 0,
      error_details: errors.length > 0 ? errors : null,
    });

    if (errors.length > 0 && resendApiKey) {
      try {
        await sendErrorEmail(
          resendApiKey,
          emailFrom,
          market.title,
          errors
        );
        console.log("[auto-publish] Error notification email sent");
      } catch (emailErr) {
        console.error(
          "[auto-publish] Failed to send error email:",
          emailErr
        );
      }
    }

    const allSuccess = errors.length === 0;

    return new Response(
      JSON.stringify({
        success: allSuccess,
        market: { id: market.id, title: market.title },
        results,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: allSuccess ? 200 : 207,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[auto-publish] Fatal error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
