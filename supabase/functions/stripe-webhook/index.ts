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
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204 });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    const body = await req.text();

    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
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
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription && session.customer) {
          const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
          const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          console.info(`Checkout completed for customer ${customerId}, subscription ${subscriptionId}`);
          await syncSubscriptionById(customerId, subscriptionId);
        } else if (session.mode === 'payment' && session.payment_status === 'paid') {
          await handleOneTimePayment(session);
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        console.info(`Subscription ${event.type} for customer ${customerId}, subscription ${subscription.id}`);
        await upsertSubscriptionData(customerId, subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && invoice.customer) {
          const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
          const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
          console.info(`Invoice paid for customer ${customerId}, refreshing subscription ${subscriptionId}`);
          await syncSubscriptionById(customerId, subscriptionId);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription && invoice.customer) {
          const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id;
          const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription.id;
          console.info(`Invoice payment failed for customer ${customerId}, refreshing subscription ${subscriptionId}`);
          await syncSubscriptionById(customerId, subscriptionId);
        }
        break;
      }

      default:
        console.info(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling event ${event.type}:`, error);
  }
}

async function syncSubscriptionById(customerId: string, subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['default_payment_method'],
    });

    await upsertSubscriptionData(customerId, subscription);
  } catch (error) {
    console.error(`Failed to retrieve subscription ${subscriptionId}:`, error);

    await retryWithList(customerId);
  }
}

async function upsertSubscriptionData(customerId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price?.id ?? null;

  const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
    {
      customer_id: customerId,
      subscription_id: subscription.id,
      price_id: priceId,
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

  console.info(`Successfully synced subscription ${subscription.id} (status: ${subscription.status}) for customer ${customerId}`);
}

async function retryWithList(customerId: string) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await new Promise(resolve => setTimeout(resolve, attempt * 2000));

    try {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        limit: 1,
        status: 'all',
        expand: ['data.default_payment_method'],
      });

      if (subscriptions.data.length > 0) {
        await upsertSubscriptionData(customerId, subscriptions.data[0]);
        return;
      }
    } catch (error) {
      console.error(`Retry attempt ${attempt} failed for customer ${customerId}:`, error);
    }
  }

  console.error(`All retry attempts failed for customer ${customerId}`);
}

async function handleOneTimePayment(session: Stripe.Checkout.Session) {
  try {
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;

    const { error: orderError } = await supabase.from('stripe_orders').insert({
      checkout_session_id: session.id,
      payment_intent_id: session.payment_intent,
      customer_id: customerId,
      amount_subtotal: session.amount_subtotal,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      status: 'completed',
    });

    if (orderError) {
      console.error('Error inserting order:', orderError);
      return;
    }

    console.info(`Successfully processed one-time payment for session: ${session.id}`);
  } catch (error) {
    console.error('Error processing one-time payment:', error);
  }
}
