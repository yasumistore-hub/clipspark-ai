import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clip } from "@/types/clip";
import { YouTubeMetadata } from "./useYouTubeMetadata";

interface AnalysisResult {
  clips: Array<{
    id: string;
    title: string;
    startTime: number;
    endTime: number;
    viralityScore: number;
    summary: string;
    sentiment: string;
  }>;
}

export function useClipAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeVideo = async (metadata: YouTubeMetadata): Promise<Clip[]> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke<AnalysisResult>(
        "analyze-transcript",
        {
          body: {
            videoTitle: metadata.title,
            videoDuration: metadata.duration,
            videoDescription: metadata.description,
          },
        }
      );

      if (fnError) {
        throw new Error(fnError.message || "Failed to analyze video");
      }

      if (!data?.clips || !Array.isArray(data.clips)) {
        throw new Error("Invalid response from analysis");
      }

      // Transform AI suggestions to Clip format
      const clips: Clip[] = data.clips.map((clip) => ({
        id: clip.id,
        title: clip.title,
        thumbnail: metadata.thumbnails.high || metadata.thumbnails.medium || "",
        startTime: clip.startTime,
        endTime: clip.endTime,
        duration: clip.endTime - clip.startTime,
        viralityScore: clip.viralityScore,
        summary: clip.summary,
        videoId: metadata.videoId,
      }));

      return clips.sort((a, b) => b.viralityScore - a.viralityScore);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Analysis failed";
      setError(message);
      console.error("Clip analysis error:", err);
      throw err;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeVideo,
    isAnalyzing,
    error,
  };
}
