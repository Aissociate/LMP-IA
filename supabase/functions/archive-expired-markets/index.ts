import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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

  try {
    console.log('[Archive Expired] Starting archive of expired markets...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date().toISOString();

    const { data: expiredMarkets, error: selectError } = await supabase
      .from('public_markets')
      .select('id, reference, title')
      .eq('is_public', true)
      .lt('deadline', now);

    if (selectError) {
      throw new Error(`Error selecting expired markets: ${selectError.message}`);
    }

    const expiredCount = expiredMarkets?.length || 0;
    console.log(`[Archive Expired] Found ${expiredCount} expired markets (not archiving, keeping public for SEO)`);

    // DO NOT archive expired markets - keep them public for SEO and historical reference
    // if (expiredCount > 0) {
    //   const { error: updateError } = await supabase
    //     .from('public_markets')
    //     .update({ is_public: false })
    //     .eq('is_public', true)
    //     .lt('deadline', now);
    //
    //   if (updateError) {
    //     throw new Error(`Error archiving markets: ${updateError.message}`);
    //   }
    //
    //   console.log(`[Archive Expired] Successfully archived ${expiredCount} markets`);
    // }

    const executionTime = Date.now() - startTime;

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          marketsArchived: expiredCount,
          executionTimeMs: executionTime,
        },
        archivedMarkets: expiredMarkets?.map(m => ({
          reference: m.reference,
          title: m.title,
        })),
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error: any) {
    console.error('[Archive Expired] Error:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Archive failed',
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
