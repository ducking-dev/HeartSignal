/**
 * 리소스 관리 훅 v6.0 - 메모리 누수 방지
 * SOLID 원칙과 Observer Pattern을 적용한 안전한 리소스 관리
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * 리소스 인터페이스 (Single Responsibility Principle)
 */
export interface ManagedResource {
  id: string;
  cleanup: () => void | Promise<void>;
  isActive?: () => boolean;
}

/**
 * 리소스 관리자 (Observer Pattern + Composite Pattern)
 */
class ResourceManager {
  private resources = new Map<string, ManagedResource>();
  private cleanupPromises = new Set<Promise<void>>();
  private isDestroyed = false;

  /**
   * 리소스 등록
   */
  register(resource: ManagedResource): void {
    if (this.isDestroyed) {
      console.warn(`ResourceManager가 이미 파괴된 상태에서 리소스 등록 시도: ${resource.id}`);
      return;
    }

    if (this.resources.has(resource.id)) {
      console.warn(`중복된 리소스 ID: ${resource.id}`);
      this.unregister(resource.id);
    }

    this.resources.set(resource.id, resource);
    console.log(`리소스 등록됨: ${resource.id}`);
  }

  /**
   * 리소스 해제
   */
  async unregister(id: string): Promise<void> {
    const resource = this.resources.get(id);
    if (!resource) return;

    this.resources.delete(id);

    try {
      const cleanupResult = resource.cleanup();
      if (cleanupResult instanceof Promise) {
        this.cleanupPromises.add(cleanupResult);
        await cleanupResult;
        this.cleanupPromises.delete(cleanupResult);
      }
      console.log(`리소스 해제됨: ${id}`);
    } catch (error: unknown) {
      console.error(`리소스 해제 중 오류 (${id}):`, error);
    }
  }

  /**
   * 모든 리소스 해제
   */
  async cleanup(): Promise<void> {
    if (this.isDestroyed) return;

    this.isDestroyed = true;
    const resourceIds = Array.from(this.resources.keys());
    
    console.log(`${resourceIds.length}개 리소스 정리 시작...`);

    // 병렬로 모든 리소스 정리
    const cleanupPromises = resourceIds.map(id => this.unregister(id));
    
    try {
      await Promise.allSettled(cleanupPromises);
      
      // 남은 cleanup promise들도 대기
      if (this.cleanupPromises.size > 0) {
        await Promise.allSettled(Array.from(this.cleanupPromises));
      }
      
      console.log('모든 리소스 정리 완료');
    } catch (error: unknown) {
      console.error('리소스 정리 중 오류:', error);
    }

    this.resources.clear();
    this.cleanupPromises.clear();
  }

  /**
   * 활성 리소스 목록 조회
   */
  getActiveResources(): string[] {
    return Array.from(this.resources.entries())
      .filter(([_, resource]) => !resource.isActive || resource.isActive())
      .map(([id]) => id);
  }

  /**
   * 리소스 상태 확인
   */
  getResourceCount(): number {
    return this.resources.size;
  }

  /**
   * 파괴 상태 확인
   */
  isDestroyed(): boolean {
    return this.isDestroyed;
  }
}

/**
 * 리소스 관리 훅
 */
