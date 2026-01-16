'use client';

// 새로운 파일: 스토어 호출을 가로채는 프록시
import { useUserStore } from './store';
import type { ConversationHistory } from './types';

/**
 * SOLID 원칙: Liskov Substitution Principle
 * 기존 스토어와 동일한 인터페이스 제공하되 안전성 추가
 */
export const createSafeUserStoreProxy = () => {
  const originalStore = useUserStore.getState();
  
  return new Proxy(originalStore, {
    get(target, prop, receiver) {
      if (prop === 'addConversation') {
        return (conversation: ConversationHistory) => {
          // 중복 체크 후 기존 함수 호출
          const existing = target.conversations.find(c => c.id === conversation.id);
          if (!existing) {
            console.log(`새 대화 추가: ${conversation.id}`);
            return Reflect.get(target, prop, receiver)(conversation);
          } else {
            console.log(`중복 대화 추가 방지: ${conversation.id}`);
            return false; // 추가되지 않았음을 알림
          }
        };
      }

      if (prop === 'updateConversation') {
        return (id: string, updates: Partial<ConversationHistory>) => {
          // 존재 여부 체크 후 기존 함수 호출
          const existing = target.conversations.find(c => c.id === id);
          if (existing) {
            console.log(`대화 업데이트: ${id}`);
            return Reflect.get(target, prop, receiver)(id, updates);
          } else {
            console.warn(`업데이트할 대화를 찾을 수 없음: ${id}`);
            return false;
          }
        };
      }

      if (prop === 'removeConversation') {
        return (id: string) => {
          // 존재 여부 체크 후 기존 함수 호출
          const existing = target.conversations.find(c => c.id === id);
          if (existing) {
            console.log(`대화 삭제: ${id}`);
            return Reflect.get(target, prop, receiver)(id);
          } else {
            console.warn(`삭제할 대화를 찾을 수 없음: ${id}`);
            return false;
          }
        };
      }
      
      // 다른 모든 속성과 메서드는 그대로 전달
      return Reflect.get(target, prop, receiver);
    },

    set(target, prop, value, receiver) {
      // conversations 배열 직접 설정 시 중복 체크
      if (prop === 'conversations' && Array.isArray(value)) {
        const uniqueConversations = new Map<string, ConversationHistory>();
        let duplicateCount = 0;

        value.forEach(conv => {
          if (!uniqueConversations.has(conv.id)) {
            uniqueConversations.set(conv.id, conv);
          } else {
            duplicateCount++;
            console.warn(`중복 대화 필터링: ${conv.id}`);
          }
        });

        if (duplicateCount > 0) {
          console.log(`${duplicateCount}개의 중복 대화가 필터링되었습니다.`);
          const filteredValue = Array.from(uniqueConversations.values());
          return Reflect.set(target, prop, filteredValue, receiver);
        }
      }

      return Reflect.set(target, prop, value, receiver);
    }
  });
};

/**
 * React Hook 형태의 안전한 스토어 사용
 */
export const useSafeUserStore = () => {
  const originalStore = useUserStore();
  
  // 프록시 생성 (매번 새로 생성하지 않도록 메모화 가능)
  const safeStore = React.useMemo(() => {
    return createSafeUserStoreProxy();
  }, []);

  // 추가 안전 기능들
  const safeMethods = React.useMemo(() => ({
    // 중복 제거 함수
    removeDuplicates: () => {
      const uniqueConversations = new Map<string, ConversationHistory>();
      let duplicateCount = 0;

      originalStore.conversations.forEach(conv => {
        if (!uniqueConversations.has(conv.id)) {
          uniqueConversations.set(conv.id, conv);
        } else {
          duplicateCount++;
        }
      });

      if (duplicateCount > 0) {
        console.log(`중복 제거: ${duplicateCount}개 항목`);
        // 기존 스토어의 reset 후 고유한 대화들만 다시 추가
        const uniqueArray = Array.from(uniqueConversations.values());
        originalStore.conversations.length = 0;
        uniqueArray.forEach(conv => originalStore.addConversation(conv));
      }

      return duplicateCount;
    },

    // 데이터 무결성 검증
    validateIntegrity: () => {
      const issues: string[] = [];
      const ids = originalStore.conversations.map(c => c.id);
      
      // 중복 ID 체크
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      if (duplicates.length > 0) {
        issues.push(`중복 ID: ${duplicates.join(', ')}`);
      }

      // 빈 ID 체크
      const emptyIds = originalStore.conversations.filter(c => !c.id || c.id.trim() === '');
      if (emptyIds.length > 0) {
        issues.push(`빈 ID: ${emptyIds.length}개`);
      }

      // 잘못된 날짜 체크
      const invalidDates = originalStore.conversations.filter(c => 
        !c.date || isNaN(new Date(c.date).getTime())
      );
      if (invalidDates.length > 0) {
        issues.push(`잘못된 날짜: ${invalidDates.length}개`);
      }

      return {
        isValid: issues.length === 0,
        issues,
        totalConversations: originalStore.conversations.length,
      };
    },

    // 통계 정보
    getStats: () => ({
      totalConversations: originalStore.conversations.length,
      uniqueIds: new Set(originalStore.conversations.map(c => c.id)).size,
      duplicateCount: originalStore.conversations.length - new Set(originalStore.conversations.map(c => c.id)).size,
    }),
  }), [originalStore]);

  return {
    ...safeStore,
    ...safeMethods,
    _isSafeProxy: true,
    _version: '6.0.0',
  };
};

// React import 추가 (위의 useMemo에서 사용)
import React from 'react';

/**
 * 타입 가드: Safe Proxy Store인지 확인
 */
export const isSafeUserStore = (store: any): store is ReturnType<typeof useSafeUserStore> => {
  return store && store._isSafeProxy === true;
};
