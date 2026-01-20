import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface YouTubeMetadata {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  thumbnails: {
    default?: string;
    medium?: string;
    high?: string;
    standard?: string;
    maxres?: string;
  };
  duration: number;
  durationFormatted: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
}

export function useYouTubeMetadata() {
  const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetadata = async (url: string): Promise<YouTubeMetadata | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "youtube-metadata",
        {
          body: { url },
        }
      );

      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setMetadata(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch video metadata";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    metadata,
    isLoading,
    error,
    fetchMetadata,
  };
}
