'use client';

// 새로운 파일: 기존 Mock 데이터 로더를 감싸는 Facade
import { loadMockUserData, mockConversationHistory } from './user-mock-data';
import type { UserState, UserActions } from '@/store/user/types';

/**
 * SOLID 원칙: Single Responsibility Principle
 * 중복 방지 책임만 가지는 별도 클래스
 */
class MockDataLoadGuard {
  private static instance: MockDataLoadGuard;
  private loadedStores = new WeakSet<UserState & UserActions>();
  
  private constructor() {} // Singleton Pattern
  
  static getInstance(): MockDataLoadGuard {
    if (!MockDataLoadGuard.instance) {
      MockDataLoadGuard.instance = new MockDataLoadGuard();
    }
    return MockDataLoadGuard.instance;
  }
  
  loadSafely(userStore: UserState & UserActions): boolean {
    if (this.loadedStores.has(userStore)) {
      console.log('Mock 데이터가 이미 로드되어 있습니다.');
      return false;
    }
    
    if (userStore.conversations.length > 0) {
      console.log('대화 데이터가 이미 존재합니다.');
      return false;
    }
    
    // 기존 함수 그대로 사용
    loadMockUserData(userStore);
    this.loadedStores.add(userStore);
    return true;
  }

  // 강제 재로딩 (개발/테스트 용도)
  forceReload(userStore: UserState & UserActions): boolean {
    console.log('Mock 데이터 강제 재로딩...');
    
    // 기존 데이터 초기화
    userStore.reset();
    
    // 추적 상태 초기화
    this.loadedStores.delete(userStore);
    
    // 새로 로드
    return this.loadSafely(userStore);
  }

  // 로드 상태 확인
  isLoaded(userStore: UserState & UserActions): boolean {
    return this.loadedStores.has(userStore);
  }

  // 통계 정보
  getStats(): { totalLoadedStores: number } {
    // WeakSet의 크기는 직접 확인할 수 없지만, 
    // 개발 환경에서 디버깅 목적으로 대략적인 정보 제공
    return {
      totalLoadedStores: this.loadedStores ? 1 : 0, // WeakSet 특성상 정확한 카운트 불가
    };
  }
}

// 기존 함수를 대체하지 않는 새로운 안전한 함수들
export const loadMockUserDataSafely = (userStore: UserState & UserActions): boolean => {
  return MockDataLoadGuard.getInstance().loadSafely(userStore);
};

export const forceReloadMockUserData = (userStore: UserState & UserActions): boolean => {
  return MockDataLoadGuard.getInstance().forceReload(userStore);
};

export const isMockDataLoaded = (userStore: UserState & UserActions): boolean => {
  return MockDataLoadGuard.getInstance().isLoaded(userStore);
};

export const getMockDataStats = () => {
  return MockDataLoadGuard.getInstance().getStats();
};

/**
 * 개발 환경 전용: Mock 데이터 상태 디버깅
 */
export const debugMockDataState = (userStore: UserState & UserActions) => {
  if (process.env.NODE_ENV !== 'development') return;

  console.group('🔍 Mock 데이터 상태 디버깅');
  console.log('- 로드 상태:', isMockDataLoaded(userStore));
  console.log('- 대화 개수:', userStore.conversations.length);
  console.log('- 인증 상태:', userStore.isAuthenticated);
  console.log('- 프로필 존재:', !!userStore.profile);
  
  if (userStore.conversations.length > 0) {
    console.log('- 대화 ID 목록:', userStore.conversations.map(c => c.id));
    
    // 중복 ID 체크
    const ids = userStore.conversations.map(c => c.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      console.warn('⚠️ 중복 ID 발견:', duplicates);
    } else {
      console.log('✅ 중복 ID 없음');
    }
  }
  
  console.groupEnd();
};
