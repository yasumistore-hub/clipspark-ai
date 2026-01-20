import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Link as LinkIcon, Youtube, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useYouTubeMetadata, YouTubeMetadata } from "@/hooks/useYouTubeMetadata";
import { Badge } from "@/components/ui/badge";

interface HeroInputProps {
  onGenerate: (url: string, metadata: YouTubeMetadata) => void;
  isProcessing: boolean;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K views`;
  }
  return `${count} views`;
}

export function HeroInput({ onGenerate, isProcessing }: HeroInputProps) {
  const [url, setUrl] = useState("");
  const { metadata, isLoading, error, fetchMetadata } = useYouTubeMetadata();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounced URL validation
  const handleUrlChange = useCallback((value: string) => {
    setUrl(value);
    
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Check if it looks like a YouTube URL
    const isYouTubeUrl = value.includes("youtube.com") || value.includes("youtu.be");
    
    if (isYouTubeUrl && value.length > 10) {
      const timer = setTimeout(() => {
        fetchMetadata(value);
      }, 500);
      setDebounceTimer(timer);
    }
  }, [debounceTimer, fetchMetadata]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && metadata) {
      onGenerate(url, metadata);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Hero Text */}
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Transform Videos</span>
          <br />
          <span className="text-foreground">Into Viral Clips</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Paste any YouTube link and let our AI identify the most engaging moments.
          Perfect for Shorts, Reels, and TikTok.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-electric-purple via-neon-cyan to-electric-purple rounded-2xl opacity-50 group-hover:opacity-75 blur-lg transition-opacity duration-500" />
          <div className="relative flex items-center gap-3 p-2 bg-card rounded-xl border border-border">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-muted">
              <Youtube className="w-6 h-6 text-primary" />
            </div>
            <Input
              type="url"
              placeholder="Paste YouTube link here..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="flex-1 border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isProcessing}
            />
            {isLoading && (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin mr-2" />
            )}
            {metadata && !isLoading && (
              <CheckCircle className="w-5 h-5 text-neon-cyan mr-2" />
            )}
            {error && !isLoading && (
              <AlertCircle className="w-5 h-5 text-destructive mr-2" />
            )}
            <Button
              type="submit"
              size="lg"
              disabled={!url.trim() || isProcessing || !metadata || isLoading}
              className="bg-gradient-to-r from-electric-purple to-primary hover:opacity-90 text-primary-foreground px-6 glow-purple"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Clips
            </Button>
          </div>
        </div>

        {/* Video Preview Card */}
        {metadata && !isLoading && (
          <div className="bg-card/50 border border-border rounded-xl p-4 flex gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <img
              src={metadata.thumbnails.medium || metadata.thumbnails.default}
              alt={metadata.title}
              className="w-32 h-20 object-cover rounded-lg"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate">{metadata.title}</h4>
              <p className="text-sm text-muted-foreground">{metadata.channelTitle}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-xs">
                  {formatDuration(metadata.duration)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {formatViewCount(metadata.viewCount)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-center text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Helper Text */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <LinkIcon className="w-4 h-4" />
          <span>Supports YouTube videos up to 2 hours long</span>
        </div>
      </form>
    </div>
  );
}
