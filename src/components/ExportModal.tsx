import { useState, useEffect } from "react";
import { Clip } from "@/types/clip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  Instagram, 
  Youtube, 
  Music2, 
  Captions, 
  Download, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExportModalProps {
  clip: Clip | null;
  isOpen: boolean;
  onClose: () => void;
}

type Platform = "instagram_reels" | "youtube_shorts" | "tiktok";
type RenderStatus = "idle" | "rendering" | "completed" | "failed";

interface RenderJob {
  id: string;
  status: RenderStatus;
  url?: string;
  progress: number;
  platform: Platform;
}

const platforms = [
  {
    id: "instagram_reels" as Platform,
    name: "Instagram Reels",
    icon: Instagram,
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    dimensions: "1080×1920",
  },
  {
    id: "youtube_shorts" as Platform,
    name: "YouTube Shorts",
    icon: Youtube,
    color: "bg-red-600",
    dimensions: "1080×1920",
  },
  {
    id: "tiktok" as Platform,
    name: "TikTok",
    icon: Music2,
    color: "bg-gradient-to-br from-cyan-400 to-pink-500",
    dimensions: "1080×1920",
  },
];

export function ExportModal({ clip, isOpen, onClose }: ExportModalProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPlatforms([]);
      setRenderJobs([]);
      setIsExporting(false);
    }
  }, [isOpen]);

  // Poll for render status
  useEffect(() => {
    const pendingJobs = renderJobs.filter(j => j.status === "rendering");
    if (pendingJobs.length === 0) return;

    const interval = setInterval(async () => {
      for (const job of pendingJobs) {
        try {
          const { data, error } = await supabase.functions.invoke("check-render-status", {
            body: { renderId: job.id },
          });

          if (error) throw error;

          setRenderJobs(prev => prev.map(j => {
            if (j.id !== job.id) return j;
            
            if (data.status === "succeeded") {
              return { ...j, status: "completed", url: data.url, progress: 100 };
            } else if (data.status === "failed") {
              return { ...j, status: "failed", progress: 0 };
            } else {
              return { ...j, progress: (data.progress || 0) * 100 };
            }
          }));
        } catch (err) {
          console.error("Status check failed:", err);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [renderJobs]);

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleExport = async () => {
    if (!clip || selectedPlatforms.length === 0) return;

    setIsExporting(true);

    for (const platform of selectedPlatforms) {
      try {
        const { data, error } = await supabase.functions.invoke("render-video", {
          body: {
            videoId: clip.videoId,
            startTime: clip.startTime,
            endTime: clip.endTime,
            format: platform,
            title: clip.title,
            captions: captionsEnabled,
          },
        });

        if (error) throw error;

        if (data.render) {
          setRenderJobs(prev => [
            ...prev,
            {
              id: data.render.id,
              status: "rendering",
              progress: 0,
              platform,
            },
          ]);
          toast.success(`Started rendering for ${platforms.find(p => p.id === platform)?.name}`);
        }
      } catch (err) {
        console.error("Export failed:", err);
        toast.error(`Failed to start export for ${platforms.find(p => p.id === platform)?.name}`);
        setRenderJobs(prev => [
          ...prev,
          {
            id: `failed-${platform}`,
            status: "failed",
            progress: 0,
            platform,
          },
        ]);
      }
    }

    setIsExporting(false);
  };

  const getJobForPlatform = (platform: Platform) => {
    return renderJobs.find(j => j.platform === platform);
  };

  if (!clip) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Download className="w-5 h-5 text-primary" />
            Export Clip
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Clip Preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-1">{clip.title}</h4>
            <p className="text-sm text-muted-foreground">{clip.duration}s clip</p>
          </div>

          {/* Platform Selection */}
          <div className="space-y-3">
            <Label className="text-foreground">Select Platforms</Label>
            <div className="grid grid-cols-1 gap-3">
              {platforms.map(platform => {
                const Icon = platform.icon;
                const isSelected = selectedPlatforms.includes(platform.id);
                const job = getJobForPlatform(platform.id);

                return (
                  <button
                    key={platform.id}
                    onClick={() => !job && togglePlatform(platform.id)}
                    disabled={!!job}
                    className={`relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card hover:border-primary/50"
                    } ${job ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
                  >
                    <div className={`w-10 h-10 rounded-lg ${platform.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-foreground">{platform.name}</p>
                      <p className="text-xs text-muted-foreground">{platform.dimensions} • 9:16 Vertical</p>
                    </div>

                    {/* Render Status */}
                    {job && (
                      <div className="flex items-center gap-2">
                        {job.status === "rendering" && (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                            <span className="text-xs text-muted-foreground">{Math.round(job.progress)}%</span>
                          </>
                        )}
                        {job.status === "completed" && (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        )}
                        {job.status === "failed" && (
                          <AlertCircle className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                    )}

                    {!job && isSelected && (
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        Selected
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Captions Toggle */}
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <Captions className="w-5 h-5 text-primary" />
              <div>
                <Label className="text-foreground">Auto-Generated Captions</Label>
                <p className="text-xs text-muted-foreground">Add animated captions to your clip</p>
              </div>
            </div>
            <Switch checked={captionsEnabled} onCheckedChange={setCaptionsEnabled} />
          </div>

          {/* Render Progress */}
          {renderJobs.some(j => j.status === "rendering") && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Rendering Progress</Label>
              {renderJobs
                .filter(j => j.status === "rendering")
                .map(job => (
                  <div key={job.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">
                        {platforms.find(p => p.id === job.platform)?.name}
                      </span>
                      <span className="text-muted-foreground">{Math.round(job.progress)}%</span>
                    </div>
                    <Progress value={job.progress} className="h-2" />
                  </div>
                ))}
            </div>
          )}

          {/* Download Links */}
          {renderJobs.some(j => j.status === "completed") && (
            <div className="space-y-2">
              <Label className="text-muted-foreground">Ready for Download</Label>
              <div className="space-y-2">
                {renderJobs
                  .filter(j => j.status === "completed" && j.url)
                  .map(job => (
                    <a
                      key={job.id}
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors"
                    >
                      <span className="font-medium text-foreground">
                        {platforms.find(p => p.id === job.platform)?.name}
                      </span>
                      <ExternalLink className="w-4 h-4 text-green-500" />
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Export Button */}
          <Button
            onClick={handleExport}
            disabled={selectedPlatforms.length === 0 || isExporting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Export...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export to {selectedPlatforms.length || 0} Platform{selectedPlatforms.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
