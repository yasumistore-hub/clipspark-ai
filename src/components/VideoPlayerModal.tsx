import { Clip } from "@/types/clip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Zap, Download, Share2, X } from "lucide-react";

interface VideoPlayerModalProps {
  clip: Clip | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoPlayerModal({ clip, isOpen, onClose }: VideoPlayerModalProps) {
  if (!clip) return null;

  // Create YouTube embed URL with start time
  const embedUrl = `https://www.youtube.com/embed/${clip.videoId}?start=${clip.startTime}&autoplay=1`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-card border-border overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <div className="flex items-start justify-between">
            <DialogTitle className="text-xl font-semibold pr-8">{clip.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        {/* Video Player */}
        <div className="aspect-video bg-background relative">
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={clip.title}
          />
        </div>

        {/* Clip Info */}
        <div className="p-6 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className={`flex items-center gap-1.5 px-3 py-1 ${
                clip.viralityScore >= 90
                  ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"
                  : "bg-primary/20 text-primary border-primary/30"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Virality Score: {clip.viralityScore}/100
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1.5 px-3 py-1">
              <Clock className="w-3.5 h-3.5" />
              {clip.duration}s
            </Badge>
            <Badge variant="outline" className="font-mono px-3 py-1">
              {formatTime(clip.startTime)} → {formatTime(clip.endTime)}
            </Badge>
          </div>

          {/* Summary */}
          <p className="text-muted-foreground">{clip.summary}</p>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button className="bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4 mr-2" />
              Download Clip
            </Button>
            <Button variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
