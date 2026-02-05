export function formatAmount(amount: number | null | undefined): string {
  if (!amount) return 'Non spécifié';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatDeadline(deadline: string | null | undefined): string {
  if (!deadline) return 'Non spécifié';

  try {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const formatted = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);

    if (diffDays < 0) return `${formatted} (Expiré)`;
    if (diffDays === 0) return `${formatted} (Aujourd'hui !)`;
    if (diffDays === 1) return `${formatted} (Demain !)`;
    if (diffDays <= 7) return `${formatted} (Dans ${diffDays} jours)`;

    return formatted;
  } catch {
    return deadline;
  }
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return 'Non spécifié';

  try {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  } catch {
    return date;
  }
}

export interface Market {
  id?: string;
  title?: string | null;
  organization?: string | null;
  estimated_amount?: number | null;
  deadline?: string | null;
  publication_date?: string | null;
  market_type?: string | null;
  city?: string | null;
  reference?: string | null;
}

export function generateMarketCardHTML(market: Market, index: number): string {
  const urgencyColor = market.deadline ? getUrgencyColor(market.deadline) : '#ccc';

  return `
    <tr>
      <td style="padding: 0 0 20px 0;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 24px;">
              <!-- Header with urgency indicator -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td>
                    <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 600; color: #1a1a1a; line-height: 1.4;">
                      ${market.title || 'Sans titre'}
                    </h2>
                  </td>
                  <td style="width: 12px; background: ${urgencyColor}; border-radius: 6px;"></td>
                </tr>
              </table>

              <!-- Organization -->
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #4a5568; font-weight: 500;">
                ${market.organization || 'Organisation non spécifiée'}
              </p>

              <!-- Details grid -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 16px;">
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Montant estimé:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="font-size: 14px; color: #1a1a1a; font-weight: 600;">${formatAmount(market.estimated_amount)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Date limite:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="font-size: 14px; color: #1a1a1a; font-weight: 600;">${formatDeadline(market.deadline)}</span>
                  </td>
                </tr>
                ${market.city ? `
                <tr>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Localisation:</span>
                  </td>
                  <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb; text-align: right;">
                    <span style="font-size: 14px; color: #1a1a1a;">${market.city}</span>
                  </td>
                </tr>
                ` : ''}
                ${market.market_type ? `
                <tr>
                  <td style="padding: 8px 0;">
                    <span style="font-size: 14px; color: #6b7280; font-weight: 500;">Type:</span>
                  </td>
                  <td style="padding: 8px 0; text-align: right;">
                    <span style="font-size: 14px; color: #1a1a1a;">${market.market_type}</span>
                  </td>
                </tr>
                ` : ''}
              </table>

              <!-- CTA Button -->
              ${market.id ? `
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding-top: 4px;">
                    <a href="https://lemarchepublic.fr/market/${market.id}"
                       style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #F77F00 0%, #E06F00 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 6px rgba(247, 127, 0, 0.2);">
                      Voir les détails →
                    </a>
                  </td>
                </tr>
              </table>
              ` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `;
}

function getUrgencyColor(deadline: string): string {
  try {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return '#9ca3af'; // Gray - expired
    if (diffDays <= 3) return '#ef4444'; // Red - urgent
    if (diffDays <= 7) return '#f59e0b'; // Orange - soon
    if (diffDays <= 14) return '#10b981'; // Green - upcoming
    return '#3b82f6'; // Blue - plenty of time
  } catch {
    return '#9ca3af';
  }
}

export function generateDigestEmailHTML(
  markets: Market[],
  userName: string,
  totalCount: number,
  alertName?: string
): string {
  const marketCardsHTML = markets.map((market, index) => generateMarketCardHTML(market, index)).join('');

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouveaux marchés publics</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f3f4f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 640px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #F77F00 0%, #E06F00 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                📬 Nouveaux Marchés Publics
              </h1>
              ${alertName ? `
              <p style="margin: 8px 0 0 0; font-size: 16px; color: #ffffff; opacity: 0.95;">
                Alerte: ${alertName}
              </p>
              ` : ''}
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 24px 24px 24px;">
              <p style="margin: 0 0 8px 0; font-size: 18px; color: #1a1a1a; font-weight: 600;">
                Bonjour ${userName},
              </p>
              <p style="margin: 0; font-size: 16px; color: #4a5568; line-height: 1.6;">
                Nous avons trouvé <strong style="color: #F77F00;">${totalCount} ${totalCount > 1 ? 'nouveaux marchés' : 'nouveau marché'}</strong> correspondant à vos critères de recherche.
              </p>
            </td>
          </tr>

          <!-- Markets -->
          <tr>
            <td style="padding: 0 24px 24px 24px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${marketCardsHTML}
              </table>
            </td>
          </tr>

          <!-- Footer CTA -->
          <tr>
            <td style="padding: 24px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #4a5568;">
                Consultez tous vos marchés sur la plateforme
              </p>
              <a href="https://lemarchepublic.fr/market-search"
                 style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #F77F00 0%, #E06F00 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(247, 127, 0, 0.2);">
                Accéder à la plateforme
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px; text-align: center; background: #1f2937; color: #d1d5db;">
              <p style="margin: 0 0 8px 0; font-size: 14px;">
                © ${new Date().getFullYear()} Le Marché Public - Tous droits réservés
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                <a href="https://lemarchepublic.fr/settings" style="color: #F77F00; text-decoration: none;">Gérer mes alertes</a> •
                <a href="https://lemarchepublic.fr/mentions-legales" style="color: #F77F00; text-decoration: none;">Mentions légales</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
