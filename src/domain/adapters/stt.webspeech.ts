'use client';

/**
 * WebSpeech STT Adapter
 * 브라우저의 Web Speech API를 사용한 실시간 음성 인식 어댑터
 * SOLID 원칙의 Interface Segregation과 Dependency Inversion 적용
 */

import type { TranscriptSegment } from '@/store/useSessionStore';

export interface STTAdapter {
  transcribeRealtime(
    onSegment: (segment: TranscriptSegment) => void,
    onError: (error: string) => void
  ): STTController;
  isSupported(): boolean;
}

export interface STTController {
  start(): void;
  stop(): void;
  isActive(): boolean;
}

export interface WebSpeechConfig {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export class WebSpeechSTTAdapter implements STTAdapter {
  private recognition: any = null;
  private config: WebSpeechConfig;
  private isListening = false;
  private startTime = 0;

  constructor(config: WebSpeechConfig = {}) {
    this.config = {
      language: 'ko-KR',
      continuous: true,
      interimResults: true,
      maxAlternatives: 1,
      ...config,
    };
  }

  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    
    const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    return hasRecognition && isSecureContext;
  }

  transcribeRealtime(
    onSegment: (segment: TranscriptSegment) => void,
    onError: (error: string) => void
  ): STTController {
    if (!this.isSupported()) {
      const errorMsg = typeof window === 'undefined' 
        ? '서버 환경에서는 음성 인식을 사용할 수 없습니다.'
        : !window.isSecureContext 
        ? '음성 인식은 HTTPS 환경에서만 사용할 수 있습니다.'
        : '이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 브라우저를 사용해주세요.';
      
      onError(errorMsg);
      return this.createDummyController();
    }

    try {
      // SpeechRecognition 인스턴스 생성
      const SpeechRecognition = 
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      this.recognition = new SpeechRecognition();
      this.setupRecognition(onSegment, onError);

      return {
        start: () => this.startRecognition(),
        stop: () => this.stopRecognition(),
        isActive: () => this.isListening,
      };
    } catch (error: any) {
      onError(`음성 인식 초기화 실패: ${error.message}`);
      return this.createDummyController();
    }
  }

  private setupRecognition(
    onSegment: (segment: TranscriptSegment) => void,
    onError: (error: string) => void
  ): void {
    if (!this.recognition) return;

    // 설정 적용
    this.recognition.lang = this.config.language!;
    this.recognition.continuous = this.config.continuous!;
    this.recognition.interimResults = this.config.interimResults!;
    this.recognition.maxAlternatives = this.config.maxAlternatives!;

    // 이벤트 리스너 설정
    this.recognition.onstart = () => {
      this.isListening = true;
      this.startTime = Date.now();
      console.log('음성 인식 시작됨');
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      
      const errorMessages: Record<string, string> = {
        'no-speech': '음성이 감지되지 않았습니다. 다시 시도해주세요.',
        'audio-capture': '마이크에 접근할 수 없습니다. 권한을 확인해주세요.',
        'not-allowed': '마이크 사용 권한이 거부되었습니다.',
        'network': '네트워크 오류가 발생했습니다.',
        'service-not-allowed': '음성 인식 서비스를 사용할 수 없습니다.',
        'bad-grammar': '문법 오류가 발생했습니다.',
        'language-not-supported': '지원되지 않는 언어입니다.',
      };

      const message = errorMessages[event.error] || `음성 인식 오류: ${event.error}`;
      onError(message);
    };

    this.recognition.onresult = (event: any) => {
      this.handleResults(event, onSegment);
    };

    // 자동 재시작 설정 (연속 인식을 위해)
    this.recognition.onend = () => {
      this.isListening = false;
      console.log('음성 인식 종료됨');
      
      // 수동으로 중지하지 않았다면 자동으로 재시작
      if (this.config.continuous && this.recognition) {
        setTimeout(() => {
          if (this.recognition && !this.isListening) {
            try {
              this.recognition.start();
              console.log('음성 인식 자동 재시작');
            } catch (error) {
              console.warn('음성 인식 재시작 실패:', error);
            }
          }
        }, 100);
      }
    };
  }

