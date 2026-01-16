'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { UserState, UserActions, UserProfile, ConversationHistory } from './types';

const initialState: UserState = {
  profile: null,
  conversations: [],
  stats: null,
  isAuthenticated: false,
};

export const useUserStore = create<UserState & UserActions>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setProfile: (profile: UserProfile) => {
          set({ profile }, false, 'setProfile');
          get().updateStats();
        },

        addConversation: (conversation: ConversationHistory) => {
          set(
            (state) => {
              // 중복 체크 추가 (TICKET-001)
              const exists = state.conversations.some(c => c.id === conversation.id);
              if (exists) {
                console.warn(`중복 대화 무시: ${conversation.id}`);
                return state; // 변경 없음
              }
              return {
                conversations: [conversation, ...state.conversations],
              };
            },
            false,
            'addConversation'
          );
          get().updateStats();
        },

        updateConversation: (id: string, updates: Partial<ConversationHistory>) => {
          set(
            (state) => ({
              conversations: state.conversations.map((conv) =>
                conv.id === id ? { ...conv, ...updates } : conv
              ),
            }),
            false,
            'updateConversation'
          );
          get().updateStats();
        },

        removeConversation: (id: string) => {
          set(
            (state) => ({
              conversations: state.conversations.filter((conv) => conv.id !== id),
            }),
            false,
            'removeConversation'
          );
          get().updateStats();
        },

        updateStats: () => {
          const { conversations } = get();
          
          if (conversations.length === 0) {
            set({ stats: null }, false, 'updateStats:empty');
            return;
          }

          const completedConversations = conversations.filter(
            (conv) => conv.status === 'completed'
          );

          const totalConversations = completedConversations.length;
          const totalDuration = completedConversations.reduce(
            (sum, conv) => sum + conv.duration,
            0
          );
          const averageMatchScore = totalConversations > 0
            ? completedConversations.reduce((sum, conv) => sum + conv.matchScore, 0) / totalConversations
            : 0;
          const bestMatchScore = totalConversations > 0
            ? Math.max(...completedConversations.map((conv) => conv.matchScore))
            : 0;

          // 가장 자주 언급된 주제들 추출 (highlights에서)
          const allHighlights = completedConversations.flatMap((conv) => conv.highlights);
          const topicCounts = allHighlights.reduce((acc, highlight) => {
            const words = highlight.split(' ').filter((word) => word.length > 2);
            words.forEach((word) => {
              acc[word] = (acc[word] || 0) + 1;
            });
            return acc;
          }, {} as Record<string, number>);
          
          const favoriteTopics = Object.entries(topicCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([topic]) => topic);

          const stats = {
            totalConversations,
            averageMatchScore: Math.round(averageMatchScore * 10) / 10,
            totalDuration,
            bestMatchScore,
            favoriteTopics,
          };

          set({ stats }, false, 'updateStats:calculated');
        },

        login: (profile: UserProfile) => {
          set({ profile, isAuthenticated: true }, false, 'login');
          get().updateStats();
        },

        logout: () => {
          set(initialState, false, 'logout');
        },

        reset: () => {
          set(initialState, false, 'reset');
        },
      }),
      {
        name: 'heartsignal-user',
        partialize: (state) => ({
          profile: state.profile,
          conversations: state.conversations,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'heartsignal-user' }
  )
);
