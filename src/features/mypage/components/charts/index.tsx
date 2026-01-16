'use client';

import React, { Suspense, lazy } from 'react';
import { ChartSkeleton } from '@/components/ui/enhanced/SkeletonCard';
import type { ConversationHistory } from '@/store/user/types';

// Lazy loading으로 차트 컴포넌트들 로드
// v4.md 개선사항: 코드 스플리팅으로 초기 로딩 성능 향상
const MatchScoreTrendChart = lazy(() => 
  import('./MatchScoreTrendChart').then(module => ({ 
    default: module.MatchScoreTrendChart 
  }))
);

const ConversationTimeChart = lazy(() => 
  import('./ConversationTimeChart').then(module => ({ 
    default: module.ConversationTimeChart 
  }))
);

const InterestSuccessChart = lazy(() => 
  import('./InterestSuccessChart').then(module => ({ 
    default: module.InterestSuccessChart 
  }))
);

// Wrapper 컴포넌트들 - Suspense로 감싸서 로딩 상태 처리
export function LazyMatchScoreTrendChart({ conversations }: { conversations: ConversationHistory[] }) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <MatchScoreTrendChart conversations={conversations} />
    </Suspense>
  );
}

export function LazyConversationTimeChart({ conversations }: { conversations: ConversationHistory[] }) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <ConversationTimeChart conversations={conversations} />
    </Suspense>
  );
}

export function LazyInterestSuccessChart({ 
  conversations, 
  userInterests 
}: { 
  conversations: ConversationHistory[];
  userInterests: string[];
}) {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <InterestSuccessChart 
        conversations={conversations} 
        userInterests={userInterests}
      />
    </Suspense>
  );
}
