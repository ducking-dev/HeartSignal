'use client';

import type { EmotionAnalysis, ConversationAnalysis, MatchScore, ProsodySample } from '@/store/useSessionStore';

export interface ProsodySummary {
  avgRMS: number;
  rmsVariance: number;
  avgPitch?: number;
  pitchRange?: number;
}

export function computeMatchScore(
  emotion: EmotionAnalysis,
  conversation: ConversationAnalysis,
  prosodySummary: ProsodySummary
): MatchScore {
  // 텍스트 점수: 감정 극성 + 라포 형성도
  const normalizedValence = (emotion.valence + 1) / 2; // -1~1을 0~1로 변환
  const textScore = 0.5 * normalizedValence + 0.5 * conversation.rapport;
  
  // 음성 점수: prosody 건강도 + 감정 각성도
  const prosodyHealth = assessProsodyHealth(prosodySummary);
  const voiceScore = 0.7 * prosodyHealth + 0.3 * emotion.arousal;
  
  // 균형 점수: 0.5(50:50)에 가까울수록 높은 점수
  const balanceScore = 1 - Math.abs(conversation.turnTakingBalance - 0.5) * 2;
  
  // PRD 명시 공식: 0.45*text + 0.35*voice + 0.20*balance
  const finalScore = 0.45 * textScore + 0.35 * voiceScore + 0.20 * balanceScore;
  
  // 경고 신호에 따른 페널티
  const penalty = Math.min(conversation.redFlags.length * 0.05, 0.2); // 최대 20% 감점
  const adjustedScore = Math.max(0, finalScore - penalty);
  
  return {
    score: Math.round(adjustedScore * 100),
    breakdown: {
      text: Math.round(textScore * 100),
      voice: Math.round(voiceScore * 100),
      balance: Math.round(balanceScore * 100)
    }
  };
}

function assessProsodyHealth(summary: ProsodySummary): number {
  // RMS 기반 음성 활력도 평가
  const volumeScore = Math.min(summary.avgRMS * 2, 1); // 0.5가 최적
  
  // RMS 변동성 평가 (너무 단조롭지 않은지)
  const varianceScore = Math.min(summary.rmsVariance * 5, 1); // 적당한 변화
  
  // 피치 범위 평가 (선택적)
  let pitchScore = 0.5; // 기본값
  if (summary.pitchRange && summary.avgPitch) {
    const normalizedRange = Math.min(summary.pitchRange / 100, 1); // 100Hz 범위가 이상적
    pitchScore = normalizedRange;
  }
  
  // 가중 평균
  return 0.5 * volumeScore + 0.3 * varianceScore + 0.2 * pitchScore;
}

export function generateDemoScore(): MatchScore {
  // OpenAI API 실패 시 사용할 데모 데이터
  return {
    score: 73,
    breakdown: {
      text: 78,
      voice: 69,
      balance: 71
    }
  };
}

export function generateDemoEmotion(): EmotionAnalysis {
  return {
    valence: 0.4,
    arousal: 0.6,
    emotions: [
      { label: 'joy', score: 0.7 },
      { label: 'surprise', score: 0.3 },
      { label: 'anger', score: 0.0 },
      { label: 'sadness', score: 0.1 },
      { label: 'fear', score: 0.0 }
    ],
    evidence: ['웃음소리가 자주 들려요', '흥미로운 질문들이 많았어요']
  };
}

export function generateDemoConversation(): ConversationAnalysis {
  return {
    rapport: 0.75,
    turnTakingBalance: 0.45,
    empathy: 0.65,
    redFlags: [],
    highlights: ['공통 관심사 발견', '자연스러운 유머', '적극적인 경청']
  };
}

export function generateDemoFeedback(): import('@/store/useSessionStore').Feedback {
  return {
    summary: '대화에서 서로에 대한 호기심이 잘 드러났어요. 특히 공통 관심사를 찾아가는 과정이 자연스러웠습니다.',
    tips: [
      '상대방이 말할 때 2-3초 더 기다려보세요. 여유로운 호흡이 더 깊은 대화를 만들어요.',
      '감정 표현을 한 단계 더 구체적으로 해보세요. "재밌다"보다는 "흥미진진해요"처럼요.',
      '질문 끝에 "어떠세요?"를 추가해보세요. 상대방의 의견을 더 끌어낼 수 있어요.'
    ]
  };
}
