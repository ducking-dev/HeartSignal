'use client';

import React, { useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { Container } from '@/components/layout/Container';
import { UserProfile } from '@/features/mypage/components/UserProfile';
// 기존 import (Phase 2에서 안전한 컴포넌트로 교체)
// import { ConversationHistoryList } from '@/features/mypage/components/ConversationHistoryList';
import { UserStats } from '@/features/mypage/components/UserStats';
// import { useUserStore } from '@/store/user/store';
// import { loadMockUserData } from '@/lib/user-mock-data';

// Phase 2: 안전한 컴포넌트들 사용
import { UltimateSafeConversationHistoryList } from '@/components/safe-wrappers/SafeConversationList';
import { useEnhancedUserStore } from '@/store/user/store-enhancer';
import { loadMockUserDataSafely, debugMockDataState } from '@/lib/user-mock-data-safe';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Phase 2: 개발 환경 모니터링
import { DuplicationMonitor } from '@/components/dev-tools/DuplicationMonitor';

export default function MyPage() {
  const router = useRouter();
  // Phase 2: Enhanced Store 사용 (기존 스토어와 완전 호환)
  const enhancedStore = useEnhancedUserStore();
  const { isAuthenticated, profile } = enhancedStore;

  // Phase 2: 안전한 Mock 데이터 로드
  useEffect(() => {
    if (!isAuthenticated) {
      const loaded = loadMockUserDataSafely(enhancedStore);
      if (loaded && process.env.NODE_ENV === 'development') {
        console.log('✅ MyPage: Mock 데이터 안전하게 로드됨');
        debugMockDataState(enhancedStore);
      }
    }
  }, [isAuthenticated, enhancedStore]);

  if (!isAuthenticated || !profile) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <Header />
        <Container className="py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              로그인이 필요합니다
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              마이페이지를 이용하려면 먼저 로그인해주세요.
            </p>
            <Button onClick={() => router.push('/')}>
              홈으로 돌아가기
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      <Container className="py-8">
        <div className="space-y-6">
          {/* 페이지 헤더 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  마이페이지
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  {profile.name}님의 HeartSignal 활동 정보
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => router.push('/settings')}
            >
              <Settings className="h-4 w-4" />
              설정
            </Button>
          </div>

          {/* 메인 컨텐츠 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 왼쪽 컬럼: 프로필 */}
            <div className="lg:col-span-1">
              <UserProfile />
            </div>
            
            {/* 오른쪽 컬럼: 통계 및 히스토리 */}
            <div className="lg:col-span-2 space-y-6">
              <UserStats />
              {/* Phase 2: 안전한 ConversationHistoryList 사용 (기존과 동일한 UI) */}
              <UltimateSafeConversationHistoryList />
            </div>
          </div>
        </div>
      </Container>
      
      {/* Phase 2: 개발 환경 중복 데이터 모니터 */}
      <DuplicationMonitor />
    </div>
  );
}