  private handleResults(
    event: any,
    onSegment: (segment: TranscriptSegment) => void
  ): void {
    const currentTime = Date.now();
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript.trim();
      
      if (transcript.length === 0) continue;

      // 세그먼트 생성
      const segment: TranscriptSegment = {
        t0: currentTime - 2000, // 대략적인 시작 시간 (2초 전)
        t1: currentTime,
        text: transcript,
        speaker: this.detectSpeaker(transcript), // 간단한 화자 구분
      };

      // 실시간 전사를 위해 중간 결과도 전송하되, 최종 결과와 구분
      if (result.isFinal) {
        // 최종 결과
        onSegment(segment);
        console.log('최종 전사 결과:', transcript);
      } else if (this.config.interimResults && transcript.length > 3) {
        // 중간 결과 (3글자 이상일 때만)
        onSegment({
          ...segment,
          text: `[임시] ${transcript}`, // 중간 결과임을 표시
        });
        console.log('중간 전사 결과:', transcript);
      }
    }
  }

  private detectSpeaker(text: string): 'me' | 'partner' {
    // 간단한 화자 구분 로직
    // 실제로는 더 복잡한 화자 분리 알고리즘이 필요
    
    // 1인칭 표현이 있으면 'me'로 추정
    const firstPersonPatterns = [
      /^나는/, /^저는/, /^제가/, /^내가/,
      /나도/, /저도/, /내/, /제/
    ];
    
    const hasFirstPerson = firstPersonPatterns.some(pattern => 
      pattern.test(text)
    );
    
    if (hasFirstPerson) {
      return 'me';
    }
    
    // 질문 형태면 상대방일 가능성이 높음
    if (text.endsWith('?') || text.includes('어떻게') || text.includes('뭐')) {
      return 'partner';
    }
    
    // 기본적으로 번갈아가며 설정 (실제로는 더 정교한 로직 필요)
    return Math.random() > 0.5 ? 'me' : 'partner';
  }

  private startRecognition(): void {
    if (!this.recognition) {
      console.warn('음성 인식이 초기화되지 않았습니다.');
      return;
    }
    
    if (this.isListening) {
      console.warn('음성 인식이 이미 실행 중입니다.');
      return;
    }
    
    try {
      this.recognition.start();
      console.log('음성 인식 시작 요청됨');
    } catch (error: any) {
      if (error.name === 'InvalidStateError') {
        console.warn('음성 인식이 이미 시작되었습니다.');
      } else {
        console.error('음성 인식 시작 실패:', error);
      }
    }
  }

  private stopRecognition(): void {
    if (!this.recognition) {
      console.warn('음성 인식이 초기화되지 않았습니다.');
      return;
    }
    
    if (!this.isListening) {
      console.warn('음성 인식이 실행 중이지 않습니다.');
      return;
    }
    
    try {
      this.recognition.stop();
      console.log('음성 인식 중지 요청됨');
    } catch (error) {
      console.error('음성 인식 중지 실패:', error);
    }
  }

  private createDummyController(): STTController {
    return {
      start: () => console.warn('STT not supported'),
      stop: () => console.warn('STT not supported'),
      isActive: () => false,
    };
  }
}

// 브라우저 호환성을 위한 타입 확장 (any로 처리)

// 데모용 STT 어댑터 (실제 음성 인식 없이 시뮬레이션)
export class DemoSTTAdapter implements STTAdapter {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;
  
  private demoTexts = [
    '안녕하세요! 만나서 반가워요.',
    '오늘 날씨가 정말 좋네요.',
    '어떤 일 하세요?',
    '취미가 뭐예요?',
    '영화 보는 걸 좋아해요.',
    '같이 커피 마실래요?',
    '다음에 또 만나요!',
  ];

  isSupported(): boolean {
    return true; // 데모는 항상 지원됨
  }

  transcribeRealtime(
    onSegment: (segment: TranscriptSegment) => void,
    onError: (error: string) => void
  ): STTController {
    return {
      start: () => this.startDemo(onSegment),
      stop: () => this.stopDemo(),
      isActive: () => this.isActive,
    };
  }

  private startDemo(onSegment: (segment: TranscriptSegment) => void): void {
    if (this.isActive) return;
    
    console.log('데모 STT 시작');
    this.isActive = true;
    let textIndex = 0;
    const startTime = Date.now();

    this.intervalId = setInterval(() => {
      if (textIndex >= this.demoTexts.length) {
        console.log('데모 STT 모든 텍스트 처리 완료');
        this.stopDemo();
        return;
      }

      const currentTime = Date.now();
      const segment: TranscriptSegment = {
        t0: currentTime - 1000,
        t1: currentTime,
        text: this.demoTexts[textIndex],
        speaker: textIndex % 2 === 0 ? 'me' : 'partner',
      };

      console.log(`데모 STT 세그먼트 ${textIndex + 1}:`, segment);
      onSegment(segment);
      textIndex++;
    }, 2000); // 2초마다 새로운 텍스트 (더 빠른 데모)
  }

  private stopDemo(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
  }
}