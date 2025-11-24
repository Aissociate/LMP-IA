import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UpsellRequest {
  userEmail: string;
  userName?: string;
  requestedPlan: string;
  currentPlan: string;
  message?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const contentType = req.headers.get("content-type");
    console.log("Content-Type:", contentType);

    if (!contentType || !contentType.includes("application/json")) {
      console.error("Invalid content type:", contentType);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Content-Type must be application/json"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const body = await req.text();
    console.log("Request body:", body);

    let data: UpsellRequest;
    try {
      data = JSON.parse(body);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Invalid JSON in request body"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const { userEmail, userName, requestedPlan, currentPlan, message } = data;

    if (!userEmail || !requestedPlan || !currentPlan) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: userEmail, requestedPlan, currentPlan"
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const SMTP_PASSWORD = Deno.env.get('SMTP_PASSWORD');

    if (!SMTP_PASSWORD) {
      console.error('SMTP_PASSWORD not configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email service not configured'
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log("Preparing email for:", userEmail);

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .info-box { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ea580c; }
    .label { font-weight: bold; color: #ea580c; margin-bottom: 5px; }
    .value { color: #374151; margin-bottom: 15px; }
    .message-box { background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #f59e0b; }
    .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Nouvelle demande d'abonnement</h1>
    </div>
    <div class="content">
      <div class="info-box">
        <div class="label">Utilisateur</div>
        <div class="value">${userName || 'N/A'} (${userEmail})</div>

        <div class="label">Plan actuel</div>
        <div class="value">${currentPlan}</div>

        <div class="label">Plan demande</div>
        <div class="value">${requestedPlan}</div>
      </div>

      ${message ? `
      <div class="message-box">
        <div class="label">Message de l'utilisateur</div>
        <div class="value">${message.replace(/\n/g, '<br>')}</div>
      </div>
      ` : ''}

      <div class="footer">
        Email envoye automatiquement depuis Le Marche Public<br>
        ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
      </div>
    </div>
  </div>
</body>
</html>
    `.trim();

    const emailText = `
Nouvelle demande d'abonnement

Utilisateur: ${userName || 'N/A'} (${userEmail})
Plan actuel: ${currentPlan}
Plan demande: ${requestedPlan}

${message ? `Message de l'utilisateur:\n${message}` : ''}

---
Email envoye automatiquement depuis Le Marche Public
${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
    `.trim();

    console.log("Connecting to SMTP server...");

    const client = new SMTPClient({
      connection: {
        hostname: "mail.gandi.net",
        port: 587,
        tls: true,
        auth: {
          username: "contact@lemarchepublic.fr",
          password: SMTP_PASSWORD,
        },
      },
    });

    console.log("Sending email...");

    await client.send({
      from: "Le Marche Public <contact@lemarchepublic.fr>",
      to: "contact@lemarchepublic.fr",
      subject: `Nouvelle demande d'abonnement - ${requestedPlan}`,
      content: emailText,
      html: emailHtml,
    });

    await client.close();

    console.log('Email sent successfully via Gandi SMTP');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demande envoyee avec succes. Nous vous contacterons rapidement.'
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing upsell request:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});