import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BOAMP_API_BASE = 'https://www.boamp.fr/api/explore/v2.1/catalog/datasets/boamp/records';
const BOAMP_DATASET_INFO = 'https://www.boamp.fr/api/explore/v2.1/catalog/datasets/boamp';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    if (searchParams.get('action') === 'get_schema') {
      console.log('[BOAMP Search] Fetching dataset schema...');
      const schemaResponse = await fetch(BOAMP_DATASET_INFO);
      const schemaData = await schemaResponse.json();
      return new Response(
        JSON.stringify(schemaData),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    console.log('[BOAMP Search] Received params:', Object.fromEntries(searchParams.entries()));

    const boampUrl = new URL(BOAMP_API_BASE);

    for (const [key, value] of searchParams.entries()) {
      boampUrl.searchParams.append(key, value);
    }

    console.log('[BOAMP Search] Fetching URL:', boampUrl.toString());

    const response = await fetch(boampUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MonMarchePublic/1.0'
      },
    });

    console.log('[BOAMP Search] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[BOAMP Search] API error:', response.status, response.statusText);
      console.error('[BOAMP Search] Error body:', errorText);
      throw new Error(`BOAMP API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[BOAMP Search] Results count:', data.total_count || 0);

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('[BOAMP Search] Error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Error fetching BOAMP data',
        details: error.toString()
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