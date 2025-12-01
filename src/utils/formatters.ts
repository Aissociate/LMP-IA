/**
 * Format a number as currency (EUR)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (!amount && amount !== 0) return 'Non spécifié';

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format a date to French locale
 */
export function formatDate(
  dateString: string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return 'Non spécifié';

  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  };

  return new Date(dateString).toLocaleDateString('fr-FR', defaultOptions);
}

/**
 * Calculate days remaining until a deadline
 */
export function getDaysRemaining(deadline: string | null | undefined): number | null {
  if (!deadline) return null;

  const now = new Date();
  const deadlineDate = new Date(deadline);
  const diff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return diff;
}

/**
 * Format days remaining with text
 */
export function formatDaysRemaining(deadline: string | null | undefined): string {
  const days = getDaysRemaining(deadline);

  if (days === null) return 'Non spécifié';
  if (days < 0) return 'Expiré';
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';

  return `${days} jours`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
