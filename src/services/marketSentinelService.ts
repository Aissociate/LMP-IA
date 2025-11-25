import { supabase } from '../lib/supabase';
import { BOAMPMarket } from '../types/boamp';

interface UserContext {
  company_name?: string;
  activity_sectors?: string[];
  expertise_areas?: string[];
  geographical_zones?: string[];
  knowledge_base?: {
    total_files: number;
    categories: string[];
    documents_content: string;
  };
}

export const marketSentinelService = {
  async analyzeMarket(market: BOAMPMarket, alertId?: string, userContext?: UserContext) {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('Not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/market-sentinel-analysis`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          market: {
            id: market.id,
            reference: market.reference,
            title: market.title,
            client: market.client,
            description: market.description,
            deadline: market.deadline,
            amount: market.amount,
            location: market.location,
            publicationDate: market.publicationDate,
            procedureType: market.procedureType,
            serviceType: market.serviceType,
            url: market.url
          },
          alert_id: alertId,
          user_context: userContext
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze market');
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Error analyzing market:', error);
      throw error;
    }
  },

  async analyzeBulkMarkets(markets: BOAMPMarket[], alertId?: string, userContext?: UserContext) {
    const results = [];
    const errors = [];

    for (const market of markets) {
      try {
        const result = await this.analyzeMarket(market, alertId, userContext);
        results.push(result);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        errors.push({ market: market.id, error: error.message });
      }
    }

    return { results, errors };
  },

  async getUserContext(userId: string): Promise<UserContext> {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('company_name, activity_sectors, expertise_areas, geographical_zones')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      const { data: knowledgeFiles, error: kbError } = await supabase
        .from('knowledge_files')
        .select('name, category, extracted_content')
        .eq('user_id', userId)
        .eq('extraction_status', 'completed')
        .order('created_at', { ascending: false });

      if (kbError) {
        console.error('Error fetching knowledge files:', kbError);
      }

      let knowledgeBase;
      if (knowledgeFiles && knowledgeFiles.length > 0) {
        const allTexts = knowledgeFiles
          .filter(f => f.extracted_content && f.extracted_content.trim().length > 0)
          .map(f => {
            const header = `\n=== Document: ${f.name} ${f.category ? `(${f.category})` : ''} ===\n`;
            return header + f.extracted_content.trim();
          })
          .join('\n\n');

        knowledgeBase = {
          total_files: knowledgeFiles.length,
          categories: [...new Set(knowledgeFiles.filter(f => f.category).map(f => f.category))],
          documents_content: allTexts
        };
      }

      return {
        company_name: profile?.company_name || profile?.company || undefined,
        activity_sectors: profile?.activity_sectors || [],
        expertise_areas: profile?.expertise_areas || [],
        geographical_zones: profile?.geographical_zones || [],
        knowledge_base: knowledgeBase
      };
    } catch (error) {
      console.error('Error fetching user context:', error);
      return {};
    }
  }
};
