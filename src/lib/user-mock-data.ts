'use client';

import type { UserProfile, ConversationHistory, UserState, UserActions } from '@/store/user/types';
import type { HeartSignalState } from '@/store/session/store';

/**
 * 박민수 사용자 프로필 Mock Data
 */
export const mockUserProfile: UserProfile = {
  id: 'user_park_minsu',
  name: '박민수',
  age: 25,
  gender: 'male',
  bio: '웹 개발자로 일하고 있어요. AI와 새로운 기술에 관심이 많고, 운동과 등산을 좋아합니다. 진솔한 대화를 나누며 서로를 알아가는 시간을 소중히 여겨요.',
  interests: ['개발', 'AI', '헬스', '등산', '넷플릭스', '요리', '테니스'],
  profileImage: 'https://picsum.photos/200/200?random=1',
  location: '서울시 강남구',
  occupation: '웹 개발자',
  joinedAt: new Date('2024-01-15'),
};

/**
 * 박민수의 대화 히스토리 Mock Data
 */
export const mockConversationHistory: ConversationHistory[] = [
  // 가장 최근 대화 (지영씨와의 대화)
  {
    id: 'conv_001_jiyoung',
    partnerName: '김지영',
    partnerAge: 24,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
    duration: 1080, // 18분
    matchScore: 82,
    summary: '첫 통화치고는 정말 자연스럽고 따뜻한 대화였어요! 서로에 대한 호기심과 배려가 잘 드러났고, 공통 관심사를 통해 자연스럽게 친밀감을 쌓아가는 모습이 인상적이었습니다.',
    highlights: [
      '공통 관심사 발견 (드라마, 운동, 요리)',
      '자연스러운 유머와 농담',
      '서로에 대한 진심어린 칭찬',
      '미래 계획에 대한 공통된 관심',
      '다음 만남 약속으로 발전'
    ],
    status: 'completed',
  },
  
  // 2주 전 대화
  {
    id: 'conv_002_soyoung',
    partnerName: '이소영',
    partnerAge: 26,
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2주 전
    duration: 720, // 12분
    matchScore: 65,
    summary: '서로 다른 관심사로 인해 대화가 조금 어색했지만, 상대방을 이해하려는 노력이 보였어요. 짧은 시간이었지만 서로에 대해 기본적인 정보를 나눌 수 있었습니다.',
    highlights: [
      '직업과 일상에 대한 진솔한 이야기',
      '서로 다른 취미에 대한 호기심',
      '정중하고 예의 바른 대화 태도'
    ],
    status: 'completed',
  },

  // 3주 전 대화
  {
    id: 'conv_003_hyejin',
    partnerName: '박혜진',
    partnerAge: 23,
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3주 전
    duration: 1440, // 24분
    matchScore: 78,
    summary: '활발하고 재밌는 대화였어요! 서로 비슷한 유머 코드를 가지고 있어서 웃음이 끊이지 않았습니다. 특히 여행과 음식에 대한 공통된 관심사가 많았어요.',
    highlights: [
      '비슷한 유머 감각으로 즐거운 분위기',
      '여행 경험과 계획 공유',
      '맛집과 요리에 대한 열정적인 대화',
      '서로의 성격에 대한 긍정적 피드백'
    ],
    status: 'completed',
  },

  // 1개월 전 대화
  {
    id: 'conv_004_minji',
    partnerName: '김민지',
    partnerAge: 25,
    date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 4주 전
    duration: 900, // 15분
    matchScore: 58,
    summary: '조용하고 신중한 성격의 상대방과의 대화였어요. 처음에는 어색했지만 점차 서로에 대해 알아가며 편안해졌습니다. 깊이 있는 대화보다는 가벼운 일상 이야기가 주를 이뤘어요.',
    highlights: [
      '책과 영화에 대한 취향 공유',
      '조용한 데이트 장소에 대한 선호도',
      '서로의 가치관에 대한 존중'
    ],
    status: 'completed',
  },

  // 1개월 반 전 대화 (첫 번째 대화)
  {
    id: 'conv_005_yuna',
    partnerName: '최유나',
    partnerAge: 27,
    date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45일 전
    duration: 540, // 9분 (첫 대화라 짧음)
    matchScore: 45,
    summary: '첫 번째 HeartSignal 대화였어요. 서로 긴장해서 어색한 분위기였지만, 앱 사용법에 익숙해지는 시간이었습니다. 짧은 대화였지만 새로운 만남에 대한 기대감이 느껴졌어요.',
    highlights: [
      '첫 만남의 설렘과 긴장감',
      '기본적인 자기소개',
      'HeartSignal 앱에 대한 호기심'
    ],
    status: 'completed',
  },
];

/**
 * 사용자 스토어에 박민수 데이터를 로드하는 헬퍼 함수
 * v4.md 개선사항: any 타입 제거로 타입 안전성 향상
 */
export const loadMockUserData = (userStore: UserState & UserActions) => {
  // 프로필 로그인
  userStore.login(mockUserProfile);
  
  // 대화 히스토리 로드
  mockConversationHistory.forEach(conversation => {
    userStore.addConversation(conversation);
  });
};

/**
 * 새로운 대화를 추가하는 헬퍼 함수 (현재 세션 데이터 기반)
 * v4.md 개선사항: any 타입 제거로 타입 안전성 향상
 */
export const addCurrentConversationToHistory = (
  userStore: UserState & UserActions,
  sessionStore: HeartSignalState,
  partnerName: string = '김지영',
  partnerAge: number = 24
) => {
  const { match, feedback, duration, segments } = sessionStore;
  
  if (!match || !feedback || !duration) {
    console.warn('세션 데이터가 완전하지 않습니다.');
    return;
  }

  const newConversation: ConversationHistory = {
    id: `conv_${Date.now()}_${partnerName.toLowerCase()}`,
    partnerName,
    partnerAge,
    date: new Date(),
    duration,
    matchScore: match.score,
    summary: feedback.summary,
    highlights: segments.length > 0 
      ? ['실시간 대화 분석 완료', '자연스러운 대화 흐름', '긍정적인 상호작용']
      : ['음성 대화 세션 완료'],
    status: 'completed' as const,
  };

  userStore.addConversation(newConversation);
};
