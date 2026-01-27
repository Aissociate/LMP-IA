import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret',
};

interface DigestQueueItem {
  id: string;
  user_id: string;
  digest_type: string;
  alert_results: Array<{
    alert_id: string;
    alert_name: string;
    markets: Array<{
      reference: string;
      title: string;
      client: string;
      description: string | null;
      amount: number | null;
      location: string | null;
      deadline: string | null;
      url: string | null;
      service_type: string | null;
    }>;
  }>;
  total_markets_count: number;
}

function generateDigestEmailHTML(
  digest: DigestQueueItem,
  recipientEmail: string,
  baseUrl: string
): string {
  const totalMarkets = digest.total_markets_count;
  const alertsCount = digest.alert_results.length;
  const digestTime = digest.digest_type === 'morning' ? '8h00' : '18h00';
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
  for (const alert of digest.alert_results) {
    marketsHTML += `
      <div style="margin-bottom: 32px; border-left: 4px solid #3b82f6; padding-left: 16px;">
        <h2 style="color: #1e40af; font-size: 18px; font-weight: 600; margin-bottom: 8px;">
          ${alert.alert_name}
        </h2>
        <p style="color: #6b7280; font-size: 14px; margin-bottom: 16px;">
          ${alert.markets.length} ${alert.markets.length > 1 ? 'marchés détectés' : 'marché détecté'}
        </p>
    `;

    for (const market of alert.markets) {
      const marketUrl = market.url || `${baseUrl}/marches/${market.reference}`;
      marketsHTML += `
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
          <h3 style="color: #111827; font-size: 16px; font-weight: 600; margin: 0 0 12px 0;">
            <a href="${marketUrl}" style="color: #111827; text-decoration: none;">${market.title}</a>
          </h3>

          <div style="margin-bottom: 12px;">
            <span style="display: inline-block; color: #6b7280; font-size: 14px; margin-right: 16px;">
              <strong>Client:</strong> ${market.client}
            </span>
            ${market.location ? `
            <span style="display: inline-block; color: #6b7280; font-size: 14px;">
              <strong>Localisation:</strong> ${market.location}
            </span>
            ` : ''}
          </div>

          <div style="margin-bottom: 12px;">
            <span style="display: inline-block; color: #6b7280; font-size: 14px; margin-right: 16px;">
              <strong>Montant:</strong> ${formatAmount(market.amount)}
            </span>
            <span style="display: inline-block; color: #6b7280; font-size: 14px;">
              <strong>Date limite:</strong> ${formatDeadline(market.deadline)}
            </span>
          </div>

          ${market.description ? `
          <p style="color: #4b5563; font-size: 14px; line-height: 1.5; margin-bottom: 12px;">
            ${market.description.substring(0, 200)}${market.description.length > 200 ? '...' : ''}
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

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vos nouveaux marchés publics</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">
                Vos nouveaux marchés publics
              </h1>
              <p style="color: #e0e7ff; font-size: 14px; margin: 8px 0 0 0;">
                Digest ${digest.digest_type === 'morning' ? 'du matin' : 'du soir'} - ${digestTime}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 24px;">
              <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
                <p style="margin: 0; font-size: 16px; color: #1e40af; font-weight: 600;">
                  ${totalMarkets} nouveau${totalMarkets > 1 ? 'x' : ''} marché${totalMarkets > 1 ? 's' : ''} détecté${totalMarkets > 1 ? 's' : ''}
                </p>
                <p style="margin: 4px 0 0 0; font-size: 14px; color: #3b82f6;">
                  ${alertsCount} alerte${alertsCount > 1 ? 's' : ''} déclenchée${alertsCount > 1 ? 's' : ''} - ${today}
                </p>
              </div>

              ${marketsHTML}
            </td>
          </tr>

          <tr>
            <td style="background-color: #f9fafb; padding: 24px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #6b7280; text-align: center;">
                <a href="${baseUrl}/market-search" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Gérer mes alertes</a> |
                <a href="${baseUrl}/settings" style="color: #3b82f6; text-decoration: none; margin: 0 8px;">Modifier mes préférences</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                Vous recevez cet email car vous avez activé les alertes marchés publics.
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
): Promise<boolean> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured');
      return false;
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
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const cronSecret = req.headers.get('X-Cron-Secret');
    const expectedSecret = Deno.env.get('CRON_SECRET');

    if (!cronSecret || cronSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const baseUrl = 'https://lemarchepublic.fr';

    const { data: pendingDigests, error: digestsError } = await supabase
      .from('email_digest_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(50);

    if (digestsError) throw digestsError;

    if (!pendingDigests || pendingDigests.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No pending digests to send', emails_sent: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let emailsSent = 0;
    let emailsFailed = 0;

    for (const digest of pendingDigests as DigestQueueItem[]) {
      try {
        const { data: user } = await supabase.auth.admin.getUserById(digest.user_id);
        if (!user?.user?.email) {
          await supabase
            .from('email_digest_queue')
            .update({
              status: 'failed',
              error_message: 'User email not found',
              sent_at: new Date().toISOString()
            })
            .eq('id', digest.id);
          emailsFailed++;
          continue;
        }

        const { data: prefs } = await supabase
          .from('user_notification_preferences')
          .select('notification_email')
          .eq('user_id', digest.user_id)
          .maybeSingle();

        const recipientEmail = prefs?.notification_email || user.user.email;

        const htmlContent = generateDigestEmailHTML(digest, recipientEmail, baseUrl);
        const subject = `${digest.total_markets_count} nouveau${digest.total_markets_count > 1 ? 'x' : ''} marché${digest.total_markets_count > 1 ? 's' : ''} public${digest.total_markets_count > 1 ? 's' : ''} détecté${digest.total_markets_count > 1 ? 's' : ''}`;

        const sent = await sendEmail(recipientEmail, subject, htmlContent);

        if (sent) {
          await supabase
            .from('email_digest_queue')
            .update({
              status: 'sent',
              sent_at: new Date().toISOString()
            })
            .eq('id', digest.id);

          await supabase.from('email_digest_history').insert({
            user_id: digest.user_id,
            sent_at: new Date().toISOString(),
            digest_type: digest.digest_type,
            alerts_triggered: digest.alert_results.length,
            markets_included: digest.total_markets_count,
            recipient_email: recipientEmail,
            email_content: htmlContent,
          });

          emailsSent++;
        } else {
          await supabase
            .from('email_digest_queue')
            .update({
              status: 'failed',
              error_message: 'Failed to send email via Resend',
              sent_at: new Date().toISOString()
            })
            .eq('id', digest.id);
          emailsFailed++;
        }
      } catch (error) {
        console.error(`Error processing digest ${digest.id}:`, error);
        await supabase
          .from('email_digest_queue')
          .update({
            status: 'failed',
            error_message: error.message,
            sent_at: new Date().toISOString()
          })
          .eq('id', digest.id);
        emailsFailed++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        digests_processed: pendingDigests.length,
        emails_sent: emailsSent,
        emails_failed: emailsFailed,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-market-digests:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
