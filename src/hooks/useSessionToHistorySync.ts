'use client';

import { useEffect } from 'react';
import { useSessionStore } from '@/store/session/store';
import { useUserStore } from '@/store/user/store';
import type { ConversationHistory } from '@/store/user/types';

/**
 * 세션 완료 시 자동으로 사용자 히스토리에 저장하는 훅
 * v4.md 개선사항: 실제 세션 데이터와 사용자 히스토리 연동
 */
export function useSessionToHistorySync() {
  const sessionStore = useSessionStore();
  const userStore = useUserStore();

  useEffect(() => {
    // 세션이 완료되고 필요한 데이터가 모두 있을 때만 저장
    if (
      sessionStore.phase === 'done' && 
      sessionStore.match && 
      sessionStore.feedback && 
      sessionStore.duration > 0 &&
      userStore.isAuthenticated
    ) {
      // 이미 저장된 세션인지 확인 (중복 저장 방지)
      const sessionId = `session_${sessionStore.startTime}`;
      const existingConversation = userStore.conversations.find(
        conv => conv.id === sessionId
      );

      if (!existingConversation) {
        // 세션 데이터를 ConversationHistory 형태로 변환
        const conversationHistory: ConversationHistory = {
          id: sessionId,
          partnerName: '대화 상대', // 실제로는 사용자 입력이나 AI 추론으로 결정
          partnerAge: 25, // 실제로는 사용자 입력이나 AI 추론으로 결정
          date: sessionStore.startTime ? new Date(sessionStore.startTime) : new Date(),
          duration: sessionStore.duration,
          matchScore: sessionStore.match.score,
          summary: sessionStore.feedback.summary,
          highlights: sessionStore.segments.length > 0 
            ? [
                '실시간 대화 분석 완료',
                `총 ${sessionStore.segments.length}개의 대화 세그먼트 기록`,
                sessionStore.emotion ? '감정 분석 데이터 포함' : '기본 분석 완료'
              ]
            : ['음성 대화 세션 완료'],
          status: 'completed' as const,
        };

        // 사용자 히스토리에 추가
        userStore.addConversation(conversationHistory);
        
        console.log('세션 데이터가 사용자 히스토리에 자동 저장되었습니다:', sessionId);
      }
    }
  }, [
    sessionStore.phase,
    sessionStore.match,
    sessionStore.feedback,
    sessionStore.duration,
    sessionStore.startTime,
    sessionStore.segments,
    sessionStore.emotion,
    userStore.isAuthenticated,
    userStore.conversations,
    userStore.addConversation
  ]);

  /**
   * 수동으로 현재 세션을 히스토리에 저장하는 함수
   */
  const saveCurrentSessionToHistory = (
    partnerName: string = '대화 상대',
    partnerAge: number = 25
  ) => {
    if (!sessionStore.match || !sessionStore.feedback || !sessionStore.duration) {
      console.warn('세션 데이터가 완전하지 않습니다.');
      return false;
    }

    if (!userStore.isAuthenticated) {
      console.warn('사용자가 인증되지 않았습니다.');
      return false;
    }

    const sessionId = `manual_${Date.now()}_${partnerName.toLowerCase()}`;
    const conversationHistory: ConversationHistory = {
      id: sessionId,
      partnerName,
      partnerAge,
      date: new Date(),
      duration: sessionStore.duration,
      matchScore: sessionStore.match.score,
      summary: sessionStore.feedback.summary,
      highlights: sessionStore.segments.length > 0 
        ? [
            '수동 저장된 대화 세션',
            `총 ${sessionStore.segments.length}개의 대화 세그먼트`,
            sessionStore.emotion ? '감정 분석 결과 포함' : '기본 분석 결과'
          ]
        : ['저장된 음성 대화 세션'],
      status: 'completed' as const,
    };

    userStore.addConversation(conversationHistory);
    console.log('세션이 수동으로 히스토리에 저장되었습니다:', sessionId);
    return true;
  };

  return {
    saveCurrentSessionToHistory,
    canSaveSession: !!(
      sessionStore.match && 
      sessionStore.feedback && 
      sessionStore.duration > 0 &&
      userStore.isAuthenticated
    )
  };
}
