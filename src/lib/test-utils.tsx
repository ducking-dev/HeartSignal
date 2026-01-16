/**
 * Test Utilities - 테스트를 위한 유틸리티 함수들
 * React Testing Library와 Jest를 활용한 테스트 헬퍼
 */

import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { AppProvider } from '@/contexts/AppContext';
import { lightTheme } from '@/lib/theme';

// 커스텀 렌더 함수 (Provider 포함)
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AppProvider initialTheme={lightTheme}>
      {children}
    </AppProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// 테스트용 모의 데이터
export const mockSessionData = {
  phase: 'done' as const,
  duration: 120,
  segments: [
    {
      t0: 0,
      t1: 2000,
      text: '안녕하세요! 만나서 반가워요.',
      speaker: 'me' as const,
    },
    {
      t0: 2500,
      t1: 4500,
      text: '네, 저도 반가워요. 오늘 날씨가 정말 좋네요.',
      speaker: 'partner' as const,
    },
  ],
  emotion: {
    valence: 0.7,
    arousal: 0.6,
    emotions: [
      { label: 'joy', score: 0.8 },
      { label: 'surprise', score: 0.2 },
      { label: 'anger', score: 0.0 },
      { label: 'sadness', score: 0.0 },
      { label: 'fear', score: 0.0 },
    ],
    evidence: ['웃음소리가 자주 들려요', '긍정적인 표현이 많았어요'],
  },
  conversation: {
    rapport: 0.8,
    turnTakingBalance: 0.6,
    empathy: 0.7,
    redFlags: [],
    highlights: ['자연스러운 대화 흐름', '공통 관심사 발견'],
  },
  match: {
    score: 78,
    breakdown: {
      text: 80,
      voice: 75,
      balance: 78,
    },
  },
  feedback: {
    summary: '대화가 자연스럽고 긍정적이었습니다. 서로에 대한 관심이 잘 드러났어요.',
    tips: [
      '더 깊은 질문을 해보세요',
      '상대방의 감정에 공감해보세요',
      '자신의 경험을 더 구체적으로 공유해보세요',
    ],
  },
};

// 테스트용 유틸리티 함수들
export const createMockElement = (tag: string, attributes: Record<string, any> = {}) => {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
};

export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  window.IntersectionObserverEntry = jest.fn();
};

export const mockMatchMedia = (matches: boolean = false) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(), // deprecated
      removeListener: jest.fn(), // deprecated
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

export const mockResizeObserver = () => {
  global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
};

// 웹 API 모킹
export const mockWebAPIs = () => {
  // MediaDevices
  Object.defineProperty(navigator, 'mediaDevices', {
    writable: true,
    value: {
      getUserMedia: jest.fn().mockResolvedValue({
        getTracks: () => [{ stop: jest.fn() }],
      }),
    },
  });

  // SpeechRecognition
  global.SpeechRecognition = jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  global.webkitSpeechRecognition = global.SpeechRecognition;

  // Notification
  Object.defineProperty(window, 'Notification', {
    writable: true,
    value: {
      permission: 'default',
      requestPermission: jest.fn().mockResolvedValue('granted'),
    },
  });

  // Service Worker
  Object.defineProperty(navigator, 'serviceWorker', {
    writable: true,
    value: {
      register: jest.fn().mockResolvedValue({}),
      ready: jest.fn().mockResolvedValue({}),
    },
  });
};

// 애니메이션 비활성화 (테스트 속도 향상)
export const disableAnimations = () => {
  const mockMotionValue = {
    set: jest.fn(),
    get: jest.fn(),
    stop: jest.fn(),
    isAnimating: jest.fn().mockReturnValue(false),
  };

  jest.mock('framer-motion', () => ({
    motion: {
      div: 'div',
      span: 'span',
      button: 'button',
      path: 'path',
      circle: 'circle',
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useAnimation: () => ({
      start: jest.fn(),
      stop: jest.fn(),
      set: jest.fn(),
    }),
    useMotionValue: () => mockMotionValue,
    useTransform: () => mockMotionValue,
  }));
};

// 로컬 스토리지 모킹
export const mockLocalStorage = () => {
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });
  return localStorageMock;
};

// 타이머 모킹 헬퍼
export const advanceTimers = (ms: number) => {
  jest.advanceTimersByTime(ms);
};

export const runAllTimers = () => {
  jest.runAllTimers();
};

// 비동기 작업 대기 헬퍼
export const waitForNextTick = () => new Promise((resolve) => setImmediate(resolve));

// 테스트 데이터 생성기
export const createTestUser = (overrides: any = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides,
});

export const createTestSession = (overrides: any = {}) => ({
  id: '1',
  userId: '1',
  createdAt: new Date().toISOString(),
  ...mockSessionData,
  ...overrides,
});

// 컴포넌트 테스트 헬퍼
export const getByTestId = (container: HTMLElement, testId: string) => {
  return container.querySelector(`[data-testid="${testId}"]`);
};

export const queryByTestId = (container: HTMLElement, testId: string) => {
  return container.querySelector(`[data-testid="${testId}"]`);
};

// 이벤트 시뮬레이션 헬퍼
export const simulateKeyPress = (element: HTMLElement, key: string, options: any = {}) => {
  const event = new KeyboardEvent('keydown', { key, ...options });
  element.dispatchEvent(event);
};

export const simulateClick = (element: HTMLElement) => {
  const event = new MouseEvent('click', { bubbles: true });
  element.dispatchEvent(event);
};

// 에러 바운더리 테스트 헬퍼
export const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// 성능 측정 모킹
export const mockPerformance = () => {
  Object.defineProperty(window, 'performance', {
    writable: true,
    value: {
      now: jest.fn().mockReturnValue(Date.now()),
      mark: jest.fn(),
      measure: jest.fn(),
      getEntriesByType: jest.fn().mockReturnValue([]),
      memory: {
        usedJSHeapSize: 1000000,
        totalJSHeapSize: 2000000,
        jsHeapSizeLimit: 4000000,
      },
    },
  });
};

