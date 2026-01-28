import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const COLLECTOR_PASSWORD = 'lemarchepublic974#';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { password, action, data, marketId } = await req.json();

    // Verify password
    if (password !== COLLECTOR_PASSWORD) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid password' }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create Supabase client with service role for admin access
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    let result;

    switch (action) {
      case 'list':
        result = await supabaseAdmin
          .from('public_markets')
          .select('*')
          .eq('source', 'manual')
          .order('created_at', { ascending: false });
        break;

      case 'listDonneursOrdre':
        result = await supabaseAdmin
          .from('manual_markets_donneurs_ordre')
          .select('*')
          .order('name');
        break;

      case 'insert':
        result = await supabaseAdmin
          .from('public_markets')
          .insert([data])
          .select();
        break;

      case 'update':
        if (!marketId) {
          throw new Error('Market ID required for update');
        }
        result = await supabaseAdmin
          .from('public_markets')
          .update(data)
          .eq('id', marketId)
          .select();
        break;

      case 'delete':
        if (!marketId) {
          throw new Error('Market ID required for delete');
        }
        result = await supabaseAdmin
          .from('public_markets')
          .delete()
          .eq('id', marketId);
        break;

      case 'publish':
        if (!marketId) {
          throw new Error('Market ID required for publish');
        }
        result = await supabaseAdmin
          .from('public_markets')
          .update({ is_public: true })
          .eq('id', marketId)
          .select();
        break;

      case 'archive':
        if (!marketId) {
          throw new Error('Market ID required for archive');
        }
        result = await supabaseAdmin
          .from('public_markets')
          .update({ is_public: false })
          .eq('id', marketId)
          .select();
        break;

      case 'insertDonneurOrdre':
        result = await supabaseAdmin
          .from('manual_markets_donneurs_ordre')
          .insert([data])
          .select();
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (result.error) {
      throw result.error;
    }

    return new Response(
      JSON.stringify({ success: true, data: result.data }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error in market-collector-save:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
