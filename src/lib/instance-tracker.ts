'use client';

// 새로운 파일: 인스턴스 추적 유틸리티
import type { UserState, UserActions } from '@/store/user/types';

/**
 * 인스턴스 추적을 위한 범용 클래스
 * SOLID 원칙: Single Responsibility Principle
 */
export class InstanceTracker<T extends object> {
  // SOLID 원칙: 제네릭 타입 사용으로 타입 안전성 보장
  private static instances = new Map<string, InstanceTracker<object>>();
  private trackedInstances = new WeakSet<T>();
  
  private constructor(private key: string) {}
  
  static getInstance<T extends object>(key: string): InstanceTracker<T> {
    if (!InstanceTracker.instances.has(key)) {
      InstanceTracker.instances.set(key, new InstanceTracker<T>(key));
    }
    return InstanceTracker.instances.get(key)!;
  }
  
  track(instance: T): boolean {
    if (this.trackedInstances.has(instance)) {
      return false; // 이미 추적 중
    }
    this.trackedInstances.add(instance);
    console.log(`[${this.key}] 새 인스턴스 추적 시작`);
    return true; // 새로 추적 시작
  }
  
  isTracked(instance: T): boolean {
    return this.trackedInstances.has(instance);
  }

  untrack(instance: T): boolean {
    if (this.trackedInstances.has(instance)) {
      this.trackedInstances.delete(instance);
      console.log(`[${this.key}] 인스턴스 추적 중단`);
      return true;
    }
    return false;
  }

  // 개발 환경 전용: 디버깅 정보
  getDebugInfo(): { key: string; hasInstances: boolean } {
    return {
      key: this.key,
      hasInstances: this.trackedInstances ? true : false, // WeakSet 특성상 정확한 크기 불가
    };
  }
}

/**
 * Mock 데이터 로딩 추적을 위한 전용 트래커
 */
export const mockDataTracker = InstanceTracker.getInstance<UserState & UserActions>('mock-data');

/**
 * 스토어 인스턴스 추적을 위한 전용 트래커
 */
export const storeInstanceTracker = InstanceTracker.getInstance<UserState & UserActions>('user-store');

/**
 * 컴포넌트 렌더링 추적을 위한 전용 트래커
 */
export const componentRenderTracker = InstanceTracker.getInstance<React.Component>('component-render');

/**
 * 중복 방지를 위한 헬퍼 함수들
 */
export const DuplicationGuard = {
  /**
   * Mock 데이터 로딩 중복 방지
   */
  canLoadMockData: (userStore: UserState & UserActions): boolean => {
    return !mockDataTracker.isTracked(userStore);
  },

  /**
   * Mock 데이터 로딩 완료 표시
   */
  markMockDataLoaded: (userStore: UserState & UserActions): void => {
    mockDataTracker.track(userStore);
  },

  /**
   * 스토어 초기화 추적
   */
  trackStoreInstance: (userStore: UserState & UserActions): boolean => {
    return storeInstanceTracker.track(userStore);
  },

  /**
   * 컴포넌트 렌더링 추적
   */
  trackComponentRender: (component: React.Component): boolean => {
    return componentRenderTracker.track(component);
  },

  /**
   * 전체 추적 상태 리셋 (개발/테스트 용도)
   */
  resetAll: (): void => {
    console.log('🔄 모든 인스턴스 추적 상태 리셋');
    // WeakSet은 clear 메서드가 없으므로 새로운 인스턴스 생성
    InstanceTracker['instances'].clear();
  },

  /**
   * 디버깅 정보 출력
   */
  debugAll: (): void => {
    if (process.env.NODE_ENV !== 'development') return;

    console.group('🔍 인스턴스 추적 상태');
    
    InstanceTracker['instances'].forEach((tracker, key) => {
      const info = tracker.getDebugInfo();
      console.log(`- ${key}:`, info);
    });
    
    console.groupEnd();
  },
};

/**
 * React Hook: 컴포넌트별 중복 방지
 */
export const useDeduplication = (componentName: string) => {
  const [isInitialized, setIsInitialized] = React.useState(false);
  
  React.useEffect(() => {
    if (!isInitialized) {
      console.log(`🎯 ${componentName} 컴포넌트 중복 방지 활성화`);
      setIsInitialized(true);
    }
  }, [componentName, isInitialized]);

  return {
    isInitialized,
    canExecute: (actionName: string, guard: () => boolean): boolean => {
      if (!isInitialized) return false;
      
      const canExecute = guard();
      if (!canExecute) {
        console.log(`⏸️ ${componentName}.${actionName} 중복 실행 방지`);
      }
      return canExecute;
    },
  };
};

// React import 추가
import React from 'react';

/**
 * 메모리 사용량 모니터링 (개발 환경 전용)
 */
export const MemoryMonitor = {
  log: (label: string): void => {
    if (process.env.NODE_ENV !== 'development' || !(performance as any).memory) return;

    const memory = (performance as any).memory;
    console.log(`📊 [${label}] 메모리 사용량:`, {
      used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`,
      total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)}MB`,
      limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)}MB`,
    });
  },

  track: (operation: string, fn: () => void): void => {
    MemoryMonitor.log(`${operation} 시작`);
    fn();
    MemoryMonitor.log(`${operation} 완료`);
  },
};

/**
 * 성능 측정 유틸리티
 */
export const PerformanceTracker = {
  time: (label: string, fn: () => void): number => {
    const start = performance.now();
    fn();
    const end = performance.now();
    const duration = end - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ [${label}] 실행 시간: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  },

  timeAsync: async (label: string, fn: () => Promise<void>): Promise<number> => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    const duration = end - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ [${label}] 비동기 실행 시간: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  },
};
