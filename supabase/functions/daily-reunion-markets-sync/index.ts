import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BOAMP_API_BASE = 'https://www.boamp.fr/api/explore/v2.1/catalog/datasets/boamp/records';

interface BOAMPRecord {
  idweb?: string;
  objet?: string;
  nomacheteur?: string;
  datelimitereponse?: string;
  dateparution?: string;
  montant?: number;
  code_departement?: string | string[];
  descripteur_code?: string | string[];
  procedure_libelle?: string;
  type_procedure?: string;
  typeannonce?: string;
  nature_categorise_libelle?: string;
  url_avis?: string;
  [key: string]: any;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const startTime = Date.now();
  let marketsFound = 0;
  let marketsInserted = 0;
  let marketsUpdated = 0;
  const errors: any[] = [];

  try {
    console.log('[Reunion Sync] Starting daily synchronization for La Réunion 974...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date().toISOString().split('T')[0];

    const boampUrl = new URL(BOAMP_API_BASE);
    boampUrl.searchParams.append('where', `code_departement="974" AND datelimitereponse >= date'${today}'`);
    boampUrl.searchParams.append('order_by', 'dateparution DESC');
    boampUrl.searchParams.append('limit', '100');
    boampUrl.searchParams.append('offset', '0');

    console.log('[Reunion Sync] Fetching from BOAMP:', boampUrl.toString());

    const response = await fetch(boampUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MonMarchePublic-Sync/1.0'
      },
    });

    if (!response.ok) {
      throw new Error(`BOAMP API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const records: BOAMPRecord[] = data.results || [];

    marketsFound = records.length;
    console.log(`[Reunion Sync] Found ${marketsFound} active markets for La Réunion`);

    for (const record of records) {
      try {
        const reference = record.idweb || `boamp-${Date.now()}-${Math.random()}`;

        const { data: existing } = await supabase
          .from('public_markets')
          .select('id')
          .eq('reference', reference)
          .maybeSingle();

        const marketData = {
          source: 'boamp',
          reference,
          title: record.objet || 'Sans titre',
          client: record.nomacheteur || 'Non spécifié',
          description: record.objet || '',
          deadline: record.datelimitereponse || null,
          amount: record.montant || null,
          location: 'La Réunion',
          publication_date: record.dateparution || new Date().toISOString(),
          procedure_type: record.procedure_libelle || record.type_procedure || null,
          service_type: record.nature_categorise_libelle || null,
          cpv_code: Array.isArray(record.descripteur_code) ? record.descripteur_code.join(', ') : record.descripteur_code || null,
          url: record.url_avis || null,
          dce_url: null,
          department: '974',
          is_public: true,
          raw_data: record,
        };

        if (existing) {
          const { error: updateError } = await supabase
            .from('public_markets')
            .update(marketData)
            .eq('id', existing.id);

          if (updateError) {
            console.error(`[Reunion Sync] Error updating market ${reference}:`, updateError);
            errors.push({ reference, error: updateError.message });
          } else {
            marketsUpdated++;
            console.log(`[Reunion Sync] Updated market: ${reference}`);
          }
        } else {
          const { error: insertError } = await supabase
            .from('public_markets')
            .insert(marketData);

          if (insertError) {
            console.error(`[Reunion Sync] Error inserting market ${reference}:`, insertError);
            errors.push({ reference, error: insertError.message });
          } else {
            marketsInserted++;
            console.log(`[Reunion Sync] Inserted new market: ${reference}`);
          }
        }
      } catch (recordError: any) {
        console.error('[Reunion Sync] Error processing record:', recordError);
        errors.push({ record: record.record_id, error: recordError.message });
      }
    }

    const executionTime = Date.now() - startTime;
    const status = errors.length > 0 ? (marketsInserted > 0 || marketsUpdated > 0 ? 'partial' : 'error') : 'success';

    const { error: logError } = await supabase
      .from('market_sync_logs')
      .insert({
        markets_found: marketsFound,
        markets_inserted: marketsInserted,
        markets_updated: marketsUpdated,
        errors: errors.length > 0 ? errors : null,
        status,
        execution_time_ms: executionTime,
      });

    if (logError) {
      console.error('[Reunion Sync] Error logging sync results:', logError);
    }

    console.log(`[Reunion Sync] Completed in ${executionTime}ms - Status: ${status}`);
    console.log(`[Reunion Sync] Summary: ${marketsFound} found, ${marketsInserted} inserted, ${marketsUpdated} updated, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: status !== 'error',
        status,
        summary: {
          marketsFound,
          marketsInserted,
          marketsUpdated,
          errors: errors.length,
          executionTimeMs: executionTime,
        },
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: status === 'error' ? 500 : 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: any) {
    console.error('[Reunion Sync] Fatal error:', error);

    const executionTime = Date.now() - startTime;

    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from('market_sync_logs')
        .insert({
          markets_found: marketsFound,
          markets_inserted: marketsInserted,
          markets_updated: marketsUpdated,
          errors: [{ error: error.message, stack: error.stack }],
          status: 'error',
          execution_time_ms: executionTime,
        });
    } catch (logError) {
      console.error('[Reunion Sync] Error logging fatal error:', logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Sync failed',
        details: error.toString(),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
