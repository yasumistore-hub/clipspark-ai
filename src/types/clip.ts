export interface Clip {
  id: string;
  title: string;
  thumbnail: string;
  startTime: number;
  endTime: number;
  duration: number;
  viralityScore: number;
  summary: string;
  videoId: string;
}

export interface RecentProject {
  id: string;
  title: string;
  thumbnail: string;
  clipCount: number;
  createdAt: string;
  videoId?: string;
}

export type ProcessingStep = 
  | "idle"
  | "fetching"
  | "downloading"
  | "transcribing"
  | "analyzing"
  | "generating"
  | "complete";
