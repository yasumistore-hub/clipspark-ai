import { useState, useEffect } from "react";
import { Clip, ProcessingStep } from "@/types/clip";
import { mockClips } from "@/data/mockData";
import { HeroInput } from "./HeroInput";
import { ProcessingState } from "./ProcessingState";
import { ClipsGrid } from "./ClipsGrid";
import { VideoPlayerModal } from "./VideoPlayerModal";

const processingSteps: ProcessingStep[] = [
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

  const isProcessing = processingStep !== "idle" && processingStep !== "complete";

  const handleGenerate = (url: string) => {
    setShowResults(false);
    setProgress(0);
    
    // Simulate processing steps
    let currentStepIndex = 0;
    setProcessingStep(processingSteps[0]);

    const stepInterval = setInterval(() => {
      currentStepIndex++;
      if (currentStepIndex < processingSteps.length) {
        setProcessingStep(processingSteps[currentStepIndex]);
      } else {
        clearInterval(stepInterval);
        setProcessingStep("complete");
        setTimeout(() => {
          setProcessingStep("idle");
          setShowResults(true);
          setClips(mockClips); // In real app, this would be the actual generated clips
        }, 500);
      }
    }, 2000);

    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1;
      });
    }, 80);
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
            <ProcessingState currentStep={processingStep} progress={progress} />
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
