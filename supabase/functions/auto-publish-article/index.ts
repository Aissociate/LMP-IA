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

async function postToBlotato(
  apiKey: string,
  platform: "facebook" | "linkedin",
  text: string
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const config = PLATFORM_CONFIG[platform];

  const payload = {
    post: {
      accountId: config.accountId,
      content: {
        text,
        mediaUrls: [],
        platform: config.platform,
      },
      target: {
        targetType: config.targetType,
        pageId: config.pageId,
      },
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
  postKey: string,
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
          <h1 style="color:#fff;font-size:20px;margin:0;">Erreur Publication Article</h1>
        </td></tr>
        <tr><td style="padding:24px;">
          <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;margin-bottom:16px;border-radius:4px;">
            <p style="margin:0;font-size:14px;color:#991b1b;font-weight:600;">La publication a echoue pour :</p>
            <p style="margin:8px 0 0;font-size:16px;color:#111827;font-weight:700;">${postKey}</p>
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
      subject: `[ERREUR] Publication article echouee - ${postKey}`,
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
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const emailFrom =
      Deno.env.get("EMAIL_FROM") ||
      "Le Marche Public <onboarding@resend.dev>";

    if (!blotatoApiKey) {
      console.error("[auto-publish-article] Missing BLOTATO_API_KEY");
      return new Response(
        JSON.stringify({ error: "Missing BLOTATO_API_KEY" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();

    const settingKey: string = body.setting_key || body.record?.setting_key || "";
    const postText: string = body.setting_value || body.record?.setting_value || "";

    if (!settingKey || !postText) {
      return new Response(
        JSON.stringify({ error: "Missing setting_key or setting_value" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `[auto-publish-article] Publishing article: ${settingKey} (${postText.length} chars)`
    );

    const errors: string[] = [];
    const results: Record<string, unknown> = {};

    for (const platform of ["facebook", "linkedin"] as const) {
      try {
        const result = await postToBlotato(blotatoApiKey, platform, postText);
        results[platform] = result;

        if (!result.ok) {
          const errMsg = `${platform}: HTTP ${result.status} - ${JSON.stringify(result.data)}`;
          errors.push(errMsg);
          console.error(`[auto-publish-article] ${errMsg}`);
        } else {
          console.log(`[auto-publish-article] ${platform} published successfully`);
        }
      } catch (err) {
        const errMsg = `${platform}: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(errMsg);
        console.error(`[auto-publish-article] ${errMsg}`);
      }
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    await supabase.from("market_social_posts").insert({
      market_id: null,
      market_table: "admin_settings",
      market_title: settingKey,
      post_text: postText,
      facebook_result: results.facebook || null,
      linkedin_result: results.linkedin || null,
      has_errors: errors.length > 0,
      error_details: errors.length > 0 ? errors : null,
    });

    if (errors.length > 0 && resendApiKey) {
      try {
        await sendErrorEmail(resendApiKey, emailFrom, settingKey, errors);
        console.log("[auto-publish-article] Error notification email sent");
      } catch (emailErr) {
        console.error("[auto-publish-article] Failed to send error email:", emailErr);
      }
    }

    const allSuccess = errors.length === 0;

    return new Response(
      JSON.stringify({
        success: allSuccess,
        settingKey,
        results,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: allSuccess ? 200 : 207,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("[auto-publish-article] Fatal error:", error);
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
