/**
 * OpenAI LLM 어댑터 v6.0 - 강화된 에러 핸들링
 * SOLID 원칙과 디자인 패턴을 적용한 견고한 API 클라이언트
 */

import type { LLMAdapter } from './llm.openai';
import type { EmotionAnalysis, ConversationAnalysis, MatchScore, Feedback } from '@/store/session/unified-store';

/**
 * API 에러 타입 정의 (Single Responsibility Principle)
 */
export enum APIErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  QUOTA_ERROR = 'QUOTA_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export class APIError extends Error {
  constructor(
    public type: APIErrorType,
    message: string,
    public statusCode?: number,
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * 재시도 전략 인터페이스 (Strategy Pattern)
 */
interface RetryStrategy {
  shouldRetry(error: APIError, attempt: number): boolean;
  getDelay(attempt: number): number;
  getMaxAttempts(): number;
}

/**
 * 지수 백오프 재시도 전략
 */
class ExponentialBackoffStrategy implements RetryStrategy {
  constructor(
    private maxAttempts: number = 3,
    private baseDelay: number = 1000,
    private maxDelay: number = 10000
  ) {}

  shouldRetry(error: APIError, attempt: number): boolean {
    if (attempt >= this.maxAttempts) return false;
    
    // 재시도 가능한 에러 타입들
    const retryableErrors = [
      APIErrorType.NETWORK_ERROR,
      APIErrorType.TIMEOUT_ERROR,
      APIErrorType.RATE_LIMIT_ERROR,
    ];
    
    return retryableErrors.includes(error.type);
  }

  getDelay(attempt: number): number {
    const delay = this.baseDelay * Math.pow(2, attempt);
    return Math.min(delay, this.maxDelay);
  }

  getMaxAttempts(): number {
    return this.maxAttempts;
  }
}

/**
 * Circuit Breaker 상태
 */
enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

/**
 * Circuit Breaker 패턴 구현
 */
class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private successCount: number = 0;

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1분
    private successThreshold: number = 2
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime < this.recoveryTimeout) {
        throw new APIError(
          APIErrorType.UNKNOWN_ERROR,
          'Circuit breaker is OPEN. Service temporarily unavailable.'
        );
      } else {
        this.state = CircuitBreakerState.HALF_OPEN;
        this.successCount = 0;
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = CircuitBreakerState.CLOSED;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }

  getState(): CircuitBreakerState {
    return this.state;
  }
}

/**
 * HTTP 클라이언트 래퍼 (Decorator Pattern)
 */
class RobustHTTPClient {
  private circuitBreaker: CircuitBreaker;
  private retryStrategy: RetryStrategy;

  constructor(
    retryStrategy: RetryStrategy = new ExponentialBackoffStrategy(),
    circuitBreaker: CircuitBreaker = new CircuitBreaker()
  ) {
    this.retryStrategy = retryStrategy;
    this.circuitBreaker = circuitBreaker;
  }

  async request(url: string, options: RequestInit): Promise<Response> {
    return this.circuitBreaker.execute(async () => {
      return this.requestWithRetry(url, options);
    });
  }

  private async requestWithRetry(url: string, options: RequestInit): Promise<Response> {
    let lastError: APIError;
    
    for (let attempt = 0; attempt < this.retryStrategy.getMaxAttempts(); attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초 타임아웃
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw this.createAPIError(response);
        }
        
        return response;
        
      } catch (error) {
        lastError = this.handleError(error);
        
        if (!this.retryStrategy.shouldRetry(lastError, attempt)) {
          throw lastError;
        }
        
        if (attempt < this.retryStrategy.getMaxAttempts() - 1) {
          const delay = this.retryStrategy.getDelay(attempt);
          console.log(`API 요청 재시도 ${attempt + 1}/${this.retryStrategy.getMaxAttempts()} (${delay}ms 후)`);
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError!;
  }

  private createAPIError(response: Response): APIError {
    const statusCode = response.status;
    
    switch (statusCode) {
      case 401:
        return new APIError(APIErrorType.AUTH_ERROR, 'API 키가 유효하지 않습니다.', statusCode);
      case 429:
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60');
        return new APIError(APIErrorType.RATE_LIMIT_ERROR, 'API 요청 한도를 초과했습니다.', statusCode, retryAfter);
      case 402:
        return new APIError(APIErrorType.QUOTA_ERROR, 'API 사용량을 초과했습니다.', statusCode);
      case 500:
      case 502:
      case 503:
      case 504:
        return new APIError(APIErrorType.NETWORK_ERROR, 'OpenAI 서버 오류가 발생했습니다.', statusCode);
      default:
        return new APIError(APIErrorType.UNKNOWN_ERROR, `HTTP ${statusCode}: ${response.statusText}`, statusCode);
    }
  }

  private handleError(error: unknown): APIError {
    if (error instanceof APIError) {
      return error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new APIError(APIErrorType.TIMEOUT_ERROR, 'API 요청 시간이 초과되었습니다.');
      }
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return new APIError(APIErrorType.NETWORK_ERROR, '네트워크 연결을 확인해주세요.');
      }
      
      return new APIError(APIErrorType.UNKNOWN_ERROR, error.message || '알 수 없는 오류가 발생했습니다.');
    }
    
