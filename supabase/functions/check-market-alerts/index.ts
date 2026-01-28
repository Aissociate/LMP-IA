import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Cron-Secret",
};

interface SearchAlert {
  id: string;
  user_id: string;
  name: string;
  keywords: string | null;
  location: string[] | null;
  service_types: string[] | null;
  public_buyer: string | null;
  cpv_code: string | null;
  amount_min: number | null;
  amount_max: number | null;
  deadline_from: string | null;
  last_checked_at: string | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const cronSecret = req.headers.get("X-Cron-Secret");
    const expectedSecret = Deno.env.get("CRON_SECRET");

    if (!cronSecret || cronSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: activeAlerts, error: alertsError } = await supabase
      .from("search_alerts")
      .select("*")
      .eq("is_active", true)
      .eq("notification_enabled", true);

    if (alertsError) throw alertsError;

    if (!activeAlerts || activeAlerts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active alerts to check", alerts_checked: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let totalDetections = 0;
    const userDigests: Map<string, any[]> = new Map();

    for (const alert of activeAlerts as SearchAlert[]) {
      try {
        const lastChecked = alert.last_checked_at || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        let query = supabase
          .from("public_markets")
          .select("*")
          .eq("is_public", true)
          .gte("created_at", lastChecked)
          .order("created_at", { ascending: false });

        if (alert.keywords) {
          const keywords = alert.keywords.toLowerCase();
          query = query.or(
            `title.ilike.%${keywords}%,description.ilike.%${keywords}%,client.ilike.%${keywords}%`
          );
        }

        if (alert.location && alert.location.length > 0) {
          const locationFilters = alert.location
            .map((loc) => `location.ilike.%${loc}%`)
            .join(",");
          query = query.or(locationFilters);
        }

        if (alert.service_types && alert.service_types.length > 0) {
          query = query.in("service_type", alert.service_types);
        }

        if (alert.public_buyer) {
          query = query.ilike("client", `%${alert.public_buyer}%`);
        }

        if (alert.cpv_code) {
          query = query.ilike("cpv_code", `%${alert.cpv_code}%`);
        }

        if (alert.amount_min !== null) {
          query = query.gte("amount", alert.amount_min);
        }

        if (alert.amount_max !== null) {
          query = query.lte("amount", alert.amount_max);
        }

        if (alert.deadline_from) {
          query = query.gte("deadline", alert.deadline_from);
        }

        const { data: markets, error: marketsError } = await query.limit(50);

        if (marketsError) {
          console.error(`Error fetching markets for alert ${alert.id}:`, marketsError);
          continue;
        }

        if (markets && markets.length > 0) {
          const { data: existingDetections } = await supabase
            .from("market_alert_detections")
            .select("market_reference")
            .eq("alert_id", alert.id)
            .eq("user_id", alert.user_id)
            .in(
              "market_reference",
              markets.map((m) => m.reference)
            );

          const existingRefs = new Set(existingDetections?.map((d) => d.market_reference) || []);

          const newMarkets = markets.filter((m) => !existingRefs.has(m.reference));

          if (newMarkets.length > 0) {
            const detections = newMarkets.map((market) => ({
              user_id: alert.user_id,
              alert_id: alert.id,
              market_reference: market.reference,
              market_title: market.title,
              market_client: market.client,
              market_description: market.description,
              market_amount: market.amount,
              market_location: market.location,
              market_deadline: market.deadline,
              market_url: market.url,
              market_service_type: market.service_type,
              is_read: false,
              is_favorited: false,
            }));

            const { error: insertError } = await supabase
              .from("market_alert_detections")
              .insert(detections);

            if (insertError) {
              console.error(`Error inserting detections for alert ${alert.id}:`, insertError);
            } else {
              totalDetections += detections.length;

              if (!userDigests.has(alert.user_id)) {
                userDigests.set(alert.user_id, []);
              }

              const userAlerts = userDigests.get(alert.user_id)!;
              const existingAlert = userAlerts.find((a) => a.alert_id === alert.id);

              if (existingAlert) {
                existingAlert.markets.push(...newMarkets);
              } else {
                userAlerts.push({
                  alert_id: alert.id,
                  alert_name: alert.name,
                  markets: newMarkets.map((m) => ({
                    reference: m.reference,
                    title: m.title,
                    client: m.client,
                    description: m.description,
                    amount: m.amount,
                    location: m.location,
                    deadline: m.deadline,
                    url: m.url,
                    service_type: m.service_type,
                  })),
                });
              }
            }
          }
        }

        await supabase
          .from("search_alerts")
          .update({ last_checked_at: new Date().toISOString() })
          .eq("id", alert.id);
      } catch (error) {
        console.error(`Error processing alert ${alert.id}:`, error);
      }
    }

    const currentHour = new Date().getHours();
    const digestType = currentHour >= 8 && currentHour < 12 ? "morning" : "evening";
    const scheduledFor = currentHour < 8
      ? new Date(new Date().setHours(8, 0, 0, 0)).toISOString()
      : currentHour < 18
      ? new Date(new Date().setHours(18, 0, 0, 0)).toISOString()
      : new Date(new Date().setDate(new Date().getDate() + 1)).setHours(8, 0, 0, 0);

    for (const [userId, alertResults] of userDigests.entries()) {
      const totalMarkets = alertResults.reduce((sum, alert) => sum + alert.markets.length, 0);

      if (totalMarkets > 0) {
        const { data: existingDigest } = await supabase
          .from("email_digest_queue")
          .select("id")
          .eq("user_id", userId)
          .eq("digest_type", digestType)
          .eq("status", "pending")
          .gte("scheduled_for", new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (!existingDigest) {
          await supabase.from("email_digest_queue").insert({
            user_id: userId,
            digest_type: digestType,
            alert_results: alertResults,
            total_markets_count: totalMarkets,
            status: "pending",
            scheduled_for: new Date(scheduledFor).toISOString(),
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        alerts_checked: activeAlerts.length,
        detections_created: totalDetections,
        users_notified: userDigests.size,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-market-alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});