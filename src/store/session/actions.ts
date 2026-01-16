/**
 * Session Actions - Single Responsibility 원칙 적용
 * 각 액션 그룹은 특정 도메인만 담당
 */

import type { 
  SessionPhase, 
  ProsodySample, 
  TranscriptSegment,
  EmotionAnalysis,
  ConversationAnalysis,
  MatchScore,
  Feedback 
} from './types';

// 세션 관련 액션 (Single Responsibility)
export interface SessionActions {
  reset(): void;
  setPhase(phase: SessionPhase): void;
  setError(message: string): void;
  setDuration(duration: number): void;
  setStartTime(time: number | null): void;
}

// 오디오 관련 액션 (Interface Segregation)
export interface AudioActions {
  setAudioBlob(blob: Blob): void;
  pushProsody(sample: ProsodySample): void;
  setCurrentRMS(rms: number): void;
  clearAudioData(): void;
}

// 전사 관련 액션 (Single Responsibility)
export interface TranscriptActions {
  pushSegment(segment: TranscriptSegment): void;
  clearSegments(): void;
}

// 분석 관련 액션 (Interface Segregation)
export interface AnalysisActions {
  setEmotion(analysis: EmotionAnalysis): void;
  setConversation(analysis: ConversationAnalysis): void;
  setMatch(score: MatchScore): void;
  setFeedback(feedback: Feedback): void;
  clearAnalysis(): void;
}

// 통합 액션 인터페이스 (Dependency Inversion)
export interface AllActions extends 
  SessionActions, 
  AudioActions, 
  TranscriptActions, 
  AnalysisActions {}

// 액션 구현 팩토리 (Open/Closed Principle)
export const createSessionActions = (
  set: (partial: any) => void,
  get: () => any
): SessionActions => ({
  reset: () => set({
    phase: "idle" as SessionPhase,
    error: null,
    startTime: null,
    duration: 0,
    audioBlob: null,
    prosody: [],
    currentRMS: 0,
    segments: [],
    emotion: null,
    conversation: null,
    match: null,
    feedback: null,
  }),
  
  setPhase: (phase: SessionPhase) => set({ phase }),
  
  setError: (error: string) => set({ 
    error, 
    phase: "error" as SessionPhase 
  }),
  
  setDuration: (duration: number) => set({ duration }),
  
  setStartTime: (startTime: number | null) => set({ startTime }),
});

export const createAudioActions = (
  set: (partial: any) => void,
  get: () => any
): AudioActions => ({
  setAudioBlob: (audioBlob: Blob) => set({ audioBlob }),
  
  pushProsody: (sample: ProsodySample) => set((state: any) => ({
    prosody: [...state.prosody, sample]
  })),
  
  setCurrentRMS: (currentRMS: number) => set({ currentRMS }),
  
  clearAudioData: () => set({
    audioBlob: null,
    prosody: [],
    currentRMS: 0,
  }),
});

export const createTranscriptActions = (
  set: (partial: any) => void,
  get: () => any
): TranscriptActions => ({
  pushSegment: (segment: TranscriptSegment) => set((state: any) => ({
    segments: [...state.segments, segment]
  })),
  
  clearSegments: () => set({ segments: [] }),
});

export const createAnalysisActions = (
  set: (partial: any) => void,
  get: () => any
): AnalysisActions => ({
  setEmotion: (emotion: EmotionAnalysis) => set({ emotion }),
  
  setConversation: (conversation: ConversationAnalysis) => set({ conversation }),
  
  setMatch: (match: MatchScore) => set({ match }),
  
  setFeedback: (feedback: Feedback) => set({ feedback }),
  
  clearAnalysis: () => set({
    emotion: null,
    conversation: null,
    match: null,
    feedback: null,
  }),
});

