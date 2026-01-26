import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RenderRequest {
  videoId: string;
  startTime: number;
  endTime: number;
  format: "instagram_reels" | "youtube_shorts" | "tiktok";
  title: string;
  captions?: boolean;
}

// Platform-specific dimensions
const platformFormats = {
  instagram_reels: { width: 1080, height: 1920, name: "Instagram Reels" },
  youtube_shorts: { width: 1080, height: 1920, name: "YouTube Shorts" },
  tiktok: { width: 1080, height: 1920, name: "TikTok" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, startTime, endTime, format, title, captions = true }: RenderRequest = await req.json();

    if (!videoId || startTime === undefined || endTime === undefined || !format) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const CREATOMATE_API_KEY = Deno.env.get("CREATOMATE_API_KEY");
    if (!CREATOMATE_API_KEY) {
      throw new Error("CREATOMATE_API_KEY is not configured");
    }

    const formatConfig = platformFormats[format];
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Build the video source with elements
    const elements: any[] = [
      {
        type: "video",
        source: youtubeUrl,
        trim_start: startTime,
        trim_end: endTime,
        fit: "cover",
      },
    ];

    // Add captions if enabled
    if (captions) {
      elements.push({
        type: "text",
        transcript_source: "video-1",
        transcript_effect: "karaoke",
        transcript_color: "#FFD700",
        width: "90%",
        height: "25%",
        x_alignment: "50%",
        y_alignment: "85%",
        font_family: "Montserrat",
        font_weight: "800",
        font_size: "6 vmin",
        fill_color: "#ffffff",
        stroke_color: "#000000",
        stroke_width: "0.8 vmin",
        background_color: "rgba(0,0,0,0.6)",
        background_x_padding: "5%",
        background_y_padding: "3%",
        background_border_radius: "10%",
        text_align: "center",
      });
    }

    // Add title overlay
    if (title) {
      elements.push({
        type: "text",
        text: title,
        width: "90%",
        x_alignment: "50%",
        y_alignment: "8%",
        font_family: "Montserrat",
        font_weight: "700",
        font_size: "4.5 vmin",
        fill_color: "#ffffff",
        stroke_color: "#000000",
        stroke_width: "0.5 vmin",
        background_color: "rgba(0,0,0,0.7)",
        background_x_padding: "4%",
        background_y_padding: "2%",
        background_border_radius: "8%",
        text_align: "center",
        time: 0,
        duration: 3,
        animations: [
          { type: "fade", fade_out: true, time: "end", duration: 0.5 },
        ],
      });
    }

    // Create render request to Creatomate
    const response = await fetch("https://api.creatomate.com/v2/renders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${CREATOMATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        output_format: "mp4",
        width: formatConfig.width,
        height: formatConfig.height,
        frame_rate: 30,
        elements,
        webhook_url: undefined, // Could add webhook for status updates
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Creatomate error:", response.status, errorText);
      
      if (response.status === 401) {
        return new Response(
          JSON.stringify({ error: "Invalid API key. Please check your Creatomate credentials." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Creatomate API error: ${response.status}`);
    }

    const renderData = await response.json();
    console.log("Creatomate response:", JSON.stringify(renderData));

    // Validate render response
    if (!renderData || !Array.isArray(renderData) || renderData.length === 0 || !renderData[0]?.id) {
      console.error("Invalid render response:", renderData);
      return new Response(
        JSON.stringify({ 
          error: "Failed to start render job. Creatomate may not support this video source.",
          details: renderData
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        render: {
          id: renderData[0].id,
          status: renderData[0].status,
          url: renderData[0].url,
          format: formatConfig.name,
          dimensions: `${formatConfig.width}x${formatConfig.height}`,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Render error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
