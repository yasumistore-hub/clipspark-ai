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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Film,
  Captions,
  Instagram,
  Youtube,
  Music2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BatchDownloadModalProps {
  clips: Clip[];
  isOpen: boolean;
  onClose: () => void;
}

type Platform = "instagram_reels" | "youtube_shorts" | "tiktok";
type RenderStatus = "idle" | "rendering" | "completed" | "failed";

interface RenderJob {
  id: string;
  clipId: string;
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
  },
  {
    id: "youtube_shorts" as Platform,
    name: "YouTube Shorts",
    icon: Youtube,
    color: "bg-red-600",
  },
  {
    id: "tiktok" as Platform,
    name: "TikTok",
    icon: Music2,
    color: "bg-gradient-to-br from-cyan-400 to-pink-500",
  },
];

export function BatchDownloadModal({ clips, isOpen, onClose }: BatchDownloadModalProps) {
  const [selectedClips, setSelectedClips] = useState<string[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("instagram_reels");
  const [captionsEnabled, setCaptionsEnabled] = useState(true);
  const [renderJobs, setRenderJobs] = useState<RenderJob[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedClips(clips.map(c => c.id));
      setRenderJobs([]);
      setIsExporting(false);
    }
  }, [isOpen, clips]);

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

          setRenderJobs(prev =>
            prev.map(j => {
              if (j.id !== job.id) return j;

              if (data.status === "succeeded") {
                return { ...j, status: "completed", url: data.url, progress: 100 };
              } else if (data.status === "failed") {
                return { ...j, status: "failed", progress: 0 };
              } else {
                return { ...j, progress: (data.progress || 0) * 100 };
              }
            })
          );
        } catch (err) {
          console.error("Status check failed:", err);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [renderJobs]);

  const toggleClip = (clipId: string) => {
    setSelectedClips(prev =>
      prev.includes(clipId)
        ? prev.filter(id => id !== clipId)
        : [...prev, clipId]
    );
  };

  const selectAll = () => {
    setSelectedClips(clips.map(c => c.id));
  };

  const deselectAll = () => {
    setSelectedClips([]);
  };

  const handleBatchExport = async () => {
    if (selectedClips.length === 0) return;

    setIsExporting(true);

    const clipsToExport = clips.filter(c => selectedClips.includes(c.id));

    for (const clip of clipsToExport) {
      try {
        const { data, error } = await supabase.functions.invoke("render-video", {
          body: {
            videoId: clip.videoId,
            startTime: clip.startTime,
            endTime: clip.endTime,
            format: selectedPlatform,
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
              clipId: clip.id,
              status: "rendering",
              progress: 0,
              platform: selectedPlatform,
            },
          ]);
        }
      } catch (err) {
        console.error("Export failed:", err);
        setRenderJobs(prev => [
          ...prev,
          {
            id: `failed-${clip.id}`,
            clipId: clip.id,
            status: "failed",
            progress: 0,
            platform: selectedPlatform,
          },
        ]);
      }
    }

    setIsExporting(false);
    toast.success(`Started rendering ${clipsToExport.length} clips`);
  };

  const getJobForClip = (clipId: string) => {
    return renderJobs.find(j => j.clipId === clipId);
  };

  const completedJobs = renderJobs.filter(j => j.status === "completed" && j.url);
  const renderingJobs = renderJobs.filter(j => j.status === "rendering");
  const overallProgress = renderJobs.length > 0
    ? renderJobs.reduce((sum, j) => sum + j.progress, 0) / renderJobs.length
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Film className="w-5 h-5 text-primary" />
            Batch Download Clips
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4 py-2">
          {/* Platform Selection */}
          <div className="space-y-2">
            <Label className="text-foreground text-sm">Format</Label>
            <div className="flex gap-2">
              {platforms.map(platform => {
                const Icon = platform.icon;
                const isSelected = selectedPlatform === platform.id;

                return (
                  <button
                    key={platform.id}
                    onClick={() => setSelectedPlatform(platform.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded ${platform.color} flex items-center justify-center`}>
                      <Icon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{platform.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Captions Toggle */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Captions className="w-4 h-4 text-primary" />
              <Label className="text-foreground text-sm">Add Captions</Label>
            </div>
            <Switch checked={captionsEnabled} onCheckedChange={setCaptionsEnabled} />
          </div>

          {/* Clip Selection */}
          <div className="space-y-2 flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-sm">
                Select Clips ({selectedClips.length}/{clips.length})
              </Label>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={selectAll} className="text-xs h-7">
                  Select All
                </Button>
                <Button variant="ghost" size="sm" onClick={deselectAll} className="text-xs h-7">
                  Deselect All
                </Button>
              </div>
            </div>
            <ScrollArea className="h-48 rounded-lg border border-border">
              <div className="p-2 space-y-1">
                {clips.map(clip => {
                  const job = getJobForClip(clip.id);
                  const isSelected = selectedClips.includes(clip.id);

                  return (
                    <div
                      key={clip.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                        isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleClip(clip.id)}
                        disabled={!!job}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {clip.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {clip.duration}s • Score: {clip.viralityScore}
                        </p>
                      </div>
                      {job && (
                        <div className="flex items-center gap-2">
                          {job.status === "rendering" && (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              <span className="text-xs text-muted-foreground w-8">
                                {Math.round(job.progress)}%
                              </span>
                            </>
                          )}
                          {job.status === "completed" && (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          )}
                          {job.status === "failed" && (
                            <AlertCircle className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Overall Progress */}
          {renderingJobs.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="text-foreground">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Completed Downloads */}
          {completedJobs.length > 0 && (
            <div className="space-y-2">
              <Label className="text-muted-foreground text-sm">
                Ready for Download ({completedJobs.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {completedJobs.map(job => {
                  const clip = clips.find(c => c.id === job.clipId);
                  return (
                    <a
                      key={job.id}
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg hover:bg-green-500/20 transition-colors text-sm"
                    >
                      <Download className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-foreground truncate max-w-[150px]">
                        {clip?.title || "Clip"}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Export Button */}
        <Button
          onClick={handleBatchExport}
          disabled={selectedClips.length === 0 || isExporting}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Starting Batch Export...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export {selectedClips.length} Clip{selectedClips.length !== 1 ? "s" : ""}
            </>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
