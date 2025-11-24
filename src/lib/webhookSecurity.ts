/**
 * Service de sécurité pour les webhooks
 */

export class WebhookSecurity {
  private static instance: WebhookSecurity;
  
  // Domaines autorisés pour les webhooks (whitelist)
  private static readonly ALLOWED_WEBHOOK_DOMAINS = [
    'app.n8n.cloud',
    'hooks.zapier.com',
    'hook.integromat.com',
    'hooks.slack.com',
    'discord.com',
    'api.telegram.org',
    'localhost' // Pour développement uniquement
  ];

  // Ports autorisés pour localhost
  private static readonly ALLOWED_LOCALHOST_PORTS = [3000, 3001, 8000, 8080, 9000];

  static getInstance(): WebhookSecurity {
    if (!WebhookSecurity.instance) {
      WebhookSecurity.instance = new WebhookSecurity();
    }
    return WebhookSecurity.instance;
  }

  /**
   * Valide qu'une URL de webhook est sécurisée
   */
  validateWebhookUrl(url: string): { valid: boolean; error?: string } {
    try {
      const urlObj = new URL(url);
      
      // Vérifier le protocole (HTTPS uniquement sauf localhost)
      if (urlObj.protocol !== 'https:' && urlObj.hostname !== 'localhost') {
        return { valid: false, error: 'Seules les URLs HTTPS sont autorisées (sauf localhost)' };
      }
      
      // Vérifier la longueur maximale
      if (url.length > 2048) {
        return { valid: false, error: 'URL trop longue (max 2048 caractères)' };
      }
      
      // Vérifier les domaines autorisés
      const isAllowedDomain = WebhookSecurity.ALLOWED_WEBHOOK_DOMAINS.some(domain => {
        if (domain === 'localhost') {
          return urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
        }
        return urlObj.hostname === domain || urlObj.hostname.endsWith('.' + domain);
      });
      
      if (!isAllowedDomain) {
        return { 
          valid: false, 
          error: `Domaine non autorisé. Domaines permis: ${WebhookSecurity.ALLOWED_WEBHOOK_DOMAINS.join(', ')}` 
        };
      }
      
      // Vérifier les ports pour localhost
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
        const port = parseInt(urlObj.port);
        if (port && !WebhookSecurity.ALLOWED_LOCALHOST_PORTS.includes(port)) {
          return { 
            valid: false, 
            error: `Port localhost non autorisé. Ports permis: ${WebhookSecurity.ALLOWED_LOCALHOST_PORTS.join(', ')}` 
          };
        }
      }
      
      // Vérifier les IPs privées (protection SSRF)
      if (this.isPrivateIP(urlObj.hostname)) {
        return { valid: false, error: 'Les adresses IP privées ne sont pas autorisées' };
      }
      
      return { valid: true };
      
    } catch (error) {
      return { valid: false, error: 'Format d\'URL invalide' };
    }
  }

  /**
   * Vérifie si une IP est privée (protection SSRF)
   */
  private isPrivateIP(hostname: string): boolean {
    // Regex pour les IPs privées
    const privateIPRegex = [
      /^127\./, // 127.0.0.0/8 (loopback) - autorisé mais vérifié séparément
      /^10\./, // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
      /^192\.168\./, // 192.168.0.0/16
      /^169\.254\./, // 169.254.0.0/16 (link-local)
      /^::1$/, // IPv6 loopback
      /^fc00:/, // IPv6 private
      /^fd00:/ // IPv6 private
    ];
    
    return privateIPRegex.some(regex => regex.test(hostname));
  }

  /**
   * Sanitise les données avant envoi au webhook
   */
  sanitizeWebhookData(data: any): any {
    const sanitized = { ...data };
    
    // Limiter la taille du contenu
    if (sanitized.message && sanitized.message.length > 10000) {
      sanitized.message = sanitized.message.substring(0, 10000) + '[...tronqué]';
    }
    
    if (sanitized.file_content && sanitized.file_content.length > 50000) {
      sanitized.file_content = sanitized.file_content.substring(0, 50000) + '[...tronqué]';
    }
    
    // Nettoyer les champs sensibles
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    delete sanitized.key;
    
    // Limiter les métadonnées utilisateur
    if (sanitized.userEmail) {
      // Hasher partiellement l'email pour la privacy
      const [local, domain] = sanitized.userEmail.split('@');
      if (local && domain) {
        sanitized.userEmail = `${local.substring(0, 2)}***@${domain}`;
      }
    }
    
    return sanitized;
  }

  /**
   * Génère un token de sécurité pour authentifier les requêtes webhook
   */
  generateWebhookToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Vérifie le rate limiting pour les webhooks
   */
  checkWebhookRateLimit(userId: string): boolean {
    const key = `webhook_${userId}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 30; // 30 requêtes par minute max
    
    const stored = localStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { count: 0, resetTime: now + windowMs };
    
    if (now > data.resetTime) {
      // Nouvelle fenêtre
      localStorage.setItem(key, JSON.stringify({ count: 1, resetTime: now + windowMs }));
      return true;
    }
    
    if (data.count >= maxRequests) {
      return false;
    }
    
    data.count++;
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  }
}

export const webhookSecurity = WebhookSecurity.getInstance();