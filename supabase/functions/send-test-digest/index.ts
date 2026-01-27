import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function generateTestDigestEmailHTML(
  recipientEmail: string,
  baseUrl: string
): string {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email de test - LeMarchéPublic.fr</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">
                Email de test
              </h1>
              <p style="color: #e0e7ff; font-size: 14px; margin: 8px 0 0 0;">
                LeMarchéPublic.fr - ${today}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 24px;">
              <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; color: #166534; font-weight: 600;">
                  ✓ Votre email de test a été envoyé avec succès !
                </p>
              </div>

              <h2 style="color: #1e40af; font-size: 18px; font-weight: 600; margin-bottom: 16px; border-left: 4px solid #3b82f6; padding-left: 16px;">
                Configuration des notifications
              </h2>

              <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-bottom: 16px;">
                Vous recevez cet email car vous avez activé les notifications pour vos alertes marchés publics.
                Voici comment fonctionnent les notifications :
              </p>

              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
                  Horaires des digests
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                  <li><strong>Digest du matin :</strong> Envoyé à 8h00 (heure de La Réunion)</li>
                  <li><strong>Digest du soir :</strong> Envoyé à 18h00 (heure de La Réunion)</li>
                </ul>
              </div>

              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
                  Format des emails
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                  <li>Vous recevez <strong>un seul email consolidé</strong> par période</li>
                  <li>L'email regroupe tous les marchés détectés par vos alertes</li>
                  <li>Chaque marché est organisé par alerte pour faciliter la lecture</li>
                  <li><strong>Aucun email n'est envoyé</strong> s'il n'y a pas de nouveau marché</li>
                </ul>
              </div>

              <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px;">
                <p style="margin: 0; font-size: 14px; color: #1e40af;">
                  <strong>💡 Astuce :</strong> Vous pouvez ajuster vos préférences de notification à tout moment depuis vos paramètres.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; text-align: center;">
                <a href="${baseUrl}/market-search" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Gérer mes alertes</a> |
                <a href="${baseUrl}/settings" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Modifier mes préférences</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                Ceci est un email de test. Vous recevez cet email car vous avez demandé un test de notification.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return { success: false, error: 'RESEND_API_KEY not configured' };
    }

    const emailFrom = Deno.env.get('EMAIL_FROM') || 'LeMarchéPublic.fr <onboarding@resend.dev>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return { success: false, error: `Resend API error: ${error}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!user.email) {
      return new Response(
        JSON.stringify({ error: 'User email not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: prefs } = await supabase
      .from('user_notification_preferences')
      .select('notification_email, email_notifications_enabled')
      .eq('user_id', user.id)
      .maybeSingle();

    if (prefs?.email_notifications_enabled === false) {
      return new Response(
        JSON.stringify({ error: 'Email notifications are disabled for this user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const recipientEmail = prefs?.notification_email || user.email;
    const baseUrl = 'https://lemarchepublic.fr';

    const htmlContent = generateTestDigestEmailHTML(recipientEmail, baseUrl);
    const subject = 'Email de test - LeMarchéPublic.fr';

    const result = await sendEmail(recipientEmail, subject, htmlContent);

    if (result.success) {
      await supabase.from('email_digest_history').insert({
        user_id: user.id,
        sent_at: new Date().toISOString(),
        digest_type: 'test',
        alerts_triggered: 0,
        markets_included: 0,
        recipient_email: recipientEmail,
        email_content: htmlContent,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test email sent successfully',
          recipient: recipientEmail,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          error: result.error || 'Failed to send email',
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in send-test-digest:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