export function useResourceManager() {
  const managerRef = useRef<ResourceManager | null>(null);

  // 매니저 초기화 (Lazy Initialization)
  if (!managerRef.current) {
    managerRef.current = new ResourceManager();
  }

  const manager = managerRef.current;

  /**
   * 리소스 등록 함수
   */
  const registerResource = useCallback((resource: ManagedResource) => {
    manager.register(resource);
  }, [manager]);

  /**
   * 리소스 해제 함수
   */
  const unregisterResource = useCallback(async (id: string) => {
    await manager.unregister(id);
  }, [manager]);

  /**
   * 타이머 리소스 생성 헬퍼
   */
  const createTimerResource = useCallback((
    id: string,
    callback: () => void,
    interval: number
  ): ManagedResource => {
    let timerId: NodeJS.Timeout | null = null;
    let isRunning = false;

    return {
      id,
      cleanup: () => {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
          isRunning = false;
        }
      },
      isActive: () => isRunning,
      // 추가 메서드들을 위한 확장 가능한 구조
      start: () => {
        if (!isRunning) {
          timerId = setInterval(callback, interval);
          isRunning = true;
        }
      },
      stop: () => {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
          isRunning = false;
        }
      },
    } as ManagedResource & { start: () => void; stop: () => void };
  }, []);

  /**
   * 이벤트 리스너 리소스 생성 헬퍼
   */
  const createEventListenerResource = useCallback((
    id: string,
    target: EventTarget,
    event: string,
    listener: EventListener,
    options?: AddEventListenerOptions
  ): ManagedResource => {
    target.addEventListener(event, listener, options);

    return {
      id,
      cleanup: () => {
        target.removeEventListener(event, listener, options);
      },
      isActive: () => true, // 이벤트 리스너는 등록되어 있으면 활성 상태
    };
  }, []);

  /**
   * AbortController 리소스 생성 헬퍼
   */
  const createAbortControllerResource = useCallback((id: string): {
    resource: ManagedResource;
    controller: AbortController;
  } => {
    const controller = new AbortController();

    const resource: ManagedResource = {
      id,
      cleanup: () => {
        if (!controller.signal.aborted) {
          controller.abort();
        }
      },
      isActive: () => !controller.signal.aborted,
    };

    return { resource, controller };
  }, []);

  /**
   * 컴포넌트 언마운트 시 자동 정리
   */
  useEffect(() => {
    return () => {
      manager.cleanup();
    };
  }, [manager]);

  /**
   * 개발 환경에서 리소스 모니터링
   */
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const interval = setInterval(() => {
        const activeResources = manager.getActiveResources();
        if (activeResources.length > 0) {
          console.log('활성 리소스:', activeResources);
        }
      }, 10000); // 10초마다 체크

      return () => clearInterval(interval);
    }
  }, [manager]);

  return {
    registerResource,
    unregisterResource,
    createTimerResource,
    createEventListenerResource,
    createAbortControllerResource,
    getActiveResources: () => manager.getActiveResources(),
    getResourceCount: () => manager.getResourceCount(),
    cleanup: () => manager.cleanup(),
  };
}

/**
 * 특정 리소스 타입을 위한 전용 훅들
 */

/**
 * 타이머 관리 훅
 */
export function useTimer(callback: () => void, interval: number, autoStart = false) {
  const { registerResource, unregisterResource, createTimerResource } = useResourceManager();
  const timerRef = useRef<(ManagedResource & { start: () => void; stop: () => void }) | null>(null);

  const start = useCallback(() => {
    if (timerRef.current) return;

    const timer = createTimerResource(`timer-${Date.now()}`, callback, interval);
    timerRef.current = timer as any;
    registerResource(timer);
    (timer as any).start();
  }, [callback, interval, registerResource, createTimerResource]);

  const stop = useCallback(() => {
    if (timerRef.current) {
      timerRef.current.stop();
      unregisterResource(timerRef.current.id);
      timerRef.current = null;
    }
  }, [unregisterResource]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
    return stop;
  }, [autoStart, start, stop]);

  return { start, stop, isRunning: () => timerRef.current?.isActive() || false };
}

/**
 * 이벤트 리스너 관리 훅
 */
export function useEventListener(
  target: EventTarget | null,
  event: string,
  listener: EventListener,
  options?: AddEventListenerOptions
) {
  const { registerResource, createEventListenerResource } = useResourceManager();

  useEffect(() => {
    if (!target) return;

    const resource = createEventListenerResource(
      `event-${event}-${Date.now()}`,
      target,
      event,
      listener,
      options
    );

    registerResource(resource);

    return () => resource.cleanup();
  }, [target, event, listener, options, registerResource, createEventListenerResource]);
}

/**
 * AbortController 관리 훅
 */
export function useAbortController() {
  const { registerResource, createAbortControllerResource } = useResourceManager();
  const controllerRef = useRef<AbortController | null>(null);

  const getController = useCallback(() => {
    if (!controllerRef.current || controllerRef.current.signal.aborted) {
      const { resource, controller } = createAbortControllerResource(`abort-${Date.now()}`);
      controllerRef.current = controller;
      registerResource(resource);
    }
    return controllerRef.current;
  }, [registerResource, createAbortControllerResource]);

  const abort = useCallback(() => {
    if (controllerRef.current && !controllerRef.current.signal.aborted) {
      controllerRef.current.abort();
      controllerRef.current = null;
    }
  }, []);

  return { getController, abort };
}
