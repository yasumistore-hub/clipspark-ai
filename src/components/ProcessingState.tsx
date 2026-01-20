import { ProcessingStep } from "@/types/clip";
import { Progress } from "@/components/ui/progress";
import { Download, Mic, Brain, Sparkles, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessingStateProps {
  currentStep: ProcessingStep;
  progress: number;
  videoTitle?: string;
}

const steps = [
  { id: "fetching", label: "Fetching Video Info", icon: Search },
  { id: "downloading", label: "Downloading Video", icon: Download },
  { id: "transcribing", label: "Transcribing Audio", icon: Mic },
  { id: "analyzing", label: "Analyzing Sentiment", icon: Brain },
  { id: "generating", label: "Generating Clips", icon: Sparkles },
];

export function ProcessingState({ currentStep, progress, videoTitle }: ProcessingStateProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-card rounded-2xl border border-border gradient-border">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4 animate-pulse-glow">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Processing Your Video</h3>
        {videoTitle && (
          <p className="text-primary mt-2 font-medium truncate max-w-md mx-auto">
            "{videoTitle}"
          </p>
        )}
        <p className="text-muted-foreground mt-1">Our AI is analyzing your content</p>
      </div>

      {/* Progress Steps */}
      <div className="space-y-4 mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isComplete = index < currentIndex;
          const isPending = index > currentIndex;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-4 p-4 rounded-lg transition-all duration-500",
                isActive && "bg-primary/10 border border-primary/30",
                isComplete && "bg-neon-cyan/10",
                isPending && "opacity-50"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                  isActive && "bg-primary glow-purple",
                  isComplete && "bg-neon-cyan glow-cyan",
                  isPending && "bg-muted"
                )}
              >
                {isComplete ? (
                  <Check className="w-5 h-5 text-secondary-foreground" />
                ) : (
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "text-primary-foreground animate-pulse" : "text-muted-foreground"
                    )}
                  />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={cn(
                    "font-medium",
                    isActive && "text-primary",
                    isComplete && "text-neon-cyan",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </p>
                {isActive && (
                  <p className="text-sm text-muted-foreground animate-pulse">
                    In progress...
                  </p>
                )}
              </div>
              {isComplete && (
                <span className="text-xs font-medium text-neon-cyan">Complete</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Overall Progress</span>
          <span className="font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}
