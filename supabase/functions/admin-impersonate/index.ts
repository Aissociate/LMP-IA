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
      .single();

    if (adminError || !adminProfile?.is_admin) {
      throw new Error("Accès réservé aux administrateurs");
    }

    const { action, targetUserId } = await req.json();

    if (action === "list_users") {
      const { data: profiles, error: profilesError } = await supabaseClient
        .from("user_profiles")
        .select("user_id, full_name, company_name, is_admin")
        .eq("is_admin", false)
        .order("full_name", { ascending: true });

      if (profilesError) throw profilesError;

      const { data: { users }, error: usersError } = await supabaseClient.auth.admin.listUsers();
      if (usersError) throw usersError;

      const enrichedUsers = users
        .filter((u) => profiles?.some((p) => p.user_id === u.id))
        .map((u) => {
          const profile = profiles?.find((p) => p.user_id === u.id);
          return {
            id: u.id,
            email: u.email,
            created_at: u.created_at,
            user_profiles: profile ? {
              full_name: profile.full_name,
              company_name: profile.company_name,
              is_admin: profile.is_admin,
            } : null,
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

    if (action === "generate_token") {
      if (!targetUserId) {
        throw new Error("targetUserId requis");
      }

      const { data: targetProfile, error: targetError } = await supabaseClient
        .from("user_profiles")
        .select("is_admin")
        .eq("user_id", targetUserId)
        .single();

      if (targetError) throw targetError;

      if (targetProfile?.is_admin) {
        throw new Error("Impossible de prendre le contrôle d'un compte admin");
      }

      const { data, error } = await supabaseClient.auth.admin.generateLink({
        type: "magiclink",
        email: (await supabaseClient.auth.admin.getUserById(targetUserId)).data.user?.email || "",
      });

      if (error) throw error;

      return new Response(
        JSON.stringify({
          access_token: data.properties?.action_link,
          user_id: targetUserId
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    throw new Error("Action non reconnue");
  } catch (error) {
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