import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Bolt Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    // Validation de sécurité de base
    const userAgent = req.headers.get('user-agent');
    if (!userAgent || !userAgent.includes('Stripe')) {
      console.warn(`Suspicious request without Stripe user-agent: ${userAgent}`);
      return new Response('Forbidden', { status: 403 });
    }

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.warn('Webhook request without signature');
      return new Response('No signature found', { status: 400 });
    }

    // Validation de la signature
    if (!signature.includes('t=') || !signature.includes('v1=')) {
      console.warn('Invalid signature format');
      return new Response('Invalid signature format', { status: 400 });
    }

    // get the raw body
    const body = await req.text();
    
    // Validation taille du body (protection DoS)
    if (body.length > 1024 * 1024) { // 1MB max
      console.warn(`Webhook body too large: ${body.length} bytes`);
      return new Response('Payload too large', { status: 413 });
    }

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      // Log pour monitoring mais ne pas exposer les détails
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    // Validation de l'événement
    if (!event.id || !event.type || !event.data) {
      console.warn('Invalid webhook event structure');
      return new Response('Invalid event structure', { status: 400 });
    }
    
    // Limitation des types d'événements traités (principe du moindre privilège)
    const allowedEventTypes = [
      'checkout.session.completed',
      'customer.subscription.created',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
      'payment_intent.succeeded'
    ];
    
    if (!allowedEventTypes.includes(event.type)) {
      console.info(`Ignored event type: ${event.type}`);
      return Response.json({ received: true, ignored: true });
    }

    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  try {
    const stripeData = event?.data?.object ?? {};

    if (!stripeData) {
      console.warn('Empty stripe data in event');
      return;
    }

    if (!('customer' in stripeData)) {
      console.warn('No customer in stripe data');
      return;
    }

    // for one time payments, we only listen for the checkout.session.completed event
    if (event.type === 'payment_intent.succeeded' && event.data.object.invoice === null) {
      return;
    }

    const { customer: customerId } = stripeData;

    if (!customerId || typeof customerId !== 'string') {
      console.error(`No customer received on event: ${JSON.stringify(event)}`);
      return;
    } else {
      // Validation du customer ID
      if (!customerId.startsWith('cus_') || customerId.length < 10) {
        console.error(`Invalid customer ID format: ${customerId}`);
        return;
      }
      
      let isSubscription = true;

      if (event.type === 'checkout.session.completed') {
        const { mode } = stripeData as Stripe.Checkout.Session;

        isSubscription = mode === 'subscription';

        console.info(`Processing ${isSubscription ? 'subscription' : 'one-time payment'} checkout session`);
      }

      const { mode, payment_status } = stripeData as Stripe.Checkout.Session;

      if (isSubscription) {
        console.info(`Starting subscription sync for customer: ${customerId}`);
        await syncCustomerFromStripe(customerId);

        if (event.type === 'checkout.session.completed') {
          await processMetadataAddons(stripeData as Stripe.Checkout.Session, customerId);
        }
      } else if (mode === 'payment' && payment_status === 'paid') {
        try {
          const {
            id: checkout_session_id,
            payment_intent,
            amount_subtotal,
            amount_total,
            currency,
          } = stripeData as Stripe.Checkout.Session;

          const { error: orderError } = await supabase.from('stripe_orders').insert({
            checkout_session_id,
            payment_intent_id: payment_intent,
            customer_id: customerId,
            amount_subtotal,
            amount_total,
            currency,
            payment_status,
            status: 'completed',
          });

          if (orderError) {
            console.error('Error inserting order:', orderError);
            return;
          }

          await processMetadataAddons(stripeData as Stripe.Checkout.Session, customerId);

          console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
        } catch (error) {
          console.error('Error processing one-time payment:', error);
        }
      }
    }
  } catch (error) {
    console.error('Error in handleEvent:', error);
    // Ne pas faire remonter l'erreur pour éviter les retry infinis
  }
}

async function processMetadataAddons(session: Stripe.Checkout.Session, customerId: string) {
  try {
    const metadata = session.metadata || {};
    const userId = metadata.user_id;
    const addonTypes = metadata.addon_types ? metadata.addon_types.split(',') : [];
    const planId = metadata.plan_id;

    if (!userId) {
      console.warn('No user_id in metadata, skipping addon processing');
      return;
    }

    const { data: customer } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .maybeSingle();

    const actualUserId = customer?.user_id || userId;

    if (!addonTypes || addonTypes.length === 0) {
      console.info('No addons in metadata');
      return;
    }

    console.info(`Processing ${addonTypes.length} addon(s) for user ${actualUserId}: ${addonTypes.join(', ')}`);

    for (const addonType of addonTypes) {
      if (!addonType.trim()) continue;

      const { data: addonInfo } = await supabase
        .from('addon_catalog')
        .select('*')
        .eq('addon_type', addonType.trim())
        .maybeSingle();

      if (!addonInfo) {
        console.error(`Addon not found in catalog: ${addonType}`);
        continue;
      }

      const { error: insertError } = await supabase
        .from('subscription_addons')
        .insert({
          user_id: actualUserId,
          addon_type: addonInfo.addon_type,
          addon_name: addonInfo.addon_name,
          price_cents: addonInfo.price_cents,
          is_recurring: addonInfo.is_recurring,
          quantity: 1,
          status: 'active'
        });

      if (insertError) {
        console.error(`Error inserting addon ${addonType}:`, insertError);
        continue;
      }

      if (addonType.trim() === 'extra_memory') {
        const monthYear = new Date().toISOString().slice(0, 7);
        const { error: updateError } = await supabase.rpc('increment_extra_memories', {
          p_user_id: actualUserId,
          p_month_year: monthYear,
          p_quantity: 1
        });

        if (updateError) {
          console.error('Error updating extra memories:', updateError);
        }
      }

      if (addonType.trim() === 'market_pro') {
        const monthYear = new Date().toISOString().slice(0, 7);
        const { error: updateError } = await supabase
          .from('monthly_memory_usage')
          .update({ market_pro_enabled: true })
          .eq('user_id', actualUserId)
          .eq('month_year', monthYear);

        if (updateError) {
          console.error('Error enabling market pro:', updateError);
        }
      }

      console.info(`Successfully added addon ${addonType} for user ${actualUserId}`);
    }

    if (planId) {
      const { error: updatePlanError } = await supabase
        .from('user_subscriptions')
        .update({ plan_id: planId })
        .eq('user_id', actualUserId);

      if (updatePlanError) {
        console.error('Error updating user plan:', updatePlanError);
      } else {
        console.info(`Updated user ${actualUserId} to plan ${planId}`);
      }
    }
  } catch (error) {
    console.error('Error processing metadata addons:', error);
  }
}

// based on the excellent https://github.com/t3dotgg/stripe-recommendations
async function syncCustomerFromStripe(customerId: string) {
  try {
    // fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    // TODO verify if needed
    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
    }

    // assumes that a customer can only have a single subscription
    const subscription = subscriptions.data[0];

    // store subscription state
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}