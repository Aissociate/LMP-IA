import { BOAMPSearchParams, BOAMPMarket, BOAMPSearchResult } from '../types/boamp';
import { supabase } from '../lib/supabase';
import { DeduplicationService } from './deduplicationService';

class BOAMPService {
  private getEdgeFunctionUrl(): string {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/boamp-search`;
  }

  private getAuthHeaders(): HeadersInit {
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    return {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    };
  }
  private buildQueryString(params: BOAMPSearchParams): string {
    const queryParts: string[] = [];

    if (params.query) {
      queryParts.push(params.query);
    }

    if (params.reference) {
      queryParts.push(`idweb = "${params.reference}"`);
    }

    if (params.keywords) {
      const escapedKeywords = params.keywords.replace(/"/g, '\\"');
      if (params.searchInDCE) {
        queryParts.push(`(objet like "${escapedKeywords}" OR texte like "${escapedKeywords}" OR nomacheteur like "${escapedKeywords}" OR code_departement like "${escapedKeywords}" OR code_departement_prestation like "${escapedKeywords}" OR descripteur_libelle like "${escapedKeywords}" OR nature_categorise_libelle like "${escapedKeywords}")`);
      } else {
        queryParts.push(`(objet like "${escapedKeywords}" OR nomacheteur like "${escapedKeywords}" OR code_departement like "${escapedKeywords}" OR code_departement_prestation like "${escapedKeywords}" OR descripteur_libelle like "${escapedKeywords}" OR nature_categorise_libelle like "${escapedKeywords}")`);
      }
    }

    if (params.location && params.location.length > 0) {
      const locationQuery = params.location.map(loc => {
        const escaped = loc.replace(/"/g, '\\"');
        return `(code_departement like "${escaped}" OR code_departement_prestation like "${escaped}")`;
      }).join(' OR ');
      queryParts.push(`(${locationQuery})`);
    }

    if (params.serviceTypes && params.serviceTypes.length > 0) {
      const serviceQuery = params.serviceTypes.map(type => {
        const escaped = type.replace(/"/g, '\\"');
        return `(nature_categorise_libelle like "${escaped}" OR nature_libelle like "${escaped}" OR type_marche like "${escaped}")`;
      }).join(' OR ');
      queryParts.push(`(${serviceQuery})`);
    }

    if (params.publicBuyer) {
      const escaped = params.publicBuyer.replace(/"/g, '\\"');
      queryParts.push(`nomacheteur like "${escaped}"`);
    }

    if (params.cpvCode) {
      const escaped = params.cpvCode.replace(/"/g, '\\"');
      queryParts.push(`(descripteur_code like "${escaped}" OR descripteur_libelle like "${escaped}")`);
    }

    if (params.procedureType) {
      const escaped = params.procedureType.replace(/"/g, '\\"');
      queryParts.push(`(type_procedure like "${escaped}" OR procedure_libelle like "${escaped}")`);
    }

    if (params.contractForm) {
      const escaped = params.contractForm.replace(/"/g, '\\"');
      queryParts.push(`formemarche like "${escaped}"`);
    }

    return queryParts.join(' AND ');
  }

  private buildDateFilter(params: BOAMPSearchParams): string {
    const filters: string[] = [];

    if (params.deadlineFrom) {
      filters.push(`datelimitereponse >= date'${params.deadlineFrom}'`);
    }

    if (params.deadlineTo) {
      filters.push(`datelimitereponse <= date'${params.deadlineTo}'`);
    }

    if (params.publicationDateFrom) {
      filters.push(`dateparution >= date'${params.publicationDateFrom}'`);
    }

    if (params.publicationDateTo) {
      filters.push(`dateparution <= date'${params.publicationDateTo}'`);
    }

    if (params.amountMin !== undefined) {
      filters.push(`montant >= ${params.amountMin}`);
    }

    if (params.amountMax !== undefined) {
      filters.push(`montant <= ${params.amountMax}`);
    }

    return filters.join(' AND ');
  }

  async searchMarkets(params: BOAMPSearchParams): Promise<BOAMPSearchResult> {
    try {
      console.log('[BOAMP Service] Search params:', params);

      const queryString = this.buildQueryString(params);
      const dateFilter = this.buildDateFilter(params);

      console.log('[BOAMP Service] Query string:', queryString);
      console.log('[BOAMP Service] Date filter:', dateFilter);

      const urlParams = new URLSearchParams();

      let whereClause = '';

      if (queryString && dateFilter) {
        whereClause = `${queryString} AND ${dateFilter}`;
      } else if (queryString) {
        whereClause = queryString;
      } else if (dateFilter) {
        whereClause = dateFilter;
      } else {
        whereClause = 'datelimitereponse >= "2024-01-01"';
      }

      urlParams.append('where', whereClause);

      const limit = params.limit || 10;
      const offset = ((params.page || 1) - 1) * limit;

      urlParams.append('limit', limit.toString());
      urlParams.append('offset', offset.toString());

      const sortField = params.sortBy === 'deadline' ? 'datelimitereponse' :
                       params.sortBy === 'amount' ? 'montant' : 'dateparution';
      const sortOrder = params.sortOrder || 'desc';
      urlParams.append('order_by', `${sortField} ${sortOrder}`);

      const edgeFunctionUrl = `${this.getEdgeFunctionUrl()}?${urlParams.toString()}`;

      console.log('[BOAMP Service] Full URL:', edgeFunctionUrl);

      const response = await fetch(edgeFunctionUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      console.log('[BOAMP Service] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[BOAMP Service] Edge Function error:', errorData);
        throw new Error(`BOAMP API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('[BOAMP Service] Data received:', data);

      if (data.results && data.results.length > 0) {
        console.log('[BOAMP Service] ========== STRUCTURE COMPLETE DU PREMIER ENREGISTREMENT ==========');
        console.log(JSON.stringify(data.results[0], null, 2));
        console.log('[BOAMP Service] ========== LISTE DE TOUS LES CHAMPS ==========');
        console.log(Object.keys(data.results[0]).sort().join('\n'));
        console.log('[BOAMP Service] ========== FIN ==========');
      }

      const markets: BOAMPMarket[] = (data.results || []).map((record: any) => {
        const fields = record;

        const buyer = fields.nomacheteur || 'Non spécifié';

        const location = this.formatLocation(fields);

        const serviceType = fields.nature_categorise_libelle ||
                           fields.nature_libelle ||
                           fields.type_marche ||
                           'Non spécifié';

        let dceUrl = undefined;
        if (fields.donnees) {
          try {
            const donnees = typeof fields.donnees === 'string' ? JSON.parse(fields.donnees) : fields.donnees;
            dceUrl = donnees?.liens_vers_dce || donnees?.urlDce || donnees?.url_dce;
          } catch (e) {
            console.error('[BOAMP Service] Error parsing donnees field:', e);
          }
        }

        console.log('[BOAMP Service] Extracted data for record:', {
          buyer,
          location,
          serviceType,
          dceUrl,
          availableFields: Object.keys(fields)
        });

        return {
          id: fields.idweb || record.record_id || `boamp-${Date.now()}-${Math.random()}`,
          reference: fields.idweb || fields.reference || 'N/A',
          title: fields.objet || 'Sans titre',
          client: buyer,
          description: fields.texte || fields.objet || '',
          deadline: fields.datelimitereponse || '',
          amount: fields.montant ? parseFloat(fields.montant) : undefined,
          location,
          publicationDate: fields.dateparution || '',
          procedureType: fields.procedure_libelle || fields.type_procedure || 'Non spécifié',
          serviceType,
          cpvCode: fields.descripteur_code || fields.dc,
          url: fields.url_avis || `https://www.boamp.fr/avis/detail/${fields.idweb}`,
          dceUrl,
          rawData: fields
        };
      });

      const total = data.total_count || markets.length;
      const totalPages = Math.ceil(total / limit);

      return {
        markets,
        total,
        page: params.page || 1,
        totalPages
      };

    } catch (error) {
      console.error('[BOAMP Service] Error searching markets:', error);
      throw error;
    }
  }

  private formatLocation(fields: any): string {
    const parts: string[] = [];

    const dept = fields.code_departement || fields.code_departement_prestation;

    if (dept) {
      parts.push(`Dép. ${dept}`);
    }

    const locationStr = parts.length > 0 ? parts.join(' ') : 'Non spécifié';

    console.log('[BOAMP Service] Location extracted:', {
      dept,
      result: locationStr
    });

    return locationStr;
  }

  async getMarketByReference(reference: string): Promise<BOAMPMarket | null> {
    try {
      const result = await this.searchMarkets({ reference, limit: 1 });
      return result.markets.length > 0 ? result.markets[0] : null;
    } catch (error) {
      console.error('[BOAMP Service] Error getting market by reference:', error);
      return null;
    }
  }

  async searchManualMarkets(params: BOAMPSearchParams): Promise<BOAMPMarket[]> {
    try {
      let query = supabase
        .from('manual_markets')
        .select('*')
        .eq('status', 'published');

      if (params.keywords) {
        const keywords = params.keywords.toLowerCase();
        query = query.or(`title.ilike.%${keywords}%,client.ilike.%${keywords}%,description.ilike.%${keywords}%`);
      }

      if (params.location && params.location.length > 0) {
        const locationFilters = params.location.map(loc => `location.ilike.%${loc}%`).join(',');
        query = query.or(locationFilters);
      }

      if (params.serviceTypes && params.serviceTypes.length > 0) {
        query = query.in('service_type', params.serviceTypes);
      }

      if (params.publicBuyer) {
        query = query.ilike('client', `%${params.publicBuyer}%`);
      }

      if (params.deadlineFrom) {
        query = query.gte('deadline', params.deadlineFrom);
      }

      if (params.deadlineTo) {
        query = query.lte('deadline', params.deadlineTo);
      }

      if (params.amountMin !== undefined) {
        query = query.gte('amount', params.amountMin);
      }

      if (params.amountMax !== undefined) {
        query = query.lte('amount', params.amountMax);
      }

      const sortField = params.sortBy === 'deadline' ? 'deadline' :
                       params.sortBy === 'amount' ? 'amount' : 'publication_date';
      const ascending = params.sortOrder === 'asc';
      query = query.order(sortField, { ascending, nullsFirst: false });

      const { data, error } = await query;

      if (error) {
        console.error('[BOAMP Service] Error searching manual markets:', error);
        return [];
      }

      return (data || []).map(record => ({
        id: `manual-${record.id}`,
        reference: record.reference || `MAN-${record.id.substring(0, 8)}`,
        title: record.title,
        client: record.client,
        description: record.description || '',
        deadline: record.deadline || '',
        amount: record.amount ? parseFloat(record.amount) : undefined,
        location: record.location || 'Non specifie',
        publicationDate: record.publication_date || '',
        procedureType: record.procedure_type || 'Non specifie',
        serviceType: record.service_type || 'Non specifie',
        cpvCode: record.cpv_code,
        url: record.url || '',
        dceUrl: record.dce_url,
        rawData: { ...record, source: 'manual', isManualMarket: true }
      }));
    } catch (error) {
      console.error('[BOAMP Service] Error in searchManualMarkets:', error);
      return [];
    }
  }

  async searchMarketsWithManual(params: BOAMPSearchParams): Promise<BOAMPSearchResult> {
    try {
      const boampResult = await this.searchMarkets(params);

      const deduplicationResult = await DeduplicationService.deduplicateMarkets(
        boampResult.markets,
        true
      );

      const convertedManualMarkets: BOAMPMarket[] = deduplicationResult.manualMarkets.map(record => ({
        id: record.id,
        reference: record.reference,
        title: record.title,
        client: record.client,
        description: record.description || '',
        deadline: record.deadline || '',
        amount: record.amount ? parseFloat(record.amount) : undefined,
        location: record.location || 'Non specifie',
        publicationDate: record.publication_date || '',
        procedureType: record.procedure_type || 'Non specifie',
        serviceType: record.service_type || 'Non specifie',
        cpvCode: record.cpv_code,
        url: record.url || '',
        dceUrl: record.dce_url,
        rawData: { ...record, source: 'manual', isManualMarket: true }
      }));

      const allMarkets = [...deduplicationResult.boampMarkets, ...convertedManualMarkets];

      const sortField = params.sortBy || 'publication_date';
      const sortOrder = params.sortOrder || 'desc';

      allMarkets.sort((a, b) => {
        let valueA: any, valueB: any;

        if (sortField === 'deadline') {
          valueA = a.deadline ? new Date(a.deadline).getTime() : 0;
          valueB = b.deadline ? new Date(b.deadline).getTime() : 0;
        } else if (sortField === 'amount') {
          valueA = a.amount || 0;
          valueB = b.amount || 0;
        } else {
          valueA = a.publicationDate ? new Date(a.publicationDate).getTime() : 0;
          valueB = b.publicationDate ? new Date(b.publicationDate).getTime() : 0;
        }

        if (sortOrder === 'asc') {
          return valueA - valueB;
        }
        return valueB - valueA;
      });

      const total = boampResult.total + convertedManualMarkets.length;
      const limit = params.limit || 20;

      console.log(`[BOAMP Service] Déduplication: ${deduplicationResult.removedDuplicates} doublon(s) manuel(s) supprimé(s)`);

      return {
        markets: allMarkets,
        total,
        page: params.page || 1,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('[BOAMP Service] Error in searchMarketsWithManual:', error);
      throw error;
    }
  }

  async getSchema(): Promise<any> {
    try {
      const apiUrl = `${this.getEdgeFunctionUrl()}?action=get_schema`;
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch schema: ${response.status}`);
      }

      const schema = await response.json();
      console.log('[BOAMP Service] Schema received:', schema);

      if (schema.fields) {
        console.log('[BOAMP Service] Available fields:', schema.fields.map((f: any) => f.name).sort().join(', '));
      }

      return schema;
    } catch (error) {
      console.error('[BOAMP Service] Error fetching schema:', error);
      throw error;
    }
  }
}

export const boampService = new BOAMPService();
