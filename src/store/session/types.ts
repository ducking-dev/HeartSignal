/**
 * Session Store Types - Interface Segregation 원칙 적용
 * 세션 관련 타입들을 분리하여 의존성 최소화
 */

export type SessionPhase = "idle" | "recording" | "processing" | "done" | "error";

// 세션 상태 (Single Responsibility)
export interface SessionState {
  phase: SessionPhase;
  error: string | null;
  startTime: number | null;
  duration: number;
}

// 오디오 상태 (Interface Segregation)
export interface AudioState {
  audioBlob: Blob | null;
  prosody: ProsodySample[];
  currentRMS: number;
}

// 전사 상태 (Single Responsibility)
export interface TranscriptState {
  segments: TranscriptSegment[];
}

// 분석 상태 (Interface Segregation)
export interface AnalysisState {
  emotion: EmotionAnalysis | null;
  conversation: ConversationAnalysis | null;
  match: MatchScore | null;
  feedback: Feedback | null;
}

// 기존 타입들 재사용
export interface TranscriptSegment {
  t0: number;
  t1: number;
  text: string;
  speaker?: "me" | "partner";
}

export interface ProsodySample {
  t: number;
  rms: number;
  pitch?: number;
}

export interface EmotionAnalysis {
  valence: number;
  arousal: number;
  emotions: Array<{
    label: string;
    score: number;
  }>;
  evidence?: string[];
}

export interface ConversationAnalysis {
  rapport: number;
  turnTakingBalance: number;
  empathy: number;
  redFlags: string[];
  highlights: string[];
}

export interface MatchScore {
  score: number;
  breakdown: {
    text: number;
    voice: number;
    balance: number;
  };
}

export interface Feedback {
  summary: string;
  tips: string[];
}

