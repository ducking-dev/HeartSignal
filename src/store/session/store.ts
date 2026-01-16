/**
 * Session Store - SOLID 원칙 적용된 통합 스토어
 * 각 액션 그룹을 조합하여 완전한 스토어 구성
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  SessionState, 
  AudioState, 
  TranscriptState, 
  AnalysisState 
} from './types';
import type { AllActions } from './actions';
import {
  createSessionActions,
  createAudioActions,
  createTranscriptActions,
  createAnalysisActions,
} from './actions';

// 전체 스토어 상태 타입 (Interface Segregation)
export interface HeartSignalState extends 
  SessionState, 
  AudioState, 
  TranscriptState, 
  AnalysisState {}

// 초기 상태 (Single Responsibility)
const initialState: HeartSignalState = {
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

// 통합 스토어 생성 (Dependency Inversion)
export const useSessionStore = create<HeartSignalState & AllActions>()(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // 각 액션 그룹을 조합 (Open/Closed Principle)
      ...createSessionActions(set, get),
      ...createAudioActions(set, get),
      ...createTranscriptActions(set, get),
      ...createAnalysisActions(set, get),
    }),
    { 
      name: 'heartsignal-session',
      // 개발 환경에서만 devtools 활성화
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// 타입 안전한 셀렉터 훅들 (Liskov Substitution)
export const useSessionState = () => useSessionStore((state) => ({
  phase: state.phase,
  error: state.error,
  startTime: state.startTime,
  duration: state.duration,
}));

export const useAudioState = () => useSessionStore((state) => ({
  audioBlob: state.audioBlob,
  prosody: state.prosody,
  currentRMS: state.currentRMS,
}));

export const useTranscriptState = () => useSessionStore((state) => ({
  segments: state.segments,
}));

export const useAnalysisState = () => useSessionStore((state) => ({
  emotion: state.emotion,
  conversation: state.conversation,
  match: state.match,
  feedback: state.feedback,
}));

// 액션만 반환하는 훅들 (Interface Segregation)
export const useSessionActions = () => useSessionStore((state) => ({
  reset: state.reset,
  setPhase: state.setPhase,
  setError: state.setError,
  setDuration: state.setDuration,
  setStartTime: state.setStartTime,
}));

export const useAudioActions = () => useSessionStore((state) => ({
  setAudioBlob: state.setAudioBlob,
  pushProsody: state.pushProsody,
  setCurrentRMS: state.setCurrentRMS,
  clearAudioData: state.clearAudioData,
}));

export const useTranscriptActions = () => useSessionStore((state) => ({
  pushSegment: state.pushSegment,
  clearSegments: state.clearSegments,
}));

export const useAnalysisActions = () => useSessionStore((state) => ({
  setEmotion: state.setEmotion,
  setConversation: state.setConversation,
  setMatch: state.setMatch,
  setFeedback: state.setFeedback,
  clearAnalysis: state.clearAnalysis,
}));

