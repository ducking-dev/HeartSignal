'use client';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type SessionPhase = "idle" | "recording" | "processing" | "done" | "error";

export interface TranscriptSegment {
  t0: number;                   // 시작 시간 (ms)
  t1: number;                   // 종료 시간 (ms)
  text: string;                 // 전사된 텍스트
  speaker?: "me" | "partner";   // 화자 구분 (선택)
}

export interface ProsodySample {
  t: number;                    // 시간 (ms)
  rms: number;                  // RMS 볼륨 (0~1)
  pitch?: number;               // 피치 (Hz, 선택)
}

export interface EmotionAnalysis {
  valence: number;              // 감정 극성 (-1~+1)
  arousal: number;              // 감정 각성도 (0~1)
  emotions: Array<{             // 세부 감정
    label: string;              // joy, anger, sadness, fear, surprise
    score: number;              // 0~1
  }>;
  evidence?: string[];          // 감정 근거
}

export interface ConversationAnalysis {
  rapport: number;              // 라포 형성도 (0~1)
  turnTakingBalance: number;    // 대화 균형도 (0~1)
  empathy: number;              // 공감 수준 (0~1)
  redFlags: string[];           // 경고 신호들
  highlights: string[];         // 긍정적 하이라이트들
}

export interface MatchScore {
  score: number;                // 최종 매칭율 (0~100)
  breakdown: {                  // 세부 점수
    text: number;               // 텍스트 분석 점수
    voice: number;              // 음성 분석 점수
    balance: number;            // 대화 균형 점수
  };
}

export interface Feedback {
  summary: string;              // 2~3문장 요약
  tips: string[];               // 실행 가능한 팁 3개
}

export interface SessionState {
  // 상태
  phase: SessionPhase;
  error: string | null;
  startTime: number | null;
  duration: number;             // 녹음 시간 (초)
  
  // 오디오 데이터
  audioBlob: Blob | null;
  prosody: ProsodySample[];
  currentRMS: number;           // 현재 볼륨 레벨
  
  // 전사 데이터
  segments: TranscriptSegment[];
  
  // 분석 결과
  emotion: EmotionAnalysis | null;
  conversation: ConversationAnalysis | null;
  match: MatchScore | null;
  feedback: Feedback | null;
}

export interface SessionActions {
  reset(): void;
  setPhase(phase: SessionPhase): void;
  setError(message: string): void;
  setDuration(duration: number): void;
  pushProsody(sample: ProsodySample): void;
  setCurrentRMS(rms: number): void;
  pushSegment(segment: TranscriptSegment): void;
  setAudioBlob(blob: Blob): void;
  setEmotion(analysis: EmotionAnalysis): void;
  setConversation(analysis: ConversationAnalysis): void;
  setMatch(score: MatchScore): void;
  setFeedback(feedback: Feedback): void;
}

const initialState: SessionState = {
  phase: "idle",
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
};

export const useSessionStore = create<SessionState & SessionActions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      reset: () => set(initialState, false, 'reset'),
      
      setPhase: (phase: SessionPhase) => 
        set({ phase }, false, `setPhase:${phase}`),
      
      setError: (error: string) => 
        set({ error, phase: "error" }, false, 'setError'),
      
      setDuration: (duration: number) => 
        set({ duration }, false, 'setDuration'),
      
      pushProsody: (sample: ProsodySample) => 
        set((state) => ({ 
          prosody: [...state.prosody, sample] 
        }), false, 'pushProsody'),
      
      setCurrentRMS: (currentRMS: number) => 
        set({ currentRMS }, false, 'setCurrentRMS'),
      
      pushSegment: (segment: TranscriptSegment) => 
        set((state) => ({ 
          segments: [...state.segments, segment] 
        }), false, 'pushSegment'),
      
      setAudioBlob: (audioBlob: Blob) => 
        set({ audioBlob }, false, 'setAudioBlob'),
      
      setEmotion: (emotion: EmotionAnalysis) => 
        set({ emotion }, false, 'setEmotion'),
      
      setConversation: (conversation: ConversationAnalysis) => 
        set({ conversation }, false, 'setConversation'),
      
      setMatch: (match: MatchScore) => 
        set({ match }, false, 'setMatch'),
      
      setFeedback: (feedback: Feedback) => 
        set({ feedback }, false, 'setFeedback'),
    }),
    { name: 'heartsignal-session' }
  )
);
