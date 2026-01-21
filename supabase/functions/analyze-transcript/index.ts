import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ClipSuggestion {
  title: string;
  startTime: number;
  endTime: number;
  viralityScore: number;
  summary: string;
  sentiment: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoTitle, videoDuration, videoDescription } = await req.json();

    if (!videoTitle || !videoDuration) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: videoTitle and videoDuration" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert video content analyst specializing in identifying viral-worthy moments for short-form content (TikTok, YouTube Shorts, Instagram Reels).

Your task is to analyze video content and suggest the most engaging clip segments based on:
- Emotional peaks (excitement, surprise, humor, controversy)
- Key insights or revelations
- Quotable moments
- Visual or narrative hooks
- Patterns that typically go viral

For each clip suggestion, provide:
1. A catchy, emoji-enhanced title that would grab attention
2. Estimated start and end times (in seconds)
3. A virality score (0-100) based on engagement potential
4. A brief summary of why this moment would perform well
5. The dominant sentiment (exciting, funny, shocking, inspiring, controversial, educational)`;

    const userPrompt = `Analyze this video and suggest 3-5 viral-worthy clip segments:

Video Title: "${videoTitle}"
Video Duration: ${videoDuration} seconds (${Math.floor(videoDuration / 60)} minutes ${videoDuration % 60} seconds)
${videoDescription ? `Video Description: "${videoDescription}"` : ""}

Based on the title and description, identify the most likely engaging moments that would work well as short clips (30-60 seconds each). Consider common video structures and where emotional peaks typically occur.

Respond with a JSON array of clip suggestions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_viral_clips",
              description: "Return 3-5 viral-worthy clip suggestions from the video",
              parameters: {
                type: "object",
                properties: {
                  clips: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string", description: "Catchy, emoji-enhanced title" },
                        startTime: { type: "number", description: "Start time in seconds" },
                        endTime: { type: "number", description: "End time in seconds" },
                        viralityScore: { type: "number", description: "Virality score 0-100" },
                        summary: { type: "string", description: "Brief summary of why this moment would perform well" },
                        sentiment: { 
                          type: "string", 
                          enum: ["exciting", "funny", "shocking", "inspiring", "controversial", "educational"],
                          description: "Dominant sentiment of the clip"
                        },
                      },
                      required: ["title", "startTime", "endTime", "viralityScore", "summary", "sentiment"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["clips"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "suggest_viral_clips" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    
    // Extract the tool call response
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "suggest_viral_clips") {
      throw new Error("Unexpected AI response format");
    }

    const clipSuggestions: { clips: ClipSuggestion[] } = JSON.parse(toolCall.function.arguments);
    
    // Validate and clamp values
    const validatedClips = clipSuggestions.clips.map((clip, index) => ({
      ...clip,
      startTime: Math.max(0, Math.min(clip.startTime, videoDuration - 30)),
      endTime: Math.min(clip.endTime, videoDuration),
      viralityScore: Math.max(0, Math.min(100, clip.viralityScore)),
      id: `ai-clip-${index + 1}`,
    })).filter(clip => clip.endTime > clip.startTime);

    return new Response(
      JSON.stringify({ clips: validatedClips }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing transcript:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
