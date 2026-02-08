import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const blotatoApiKey = Deno.env.get("BLOTATO_API_KEY");
    if (!blotatoApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "BLOTATO_API_KEY not found in secrets",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json().catch(() => ({}));
    const testText =
      body.text ||
      "Test de connexion Blotato - Le Marche Public " +
        new Date().toISOString();

    const facebookPayload = {
      post: {
        accountId: "19719",
        content: {
          text: testText,
          mediaUrls: [],
          platform: "facebook",
        },
        target: {
          targetType: "facebook",
          pageId: "890439544151584",
        },
      },
    };

    const fbResponse = await fetch("https://backend.blotato.com/v2/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "blotato-api-key": blotatoApiKey,
      },
      body: JSON.stringify(facebookPayload),
    });

    const fbData = await fbResponse.json();

    const linkedinPayload = {
      post: {
        accountId: "12951",
        content: {
          text: testText,
          mediaUrls: [],
          platform: "linkedin",
        },
        target: {
          targetType: "linkedin",
          pageId: "104443151",
        },
      },
    };

    const liResponse = await fetch("https://backend.blotato.com/v2/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "blotato-api-key": blotatoApiKey,
      },
      body: JSON.stringify(linkedinPayload),
    });

    const liData = await liResponse.json();

    return new Response(
      JSON.stringify({
        success: fbResponse.ok && liResponse.ok,
        facebook: {
          status: fbResponse.status,
          ok: fbResponse.ok,
          data: fbData,
        },
        linkedin: {
          status: liResponse.status,
          ok: liResponse.ok,
          data: liData,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
