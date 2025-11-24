/**
 * Service de validation et sécurité
 */

export class SecurityValidation {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Minimum 8 caractères requis');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Au moins une majuscule requise');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Au moins une minuscule requise');
    }
    if (!/\d/.test(password)) {
      errors.push('Au moins un chiffre requis');
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Au moins un caractère spécial requis');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  static validateFileType(fileName: string, allowedTypes: string[]): boolean {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  }

  static validateFileSize(size: number, maxSizeMB: number): boolean {
    return size <= maxSizeMB * 1024 * 1024;
  }

  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .substring(0, 255);
  }

  static validateUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static validateStripeAmount(amount: number): boolean {
    return amount > 0 && amount <= 999999.99 && Number.isFinite(amount);
  }

  static rateLimitKey(userId: string, action: string): string {
    return `rate_limit_${action}_${userId}`;
  }
}