import { useState } from "react";
import { Clip } from "@/types/clip";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Play, Download, Edit, Clock, Zap, Check, X } from "lucide-react";

interface ClipCardProps {
  clip: Clip;
  onPlay: (clip: Clip) => void;
  onUpdate?: (clip: Clip) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function ClipCard({ clip, onPlay, onUpdate }: ClipCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(clip.title);
  const [editedSummary, setEditedSummary] = useState(clip.summary);

  const handleStartEdit = () => {
    setEditedTitle(clip.title);
    setEditedSummary(clip.summary);
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate({
        ...clip,
        title: editedTitle.trim() || clip.title,
        summary: editedSummary.trim() || clip.summary,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(clip.title);
    setEditedSummary(clip.summary);
    setIsEditing(false);
  };

  return (
    <Card className="group overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 card-glow">
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden">
        <img
          src={clip.thumbnail}
          alt={clip.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
        
        {/* Play Button Overlay */}
        <button
          onClick={() => onPlay(clip)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center glow-purple transform group-hover:scale-110 transition-transform">
            <Play className="w-7 h-7 text-primary-foreground ml-1" />
          </div>
        </button>

        {/* Duration Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs font-medium">{clip.duration}s</span>
        </div>

        {/* Time Range */}
        <div className="absolute bottom-3 right-3 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-md">
          <span className="text-xs font-mono text-muted-foreground">
            {formatTime(clip.startTime)} - {formatTime(clip.endTime)}
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        {/* Title */}
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            className="mb-3 bg-muted border-border focus:border-primary"
            placeholder="Clip title..."
            maxLength={100}
          />
        ) : (
          <h3 className="font-semibold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {clip.title}
          </h3>
        )}

        {/* Badges */}
        <div className="flex items-center gap-2 mb-4">
          <Badge
            variant="secondary"
            className={`flex items-center gap-1 ${
              clip.viralityScore >= 90
                ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30"
                : clip.viralityScore >= 80
                ? "bg-primary/20 text-primary border-primary/30"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Zap className="w-3 h-3" />
            Virality: {clip.viralityScore}/100
          </Badge>
        </div>

        {/* Summary */}
        {isEditing ? (
          <Textarea
            value={editedSummary}
            onChange={(e) => setEditedSummary(e.target.value)}
            className="mb-4 bg-muted border-border focus:border-primary resize-none"
            placeholder="Clip summary..."
            rows={3}
            maxLength={300}
          />
        ) : (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {clip.summary}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSave}
              >
                <Check className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-border hover:bg-muted"
                onClick={handleCancel}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => onPlay(clip)}
              >
                <Play className="w-4 h-4 mr-1" />
                Play
              </Button>
              <Button size="sm" variant="outline" className="border-border hover:bg-muted">
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-border hover:bg-muted"
                onClick={handleStartEdit}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
