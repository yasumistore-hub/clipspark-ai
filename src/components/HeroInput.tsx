import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Link as LinkIcon, Youtube } from "lucide-react";

interface HeroInputProps {
  onGenerate: (url: string) => void;
  isProcessing: boolean;
}

export function HeroInput({ onGenerate, isProcessing }: HeroInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onGenerate(url);
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
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 border-0 bg-transparent text-lg placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={isProcessing}
            />
            <Button
              type="submit"
              size="lg"
              disabled={!url.trim() || isProcessing}
              className="bg-gradient-to-r from-electric-purple to-primary hover:opacity-90 text-primary-foreground px-6 glow-purple"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Clips
            </Button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <LinkIcon className="w-4 h-4" />
          <span>Supports YouTube videos up to 2 hours long</span>
        </div>
      </form>
    </div>
  );
}
