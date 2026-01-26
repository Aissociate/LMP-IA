import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: markets, error } = await supabase
      .from('public_markets')
      .select('slug, updated_at, publication_date')
      .eq('department', '974')
      .eq('is_public', true)
      .order('publication_date', { ascending: false });

    if (error) throw error;

    const baseUrl = 'https://lemarchepublic.fr';

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/marchepublics/974</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${markets?.map(market => `  <url>
    <loc>${baseUrl}/marchepublics/974/${market.slug}</loc>
    <lastmod>${new Date(market.updated_at || market.publication_date).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>`;

    return new Response(sitemap, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error: any) {
    console.error('[Sitemap Generation] Error:', error);

    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to generate sitemap',
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
