export interface ImageAnalysisResult {
  isAI: boolean;
  confidence: number;
  metadata?: {
    format: string;
    width: number;
    height: number;
    size: number;
    hasExif: boolean;
    software?: string;
  };
  compressionFactor: number;
  noiseScore: number;
  ganArtifactScore: number;
  explanation: string;
}

export interface VideoAnalysisResult {
  isAI: boolean;
  confidence: number;
  faceConsistency: number;
  lipSyncScore: number;
  temporalInconsistency: number;
  suspiciousFrames: number[];
  timelineAnalysis: { timestamp: number; aiScore: number }[];
  explanation: string;
}

export interface TextAnalysisResult {
  isAI: boolean;
  confidence: number;
  perplexity: number;
  burstiness: number;
  sentenceAnalysis: {
    sentence: string;
    score: number; // 0 (Human) to 1 (AI)
    perplexity: number;
  }[];
  suspiciousParagraphs: number[]; // indexes of paragraphs that are likely AI
  explanation: string;
}

export interface IAIEngine {
  analyzeImage(filePath: string): Promise<ImageAnalysisResult>;
  analyzeVideo(filePath: string): Promise<VideoAnalysisResult>;
  analyzeText(text: string): Promise<TextAnalysisResult>;
}
