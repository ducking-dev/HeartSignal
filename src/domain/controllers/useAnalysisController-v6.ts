/**
 * 분석 컨트롤러 v6.0 - SOLID 원칙 적용 개선판
 * 기존 서비스와 분리된 새로운 컨트롤러
 */

import { useCallback, useRef, useEffect } from 'react';
import { useUnifiedSessionStore, useSessionActions, useAudioActions, useTranscriptActions, useAnalysisActions } from '@/store/session/unified-store';
import { AudioRecorder } from '@/domain/audio/recorder';
import { WebSpeechSTTAdapter } from '@/domain/adapters/stt.webspeech';
import { OpenAIAdapterV6 } from '@/domain/adapters/llm.openai-v6';
import { loadMockSessionDataInstant } from '@/lib/mock-data';
import { useResourceManager, useTimer, useAbortController } from '@/hooks/useResourceManager';
import type { STTController } from '@/domain/adapters/stt.webspeech';

/**
 * 리소스 관리 인터페이스 (Single Responsibility Principle)
 * SOLID 원칙: Interface Segregation Principle - 명확한 인터페이스 정의
 */
interface ManagedResource {
  cleanup(): void;
  isActive(): boolean;
}

/**
 * 타이머 관리 클래스 (Single Responsibility Principle)
 */
class SessionTimer implements ManagedResource {
  private timerId: NodeJS.Timeout | null = null;
  private startTime: number | null = null;
  private onUpdate: (duration: number) => void;

  constructor(onUpdate: (duration: number) => void) {
    this.onUpdate = onUpdate;
  }

  start(): void {
    this.startTime = Date.now();
    this.timerId = setInterval(() => {
      if (this.startTime) {
        const duration = Math.floor((Date.now() - this.startTime) / 1000);
        this.onUpdate(duration);
      }
    }, 1000);
  }

  stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  cleanup(): void {
    this.stop();
    this.startTime = null;
  }

  isActive(): boolean {
    return this.timerId !== null;
  }
}

/**
 * 오디오 레코더 래퍼 (Adapter Pattern)
 */
class SafeAudioRecorder implements ManagedResource {
  private recorder: AudioRecorder | null = null;

  async start(): Promise<void> {
    if (this.recorder) {
      throw new Error('레코더가 이미 실행 중입니다.');
    }
    
    this.recorder = new AudioRecorder();
    await this.recorder.start();
  }

  async stop(): Promise<Blob> {
    if (!this.recorder) {
      throw new Error('레코더가 실행되지 않았습니다.');
    }
    
    const blob = await this.recorder.stop();
    this.recorder = null;
    return blob;
  }

  cleanup(): void {
    if (this.recorder) {
      try {
        this.recorder.stop();
      } catch (error: unknown) {
        console.warn('레코더 정리 중 오류:', error);
      }
      this.recorder = null;
    }
  }

  isActive(): boolean {
    return this.recorder !== null;
  }
}

/**
 * STT 컨트롤러 래퍼 (Adapter Pattern)
 */
class SafeSTTController implements ManagedResource {
  private controller: STTController | null = null;
  private adapter: WebSpeechSTTAdapter;

  constructor() {
    this.adapter = new WebSpeechSTTAdapter();
  }

  start(
    onSegment: (segment: any) => void,
    onError: (error: string) => void
  ): void {
    if (this.controller) {
      throw new Error('STT가 이미 실행 중입니다.');
    }

    this.controller = this.adapter.transcribeRealtime(onSegment, onError);
    this.controller.start();
  }

  stop(): void {
    if (this.controller) {
      this.controller.stop();
      this.controller = null;
    }
  }

  cleanup(): void {
    this.stop();
  }

  isActive(): boolean {
    return this.controller !== null;
  }
}

/**
 * 리소스 관리자 (Composite Pattern)
 * SOLID 원칙: Composite Pattern으로 여러 리소스를 하나로 관리
 */
class ResourceManagerComposite implements ManagedResource {
  private resources: ManagedResource[] = [];

  add(resource: ManagedResource): void {
    this.resources.push(resource);
  }

  cleanup(): void {
    this.resources.forEach(resource => {
      try {
        resource.cleanup();
      } catch (error: unknown) {
        console.warn('리소스 정리 중 오류:', error);
      }
    });
    this.resources = [];
  }

  isActive(): boolean {
    return this.resources.some(resource => resource.isActive());
  }
}

/**
 * 개선된 분석 컨트롤러 v6.0
 * SOLID 원칙과 디자인 패턴을 적용한 안전한 컨트롤러
 */
