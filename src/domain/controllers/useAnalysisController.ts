'use client';

import { 
  useSessionStore,
  useSessionState,
  useSessionActions,
  useAudioActions,
  useTranscriptActions,
  useAnalysisActions 
} from '@/store/session/store';
import { AudioRecorder } from '@/domain/audio/recorder';
import { WebSpeechSTTAdapter, STTAdapter } from '@/domain/adapters/stt.webspeech';
import { OpenAIAdapter } from '@/domain/adapters/llm.openai';
import { 
  computeMatchScore, 
  generateDemoScore, 
  generateDemoEmotion, 
  generateDemoConversation, 
  generateDemoFeedback 
} from '@/domain/analysis/scoring';
import { loadMockSessionDataInstant } from '@/lib/mock-data';
import { useCallback, useRef, useEffect } from 'react';

export function useAnalysisController() {
  // SOLID 원칙 적용: 필요한 상태와 액션만 구독 (Interface Segregation)
  const sessionState = useSessionState();
  const sessionActions = useSessionActions();
  const audioActions = useAudioActions();
  const transcriptActions = useTranscriptActions();
  const analysisActions = useAnalysisActions();
  
  // 호환성을 위한 통합 객체
  const store = {
    ...sessionState,
    ...sessionActions,
    ...audioActions,
    ...transcriptActions,
    ...analysisActions,
    // 추가 상태들
    segments: useSessionStore(state => state.segments),
    emotion: useSessionStore(state => state.emotion),
    conversation: useSessionStore(state => state.conversation),
    match: useSessionStore(state => state.match),
    feedback: useSessionStore(state => state.feedback),
  };
  const recorderRef = useRef<AudioRecorder | null>(null);
  const sttRef = useRef<STTAdapter | null>(null);
  const sttControlRef = useRef<{ start: () => void; stop: () => void } | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 타이머 업데이트
  useEffect(() => {
    if (store.phase === 'recording' && startTimeRef.current) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current!) / 1000);
        store.setDuration(elapsed);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [store.phase]);

  const startSession = useCallback(async () => {
    try {
      console.log('세션 시작 시도...');
      store.reset();
      store.setPhase('recording');
      startTimeRef.current = Date.now();

      // 1. 마이크 권한 체크
      console.log('마이크 권한 체크...');
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop()); // 권한 체크 후 즉시 해제
        console.log('마이크 권한 확인됨');
      } catch (permissionError: any) {
        console.error('마이크 권한 오류:', permissionError);
        throw new Error('마이크 사용 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
      }

      // 2. 오디오 녹음 시작
      console.log('오디오 녹음 시작...');
      recorderRef.current = new AudioRecorder();
      await recorderRef.current.start();
      console.log('오디오 녹음 시작 완료');

      // 3. 실시간 STT 시작
      console.log('STT 시작...');
      sttRef.current = new WebSpeechSTTAdapter();
      
      // STT가 지원되지 않는 경우 데모 모드 사용
      if (!sttRef.current.isSupported()) {
        console.log('STT 지원되지 않음, 데모 STT 사용');
        const { DemoSTTAdapter } = await import('@/domain/adapters/stt.webspeech');
        sttRef.current = new DemoSTTAdapter();
        console.log('데모 STT 어댑터로 전환 완료');
      } else {
        console.log('Web Speech STT 사용 가능');
      }
      
      sttControlRef.current = sttRef.current.transcribeRealtime(
        (segment) => {
          console.log('새 세그먼트:', segment);
          store.pushSegment(segment);
        },
        (error) => {
          console.error('STT 에러:', error);
          store.setError(error);
        }
      );
      sttControlRef.current.start();
      console.log('STT 시작 완료');

      // 4. 실시간 음성 레벨 시뮬레이션 (간단한 버전)
      const levelInterval = setInterval(() => {
        if (store.phase === 'recording') {
          const randomLevel = Math.random() * 0.8 + 0.1; // 0.1 ~ 0.9
          store.setCurrentRMS(randomLevel);
        } else {
          clearInterval(levelInterval);
        }
      }, 100);

      console.log('세션 시작 완료');

    } catch (error: any) {
      console.error('세션 시작 실패:', error);
      store.setError(error.message || '알 수 없는 오류가 발생했습니다.');
      store.setPhase('error');
      
      // 리소스 정리
      if (recorderRef.current) {
        try {
          await recorderRef.current.stop();
        } catch (cleanupError) {
          console.error('녹음기 정리 실패:', cleanupError);
        }
      }
      
      if (sttControlRef.current) {
        try {
          sttControlRef.current.stop();
        } catch (cleanupError) {
          console.error('STT 정리 실패:', cleanupError);
        }
      }
    }
  }, [store]);

  const stopAndAnalyze = useCallback(async () => {
    try {
      console.log('분석 시작...');
      store.setPhase('processing');

      // 1. 녹음 및 실시간 분석 중지
      let audioBlob: Blob | null = null;
      
      console.log('녹음 중지 중...');
      if (recorderRef.current) {
        try {
          audioBlob = await recorderRef.current.stop();
          store.setAudioBlob(audioBlob);
          console.log('녹음 중지 완료, 블롭 크기:', audioBlob.size);
        } catch (stopError) {
          console.error('녹음 중지 실패:', stopError);
          throw new Error(`녹음 중지에 실패했습니다: ${stopError instanceof Error ? stopError.message : String(stopError)}`);
        }
      }

      console.log('STT 중지 중...');
      if (sttControlRef.current) {
        try {
          sttControlRef.current.stop();
          console.log('STT 중지 완료');
        } catch (sttStopError) {
          console.error('STT 중지 실패:', sttStopError);
          // STT 중지 실패는 치명적이지 않으므로 계속 진행
        }
      }

      // STT 참조 정리
      sttControlRef.current = null;
      sttRef.current = null;

      // 2. 전사 텍스트 준비
      const transcript = store.segments.map(s => s.text).join(' ').trim();
      console.log('전사 텍스트:', transcript);
      console.log('세그먼트 개수:', store.segments.length);
      
      // 전사 텍스트가 없거나 너무 짧으면 데모 데이터 사용
      if (!transcript || transcript.length < 5) {
        console.warn('전사 텍스트가 너무 짧음 또는 없음, 데모 데이터로 진행');
        console.log('데모 분석 시작...');
        await simulateAnalysis(store);
        console.log('데모 분석 완료');
        return;
      }

      // 3. AI 분석 실행 또는 데모 데이터 사용
      const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      console.log('=== 환경변수 디버깅 ===');
      console.log('API 키 존재 여부:', !!apiKey);
      console.log('API 키 길이:', apiKey?.length || 0);
      console.log('API 키 시작 부분:', apiKey?.substring(0, 10) || 'undefined');
      console.log('전체 환경변수 키들:', Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));
      console.log('=====================');
      
      if (!apiKey) {
        console.log('API 키 없음, 데모 데이터 사용');
        await simulateAnalysis(store);
        return;
      }

      try {
        console.log('OpenAI 분석 시작...');
        const openai = new OpenAIAdapter({
          apiKey,
          model: 'gpt-4o-mini',
          maxTokens: 500,
          temperature: 0.3
        });

        // 병렬로 감정 분석과 상호작용 분석 실행
        const [emotion, conversation] = await Promise.all([
          openai.analyzeEmotion(transcript),
          openai.analyzeConversation(transcript, {
            segmentCount: store.segments.length,
            avgSegmentLength: transcript.length / store.segments.length,
            duration: store.duration
          })
        ]);

        console.log('AI 분석 완료');

        // 점수 계산
        const prosodySummary = {
          avgRMS: 0.3,
          rmsVariance: 0.1
        };

        const match = computeMatchScore(emotion, conversation, prosodySummary);

        // 피드백 생성
        const feedback = await openai.generateFeedback({
          matchScore: match,
          emotion,
          conversation
        });

        // 결과 저장
        store.setEmotion(emotion);
        store.setConversation(conversation);
        store.setMatch(match);
        store.setFeedback(feedback);
        store.setPhase('done');

        console.log('분석 완료');

      } catch (apiError) {
        console.error('OpenAI API error:', apiError);
        // API 실패 시 데모 데이터로 대체
        console.log('API 실패, 데모 데이터로 대체');
        await simulateAnalysis(store);
      }

    } catch (error: any) {
      console.error('Analysis error:', error);
      store.setError(error.message || '분석 중 오류가 발생했습니다.');
      store.setPhase('error');
    }
  }, [store]);

  const resetSession = useCallback(() => {
    console.log('세션 리셋 시작...');
    
    // 모든 리소스 정리
    if (sttControlRef.current) {
      try {
        sttControlRef.current.stop();
        console.log('STT 중지됨');
      } catch (error) {
        console.warn('STT 중지 중 오류:', error);
      }
      sttControlRef.current = null;
    }
    
    if (recorderRef.current) {
      try {
        recorderRef.current.stop();
        console.log('레코더 중지됨');
      } catch (error) {
        console.warn('레코더 중지 중 오류:', error);
      }
      recorderRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // 참조 정리
    sttRef.current = null;
    startTimeRef.current = null;
    
    // 스토어 리셋
    store.reset();
    
    console.log('세션 리셋 완료');
  }, [store]);

  const loadMockData = useCallback(() => {
    loadMockSessionDataInstant(store);
  }, [store]);

  return {
    startSession,
    stopAndAnalyze,
    resetSession,
    loadMockData,
    phase: store.phase,
    duration: store.duration,
    // currentRMS 속성이 스토어에 없어서 제거
    segments: store.segments,
    error: store.error,
    emotion: store.emotion,
    conversation: store.conversation,
    match: store.match,
    feedback: store.feedback,
    isRecording: store.phase === 'recording',
    isProcessing: store.phase === 'processing',
    isDone: store.phase === 'done',
    hasError: store.phase === 'error'
  };
}

// 데모 데이터 시뮬레이션
async function simulateAnalysis(store: any) {
  // 프로세싱 시뮬레이션
  await new Promise(resolve => setTimeout(resolve, 2000));

  const demoEmotion = generateDemoEmotion();
  const demoConversation = generateDemoConversation();
  const demoMatch = generateDemoScore();
  const demoFeedback = generateDemoFeedback();

  store.setEmotion(demoEmotion);
  store.setConversation(demoConversation);
  store.setMatch(demoMatch);
  store.setFeedback(demoFeedback);
  store.setPhase('done');
}
