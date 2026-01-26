import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const startTime = Date.now();
  const results: any = {
    syncMarkets: null,
    archiveExpired: null,
  };
  const errors: string[] = [];

  try {
    console.log('[Init Database] Starting database initialization...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    console.log('[Init Database] Step 1: Syncing La Réunion markets from BOAMP...');
    try {
      const syncResponse = await fetch(
        `${supabaseUrl}/functions/v1/daily-reunion-markets-sync`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (syncResponse.ok) {
        results.syncMarkets = await syncResponse.json();
        console.log('[Init Database] Markets sync completed:', results.syncMarkets);
      } else {
        const errorText = await syncResponse.text();
        errors.push(`Market sync failed: ${syncResponse.status} - ${errorText}`);
        console.error('[Init Database] Market sync failed:', errorText);
      }
    } catch (syncError: any) {
      errors.push(`Market sync error: ${syncError.message}`);
      console.error('[Init Database] Market sync error:', syncError);
    }

    console.log('[Init Database] Step 2: Archiving expired markets...');
    try {
      const archiveResponse = await fetch(
        `${supabaseUrl}/functions/v1/archive-expired-markets`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (archiveResponse.ok) {
        results.archiveExpired = await archiveResponse.json();
        console.log('[Init Database] Archive completed:', results.archiveExpired);
      } else {
        const errorText = await archiveResponse.text();
        errors.push(`Archive failed: ${archiveResponse.status} - ${errorText}`);
        console.error('[Init Database] Archive failed:', errorText);
      }
    } catch (archiveError: any) {
      errors.push(`Archive error: ${archiveError.message}`);
      console.error('[Init Database] Archive error:', archiveError);
    }

    const executionTime = Date.now() - startTime;
    const success = errors.length === 0;

    console.log(`[Init Database] Initialization ${success ? 'completed successfully' : 'completed with errors'} in ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        success,
        message: success
          ? 'Database initialized successfully'
          : 'Database initialization completed with some errors',
        executionTimeMs: executionTime,
        results,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: success ? 200 : 207,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: any) {
    console.error('[Init Database] Fatal error:', error);
    const executionTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Initialization failed',
        details: error.toString(),
        executionTimeMs: executionTime,
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