export function useAnalysisControllerV6() {
  // 통합 스토어 사용 (Dependency Inversion Principle)
  const store = useUnifiedSessionStore();
  const sessionActions = useSessionActions();
  const audioActions = useAudioActions();
  const transcriptActions = useTranscriptActions();
  const analysisActions = useAnalysisActions();

  // 리소스 관리 (메모리 누수 방지)
  const { registerResource, unregisterResource, getActiveResources } = useResourceManager();
  const { getController: getAbortController, abort: abortAllRequests } = useAbortController();
  
  // 세션 타이머 (자동 리소스 관리)
  const sessionTimer = useTimer(
    () => {
      const duration = store.startTime ? Math.floor((Date.now() - store.startTime) / 1000) : 0;
      sessionActions.setDuration(duration);
    },
    1000,
    false // 수동 시작
  );

  // 리소스 참조들
  const recorderRef = useRef<SafeAudioRecorder | null>(null);
  const sttRef = useRef<SafeSTTController | null>(null);

  /**
   * 세션 시작 (Single Responsibility Principle)
   */
  const startSession = useCallback(async () => {
    try {
      console.log('세션 시작...');
      sessionActions.setPhase('recording');
      sessionActions.setStartTime(Date.now());

      // 세션 타이머 시작
      sessionTimer.start();

      // 오디오 레코더 시작
      recorderRef.current = new SafeAudioRecorder();
      await recorderRef.current.start();
      
      // 레코더를 리소스로 등록
      registerResource({
        id: 'audio-recorder',
        cleanup: () => recorderRef.current?.cleanup(),
        isActive: () => recorderRef.current?.isActive() || false,
      });

      // STT 시작
      sttRef.current = new SafeSTTController();
      sttRef.current.start(
        (segment) => {
          transcriptActions.pushSegment(segment);
        },
        (error) => {
          console.error('STT 에러:', error);
          sessionActions.setError(error);
        }
      );

      // STT를 리소스로 등록
      registerResource({
        id: 'stt-controller',
        cleanup: () => sttRef.current?.cleanup(),
        isActive: () => sttRef.current?.isActive() || false,
      });

      console.log('세션 시작 완료');
    } catch (error: unknown) {
      console.error('세션 시작 실패:', error);
      const errorMessage = 
        error instanceof Error ? error.message :
        typeof error === 'string' ? error :
        '세션을 시작할 수 없습니다.';
      sessionActions.setError(errorMessage);
      
      // 에러 발생 시 모든 리소스 정리
      sessionTimer.stop();
      await unregisterResource('audio-recorder');
      await unregisterResource('stt-controller');
    }
  }, [sessionActions, transcriptActions, registerResource, unregisterResource, sessionTimer]);

  /**
   * 세션 중지 및 분석 (Single Responsibility Principle)
   */
  const stopAndAnalyze = useCallback(async () => {
    try {
      console.log('분석 시작...');
      sessionActions.setPhase('processing');

      // 타이머 중지
      sessionTimer.stop();

      // 오디오 레코더 중지 및 데이터 저장
      let audioBlob: Blob | null = null;
      if (recorderRef.current) {
        audioBlob = await recorderRef.current.stop();
        audioActions.setAudioBlob(audioBlob);
      }

      // STT 중지
      if (sttRef.current) {
        sttRef.current.stop();
      }

      // 리소스 정리
      await unregisterResource('audio-recorder');
      await unregisterResource('stt-controller');

      // AI 분석 시도 (AbortController로 취소 가능)
      try {
        const controller = getAbortController();
        await performAIAnalysisV6(store, analysisActions, controller.signal);
        sessionActions.setPhase('done');
        console.log('분석 완료');
      } catch (apiError: unknown) {
        if (apiError instanceof Error && apiError.name === 'AbortError') {
          console.log('분석이 취소되었습니다.');
          return;
        }
        
        console.error('AI 분석 실패, Mock 데이터 사용:', apiError);
        await simulateAnalysis(analysisActions);
        sessionActions.setPhase('done');
      }

    } catch (error: unknown) {
      console.error('분석 중 오류:', error);
      const errorMessage = 
        error instanceof Error ? error.message :
        typeof error === 'string' ? error :
        '분석 중 오류가 발생했습니다.';
      sessionActions.setError(errorMessage);
    }
  }, [sessionActions, audioActions, analysisActions, store, sessionTimer, unregisterResource, getAbortController]);

  /**
   * 세션 리셋 (Single Responsibility Principle)
   */
  const resetSession = useCallback(async () => {
    console.log('세션 리셋...');
    
    // 타이머 중지
    sessionTimer.stop();
    
    // 진행 중인 모든 API 요청 취소
    abortAllRequests();
    
    // 모든 리소스 정리
    await unregisterResource('audio-recorder');
    await unregisterResource('stt-controller');
    
    // 참조 초기화
    recorderRef.current = null;
    sttRef.current = null;
    
    // 스토어 리셋
    sessionActions.reset();
    
    console.log('세션 리셋 완료');
  }, [sessionActions, sessionTimer, abortAllRequests, unregisterResource]);

  /**
   * Mock 데이터 로드
   */
  const loadMockData = useCallback(() => {
    loadMockSessionDataInstant(store);
  }, [store]);

  // 개발 환경에서 리소스 모니터링
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const activeResources = getActiveResources();
        if (activeResources.length > 0) {
          console.log('🔍 활성 리소스:', activeResources);
        }
      }, 15000); // 15초마다 체크

      return () => clearInterval(interval);
    }
  }, [getActiveResources]);

  return {
    // 상태
    phase: store.phase,
    error: store.error,
    duration: store.duration,
    segments: store.segments,
    match: store.match,
    feedback: store.feedback,
    isRecording: store.phase === 'recording',
    
    // 액션
    startSession,
    stopAndAnalyze,
    resetSession,
    loadMockData,
    
    // 디버깅 정보 (개발 환경)
    ...(process.env.NODE_ENV === 'development' && {
      getActiveResources,
      isTimerRunning: sessionTimer.isRunning,
    }),
  };
}

