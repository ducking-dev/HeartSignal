/**
 * 통합 세션 스토어 - SOLID 원칙 적용
 * v6.0 개선사항: 중복 스토어 통합 및 타입 안전성 강화
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// 기존 타입들을 재사용 (Open/Closed Principle)
export type SessionPhase = "idle" | "recording" | "processing" | "done" | "error";

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

// 상태 인터페이스들 (Interface Segregation Principle)
export interface SessionState {
  phase: SessionPhase;
  error: string | null;
  startTime: number | null;
  duration: number;
}

export interface AudioState {
  audioBlob: Blob | null;
  prosody: ProsodySample[];
  currentRMS: number;
}

export interface TranscriptState {
  segments: TranscriptSegment[];
}

export interface AnalysisState {
  emotion: EmotionAnalysis | null;
  conversation: ConversationAnalysis | null;
  match: MatchScore | null;
  feedback: Feedback | null;
}

// 액션 인터페이스들 (Single Responsibility Principle)
export interface SessionActions {
  reset(): void;
  setPhase(phase: SessionPhase): void;
  setError(message: string): void;
  setDuration(duration: number): void;
  setStartTime(time: number | null): void;
}

export interface AudioActions {
  setAudioBlob(blob: Blob): void;
  pushProsody(sample: ProsodySample): void;
  setCurrentRMS(rms: number): void;
  clearAudioData(): void;
}

export interface TranscriptActions {
  pushSegment(segment: TranscriptSegment): void;
  clearSegments(): void;
}

export interface AnalysisActions {
  setEmotion(analysis: EmotionAnalysis): void;
  setConversation(analysis: ConversationAnalysis): void;
  setMatch(score: MatchScore): void;
  setFeedback(feedback: Feedback): void;
  clearAnalysis(): void;
}

// 전체 상태 및 액션 타입
export type UnifiedSessionState = SessionState & AudioState & TranscriptState & AnalysisState;
export type UnifiedSessionActions = SessionActions & AudioActions & TranscriptActions & AnalysisActions;

// 초기 상태
const initialState: UnifiedSessionState = {
  // Session
  phase: "idle",
  error: null,
  startTime: null,
  duration: 0,
  
  // Audio
  audioBlob: null,
  prosody: [],
  currentRMS: 0,
  
  // Transcript
  segments: [],
  
  // Analysis
  emotion: null,
  conversation: null,
  match: null,
  feedback: null,
};

/**
 * 통합 세션 스토어 (Dependency Inversion Principle)
 * 기존 스토어들을 대체하는 새로운 통합 스토어
 */
export const useUnifiedSessionStore = create<UnifiedSessionState & UnifiedSessionActions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Session Actions
      reset: () => {
        set(initialState, false, 'reset');
      },
      
      setPhase: (phase: SessionPhase) => {
        set({ phase }, false, `setPhase:${phase}`);
      },
      
      setError: (error: string) => {
        set({ error, phase: "error" }, false, 'setError');
      },
      
      setDuration: (duration: number) => {
        set({ duration }, false, 'setDuration');
      },
      
      setStartTime: (startTime: number | null) => {
        set({ startTime }, false, 'setStartTime');
      },
      
      // Audio Actions
      setAudioBlob: (audioBlob: Blob) => {
        set({ audioBlob }, false, 'setAudioBlob');
      },
      
      pushProsody: (sample: ProsodySample) => {
        set((state) => ({ 
          prosody: [...state.prosody, sample] 
        }), false, 'pushProsody');
      },
      
      setCurrentRMS: (currentRMS: number) => {
        set({ currentRMS }, false, 'setCurrentRMS');
      },
      
      clearAudioData: () => {
        set({ 
          audioBlob: null, 
          prosody: [], 
          currentRMS: 0 
        }, false, 'clearAudioData');
      },
      
      // Transcript Actions
      pushSegment: (segment: TranscriptSegment) => {
        set((state) => ({ 
          segments: [...state.segments, segment] 
        }), false, 'pushSegment');
      },
      
      clearSegments: () => {
        set({ segments: [] }, false, 'clearSegments');
      },
      
      // Analysis Actions
      setEmotion: (emotion: EmotionAnalysis) => {
        set({ emotion }, false, 'setEmotion');
      },
      
      setConversation: (conversation: ConversationAnalysis) => {
        set({ conversation }, false, 'setConversation');
      },
      
      setMatch: (match: MatchScore) => {
        set({ match }, false, 'setMatch');
      },
      
      setFeedback: (feedback: Feedback) => {
        set({ feedback }, false, 'setFeedback');
      },
      
      clearAnalysis: () => {
        set({ 
          emotion: null, 
          conversation: null, 
          match: null, 
          feedback: null 
        }, false, 'clearAnalysis');
      },
    }),
    { 
      name: 'heartsignal-unified-session',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// 타입 안전한 셀렉터 훅들 (Liskov Substitution Principle)
export const useSessionState = () => useUnifiedSessionStore((state) => ({
  phase: state.phase,
  error: state.error,
  startTime: state.startTime,
  duration: state.duration,
}));

export const useAudioState = () => useUnifiedSessionStore((state) => ({
  audioBlob: state.audioBlob,
  prosody: state.prosody,
  currentRMS: state.currentRMS,
}));

export const useTranscriptState = () => useUnifiedSessionStore((state) => ({
  segments: state.segments,
}));

export const useAnalysisState = () => useUnifiedSessionStore((state) => ({
  emotion: state.emotion,
  conversation: state.conversation,
  match: state.match,
  feedback: state.feedback,
}));

// 액션만 반환하는 훅들 (Interface Segregation Principle)
export const useSessionActions = () => useUnifiedSessionStore((state) => ({
  reset: state.reset,
  setPhase: state.setPhase,
  setError: state.setError,
  setDuration: state.setDuration,
  setStartTime: state.setStartTime,
}));

export const useAudioActions = () => useUnifiedSessionStore((state) => ({
  setAudioBlob: state.setAudioBlob,
  pushProsody: state.pushProsody,
  setCurrentRMS: state.setCurrentRMS,
  clearAudioData: state.clearAudioData,
}));

export const useTranscriptActions = () => useUnifiedSessionStore((state) => ({
  pushSegment: state.pushSegment,
  clearSegments: state.clearSegments,
}));

export const useAnalysisActions = () => useUnifiedSessionStore((state) => ({
  setEmotion: state.setEmotion,
  setConversation: state.setConversation,
  setMatch: state.setMatch,
  setFeedback: state.setFeedback,
  clearAnalysis: state.clearAnalysis,
}));

/**
 * 기존 스토어와의 호환성을 위한 어댑터 (Adapter Pattern)
 * 기존 코드 수정 없이 새로운 스토어 사용 가능
 */
export const useSessionStore = useUnifiedSessionStore;

// 타입 호환성을 위한 재수출
export type {
  SessionState as LegacySessionState,
  SessionActions as LegacySessionActions,
} from '../useSessionStore';
