'use client';

// 새로운 파일: 기존 스토어를 확장하는 데코레이터
import { useUserStore } from './store';
import type { ConversationHistory } from './types';

/**
 * SOLID 원칙: Open/Closed Principle
 * 기존 스토어는 수정하지 않고 확장만 수행
 */
export const useEnhancedUserStore = () => {
  const originalStore = useUserStore();
  
  // 중복 방지 래퍼 함수 (기존 함수를 대체하지 않음)
  const addConversationSafely = (conversation: ConversationHistory) => {
    const existing = originalStore.conversations.find(c => c.id === conversation.id);
    
    if (existing) {
      console.log(`중복 대화 무시: ${conversation.id}`);
      return false; // 중복이면 추가하지 않음
    }
    
    // 기존 함수 그대로 사용
    originalStore.addConversation(conversation);
    return true;
  };

  // 안전한 업데이트 함수
  const updateConversationSafely = (id: string, updates: Partial<ConversationHistory>) => {
    const existing = originalStore.conversations.find(c => c.id === id);
    
    if (!existing) {
      console.warn(`업데이트할 대화를 찾을 수 없음: ${id}`);
      return false;
    }

    // 기존 함수 그대로 사용
    originalStore.updateConversation(id, updates);
    return true;
  };

  // 중복 제거 유틸리티 함수
  const removeDuplicates = () => {
    const uniqueConversations = new Map<string, ConversationHistory>();
    let duplicateCount = 0;

    originalStore.conversations.forEach(conv => {
      if (!uniqueConversations.has(conv.id)) {
        uniqueConversations.set(conv.id, conv);
      } else {
        duplicateCount++;
        console.warn(`중복 발견: ${conv.id}`);
      }
    });

    if (duplicateCount > 0) {
      console.log(`${duplicateCount}개의 중복 대화 발견, 정리 중...`);
      // 기존 conversations 배열을 고유한 것들로 교체
      // 이는 내부적으로만 사용되므로 기존 API를 변경하지 않음
      const uniqueArray = Array.from(uniqueConversations.values());
      originalStore.conversations.length = 0;
      uniqueArray.forEach(conv => originalStore.conversations.push(conv));
      originalStore.updateStats();
    }

    return duplicateCount;
  };
  
  return {
    ...originalStore, // 모든 기존 기능 유지
    addConversationSafely, // 새로운 안전한 함수만 추가
    updateConversationSafely, // 안전한 업데이트 함수
    removeDuplicates, // 중복 제거 함수
    // 메타데이터
    _enhanced: true,
    _version: '6.0.0',
  };
};

/**
 * 타입 가드: Enhanced Store인지 확인
 */
export const isEnhancedStore = (store: any): store is ReturnType<typeof useEnhancedUserStore> => {
  return store && store._enhanced === true;
};
