import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const BLOTATO_API_URL = "https://backend.blotato.com/v2/posts";

const PLATFORM_CONFIG = {
  facebook: {
    accountId: "19719",
    pageId: "890439544151584",
    platform: "facebook" as const,
    targetType: "facebook" as const,
  },
  linkedin: {
    accountId: "12951",
    pageId: "104443151",
    platform: "linkedin" as const,
    targetType: "linkedin" as const,
  },
};

type PlatformKey = keyof typeof PLATFORM_CONFIG;

interface PostRequest {
  text: string;
  mediaUrls?: string[];
  platforms?: PlatformKey[];
  scheduledTime?: string;
  facebookLink?: string;
}

function buildPayload(
  config: (typeof PLATFORM_CONFIG)[PlatformKey],
  text: string,
  mediaUrls: string[],
  scheduledTime?: string,
  facebookLink?: string
) {
  const target: Record<string, string> = {
    targetType: config.targetType,
  };

  if (config.pageId) {
    target.pageId = config.pageId;
  }

  if (config.targetType === "facebook" && facebookLink) {
    target.link = facebookLink;
  }

  const payload: Record<string, unknown> = {
    post: {
      accountId: config.accountId,
      content: {
        text,
        mediaUrls,
        platform: config.platform,
      },
      target,
    },
  };

  if (scheduledTime) {
    payload.scheduledTime = scheduledTime;
  }

  return payload;
}

async function postToBlotato(
  apiKey: string,
  payload: Record<string, unknown>
): Promise<{ ok: boolean; status: number; data: unknown }> {
  const response = await fetch(BLOTATO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "blotato-api-key": apiKey,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  return { ok: response.ok, status: response.status, data };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const blotatoApiKey = Deno.env.get("BLOTATO_API_KEY");
    if (!blotatoApiKey) {
      return new Response(
        JSON.stringify({
          error:
            "BLOTATO_API_KEY not configured. Add it to Edge Function secrets.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body: PostRequest = await req.json();
    const { text, mediaUrls = [], platforms = ["facebook", "linkedin"], scheduledTime, facebookLink } = body;

    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Post text is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results: Record<string, { success: boolean; data: unknown }> = {};

    for (const platform of platforms) {
      const config = PLATFORM_CONFIG[platform];
      if (!config) {
        results[platform] = {
          success: false,
          data: { error: `Unknown platform: ${platform}` },
        };
        continue;
      }

      const payload = buildPayload(config, text, mediaUrls, scheduledTime, facebookLink);
      const result = await postToBlotato(blotatoApiKey, payload);

      results[platform] = {
        success: result.ok,
        data: result.data,
      };
    }

    const allSuccess = Object.values(results).every((r) => r.success);

    return new Response(
      JSON.stringify({
        success: allSuccess,
        results,
      }),
      {
        status: allSuccess ? 200 : 207,
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
