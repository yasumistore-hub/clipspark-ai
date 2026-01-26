import { useState } from "react";
import { Clip } from "@/types/clip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Film,
  ExternalLink,
  Play,
  Clock
} from "lucide-react";

interface DownloadModalProps {
  clip: Clip | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenExport?: (clip: Clip) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function DownloadModal({ clip, isOpen, onClose, onOpenExport }: DownloadModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!clip) return null;

  // Create YouTube clip URL for original download
  const youtubeClipUrl = `https://www.youtube.com/watch?v=${clip.videoId}&t=${clip.startTime}s`;

  const handleDownloadOriginal = async () => {
    setIsDownloading(true);
    
    // Open YouTube video at the clip's start time
    // Note: Direct YouTube download requires user to use external tools
    window.open(youtubeClipUrl, "_blank");
    
    setIsDownloading(false);
  };

  const handleExportFormatted = () => {
    onClose();
    if (onOpenExport && clip) {
      onOpenExport(clip);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Download Clip
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Clip Preview */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-foreground line-clamp-2">{clip.title}</h4>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {clip.duration}s
              </span>
              <span className="font-mono">
                {formatTime(clip.startTime)} → {formatTime(clip.endTime)}
              </span>
            </div>
          </div>

          {/* Download Options */}
          <div className="space-y-3">
            {/* Original Video */}
            <button
              onClick={handleDownloadOriginal}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-border bg-card hover:border-primary/50 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Play className="w-6 h-6 text-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Open Original on YouTube</p>
                <p className="text-xs text-muted-foreground">Opens video at clip start time</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </button>

            {/* Formatted Export */}
            <button
              onClick={handleExportFormatted}
              className="w-full flex items-center gap-4 p-4 rounded-lg border-2 border-primary/30 bg-primary/5 hover:border-primary/50 transition-all text-left"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                <Film className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Export Formatted Video</p>
                <p className="text-xs text-muted-foreground">
                  Render as Reels, Shorts, TikTok with captions
                </p>
              </div>
              <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                Recommended
              </Badge>
            </button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            For direct MP4 download, use the formatted export option which renders the clip with your chosen settings.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
