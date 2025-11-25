import { createClient } from 'jsr:@supabase/supabase-js@2';
import Stripe from 'npm:stripe@14';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, stripe-signature',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2023-10-16',
  });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  if (!signature || !webhookSecret) {
    return new Response(
      JSON.stringify({ error: 'Missing signature or webhook secret' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Webhook event type:', event.type);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId || !subscriptionId) {
          console.error('Missing user_id or subscription_id in metadata');
          break;
        }

        // Récupérer l'abonnement Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0].price.id;

        // Trouver le plan correspondant
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('stripe_price_id', priceId)
          .single();

        if (!plan) {
          console.error('Plan not found for price_id:', priceId);
          break;
        }

        // Créer ou mettre à jour l'abonnement utilisateur
        const { error: subError } = await supabase
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_id: plan.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (subError) {
          console.error('Error upserting subscription:', subError);
          break;
        }

        // Réinitialiser le compteur mensuel
        const { error: resetError } = await supabase.rpc('reset_monthly_usage', {
          p_user_id: userId,
          p_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          p_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });

        if (resetError) {
          console.error('Error resetting usage:', resetError);
        }

        console.log('Subscription created/updated for user:', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;

        // Trouver le plan
        const { data: plan } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('stripe_price_id', priceId)
          .single();

        if (!plan) {
          console.error('Plan not found for price_id:', priceId);
          break;
        }

        // Mettre à jour l'abonnement
        const { error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            plan_id: plan.id,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          break;
        }

        console.log('Subscription updated:', subscription.id);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        // Mettre à jour le statut
        const { error: deleteError } = await supabase
          .from('user_subscriptions')
          .update({
            status: 'canceled',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id);

        if (deleteError) {
          console.error('Error canceling subscription:', deleteError);
          break;
        }

        console.log('Subscription canceled:', subscription.id);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;

        if (!subscriptionId) break;

        // Récupérer l'abonnement
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        // Récupérer l'user_id depuis l'abonnement
        const { data: userSub } = await supabase
          .from('user_subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscriptionId)
          .single();

        if (!userSub) {
          console.error('User subscription not found');
          break;
        }

        // Réinitialiser le compteur pour la nouvelle période
        const { error: resetError } = await supabase.rpc('reset_monthly_usage', {
          p_user_id: userSub.user_id,
          p_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          p_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        });

        if (resetError) {
          console.error('Error resetting usage on payment:', resetError);
        }

        console.log('Usage reset for user:', userSub.user_id);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});