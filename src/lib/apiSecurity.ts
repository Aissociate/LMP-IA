/**
 * Service de sécurité API et protection contre les attaques
 */

interface RateLimitConfig {
  maxRequests: number;
  timeWindowMs: number;
}

export class ApiSecurity {
  private static instance: ApiSecurity;
  private rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  static getInstance(): ApiSecurity {
    if (!ApiSecurity.instance) {
      ApiSecurity.instance = new ApiSecurity();
    }
    return ApiSecurity.instance;
  }

  /**
   * Vérification du rate limiting côté client
   */
  checkRateLimit(userId: string, action: string, config: RateLimitConfig): boolean {
    const key = `${userId}_${action}`;
    const now = Date.now();
    const entry = this.rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Nouvelle fenêtre de temps
      this.rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.timeWindowMs
      });
      return true;
    }

    if (entry.count >= config.maxRequests) {
      return false; // Limite dépassée
    }

    // Incrémenter le compteur
    entry.count++;
    return true;
  }

  /**
   * Nettoyage périodique du cache rate limit
   */
  cleanupRateLimit(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Validation des headers de sécurité
   */
  validateSecurityHeaders(request: Request): boolean {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    
    // Vérifier l'origine pour les requêtes CORS
    if (origin) {
      const allowedOrigins = [
        'http://localhost:5173',
        'https://localhost:5173',
        window.location.origin
      ];
      
      if (!allowedOrigins.includes(origin)) {
        console.warn(`Blocked request from unauthorized origin: ${origin}`);
        return false;
      }
    }
    
    return true;
  }

  /**
   * Génération de nonce pour CSP
   */
  generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validation des montants Stripe
   */
  validateStripeAmount(amount: number, currency: string = 'EUR'): boolean {
    // Montants minimum et maximum par devise
    const limits = {
      EUR: { min: 0.50, max: 999999.99 }
    };
    
    const limit = limits[currency as keyof typeof limits];
    if (!limit) return false;
    
    return amount >= limit.min && amount <= limit.max && Number.isFinite(amount);
  }

  /**
   * Protection contre les attaques par timing
   */
  async constantTimeCompare(a: string, b: string): Promise<boolean> {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    // Ajouter un délai constant pour éviter les attaques par timing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 10 + 5));
    
    return result === 0;
  }
}

export const apiSecurity = ApiSecurity.getInstance();

// Rate limiting configurations
export const RATE_LIMITS = {
  FILE_UPLOAD: { maxRequests: 10, timeWindowMs: 60 * 1000 }, // 10 uploads par minute
  AI_GENERATION: { maxRequests: 1000, timeWindowMs: 60 * 1000 }, // 1000 générations par minute (illimité)
  WEBHOOK_CALLS: { maxRequests: 100, timeWindowMs: 60 * 1000 }, // 100 appels webhook par minute
  LOGIN_ATTEMPTS: { maxRequests: 5, timeWindowMs: 15 * 60 * 1000 }, // 5 tentatives par 15 minutes
  STRIPE_CHECKOUT: { maxRequests: 10, timeWindowMs: 5 * 60 * 1000 }, // 10 checkouts par 5 minutes
};