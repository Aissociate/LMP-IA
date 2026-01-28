import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface Detection {
  alert_id: string;
  alert_name: string;
  market_reference: string;
  market_title: string;
  market_client: string;
  market_description: string | null;
  market_amount: number | null;
  market_location: string | null;
  market_deadline: string | null;
  market_url: string | null;
  market_service_type: string | null;
  detected_at: string;
}

function generateTestDigestEmailHTML(
  recipientEmail: string,
  baseUrl: string,
  detections: Detection[],
  alertGroups: Map<string, { name: string; markets: Detection[] }>
): string {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formatAmount = (amount: number | null) => {
    if (!amount) return 'Non communiqué';
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'Non communiquée';
    const date = new Date(deadline);
    const daysUntil = Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const dateStr = date.toLocaleDateString('fr-FR');

    if (daysUntil < 0) return `<span style="color: #dc2626;">${dateStr} (Expirée)</span>`;
    if (daysUntil <= 7) return `<span style="color: #dc2626;">${dateStr} (${daysUntil}j restants)</span>`;
    if (daysUntil <= 14) return `<span style="color: #f59e0b;">${dateStr} (${daysUntil}j restants)</span>`;
    return `${dateStr} (${daysUntil}j restants)`;
  };

  let marketsHTML = '';

  if (detections.length === 0) {
    marketsHTML = `
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
        <p style="margin: 0; font-size: 16px; color: #92400e; font-weight: 600;">
          Aucune détection récente
        </p>
        <p style="margin: 8px 0 0 0; font-size: 14px; color: #92400e;">
          Aucun marché n'a été détecté récemment pour vos alertes actives. Cet email de test montre le format que vous recevrez lorsque des marchés correspondront à vos critères.
        </p>
      </div>
    `;
  } else {
    for (const [alertId, alertData] of alertGroups.entries()) {
      marketsHTML += `
        <div style="margin-bottom: 32px; border-left: 4px solid #3b82f6; padding-left: 16px;">
          <h2 style="color: #1e40af; font-size: 18px; font-weight: 600; margin-bottom: 8px;">
            ${alertData.name}
          </h2>
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
            ${alertData.markets.length} ${alertData.markets.length > 1 ? 'marchés détectés' : 'marché détecté'}
          </p>
      `;

      for (const market of alertData.markets) {
        const marketUrl = market.market_url || `${baseUrl}/marches/${market.market_reference}`;
        marketsHTML += `
          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
            <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
              <a href="${marketUrl}" style="color: #111827; text-decoration: none;">${market.market_title}</a>
            </h3>

            <div style="margin-bottom: 12px;">
              <span style="display: inline-block; color: #6b7280; font-size: 14px; margin-right: 16px;">
                <strong>Client:</strong> ${market.market_client}
              </span>
              ${market.market_location ? `
              <span style="display: inline-block; color: #6b7280; font-size: 14px;">
                <strong>Localisation:</strong> ${market.market_location}
              </span>
              ` : ''}
            </div>

            <div style="margin-bottom: 12px;">
              <span style="display: inline-block; color: #6b7280; font-size: 14px; margin-right: 16px;">
                <strong>Montant:</strong> ${formatAmount(market.market_amount)}
              </span>
              <span style="display: inline-block; color: #6b7280; font-size: 14px;">
                <strong>Date limite:</strong> ${formatDeadline(market.market_deadline)}
              </span>
            </div>

            ${market.market_description ? `
            <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 12px;">
              ${market.market_description.substring(0, 200)}${market.market_description.length > 200 ? '...' : ''}
            </p>
            ` : ''}

            <a href="${marketUrl}"
               style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 500;">
              Consulter le marché
            </a>
          </div>
        `;
      }

      marketsHTML += '</div>';
    }
  }

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email de test - Détections de marchés</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">
                Email de test - Vos détections
              </h1>
              <p style="color: #e0e7ff; font-size: 14px; margin: 8px 0 0 0;">
                Aperçu du format des notifications - ${today}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 24px;">
              <div style="background: #dcfce7; border-left: 4px solid #16a34a; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; color: #166534; font-weight: 600;">
                  Email de test envoyé avec succès
                </p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #166534;">
                  ${detections.length} détection${detections.length > 1 ? 's' : ''} récente${detections.length > 1 ? 's' : ''} (dernières 24h)
                </p>
              </div>

              ${marketsHTML}

              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
                  Horaires des digests automatiques
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.8;">
                  <li><strong>Digest du matin :</strong> 8h00 (UTC+4)</li>
                  <li><strong>Digest du soir :</strong> 18h00 (UTC+4)</li>
                  <li>Les emails sont envoyés uniquement s'il y a de nouvelles détections</li>
                </ul>
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
                Ceci est un email de test montrant les détections récentes. Les emails automatiques seront envoyés 2 fois par jour.
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

function validateEmailFrom(emailFrom: string): string {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const namedEmailRegex = /^[^<>]+<[^\s@]+@[^\s@]+\.[^\s@]+>$/;

  if (emailRegex.test(emailFrom) || namedEmailRegex.test(emailFrom)) {
    return emailFrom;
  }

  console.warn('Invalid EMAIL_FROM format detected:', emailFrom);
  return 'Le Marche Public <onboarding@resend.dev>';
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

    const rawEmailFrom = Deno.env.get('EMAIL_FROM') || 'Le Marche Public <onboarding@resend.dev>';
    console.log('Raw EMAIL_FROM value:', rawEmailFrom);

    const emailFrom = validateEmailFrom(rawEmailFrom);
    console.log('Validated EMAIL_FROM:', emailFrom);

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

    // Récupérer les détections récentes (dernières 24h)
    const { data: recentDetections, error: detectionsError } = await supabase
      .from('market_alert_detections')
      .select(`
        alert_id,
        market_reference,
        market_title,
        market_client,
        market_description,
        market_amount,
        market_location,
        market_deadline,
        market_url,
        market_service_type,
        detected_at,
        search_alerts!inner(name)
      `)
      .eq('user_id', user.id)
      .gte('detected_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('detected_at', { ascending: false })
      .limit(20);

    if (detectionsError) {
      console.error('Error fetching detections:', detectionsError);
    }

    const detections: Detection[] = (recentDetections || []).map((d: any) => ({
      alert_id: d.alert_id,
      alert_name: d.search_alerts?.name || 'Alerte',
      market_reference: d.market_reference,
      market_title: d.market_title,
      market_client: d.market_client,
      market_description: d.market_description,
      market_amount: d.market_amount,
      market_location: d.market_location,
      market_deadline: d.market_deadline,
      market_url: d.market_url,
      market_service_type: d.market_service_type,
      detected_at: d.detected_at,
    }));

    // Grouper les détections par alerte
    const alertGroups = new Map<string, { name: string; markets: Detection[] }>();
    for (const detection of detections) {
      if (!alertGroups.has(detection.alert_id)) {
        alertGroups.set(detection.alert_id, {
          name: detection.alert_name,
          markets: [],
        });
      }
      alertGroups.get(detection.alert_id)!.markets.push(detection);
    }

    const htmlContent = generateTestDigestEmailHTML(recipientEmail, baseUrl, detections, alertGroups);
    const subject = detections.length > 0
      ? `Email de test - ${detections.length} détection${detections.length > 1 ? 's' : ''} récente${detections.length > 1 ? 's' : ''}`
      : 'Email de test - Format des notifications';

    const result = await sendEmail(recipientEmail, subject, htmlContent);

    if (result.success) {
      await supabase.from('email_digest_history').insert({
        user_id: user.id,
        sent_at: new Date().toISOString(),
        digest_type: 'test',
        alerts_triggered: alertGroups.size,
        markets_included: detections.length,
        recipient_email: recipientEmail,
        email_content: htmlContent,
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Test email sent successfully',
          recipient: recipientEmail,
          detections_count: detections.length,
          alerts_count: alertGroups.size,
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
