import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { to } = await req.json();

    if (!to) {
      return new Response(
        JSON.stringify({ error: "Missing 'to' email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured. Please add it to Edge Function secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailFrom = Deno.env.get("EMAIL_FROM") || "Le Marche Public <onboarding@resend.dev>";
    const today = new Date().toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background:linear-gradient(135deg,#3b82f6 0%,#1e40af 100%);padding:32px 24px;text-align:center;">
              <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0;">
                Le Marche Public
              </h1>
              <p style="color:#e0e7ff;font-size:14px;margin:8px 0 0 0;">
                Test de notification - ${today}
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 24px;">
              <div style="background:#dcfce7;border-left:4px solid #16a34a;padding:16px;margin-bottom:24px;border-radius:4px;">
                <p style="margin:0;font-size:16px;color:#166534;font-weight:600;">
                  Configuration email reussie !
                </p>
                <p style="margin:8px 0 0 0;font-size:14px;color:#166534;">
                  Votre systeme de notifications par email fonctionne correctement via Resend.
                </p>
              </div>

              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px;">
                <h3 style="color:#111827;font-size:16px;font-weight:600;margin:0 0 12px 0;">
                  Exemple de detection de marche
                </h3>
                <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;">
                  <h4 style="color:#111827;font-size:15px;font-weight:600;margin:0 0 8px 0;">
                    Travaux de renovation energetique - Batiment communal
                  </h4>
                  <div style="margin-bottom:8px;">
                    <span style="color:#6b7280;font-size:14px;margin-right:16px;">
                      <strong>Client:</strong> Commune de Saint-Denis
                    </span>
                    <span style="color:#6b7280;font-size:14px;">
                      <strong>Localisation:</strong> La Reunion (974)
                    </span>
                  </div>
                  <div style="margin-bottom:8px;">
                    <span style="color:#6b7280;font-size:14px;margin-right:16px;">
                      <strong>Montant:</strong> 150 000,00 EUR
                    </span>
                    <span style="color:#6b7280;font-size:14px;">
                      <strong>Date limite:</strong> 15/03/2026 (35j restants)
                    </span>
                  </div>
                  <p style="color:#4b5563;font-size:14px;line-height:1.5;margin-bottom:12px;">
                    Marche de travaux portant sur la renovation energetique du batiment communal incluant isolation thermique, remplacement des menuiseries et mise aux normes...
                  </p>
                  <a href="https://lemarchepublic.fr" style="display:inline-block;background:#3b82f6;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:500;">
                    Consulter le marche
                  </a>
                </div>
              </div>

              <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:16px;">
                <h3 style="color:#0c4a6e;font-size:16px;font-weight:600;margin:0 0 8px 0;">
                  Prochaines etapes
                </h3>
                <ul style="margin:0;padding-left:20px;color:#0c4a6e;font-size:14px;line-height:1.8;">
                  <li>Configurez vos alertes dans la section Veille</li>
                  <li>Les digests seront envoyes automatiquement 2x/jour</li>
                  <li>Personnalisez vos preferences dans les Parametres</li>
                </ul>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:24px;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                Ceci est un email de test envoye depuis Le Marche Public.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [to],
        subject: "Test - Le Marche Public - Notifications actives",
        html,
      }),
    });

    const resendResult = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ success: false, error: resendResult }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: `Test email sent to ${to}`, resend_id: resendResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
