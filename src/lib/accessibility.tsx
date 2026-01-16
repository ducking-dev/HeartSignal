/**
 * Accessibility Utilities - 접근성 개선을 위한 유틸리티들
 * WCAG 2.1 AA 기준을 만족하는 접근성 기능 제공
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';

// 키보드 내비게이션 관리
export function useKeyboardNavigation(
  containerRef: React.RefObject<HTMLElement>,
  options: {
    loop?: boolean;
    direction?: 'horizontal' | 'vertical' | 'both';
    selector?: string;
  } = {}
) {
  const { loop = true, direction = 'both', selector = '[tabindex]:not([tabindex="-1"]), button, input, select, textarea, a[href]' } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const focusableElements = container.querySelectorAll(selector);
      const focusableArray = Array.from(focusableElements) as HTMLElement[];
      const currentIndex = focusableArray.indexOf(document.activeElement as HTMLElement);

      let nextIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
          if (direction === 'vertical' || direction === 'both') {
            event.preventDefault();
            nextIndex = currentIndex + 1;
          }
          break;
        case 'ArrowUp':
          if (direction === 'vertical' || direction === 'both') {
            event.preventDefault();
            nextIndex = currentIndex - 1;
          }
          break;
        case 'ArrowRight':
          if (direction === 'horizontal' || direction === 'both') {
            event.preventDefault();
            nextIndex = currentIndex + 1;
          }
          break;
        case 'ArrowLeft':
          if (direction === 'horizontal' || direction === 'both') {
            event.preventDefault();
            nextIndex = currentIndex - 1;
          }
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = focusableArray.length - 1;
          break;
      }

      if (nextIndex !== currentIndex) {
        if (loop) {
          nextIndex = (nextIndex + focusableArray.length) % focusableArray.length;
        } else {
          nextIndex = Math.max(0, Math.min(nextIndex, focusableArray.length - 1));
        }

        focusableArray[nextIndex]?.focus();
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [containerRef, loop, direction, selector]);
}

// 포커스 트랩 (모달, 다이얼로그용)
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // 이전 포커스 저장
    previousActiveElement.current = document.activeElement as HTMLElement;

    // 포커스 가능한 요소들 찾기
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // 첫 번째 요소에 포커스
    firstElement?.focus();

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      // 이전 포커스 복원
      previousActiveElement.current?.focus();
    };
  }, [isActive]);

  return containerRef;
}

// 스크린 리더 전용 텍스트
export function ScreenReaderOnly({ children }: { children: React.ReactNode }) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}

// 아리아 라이브 영역 관리
export function useAriaLiveRegion() {
  const [message, setMessage] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((text: string, priority: 'polite' | 'assertive' = 'polite') => {
    setPoliteness(priority);
    setMessage(text);
    
    // 메시지 클리어 (스크린 리더가 읽은 후)
    setTimeout(() => setMessage(''), 1000);
  }, []);

  const LiveRegion = () => (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );

  return { announce, LiveRegion };
}

// 색상 대비 검사
export function checkColorContrast(
  foreground: string,
  background: string,
  fontSize: number = 16
): { ratio: number; isAACompliant: boolean; isAAACompliant: boolean } {
  // RGB 값 추출
  const getRGB = (color: string) => {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16),
    };
  };

  // 상대 밝기 계산
  const getLuminance = (r: number, g: number, b: number) => {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const fg = getRGB(foreground);
  const bg = getRGB(background);
  
  const fgLuminance = getLuminance(fg.r, fg.g, fg.b);
  const bgLuminance = getLuminance(bg.r, bg.g, bg.b);
  
  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                (Math.min(fgLuminance, bgLuminance) + 0.05);

  const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontSize < 18); // Bold text
  const aaThreshold = isLargeText ? 3 : 4.5;
  const aaaThreshold = isLargeText ? 4.5 : 7;

  return {
    ratio: Math.round(ratio * 100) / 100,
    isAACompliant: ratio >= aaThreshold,
    isAAACompliant: ratio >= aaaThreshold,
  };
}

// 모션 감소 설정 감지
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// 고대비 모드 감지
export function usePrefersHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setPrefersHighContrast(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersHighContrast(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersHighContrast;
}

// 접근성 개선된 버튼 컴포넌트
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  ariaLabel,
  ariaDescribedBy,
  disabled,
  ...props
}: AccessibleButtonProps) {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <button
      {...props}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      className={`
        inline-flex items-center justify-center
        font-medium rounded-lg
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${!prefersReducedMotion ? 'transition-all duration-200' : ''}
        ${size === 'sm' ? 'px-3 py-2 text-sm' : ''}
        ${size === 'md' ? 'px-4 py-2 text-base' : ''}
        ${size === 'lg' ? 'px-6 py-3 text-lg' : ''}
        ${variant === 'primary' ? 'bg-primary-500 text-white hover:bg-primary-600' : ''}
        ${variant === 'secondary' ? 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300' : ''}
        ${variant === 'ghost' ? 'bg-transparent text-primary-500 hover:bg-primary-50' : ''}
        ${props.className || ''}
      `}
    >
      {loading && (
        <span className="mr-2" aria-hidden="true">
          <span className="animate-spin">⟳</span>
        </span>
      )}
      {children}
      {loading && <ScreenReaderOnly>로딩 중</ScreenReaderOnly>}
    </button>
  );
}

// Skip Link 컴포넌트
export function SkipLink({ href = '#main-content', children = '본문으로 건너뛰기' }) {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4
        bg-primary-500 text-white px-4 py-2 rounded-md
        focus:outline-none focus:ring-2 focus:ring-primary-300
        z-50 font-medium
      "
    >
      {children}
    </a>
  );
}

// 랜드마크 역할을 가진 컴포넌트들
export function MainContent({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <main id="main-content" role="main" {...props}>
      {children}
    </main>
  );
}

export function NavigationLandmark({ children, ariaLabel, ...props }: React.HTMLAttributes<HTMLElement> & { ariaLabel: string }) {
  return (
    <nav role="navigation" aria-label={ariaLabel} {...props}>
      {children}
    </nav>
  );
}

// 접근성 테스트 유틸리티
export function runAccessibilityCheck() {
  if (process.env.NODE_ENV !== 'development') return;

  const issues: string[] = [];

  // 이미지 alt 텍스트 확인
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!img.alt) {
      issues.push(`이미지 ${index + 1}에 alt 속성이 없습니다.`);
    }
  });

  // 버튼 텍스트 확인
  const buttons = document.querySelectorAll('button');
  buttons.forEach((button, index) => {
    const hasText = button.textContent?.trim() || button.ariaLabel;
    if (!hasText) {
      issues.push(`버튼 ${index + 1}에 텍스트나 aria-label이 없습니다.`);
    }
  });

  // 링크 텍스트 확인
  const links = document.querySelectorAll('a');
  links.forEach((link, index) => {
    const hasText = link.textContent?.trim() || link.ariaLabel;
    if (!hasText) {
      issues.push(`링크 ${index + 1}에 텍스트나 aria-label이 없습니다.`);
    }
  });

  // 제목 구조 확인
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  headings.forEach((heading, index) => {
    const currentLevel = parseInt(heading.tagName.charAt(1));
    if (currentLevel > previousLevel + 1) {
      issues.push(`제목 레벨이 건너뛰어졌습니다: ${heading.textContent}`);
    }
    previousLevel = currentLevel;
  });

  if (issues.length > 0) {
    console.group('🔍 접근성 문제 발견');
    issues.forEach(issue => console.warn(issue));
    console.groupEnd();
  } else {
    console.log('✅ 기본 접근성 검사 통과');
  }

  return issues;
}

