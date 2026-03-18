import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const ADMIN_USER = 'admin';
const SALT = 'iris_prospects_2024';
const GHL_API_URL = 'https://services.leadconnectorhq.com/contacts/';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const adminPassword = Deno.env.get('PROSPECTS_ADMIN_PASSWORD') || 'LMP974#';
  const expectedHash = await hashPassword(adminPassword);
  const providedHash = await hashPassword(password);
  return username === ADMIN_USER && providedHash === expectedHash;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { username, password, action } = body;

    if (!username || !password) {
      return new Response(JSON.stringify({ error: 'Identifiants requis' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const valid = await verifyCredentials(username, password);
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Identifiants incorrects' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    if (action === 'sync_ghl') {
      const { lead_id } = body;
      if (!lead_id) {
        return new Response(JSON.stringify({ error: 'lead_id requis' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: lead, error: fetchError } = await supabase
        .from('lead_captures')
        .select('*')
        .eq('id', lead_id)
        .single();

      if (fetchError || !lead) {
        return new Response(JSON.stringify({ error: 'Prospect introuvable' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const GHL_API_KEY = Deno.env.get('GHL_API_KEY');
      const GHL_LOCATION_ID = Deno.env.get('GHL_LOCATION_ID');

      if (!GHL_API_KEY || !GHL_LOCATION_ID) {
        return new Response(JSON.stringify({ error: 'Clés GHL manquantes (GHL_API_KEY, GHL_LOCATION_ID)' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const customFields: { key: string; field_value: string }[] = [];
      if (lead.company_name) customFields.push({ key: 'company_name', field_value: lead.company_name });
      if (lead.siret) customFields.push({ key: 'siret', field_value: lead.siret });
      if (lead.naf_code) customFields.push({ key: 'naf_code', field_value: lead.naf_code });
      if (lead.legal_form) customFields.push({ key: 'legal_form', field_value: lead.legal_form });
      if (lead.main_activity) customFields.push({ key: 'main_activity', field_value: lead.main_activity });
      if (lead.workforce_range) customFields.push({ key: 'workforce_range', field_value: lead.workforce_range });
      if (lead.turnover_range) customFields.push({ key: 'turnover_range', field_value: lead.turnover_range });
      if (lead.city) customFields.push({ key: 'city', field_value: lead.city });
      if (lead.postal_code) customFields.push({ key: 'postal_code', field_value: lead.postal_code });
      if (lead.website) customFields.push({ key: 'website', field_value: lead.website });

      const ghlPayload = {
        firstName: lead.first_name || '',
        lastName: lead.last_name || '',
        email: lead.email || '',
        phone: lead.phone || '',
        companyName: lead.company_name || '',
        address1: lead.address || '',
        city: lead.city || '',
        postalCode: lead.postal_code || '',
        website: lead.website || '',
        locationId: GHL_LOCATION_ID,
        tags: ['iris-prospect', 'admin-sync'],
        source: 'Admin Prospects',
        customFields: customFields.length > 0 ? customFields : undefined,
      };

      const ghlRes = await fetch(GHL_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GHL_API_KEY}`,
          'Content-Type': 'application/json',
          'Version': '2021-07-28',
        },
        body: JSON.stringify(ghlPayload),
      });

      const ghlResult = await ghlRes.json();

      if (!ghlRes.ok) {
        console.error('GHL error:', ghlResult);
        return new Response(JSON.stringify({ error: 'Erreur GoHighLevel', details: ghlResult }), {
          status: ghlRes.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      await supabase
        .from('lead_captures')
        .update({ status: 'contacte', updated_at: new Date().toISOString() })
        .eq('id', lead_id);

      return new Response(JSON.stringify({ success: true, ghl_contact: ghlResult }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data, error } = await supabase
      .from('lead_captures')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('DB error:', error);
      return new Response(JSON.stringify({ error: 'Erreur base de données' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ leads: data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('Edge function error:', message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
