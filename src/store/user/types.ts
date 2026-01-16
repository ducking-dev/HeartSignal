'use client';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  bio: string;
  interests: string[];
  profileImage?: string;
  location?: string;
  occupation?: string;
  joinedAt: Date;
}

export interface ConversationHistory {
  id: string;
  partnerName: string;
  partnerAge: number;
  date: Date;
  duration: number; // 초 단위
  matchScore: number;
  summary: string;
  highlights: string[];
  status: 'completed' | 'ongoing' | 'cancelled';
}

export interface UserStats {
  totalConversations: number;
  averageMatchScore: number;
  totalDuration: number; // 총 대화 시간 (초)
  bestMatchScore: number;
  favoriteTopics: string[];
}

export interface UserState {
  profile: UserProfile | null;
  conversations: ConversationHistory[];
  stats: UserStats | null;
  isAuthenticated: boolean;
}

export interface UserActions {
  setProfile(profile: UserProfile): void;
  addConversation(conversation: ConversationHistory): void;
  updateConversation(id: string, updates: Partial<ConversationHistory>): void;
  removeConversation(id: string): void;
  updateStats(): void;
  login(profile: UserProfile): void;
  logout(): void;
  reset(): void;
}
