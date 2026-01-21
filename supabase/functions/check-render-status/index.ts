import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { renderId } = await req.json();

    if (!renderId) {
      return new Response(
        JSON.stringify({ error: "Missing renderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const CREATOMATE_API_KEY = Deno.env.get("CREATOMATE_API_KEY");
    if (!CREATOMATE_API_KEY) {
      throw new Error("CREATOMATE_API_KEY is not configured");
    }

    const response = await fetch(`https://api.creatomate.com/v2/renders/${renderId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${CREATOMATE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Creatomate status error:", response.status, errorText);
      throw new Error(`Failed to check render status: ${response.status}`);
    }

    const renderData = await response.json();

    return new Response(
      JSON.stringify({
        id: renderData.id,
        status: renderData.status,
        url: renderData.url,
        progress: renderData.progress,
        error_message: renderData.error_message,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Status check error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
