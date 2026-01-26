import { Clip } from "@/types/clip";
import { ClipCard } from "./ClipCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Download } from "lucide-react";

interface ClipsGridProps {
  clips: Clip[];
  onPlayClip: (clip: Clip) => void;
  onUpdateClip?: (clip: Clip) => void;
  onExportClip?: (clip: Clip) => void;
  onDownloadClip?: (clip: Clip) => void;
  onBatchDownload?: () => void;
}

export function ClipsGrid({ clips, onPlayClip, onUpdateClip, onExportClip, onDownloadClip, onBatchDownload }: ClipsGridProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Generated Clips
          </h2>
          <p className="text-muted-foreground mt-1">
            {clips.length} viral-worthy moments detected
          </p>
        </div>
        {onBatchDownload && clips.length > 1 && (
          <Button
            onClick={onBatchDownload}
            variant="outline"
            className="border-primary/50 hover:bg-primary/10"
          >
            <Download className="w-4 h-4 mr-2" />
            Download All
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {clips.map((clip) => (
          <ClipCard
            key={clip.id}
            clip={clip}
            onPlay={onPlayClip}
            onUpdate={onUpdateClip}
            onExport={onExportClip}
            onDownload={onDownloadClip}
          />
        ))}
      </div>
    </div>
  );
}
