import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Aucun en-tête d'autorisation");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Non autorisé");
    }

    const { data: adminProfile, error: adminError } = await supabaseClient
      .from("user_profiles")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminError || !adminProfile?.is_admin) {
      throw new Error("Accès réservé aux administrateurs");
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const userId = url.searchParams.get("userId");

    if (action === "list") {
      const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers();
      if (usersError) throw usersError;

      const userIds = users.map(u => u.id);
      const { data: profiles, error: profilesError } = await supabaseClient
        .from("user_profiles")
        .select("user_id, full_name, company_name")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      const enrichedUsers = users.map((u) => {
        const profile = profiles?.find((p) => p.user_id === u.id);
        return {
          id: u.id,
          email: u.email,
          created_at: u.created_at,
          user_profiles: profile ? [{
            full_name: profile.full_name,
            company_name: profile.company_name,
          }] : [],
        };
      });

      return new Response(
        JSON.stringify({ users: enrichedUsers }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (action === "get" && userId) {
      const { data, error: getUserError } = await supabaseClient.auth.admin.getUserById(userId);
      if (getUserError) throw getUserError;

      const { data: profile, error: profileError } = await supabaseClient
        .from("user_profiles")
        .select("full_name, company_name")
        .eq("user_id", userId)
        .maybeSingle();

      if (profileError) throw profileError;

      return new Response(
        JSON.stringify({
          user: {
            ...data.user,
            user_metadata: {
              ...data.user?.user_metadata,
              full_name: profile?.full_name,
            },
          },
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    throw new Error("Action non reconnue ou paramètres manquants");
  } catch (error) {
    console.error("Error in admin-users function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});