/**
 * Performance Utilities - 성능 최적화를 위한 유틸리티들
 * 메모이제이션, 디바운싱, 스로틀링 등의 최적화 기법 제공
 */

import { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import { debounce, throttle } from 'es-toolkit';

// 디바운스 훅
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 스로틀 훅
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledFn = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  );

  return throttledFn as T;
}

// 디바운스 콜백 훅
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const debouncedFn = useMemo(
    () => debounce(callback, delay),
    [callback, delay]
  );

  return debouncedFn as T;
}

// 이전 값 추적 훅
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}

// 마운트 상태 추적 훅 (메모리 누수 방지)
export function useIsMounted(): () => boolean {
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  return useCallback(() => isMountedRef.current, []);
}

// 지연 로딩을 위한 Intersection Observer 훅
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options]);

  return [ref, isIntersecting];
}

// 메모이제이션된 컴포넌트 래퍼
export function memo<T extends React.ComponentType<any>>(
  Component: T,
  propsAreEqual?: (
    prevProps: React.ComponentProps<T>,
    nextProps: React.ComponentProps<T>
  ) => boolean
): T {
  return React.memo(Component, propsAreEqual) as T;
}

// 성능 측정 유틸리티
export class PerformanceProfiler {
  private static measurements: Map<string, number> = new Map();

  static start(label: string): void {
    if (typeof performance !== 'undefined') {
      this.measurements.set(label, performance.now());
    }
  }

  static end(label: string): number {
    if (typeof performance === 'undefined') return 0;
    
    const startTime = this.measurements.get(label);
    if (startTime === undefined) {
      console.warn(`Performance measurement '${label}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(label);

    if (process.env.NODE_ENV === 'development') {
      console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static measure<T>(label: string, fn: () => T): T {
    this.start(label);
    const result = fn();
    this.end(label);
    return result;
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    const result = await fn();
    this.end(label);
    return result;
  }
}

// 컴포넌트 성능 측정 HOC
export function withPerformanceProfiler<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedComponent = (props: P) => {
    const name = componentName || Component.displayName || Component.name || 'Component';
    
    useEffect(() => {
      PerformanceProfiler.start(`${name} render`);
      return () => {
        PerformanceProfiler.end(`${name} render`);
      };
    });

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withPerformanceProfiler(${name})`;
  return WrappedComponent;
}

// 이미지 지연 로딩 컴포넌트
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export function LazyImage({ 
  src, 
  alt, 
  placeholder, 
  className, 
  ...props 
}: LazyImageProps) {
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder || '');

  useEffect(() => {
    if (isIntersecting && !isLoaded) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.src = src;
    }
  }, [isIntersecting, isLoaded, src]);

  return (
    <div ref={ref} className={className}>
      <img
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-50'
        }`}
        {...props}
      />
    </div>
  );
}

// 번들 크기 최적화를 위한 동적 import 유틸리티
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = React.lazy(importFn);
  
  return (props: React.ComponentProps<T>) => (
    <React.Suspense 
      fallback={fallback ? <fallback /> : <div>Loading...</div>}
    >
      <LazyComponent {...props} />
    </React.Suspense>
  );
}

// 메모리 사용량 모니터링 (개발 환경)
export function useMemoryMonitor(interval: number = 5000) {
  const [memoryInfo, setMemoryInfo] = useState<any>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (!('memory' in performance)) return;

    const updateMemoryInfo = () => {
      const memory = (performance as any).memory;
      setMemoryInfo({
        usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      });
    };

    updateMemoryInfo();
    const intervalId = setInterval(updateMemoryInfo, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  return memoryInfo;
}

// 렌더링 최적화를 위한 가상화 훅
export function useVirtualization<T>(
  items: T[],
  containerHeight: number,
  itemHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(visibleStart, visibleEnd);
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleStart * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

