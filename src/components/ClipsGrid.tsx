import { Clip } from "@/types/clip";
import { ClipCard } from "./ClipCard";
import { Sparkles } from "lucide-react";

interface ClipsGridProps {
  clips: Clip[];
  onPlayClip: (clip: Clip) => void;
  onUpdateClip?: (clip: Clip) => void;
  onExportClip?: (clip: Clip) => void;
}

export function ClipsGrid({ clips, onPlayClip, onUpdateClip, onExportClip }: ClipsGridProps) {
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
          />
        ))}
      </div>
    </div>
  );
}
