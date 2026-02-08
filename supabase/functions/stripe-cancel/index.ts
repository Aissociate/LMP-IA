import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  appInfo: { name: 'Bolt Integration', version: '1.0.0' },
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function corsResponse(body: object | null, status = 200) {
  if (status === 204) {
    return new Response(null, { status, headers: corsHeaders });
  }
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return corsResponse({ error: 'Missing authorization header' }, 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return corsResponse({ error: 'Unauthorized' }, 401);
    }

    const { action } = await req.json();

    const { data: customer, error: customerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (customerError || !customer?.customer_id) {
      return corsResponse({ error: 'No Stripe customer found' }, 404);
    }

    const { data: subRecord, error: subError } = await supabase
      .from('stripe_subscriptions')
      .select('subscription_id, status')
      .eq('customer_id', customer.customer_id)
      .maybeSingle();

    if (subError || !subRecord?.subscription_id) {
      return corsResponse({ error: 'No active subscription found' }, 404);
    }

    if (action === 'cancel') {
      const updated = await stripe.subscriptions.update(subRecord.subscription_id, {
        cancel_at_period_end: true,
      });

      await supabase
        .from('stripe_subscriptions')
        .update({ cancel_at_period_end: true })
        .eq('customer_id', customer.customer_id);

      return corsResponse({
        success: true,
        message: 'Subscription will be cancelled at period end',
        cancel_at: updated.current_period_end,
      });
    }

    if (action === 'reactivate') {
      await stripe.subscriptions.update(subRecord.subscription_id, {
        cancel_at_period_end: false,
      });

      await supabase
        .from('stripe_subscriptions')
        .update({ cancel_at_period_end: false })
        .eq('customer_id', customer.customer_id);

      return corsResponse({
        success: true,
        message: 'Subscription reactivated',
      });
    }

    return corsResponse({ error: 'Invalid action. Use "cancel" or "reactivate".' }, 400);
  } catch (error: any) {
    console.error('Stripe cancel error:', error);
    return corsResponse({ error: error.message }, 500);
  }
});
