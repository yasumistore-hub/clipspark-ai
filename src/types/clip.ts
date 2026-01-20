export interface Clip {
  id: string;
  title: string;
  thumbnail: string;
  startTime: number;
  endTime: number;
  duration: number;
  viralityScore: number;
  summary: string;
  videoUrl: string;
}

export interface RecentProject {
  id: string;
  title: string;
  thumbnail: string;
  clipCount: number;
  createdAt: string;
}

export type ProcessingStep = 
  | "idle"
  | "downloading"
  | "transcribing"
  | "analyzing"
  | "generating"
  | "complete";
