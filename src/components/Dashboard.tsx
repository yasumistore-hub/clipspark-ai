import { useState, useRef } from "react";
import { Clip, ProcessingStep } from "@/types/clip";
import { mockClips } from "@/data/mockData";
import { HeroInput } from "./HeroInput";
import { ProcessingState } from "./ProcessingState";
import { ClipsGrid } from "./ClipsGrid";
import { VideoPlayerModal } from "./VideoPlayerModal";
import { YouTubeMetadata } from "@/hooks/useYouTubeMetadata";
import { useClipAnalysis } from "@/hooks/useClipAnalysis";
import { toast } from "sonner";

const processingSteps: ProcessingStep[] = [
  "fetching",
  "downloading",
  "transcribing",
  "analyzing",
  "generating",
];

export function Dashboard() {
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [progress, setProgress] = useState(0);
  const [clips, setClips] = useState<Clip[]>(mockClips);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [showResults, setShowResults] = useState(true);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>("");
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { analyzeVideo } = useClipAnalysis();

  const isProcessing = processingStep !== "idle" && processingStep !== "complete";

  const handleGenerate = async (url: string, metadata: YouTubeMetadata) => {
    setShowResults(false);
    setProgress(0);
    setCurrentVideoTitle(metadata.title);
    
    // Start processing animation
    let currentStepIndex = 0;
    setProcessingStep(processingSteps[0]);

    // Progress animation
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          return 95; // Cap at 95% until AI completes
        }
        return prev + 0.8;
      });
    }, 100);

    // Step animation (faster to reach analyzing step where AI kicks in)
    if (stepIntervalRef.current) {
      clearInterval(stepIntervalRef.current);
    }

    stepIntervalRef.current = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < processingSteps.length - 1) {
        setProcessingStep(processingSteps[currentStepIndex]);
      } else {
        if (stepIntervalRef.current) {
          clearInterval(stepIntervalRef.current);
        }
      }
    }, 1200);

    try {
      // Call AI to analyze video and generate clips
      const aiClips = await analyzeVideo(metadata);
      
      // Cleanup intervals
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }

      // Complete the progress
      setProgress(100);
      setProcessingStep("complete");
      
      setTimeout(() => {
        setProcessingStep("idle");
        setShowResults(true);
        setClips(aiClips);
        toast.success(`Found ${aiClips.length} viral-worthy clips!`);
      }, 500);
    } catch (error) {
      // Cleanup intervals on error
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
      }
      
      setProcessingStep("idle");
      setShowResults(true);
      toast.error(error instanceof Error ? error.message : "Failed to analyze video");
    }
  };

  const handlePlayClip = (clip: Clip) => {
    setSelectedClip(clip);
  };

  return (
    <div className="flex-1 p-8 overflow-auto">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Input Section */}
        <section className="pt-8 pb-4">
          <HeroInput onGenerate={handleGenerate} isProcessing={isProcessing} />
        </section>

        {/* Processing State */}
        {isProcessing && (
          <section className="py-8">
            <ProcessingState 
              currentStep={processingStep} 
              progress={progress} 
              videoTitle={currentVideoTitle}
            />
          </section>
        )}

        {/* Results Grid */}
        {showResults && clips.length > 0 && !isProcessing && (
          <section>
            <ClipsGrid clips={clips} onPlayClip={handlePlayClip} />
          </section>
        )}

        {/* Video Player Modal */}
        <VideoPlayerModal
          clip={selectedClip}
          isOpen={!!selectedClip}
          onClose={() => setSelectedClip(null)}
        />
      </div>
    </div>
  );
}
