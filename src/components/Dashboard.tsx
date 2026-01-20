import { useState, useRef } from "react";
import { Clip, ProcessingStep } from "@/types/clip";
import { mockClips } from "@/data/mockData";
import { HeroInput } from "./HeroInput";
import { ProcessingState } from "./ProcessingState";
import { ClipsGrid } from "./ClipsGrid";
import { VideoPlayerModal } from "./VideoPlayerModal";
import { YouTubeMetadata } from "@/hooks/useYouTubeMetadata";

const processingSteps: ProcessingStep[] = [
  "fetching",
  "downloading",
  "transcribing",
  "analyzing",
  "generating",
];

// Generate mock clips based on real video metadata
function generateMockClipsFromMetadata(metadata: YouTubeMetadata): Clip[] {
  const videoDuration = metadata.duration;
  const clipTitles = [
    "Mind-blowing Fact! 🤯",
    "The Secret Nobody Talks About 🔥",
    "This Changed My Perspective ✨",
    "You Won't Believe This 😱",
    "The Truth Revealed 💡",
  ];
  
  const summaries = [
    "This segment discusses a fascinating breakthrough that will change everything.",
    "A controversial take that's guaranteed to spark discussion.",
    "An emotional moment that resonates with viewers on a deep level.",
    "The most viral-worthy moment with perfect pacing.",
    "Key insights that everyone needs to hear.",
  ];

  // Generate 3-5 clips based on video duration
  const numClips = Math.min(5, Math.max(3, Math.floor(videoDuration / 300)));
  const clips: Clip[] = [];

  for (let i = 0; i < numClips; i++) {
    const startTime = Math.floor((videoDuration / numClips) * i + Math.random() * 60);
    const duration = Math.floor(30 + Math.random() * 30); // 30-60 seconds
    const endTime = Math.min(startTime + duration, videoDuration);

    clips.push({
      id: `clip-${i + 1}`,
      title: `${clipTitles[i % clipTitles.length]}`,
      thumbnail: metadata.thumbnails.high || metadata.thumbnails.medium || "",
      startTime,
      endTime,
      duration: endTime - startTime,
      viralityScore: Math.floor(75 + Math.random() * 25),
      summary: summaries[i % summaries.length],
      videoId: metadata.videoId,
    });
  }

  return clips.sort((a, b) => b.viralityScore - a.viralityScore);
}

export function Dashboard() {
  const [processingStep, setProcessingStep] = useState<ProcessingStep>("idle");
  const [progress, setProgress] = useState(0);
  const [clips, setClips] = useState<Clip[]>(mockClips);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
  const [showResults, setShowResults] = useState(true);
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>("");
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isProcessing = processingStep !== "idle" && processingStep !== "complete";

  const handleGenerate = (url: string, metadata: YouTubeMetadata) => {
    setShowResults(false);
    setProgress(0);
    setCurrentVideoTitle(metadata.title);
    
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
        
        // Generate clips based on real metadata
        const generatedClips = generateMockClipsFromMetadata(metadata);
        
        setTimeout(() => {
          setProcessingStep("idle");
          setShowResults(true);
          setClips(generatedClips);
        }, 500);
      }
    }, 1500);

    // Progress animation
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          return 100;
        }
        return prev + 1.2;
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
