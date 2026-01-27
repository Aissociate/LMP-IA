import { supabase } from '../lib/supabase';
import { BOAMPMarket } from '../types/boamp';

export interface DeduplicationResult {
  boampMarkets: BOAMPMarket[];
  manualMarkets: any[];
  removedDuplicates: number;
}

export class DeduplicationService {
  static async deduplicateMarkets(
    boampMarkets: BOAMPMarket[],
    includeManualMarkets: boolean = false
  ): Promise<DeduplicationResult> {
    const manualMarkets: any[] = [];
    let removedDuplicates = 0;

    if (!includeManualMarkets) {
      return {
        boampMarkets,
        manualMarkets,
        removedDuplicates,
      };
    }

    try {
      const { data: manualMarketsData, error } = await supabase
        .from('manual_markets')
        .select('*')
        .eq('is_duplicate', false);

      if (error) {
        console.error('Error fetching manual markets:', error);
        return { boampMarkets, manualMarkets, removedDuplicates };
      }

      if (!manualMarketsData || manualMarketsData.length === 0) {
        return { boampMarkets, manualMarkets, removedDuplicates };
      }

      const boampReferences = new Set(boampMarkets.map(m => m.reference?.toLowerCase()));
      const boampUrls = new Set(boampMarkets.map(m => m.liens_telechargement?.toLowerCase()));
      const boampTitles = new Map(
        boampMarkets.map(m => [
          `${m.intitule?.toLowerCase()}_${m.date_limite_reponse}`,
          true
        ])
      );

      const uniqueManualMarkets = manualMarketsData.filter(manual => {
        const manualRef = manual.reference?.toLowerCase();
        const manualUrl = manual.url?.toLowerCase();
        const manualTitleKey = `${manual.title?.toLowerCase()}_${manual.deadline}`;

        const isDuplicate =
          (manualRef && boampReferences.has(manualRef)) ||
          (manualUrl && boampUrls.has(manualUrl)) ||
          boampTitles.has(manualTitleKey);

        if (isDuplicate) {
          removedDuplicates++;
        }

        return !isDuplicate;
      });

      manualMarkets.push(...uniqueManualMarkets);

      return {
        boampMarkets,
        manualMarkets: uniqueManualMarkets,
        removedDuplicates,
      };
    } catch (error) {
      console.error('Error during deduplication:', error);
      return { boampMarkets, manualMarkets, removedDuplicates };
    }
  }

  static async markManualMarketDuplicates(
    boampMarkets: BOAMPMarket[]
  ): Promise<number> {
    try {
      const { data: manualMarketsData, error } = await supabase
        .from('manual_markets')
        .select('*')
        .eq('is_duplicate', false);

      if (error || !manualMarketsData) {
        return 0;
      }

      let markedCount = 0;

      for (const manual of manualMarketsData) {
        const matchingBoamp = boampMarkets.find(boamp => {
          const refMatch = manual.reference && boamp.reference &&
            manual.reference.toLowerCase() === boamp.reference.toLowerCase();

          const urlMatch = manual.url && boamp.liens_telechargement &&
            manual.url.toLowerCase() === boamp.liens_telechargement.toLowerCase();

          const titleDateMatch = manual.title && boamp.intitule &&
            manual.title.toLowerCase() === boamp.intitule.toLowerCase() &&
            manual.deadline === boamp.date_limite_reponse;

          return refMatch || urlMatch || titleDateMatch;
        });

        if (matchingBoamp) {
          const { error: updateError } = await supabase
            .from('manual_markets')
            .update({
              is_duplicate: true,
              duplicate_of_reference: matchingBoamp.reference,
              duplicate_source: 'boamp',
              duplicate_notes: `Marché BOAMP détecté: ${matchingBoamp.intitule}`,
            })
            .eq('id', manual.id);

          if (!updateError) {
            markedCount++;
          }
        }
      }

      return markedCount;
    } catch (error) {
      console.error('Error marking duplicates:', error);
      return 0;
    }
  }

  static calculateSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1;

    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;

    if (longer.length === 0) return 1;

    const editDistance = this.levenshteinDistance(s1, s2);
    return (longer.length - editDistance) / longer.length;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

export const deduplicationService = new DeduplicationService();
