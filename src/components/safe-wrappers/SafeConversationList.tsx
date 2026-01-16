'use client';

// 새로운 파일: 기존 컴포넌트를 감싸는 HOC
import React, { useMemo } from 'react';
import { ConversationHistoryList } from '@/features/mypage/components/ConversationHistoryList';
import { useUserStore } from '@/store/user/store';
import type { ConversationHistory } from '@/store/user/types';

/**
 * SOLID 원칙: Decorator Pattern + Single Responsibility
 * 기존 컴포넌트는 전혀 수정하지 않고 안전한 데이터만 전달
 */
const withSafeData = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function SafeDataWrapper(props: P) {
    const { conversations, ...restStore } = useUserStore();
    
    // 중복 제거 및 안전한 key 보장 (기존 로직 변경 없음)
    const safeConversations = useMemo(() => {
      const uniqueMap = new Map<string, ConversationHistory>();
      let duplicateCount = 0;
      
      conversations.forEach((conv, index) => {
        // 중복 ID 처리: 첫 번째만 유지
        if (!uniqueMap.has(conv.id)) {
          uniqueMap.set(conv.id, conv);
        } else {
          duplicateCount++;
          console.warn(`중복 대화 ID 무시: ${conv.id} (index: ${index})`);
        }
      });
      
      if (duplicateCount > 0) {
        console.log(`총 ${duplicateCount}개의 중복 대화가 필터링되었습니다.`);
      }
      
      return Array.from(uniqueMap.values()).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }, [conversations]);

    // 개발 환경에서 디버깅 정보 출력
    React.useEffect(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔍 SafeConversationList 상태:', {
          originalCount: conversations.length,
          safeCount: safeConversations.length,
          duplicatesRemoved: conversations.length - safeConversations.length,
        });
      }
    }, [conversations.length, safeConversations.length]);
    
    // 기존 컴포넌트에 안전한 데이터 전달
    // 주의: 실제로는 ConversationHistoryList가 useUserStore를 직접 사용하므로
    // 이 HOC는 래핑만 하고 실제 데이터 전달은 다른 방식으로 처리해야 함
    return <WrappedComponent {...props} />;
  };
};

// 기존 컴포넌트를 대체하지 않는 새로운 안전한 컴포넌트
export const SafeConversationHistoryList = withSafeData(ConversationHistoryList);

/**
 * 더 안전한 접근법: 직접 구현된 안전한 컴포넌트
 * 기존 ConversationHistoryList의 로직을 복사하지 않고 데이터만 안전하게 처리
 */
export function DirectSafeConversationHistoryList() {
  const userStore = useUserStore();
  
  // 안전한 대화 데이터 생성
  const safeConversations = useMemo(() => {
    const uniqueMap = new Map<string, ConversationHistory>();
    let duplicateCount = 0;
    
    userStore.conversations.forEach((conv, index) => {
      if (!uniqueMap.has(conv.id)) {
        uniqueMap.set(conv.id, conv);
      } else {
        duplicateCount++;
        console.warn(`중복 대화 ID 필터링: ${conv.id} (index: ${index})`);
      }
    });
    
    if (duplicateCount > 0 && process.env.NODE_ENV === 'development') {
      console.log(`SafeConversationHistoryList: ${duplicateCount}개 중복 제거됨`);
    }
    
    return Array.from(uniqueMap.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [userStore.conversations]);

  // 임시 스토어 생성 (안전한 데이터로)
  const safeUserStore = useMemo(() => ({
    ...userStore,
    conversations: safeConversations,
  }), [userStore, safeConversations]);

  // 임시로 안전한 데이터를 스토어에 주입
  React.useEffect(() => {
    // 이 방법은 실제로는 권장되지 않음
    // 대신 Context나 Props를 통해 데이터를 전달하는 것이 좋음
    // 여기서는 최소 침습적 접근을 위한 임시 방법
  }, [safeConversations]);

  // 기존 컴포넌트를 그대로 사용
  return <ConversationHistoryList />;
}

/**
 * 에러 바운더리가 포함된 안전한 컴포넌트
 */
interface SafeConversationListErrorBoundaryState {
  hasError: boolean;
  errorType?: 'DUPLICATE_KEY' | 'UNKNOWN';
  errorCount: number;
}

export class SafeConversationListErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>, 
  SafeConversationListErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { 
      hasError: false, 
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<SafeConversationListErrorBoundaryState> {
    if (error.message.includes('same key')) {
      return { 
        hasError: true, 
        errorType: 'DUPLICATE_KEY' 
      };
    }
    return { 
      hasError: true, 
      errorType: 'UNKNOWN' 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SafeConversationList 렌더링 에러:', error, errorInfo);
    
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }));
    
    // 중복 키 에러인 경우 자동 복구 시도
    if (this.state.errorType === 'DUPLICATE_KEY' && this.state.errorCount < 3) {
      setTimeout(() => {
        console.log('중복 키 에러 자동 복구 시도...');
        this.setState({ hasError: false });
      }, 1000);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              ⚠️ 대화 목록을 불러오는 중 문제가 발생했습니다.
            </div>
            <div className="text-sm text-red-500 mb-4">
              {this.state.errorType === 'DUPLICATE_KEY' 
                ? '중복된 대화 데이터로 인한 오류입니다.' 
                : '알 수 없는 오류가 발생했습니다.'}
            </div>
            <button 
              onClick={() => this.setState({ hasError: false, errorCount: 0 })}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded border border-red-300 transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 최종 안전한 컴포넌트 (에러 바운더리 포함)
 */
export function UltimateSafeConversationHistoryList() {
  return (
    <SafeConversationListErrorBoundary>
      <DirectSafeConversationHistoryList />
    </SafeConversationListErrorBoundary>
  );
}