    return new APIError(APIErrorType.UNKNOWN_ERROR, '알 수 없는 오류가 발생했습니다.');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * 응답 파서 (Single Responsibility Principle)
 */
class ResponseParser {
  static async parseJSON<T>(response: Response): Promise<T> {
    try {
      const text = await response.text();
      
      if (!text.trim()) {
        throw new APIError(APIErrorType.PARSE_ERROR, 'OpenAI API에서 빈 응답을 받았습니다.');
      }
      
      const data = JSON.parse(text);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new APIError(APIErrorType.PARSE_ERROR, 'OpenAI API 응답 형식이 올바르지 않습니다.');
      }
      
      const content = data.choices[0].message.content;
      
      if (!content) {
        throw new APIError(APIErrorType.PARSE_ERROR, 'OpenAI API에서 내용을 받지 못했습니다.');
      }
      
      return JSON.parse(content);
      
    } catch (error: unknown) {
      if (error instanceof APIError) {
        throw error;
      }
      
      if (error instanceof SyntaxError) {
        throw new APIError(APIErrorType.PARSE_ERROR, 'OpenAI API 응답을 파싱할 수 없습니다.');
      }
      
      // 타입 가드를 사용한 안전한 메시지 추출 (SOLID 원칙 준수)
      const errorMessage = 
        error instanceof Error ? error.message :
        typeof error === 'string' ? error :
        '알 수 없는 오류';
      
      throw new APIError(APIErrorType.UNKNOWN_ERROR, `응답 처리 중 오류: ${errorMessage}`);
    }
  }
}

/**
 * 강화된 OpenAI 어댑터 v6.0
 */
export class OpenAIAdapterV6 implements LLMAdapter {
  private httpClient: RobustHTTPClient;
  private config: {
    apiKey: string;
    model: string;
    maxTokens: number;
    temperature: number;
  };

  constructor(config: { apiKey: string; model?: string; maxTokens?: number; temperature?: number }) {
    this.config = {
      apiKey: config.apiKey,
      model: config.model || 'gpt-3.5-turbo',
      maxTokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.7,
    };
    
    this.httpClient = new RobustHTTPClient();
  }

  async analyzeEmotion(data: any): Promise<EmotionAnalysis> {
    const prompt = `
다음 대화 데이터를 분석하여 감정 상태를 JSON 형태로 반환해주세요:

대화 세그먼트: ${JSON.stringify(data.segments)}
음성 데이터: ${JSON.stringify(data.prosody)}

다음 형식으로 응답해주세요:
{
  "valence": 0.7,
  "arousal": 0.6,
  "emotions": [
    {"label": "joy", "score": 0.8},
    {"label": "interest", "score": 0.7}
  ],
  "evidence": ["긍정적인 어조", "활발한 대화"]
}
`;

    return this.callAPI<EmotionAnalysis>(prompt);
  }

  async analyzeConversation(data: any): Promise<ConversationAnalysis> {
    const prompt = `
다음 대화와 감정 분석 결과를 바탕으로 대화 품질을 분석해주세요:

대화 세그먼트: ${JSON.stringify(data.segments)}
감정 분석: ${JSON.stringify(data.emotion)}

다음 형식으로 응답해주세요:
{
  "rapport": 0.75,
  "turnTakingBalance": 0.8,
  "empathy": 0.7,
  "redFlags": [],
  "highlights": ["자연스러운 대화 흐름", "상호 관심 표현"]
}
`;

    return this.callAPI<ConversationAnalysis>(prompt);
  }

  async calculateMatchScore(data: any): Promise<MatchScore> {
    const prompt = `
감정 분석과 대화 분석 결과를 바탕으로 매칭 점수를 계산해주세요:

감정 분석: ${JSON.stringify(data.emotion)}
대화 분석: ${JSON.stringify(data.conversation)}

다음 형식으로 응답해주세요:
{
  "score": 78,
  "breakdown": {
    "text": 80,
    "voice": 75,
    "balance": 80
  }
}
`;

    return this.callAPI<MatchScore>(prompt);
  }

  async generateFeedback(data: any): Promise<Feedback> {
    const prompt = `
분석 결과를 바탕으로 사용자에게 도움이 되는 피드백을 생성해주세요:

감정 분석: ${JSON.stringify(data.emotion)}
대화 분석: ${JSON.stringify(data.conversation)}
매칭 점수: ${JSON.stringify(data.match)}

다음 형식으로 응답해주세요:
{
  "summary": "전반적으로 좋은 대화였습니다...",
  "tips": [
    "더 깊이 있는 질문으로 상대방을 알아가보세요",
    "공통 관심사에 대해 더 이야기해보세요",
    "적절한 유머로 분위기를 더욱 편안하게 만들어보세요"
  ]
}
`;

    return this.callAPI<Feedback>(prompt);
  }

  private async callAPI<T>(prompt: string): Promise<T> {
    try {
      const response = await this.httpClient.request('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          response_format: { type: 'json_object' }
        }),
      });

      return ResponseParser.parseJSON<T>(response);

    } catch (error) {
      if (error instanceof APIError) {
        console.error(`OpenAI API 에러 [${error.type}]:`, error.message);
        throw error;
      }
      
      console.error('예상치 못한 에러:', error);
      throw new APIError(APIErrorType.UNKNOWN_ERROR, '예상치 못한 오류가 발생했습니다.');
    }
  }

  /**
   * 헬스 체크 메서드
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.callAPI('{"test": true}');
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Circuit Breaker 상태 확인
   */
  getCircuitBreakerState(): string {
    return this.httpClient['circuitBreaker'].getState();
  }
}
