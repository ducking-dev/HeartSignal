/**
 * Responsive Utilities - 반응형 디자인을 위한 유틸리티들
 * v1.md의 브레이크포인트와 모바일 최적화 가이드 구현
 */

import { useState, useEffect } from 'react';

// v1.md 기준 브레이크포인트
export const breakpoints = {
  mobile: 320,    // 최소 너비
  tablet: 768,    // 태블릿
  desktop: 1024,  // 데스크톱
  wide: 1280,     // 와이드 스크린
} as const;

export type Breakpoint = keyof typeof breakpoints;

// 현재 화면 크기 감지 훅
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints.wide) {
        setBreakpoint('wide');
      } else if (width >= breakpoints.desktop) {
        setBreakpoint('desktop');
      } else if (width >= breakpoints.tablet) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('mobile');
      }
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return breakpoint;
}

// 특정 브레이크포인트 이상인지 확인
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// 모바일 여부 확인
export function useIsMobile(): boolean {
  return useMediaQuery(`(max-width: ${breakpoints.tablet - 1}px)`);
}

// 태블릿 여부 확인
export function useIsTablet(): boolean {
  return useMediaQuery(
    `(min-width: ${breakpoints.tablet}px) and (max-width: ${breakpoints.desktop - 1}px)`
  );
}

// 데스크톱 여부 확인
export function useIsDesktop(): boolean {
  return useMediaQuery(`(min-width: ${breakpoints.desktop}px)`);
}

// 터치 디바이스 감지
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    checkTouch();
  }, []);

  return isTouch;
}

// 반응형 값 반환 훅
export function useResponsiveValue<T>(values: {
  mobile?: T;
  tablet?: T;
  desktop?: T;
  wide?: T;
}): T | undefined {
  const breakpoint = useBreakpoint();
  
  // 현재 브레이크포인트부터 하위로 내려가며 값 찾기
  const orderedBreakpoints: Breakpoint[] = ['wide', 'desktop', 'tablet', 'mobile'];
  const currentIndex = orderedBreakpoints.indexOf(breakpoint);
  
  for (let i = currentIndex; i < orderedBreakpoints.length; i++) {
    const bp = orderedBreakpoints[i];
    if (values[bp] !== undefined) {
      return values[bp];
    }
  }
  
  return undefined;
}

// 반응형 클래스명 생성
export function getResponsiveClasses(classes: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  wide?: string;
}): string {
  const classArray: string[] = [];
  
  if (classes.mobile) classArray.push(classes.mobile);
  if (classes.tablet) classArray.push(`md:${classes.tablet}`);
  if (classes.desktop) classArray.push(`lg:${classes.desktop}`);
  if (classes.wide) classArray.push(`xl:${classes.wide}`);
  
  return classArray.join(' ');
}

// 컴포넌트 크기 조정 유틸리티 (v1.md 기준)
export const responsiveSizes = {
  // SessionRecorder 크기
  sessionRecorder: {
    mobile: 'w-24 h-24',     // 96x96px
    tablet: 'w-28 h-28',     // 112x112px
    desktop: 'w-32 h-32',    // 128x128px (기본)
    wide: 'w-36 h-36',       // 144x144px
  },
  
  // LiveTranscriptPanel 높이
  transcriptPanel: {
    mobile: 'h-60',          // 240px
    tablet: 'h-72',          // 288px
    desktop: 'h-80',         // 320px (기본)
    wide: 'h-96',            // 384px
  },
  
  // ScoreGauge 크기
  scoreGauge: {
    mobile: 'w-40 h-24',     // 160x96px
    tablet: 'w-48 h-28',     // 192x112px
    desktop: 'w-50 h-30',    // 200x120px (기본)
    wide: 'w-56 h-32',       // 224x128px
  },
  
  // Container 패딩
  containerPadding: {
    mobile: 'px-4',          // 16px
    tablet: 'px-6',          // 24px
    desktop: 'px-8',         // 32px
    wide: 'px-12',           // 48px
  },
  
  // 간격
  spacing: {
    mobile: 'space-y-4',     // 16px
    tablet: 'space-y-6',     // 24px
    desktop: 'space-y-8',    // 32px
    wide: 'space-y-12',      // 48px
  },
} as const;

// 반응형 컴포넌트 래퍼
interface ResponsiveWrapperProps {
  children: React.ReactNode;
  mobile?: React.ReactNode;
  tablet?: React.ReactNode;
  desktop?: React.ReactNode;
  wide?: React.ReactNode;
}

export function ResponsiveWrapper({ 
  children, 
  mobile, 
  tablet, 
  desktop, 
  wide 
}: ResponsiveWrapperProps) {
  const breakpoint = useBreakpoint();
  
  switch (breakpoint) {
    case 'mobile':
      return <>{mobile || children}</>;
    case 'tablet':
      return <>{tablet || mobile || children}</>;
    case 'desktop':
      return <>{desktop || tablet || mobile || children}</>;
    case 'wide':
      return <>{wide || desktop || tablet || mobile || children}</>;
    default:
      return <>{children}</>;
  }
}

// 터치 최적화 스타일
export const touchOptimized = {
  // 최소 터치 타겟 크기 (44x44px)
  minTouchTarget: 'min-h-[44px] min-w-[44px]',
  
  // 터치 친화적 간격
  touchSpacing: 'space-y-3 space-x-3',
  
  // 터치 피드백
  touchFeedback: 'active:scale-95 transition-transform duration-75',
  
  // 스크롤 최적화
  scrollOptimized: 'overscroll-contain scroll-smooth',
} as const;

// 뷰포트 메타 태그 설정 확인
export function checkViewportMeta(): boolean {
  if (typeof document === 'undefined') return false;
  
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  return viewportMeta !== null;
}

// 안전 영역 (Safe Area) 지원
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    const updateSafeArea = () => {
      if (typeof getComputedStyle === 'undefined') return;
      
      const style = getComputedStyle(document.documentElement);
      setSafeArea({
        top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
        right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
        bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
        left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
      });
    };

    updateSafeArea();
    window.addEventListener('resize', updateSafeArea);
    window.addEventListener('orientationchange', updateSafeArea);
    
    return () => {
      window.removeEventListener('resize', updateSafeArea);
      window.removeEventListener('orientationchange', updateSafeArea);
    };
  }, []);

  return safeArea;
}

