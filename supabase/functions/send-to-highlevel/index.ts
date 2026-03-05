import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';

interface ContactPayload {
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  companyName?: string;
  tags?: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const GHL_API_KEY = Deno.env.get('GHL_API_KEY');
    const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID');

    if (!GHL_API_KEY || !GHL_LOCATION_ID) {
      console.error('Missing GHL environment variables');
      return new Response(JSON.stringify({ error: 'Configuration manquante' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: ContactPayload = await req.json();

    if (!body.email) {
      return new Response(JSON.stringify({ error: 'Email requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ghlPayload = {
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      email: body.email,
      phone: body.phone || '',
      companyName: body.companyName || '',
      locationId: GHL_LOCATION_ID,
      tags: body.tags || ['iris-lead'],
      source: 'Iris Platform',
    };

    const response = await fetch(GHL_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GHL_API_KEY}`,
        'Content-Type': 'application/json',
        'Version': '2021-07-28',
      },
      body: JSON.stringify(ghlPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('GHL API error:', result);
      return new Response(JSON.stringify({ error: 'Erreur GoHighLevel', details: result }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, contact: result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