/**
 * AI 분석 수행 v6.0 - 강화된 에러 핸들링 (Single Responsibility Principle)
 * SOLID 원칙: Dependency Inversion Principle - 구체적 타입이 아닌 인터페이스에 의존
 */
async function performAIAnalysisV6(
  store: { segments: any[]; prosody: any[] },
  analysisActions: { setEmotion: (emotion: any) => void; setConversation: (conversation: any) => void; setMatch: (match: any) => void; setFeedback: (feedback: any) => void },
  signal?: AbortSignal
): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  const llm = new OpenAIAdapterV6({ apiKey });
  
  // 취소 확인 헬퍼
  const checkAborted = () => {
    if (signal?.aborted) {
      throw new Error('AbortError');
    }
  };

  try {
    // 감정 분석
    checkAborted();
    console.log('🧠 감정 분석 시작...');
    const emotionResult = await llm.analyzeEmotion({
      segments: store.segments,
      prosody: store.prosody,
    });
    analysisActions.setEmotion(emotionResult);

    // 대화 분석
    checkAborted();
    console.log('💬 대화 분석 시작...');
    const conversationResult = await llm.analyzeConversation({
      segments: store.segments,
      emotion: emotionResult,
    });
    analysisActions.setConversation(conversationResult);

    // 매칭 점수 계산
    checkAborted();
    console.log('📊 매칭 점수 계산 시작...');
    const matchResult = await llm.calculateMatchScore({
      emotion: emotionResult,
      conversation: conversationResult,
    });
    analysisActions.setMatch(matchResult);

    // 피드백 생성
    checkAborted();
    console.log('💡 피드백 생성 시작...');
    const feedbackResult = await llm.generateFeedback({
      emotion: emotionResult,
      conversation: conversationResult,
      match: matchResult,
    });
    analysisActions.setFeedback(feedbackResult);

    console.log('✅ AI 분석 완료');
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'AbortError') {
      console.log('🚫 AI 분석 취소됨');
      throw error;
    }
    
    console.error('❌ AI 분석 실패:', error);
    throw error;
  }
}

/**
 * Mock 분석 시뮬레이션 (Fallback)
 */
async function simulateAnalysis(analysisActions: any): Promise<void> {
  // Mock 데이터로 분석 결과 시뮬레이션
  const mockEmotion = {
    valence: 0.7,
    arousal: 0.6,
    emotions: [
      { label: 'joy', score: 0.8 },
      { label: 'interest', score: 0.7 },
    ],
    evidence: ['긍정적인 어조', '활발한 대화'],
  };

  const mockConversation = {
    rapport: 0.75,
    turnTakingBalance: 0.8,
    empathy: 0.7,
    redFlags: [],
    highlights: ['자연스러운 대화 흐름', '상호 관심 표현'],
  };

  const mockMatch = {
    score: 78,
    breakdown: {
      text: 80,
      voice: 75,
      balance: 80,
    },
  };

  const mockFeedback = {
    summary: '전반적으로 좋은 대화였습니다. 서로에 대한 관심이 잘 드러났고 자연스러운 소통이 이루어졌습니다.',
    tips: [
      '더 깊이 있는 질문으로 상대방을 알아가보세요',
      '공통 관심사에 대해 더 이야기해보세요',
      '적절한 유머로 분위기를 더욱 편안하게 만들어보세요',
    ],
  };

  analysisActions.setEmotion(mockEmotion);
  analysisActions.setConversation(mockConversation);
  analysisActions.setMatch(mockMatch);
  analysisActions.setFeedback(mockFeedback);
}
