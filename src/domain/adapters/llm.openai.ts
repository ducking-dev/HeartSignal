'use client';

import type { EmotionAnalysis, ConversationAnalysis, Feedback } from '@/store/useSessionStore';

export interface LLMAdapter {
  analyzeEmotion(transcript: string): Promise<EmotionAnalysis>;
  analyzeConversation(transcript: string, metadata: any): Promise<ConversationAnalysis>;
  generateFeedback(analysisResults: any): Promise<Feedback>;
}

export interface OpenAIConfig {
  apiKey: string;
  model: string;              // 'gpt-4o-mini'
  maxTokens: number;          // 500
  temperature: number;        // 0.3
}

export class OpenAIAdapter implements LLMAdapter {
  private config: OpenAIConfig;

  constructor(config: OpenAIConfig) {
    this.config = config;
  }

  async analyzeEmotion(transcript: string): Promise<EmotionAnalysis> {
    const prompt = `당신은 소개팅 대화 분석 전문가입니다. 다음 전사 내용을 분석해 감정 상태를 JSON으로 반환하세요.

**대화 전사:**
${transcript}

**분석 요구사항:**
- valence: -1(매우 부정적) ~ +1(매우 긍정적)
- arousal: 0(매우 차분) ~ 1(매우 흥미진진)
- 5가지 기본 감정별 강도 측정

**JSON 출력 형식:**
{
  "valence": 0.0,
  "arousal": 0.0, 
  "emotions": [
    {"label": "joy", "score": 0.0},
    {"label": "anger", "score": 0.0},
    {"label": "sadness", "score": 0.0},
    {"label": "fear", "score": 0.0},
    {"label": "surprise", "score": 0.0}
  ],
  "evidence": ["감정을 보여주는 구체적 표현 2가지"]
}`;

    return this.callAPI(prompt);
  }

  async analyzeConversation(transcript: string, metadata: any): Promise<ConversationAnalysis> {
    const prompt = `소개팅 대화의 상호작용 품질을 분석하는 전문가로서 다음을 평가해주세요.

**대화 데이터:**
- 전사: ${transcript}
- 발화 통계: ${JSON.stringify(metadata)}

**분석 기준:**
- rapport: 서로에 대한 관심과 호감 표현 정도 (0~1)
- turnTakingBalance: 0.5가 이상적 (50:50 균형)
- empathy: 상대방 감정에 대한 이해와 공감 반응 (0~1)
- redFlags: 부정적 신호들
- highlights: 긍정적 신호들

**JSON 출력:**
{
  "rapport": 0.0,
  "turnTakingBalance": 0.0,
  "empathy": 0.0,
  "redFlags": ["구체적 경고 신호들"],
  "highlights": ["긍정적 하이라이트들"]
}`;

    return this.callAPI(prompt);
  }

  async generateFeedback(analysisResults: any): Promise<Feedback> {
    const { matchScore, emotion, conversation } = analysisResults;
    
    const prompt = `당신은 따뜻하고 신뢰감 있는 데이팅 코치입니다. 분석 결과를 바탕으로 건설적 피드백을 제공하세요.

**분석 결과:**
- 매칭 점수: ${matchScore.score}/100
- 감정 분석: valence ${emotion.valence}, 주요 감정 ${emotion.emotions[0]?.label}
- 상호작용: 라포 ${conversation.rapport}, 공감 ${conversation.empathy}
- 경고 신호: ${conversation.redFlags.join(', ')}
- 긍정 포인트: ${conversation.highlights.join(', ')}

**피드백 요구사항:**
- 브랜드 톤: 따뜻하고 격려하는 말투, "감정은 섬세하게, 결과는 간단하게"
- summary: 전체적인 대화 흐름을 2-3문장으로 요약
- tips: 다음 데이트에서 바로 실천할 수 있는 구체적 조언 3개

**JSON 출력:**
{
  "summary": "오늘 대화에서 서로에 대한 관심이 잘 드러났어요. 특히 공통 관심사에 대한 이야기에서 자연스러운 호감이 느껴졌습니다.",
  "tips": [
    "상대방이 말할 때 2-3초 더 기다려보세요. 여유로운 호흡이 더 깊은 대화를 만들어요.",
    "다음번엔 감정을 표현하는 단어를 하나씩 더 써보세요. '좋다'보다는 '설레네', '재밌다'보다는 '흥미진진해'처럼요.",
    "상대방의 관심사에 질문을 하나 더 해보세요. 호기심이 호감으로 전해져요."
  ]
}`;

    return this.callAPI(prompt);
  }

  private async callAPI(prompt: string): Promise<any> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
          response_format: { type: 'json_object' }
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API 오류: ${error.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('OpenAI API에서 응답을 받지 못했습니다.');
      }

      return JSON.parse(content);

    } catch (error: unknown) {
      if (error instanceof SyntaxError) {
        throw new Error('OpenAI API 응답을 파싱할 수 없습니다.');
      }
      throw error;
    }
  }
}
