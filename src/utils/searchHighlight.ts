export function highlightSearchTerms(text: string, searchQuery: string): string {
  if (!text || !searchQuery || searchQuery.trim() === '') {
    return text || '';
  }

  const terms = searchQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 2);

  if (terms.length === 0) {
    return text;
  }

  const regex = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');

  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600/40 px-0.5 rounded">$1</mark>');
}

export function extractSearchContext(text: string, searchQuery: string, contextLength: number = 150): string {
  if (!text || !searchQuery || searchQuery.trim() === '') {
    return text ? text.substring(0, contextLength) + (text.length > contextLength ? '...' : '') : '';
  }

  const terms = searchQuery
    .toLowerCase()
    .split(/\s+/)
    .filter(term => term.length > 2);

  if (terms.length === 0) {
    return text.substring(0, contextLength) + (text.length > contextLength ? '...' : '');
  }

  const lowerText = text.toLowerCase();
  let bestIndex = -1;
  let maxScore = 0;

  for (const term of terms) {
    const index = lowerText.indexOf(term);
    if (index !== -1 && index < maxScore) {
      bestIndex = index;
      maxScore = index;
    }
    if (index !== -1 && bestIndex === -1) {
      bestIndex = index;
    }
  }

  if (bestIndex === -1) {
    return text.substring(0, contextLength) + (text.length > contextLength ? '...' : '');
  }

  const start = Math.max(0, bestIndex - Math.floor(contextLength / 2));
  const end = Math.min(text.length, start + contextLength);

  let excerpt = text.substring(start, end);

  if (start > 0) excerpt = '...' + excerpt;
  if (end < text.length) excerpt = excerpt + '...';

  return excerpt;
}

export function calculateMatchScore(text: string, searchQuery: string): number {
  if (!text || !searchQuery) return 0;

  const lowerText = text.toLowerCase();
  const lowerQuery = searchQuery.toLowerCase();
  const terms = lowerQuery.split(/\s+/).filter(term => term.length > 2);

  if (terms.length === 0) return 0;

  let score = 0;

  if (lowerText.includes(lowerQuery)) {
    score += 10;
  }

  for (const term of terms) {
    if (lowerText.includes(term)) {
      score += 2;
    }

    const words = lowerText.split(/\s+/);
    for (const word of words) {
      if (word.startsWith(term)) {
        score += 1;
      }
    }
  }

  return score;
}