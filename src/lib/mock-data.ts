'use client';

import type { 
  TranscriptSegment, 
  ProsodySample, 
  EmotionAnalysis, 
  ConversationAnalysis, 
  MatchScore, 
  Feedback 
} from '@/store/useSessionStore';

/**
 * 대한민국 20대 남녀 소개팅 후 첫 통화 Mock Data
 * 
 * 시나리오: 
 * - 민수(25, 남) & 지영(24, 여)
 * - 지난주 소개팅에서 만남
 * - 첫 통화, 서로 탐색하는 단계
 * - 약간의 긴장감과 호기심이 공존
 * - 총 통화 시간: 약 18분
 */

// 실제적인 첫 통화 대화 내용
export const mockTranscriptSegments: TranscriptSegment[] = [
  // 인사 & 시작 (0-30초)
  { t0: 0, t1: 2800, text: "안녕하세요! 민수씨", speaker: "me" },
  { t0: 3200, t1: 5900, text: "네 안녕하세요 지영씨! 잘 지내셨어요?", speaker: "partner" },
  { t0: 6500, t1: 9200, text: "네, 덕분에요. 오늘 하루 어떻게 보내셨어요?", speaker: "me" },
  { t0: 9800, t1: 13400, text: "아 저는 오늘 친구들이랑 카페 갔다가 집에서 넷플릭스 봤어요", speaker: "partner" },
  { t0: 14000, t1: 16800, text: "오 뭐 보셨어요? 저도 요즘 드라마 찾고 있었는데", speaker: "me" },
  { t0: 17400, t1: 21200, text: "아 '더 글로리' 다시 보고 있어요. 복수극 좋아하시나요?", speaker: "partner" },
  { t0: 21800, t1: 25600, text: "와 저도 그거 재밌게 봤어요! 송혜교 연기 진짜 좋더라고요", speaker: "me" },
  { t0: 26200, t1: 29800, text: "맞아요! 특히 감정 연기가... 소름 돋았어요", speaker: "partner" },

  // 취미/관심사 탐색 (30초-3분)
  { t0: 32000, t1: 36400, text: "그런데 평소에 드라마 자주 보시는 편이에요?", speaker: "me" },
  { t0: 37000, t1: 42800, text: "음... 그렇게 자주는 아니고요. 운동하거나 친구들 만나는 걸 더 좋아해요", speaker: "partner" },
  { t0: 43400, t1: 46200, text: "어떤 운동 하세요? 저도 운동 좋아해요", speaker: "me" },
  { t0: 46800, t1: 51600, text: "필라테스랑 가끔 테니스 쳐요. 민수씨는 어떤 운동 하세요?", speaker: "partner" },
  { t0: 52200, t1: 57400, text: "저는 헬스장 다니고요, 주말에는 등산도 가끔 가요. 테니스 재밌나요?", speaker: "me" },
  { t0: 58000, t1: 63800, text: "네! 처음엔 어려웠는데 지금은 정말 재밌어요. 스트레스도 풀리고", speaker: "partner" },
  { t0: 64400, t1: 68200, text: "좋네요. 저도 한번 배워보고 싶었는데 기회가 없었어요", speaker: "me" },
  { t0: 68800, t1: 72600, text: "기회 되면 같이... 아니 언젠가 해보세요 하하", speaker: "partner" },

  // 소개팅 당일 이야기 (3분-6분)
  { t0: 75000, t1: 79400, text: "그런데 지난주 소개팅 때 어떠셨어요? 솔직히", speaker: "me" },
  { t0: 80000, t1: 84800, text: "음... 처음엔 좀 긴장했는데 생각보다 편하게 대화할 수 있어서 좋았어요", speaker: "partner" },
  { t0: 85400, t1: 89200, text: "저도요! 사실 소개팅 자체가 처음이라 떨렸거든요", speaker: "me" },
  { t0: 89800, t1: 93600, text: "진짜요? 전혀 그런 것 같지 않았는데요", speaker: "partner" },
  { t0: 94200, t1: 98400, text: "하하 티 안 나게 하려고 노력했어요. 그날 파스타 맛있었죠?", speaker: "me" },
  { t0: 99000, t1: 103800, text: "네! 그 로제 파스타 정말 맛있었어요. 그 식당 자주 가시나요?", speaker: "partner" },
  { t0: 104400, t1: 108600, text: "아니요, 사실 그날 처음 가봤어요. 인터넷에서 찾아서", speaker: "me" },
  { t0: 109200, t1: 112800, text: "와 그런데도 그렇게 좋은 곳을... 센스 있으시네요", speaker: "partner" },

  // 일상 & 직장 이야기 (6분-9분)
  { t0: 115000, t1: 119400, text: "그런데 요즘 회사 일은 어떠세요? 바쁘시겠어요", speaker: "me" },
  { t0: 120000, t1: 125200, text: "음 그냥 그래요. 마케팅팀이다 보니까 프로젝트마다 좀 달라서", speaker: "partner" },
  { t0: 125800, t1: 130600, text: "마케팅 재밌을 것 같은데요. 창의적인 일 많이 하시겠네요", speaker: "me" },
  { t0: 131200, t1: 136800, text: "맞아요, 그런 부분이 좋긴 해요. 민수씨는 개발자라고 하셨죠?", speaker: "partner" },
  { t0: 137400, t1: 142200, text: "네, 웹 개발 하고 있어요. 요즘엔 AI 관련 프로젝트도 하고 있고", speaker: "me" },
  { t0: 142800, t1: 147600, text: "와 AI요? 요즘 핫한 분야잖아요. 어려울 것 같은데", speaker: "partner" },
  { t0: 148200, t1: 152800, text: "생각보다 재밌어요. 뭔가 새로운 걸 만들어내는 느낌이라서", speaker: "me" },
  { t0: 153400, t1: 157200, text: "멋있어요. 저는 코딩 하나도 못하거든요", speaker: "partner" },

  // 가벼운 농담 & 케미 (9분-12분)
  { t0: 160000, t1: 164400, text: "그런데 지영씨 목소리 정말 좋으시네요. 라디오 DJ 같아요", speaker: "me" },
  { t0: 165000, t1: 168800, text: "에이~ 그런 소리 처음 들어봐요. 고마워요", speaker: "partner" },
  { t0: 169400, t1: 173600, text: "진짜에요! 차분하면서도 따뜻한 느낌이에요", speaker: "me" },
  { t0: 174200, t1: 178400, text: "민수씨도 목소리 좋으세요. 신뢰감 있는 목소리", speaker: "partner" },
  { t0: 179000, t1: 182800, text: "하하 감사해요. 그런데 전화로 이야기하니까 더 편한 것 같아요", speaker: "me" },
  { t0: 183400, t1: 187600, text: "맞아요! 직접 만났을 때보다 덜 긴장되는 것 같아요", speaker: "partner" },
  { t0: 188200, t1: 192400, text: "그럼 다음엔 더 편하게 만날 수 있겠네요", speaker: "me" },
  { t0: 193000, t1: 196200, text: "그... 그렇죠? 하하", speaker: "partner" },

  // 미래 계획 & 관심사 (12분-15분)
  { t0: 200000, t1: 204800, text: "그런데 요즘 뭔가 새로 시작해보고 싶은 거 있어요?", speaker: "me" },
  { t0: 205400, t1: 210600, text: "음... 요리 배우고 싶어요. 혼자 살다 보니까 매번 배달 시켜먹게 되더라고요", speaker: "partner" },
  { t0: 211200, t1: 215800, text: "아 저도요! 라면 끓이는 것 말고는 진짜 못해요", speaker: "me" },
  { t0: 216400, t1: 221200, text: "하하 그럼 둘 다 요리 초보네요. 같이 배우면 재밌겠다", speaker: "partner" },
  { t0: 221800, t1: 226000, text: "좋은 생각이에요! 쿠킹클래스 같은 거 있잖아요", speaker: "me" },
  { t0: 226600, t1: 231400, text: "맞아요, 그런 거 한번 찾아볼까요? 커플 클래스도 있던데", speaker: "partner" },
  { t0: 232000, t1: 235200, text: "커플... 클래스요? 하하", speaker: "me" },
  { t0: 235800, t1: 239000, text: "아 그게 아니라... 아 진짜 왜 이래", speaker: "partner" },

  // 마무리 & 다음 약속 (15분-18분)
  { t0: 242000, t1: 246800, text: "하하 귀여우시네요. 그런데 벌써 시간이 이렇게 됐네요", speaker: "me" },
  { t0: 247400, t1: 251600, text: "어 진짜네요. 시간 가는 줄 몰랐어요", speaker: "partner" },
  { t0: 252200, t1: 256800, text: "저도요. 대화가 재밌어서 금방 지나간 것 같아요", speaker: "me" },
  { t0: 257400, t1: 262200, text: "네, 민수씨랑 이야기하니까 정말 편해요", speaker: "partner" },
  { t0: 262800, t1: 267600, text: "그럼... 이번 주말에 시간 되시면 만나볼까요?", speaker: "me" },
  { t0: 268200, t1: 272400, text: "좋아요! 어디서 만날까요?", speaker: "partner" },
  { t0: 273000, t1: 277800, text: "한강공원 어때요? 날씨도 좋고 산책하면서 이야기하면", speaker: "me" },
  { t0: 278400, t1: 282600, text: "완벽해요! 토요일 오후 2시쯤 어때요?", speaker: "partner" },
  { t0: 283200, t1: 286800, text: "좋아요. 그럼 토요일에 봬요!", speaker: "me" },
  { t0: 287400, t1: 291200, text: "네! 안녕히 주무세요~", speaker: "partner" },
  { t0: 291800, t1: 294600, text: "지영씨도 안녕히 주무세요!", speaker: "me" }
];

// 실시간 음성 데이터 (prosody) - 감정 변화 반영
export const mockProsodyData: ProsodySample[] = [
  // 초반 긴장감 (낮은 볼륨, 안정적인 피치)
  { t: 0, rms: 0.3, pitch: 180 },
  { t: 5000, rms: 0.35, pitch: 185 },
  { t: 10000, rms: 0.4, pitch: 190 },
  
  // 대화가 풀리기 시작 (볼륨 상승)
  { t: 30000, rms: 0.5, pitch: 195 },
  { t: 60000, rms: 0.55, pitch: 200 },
  { t: 90000, rms: 0.6, pitch: 205 },
  
  // 소개팅 이야기로 약간 긴장
  { t: 120000, rms: 0.45, pitch: 185 },
  { t: 150000, rms: 0.5, pitch: 190 },
  
  // 직장 이야기로 안정감
  { t: 180000, rms: 0.55, pitch: 200 },
  { t: 210000, rms: 0.6, pitch: 205 },
  
  // 농담과 케미 (활발한 대화)
  { t: 240000, rms: 0.65, pitch: 210 },
  { t: 270000, rms: 0.7, pitch: 215 },
  { t: 300000, rms: 0.68, pitch: 212 },
  
  // 요리 이야기로 흥미진진
  { t: 330000, rms: 0.72, pitch: 218 },
  { t: 360000, rms: 0.7, pitch: 215 },
  
  // 커플클래스 언급으로 살짝 당황
  { t: 390000, rms: 0.5, pitch: 195 },
  { t: 420000, rms: 0.55, pitch: 200 },
  
  // 다음 약속으로 기대감
  { t: 450000, rms: 0.65, pitch: 210 },
  { t: 480000, rms: 0.6, pitch: 205 },
  
  // 마무리 인사 (따뜻하고 만족스러운 톤)
  { t: 510000, rms: 0.58, pitch: 200 },
  { t: 540000, rms: 0.55, pitch: 195 }
];

// 감정 분석 결과
export const mockEmotionAnalysis: EmotionAnalysis = {
  valence: 0.65, // 전반적으로 긍정적
  arousal: 0.55, // 적당한 흥미와 긴장감
  emotions: [
    { label: 'joy', score: 0.6 }, // 즐거움이 주된 감정
    { label: 'surprise', score: 0.25 }, // 새로운 발견의 놀라움
    { label: 'fear', score: 0.15 }, // 약간의 긴장감
    { label: 'anger', score: 0.05 }, // 거의 없음
    { label: 'sadness', score: 0.1 } // 약간의 아쉬움
  ],
  evidence: [
    '웃음소리와 "하하" 표현이 자주 등장',
    '목소리 톤이 점진적으로 밝아짐',
    '상대방 칭찬과 긍정적 반응',
    '다음 만남에 대한 기대감 표현'
  ]
};

// 대화 분석 결과
export const mockConversationAnalysis: ConversationAnalysis = {
  rapport: 0.78, // 좋은 라포 형성
  turnTakingBalance: 0.52, // 남성이 약간 더 많이 말함 (자연스러운 수준)
  empathy: 0.68, // 서로에 대한 관심과 공감
  redFlags: [], // 특별한 경고 신호 없음
  highlights: [
    '공통 관심사 발견 (드라마, 운동, 요리)',
    '자연스러운 유머와 농담',
    '서로에 대한 진심어린 칭찬',
    '미래 계획에 대한 공통된 관심',
    '다음 만남 약속으로 발전'
  ]
};

// 매칭 점수
export const mockMatchScore: MatchScore = {
  score: 82, // 높은 매칭율
  breakdown: {
    text: 85, // 대화 내용과 감정 표현이 좋음
    voice: 78, // 음성 톤과 리듬이 조화로움
    balance: 84 // 대화 균형이 좋음
  }
};

// AI 피드백
export const mockFeedback: Feedback = {
  summary: '첫 통화치고는 정말 자연스럽고 따뜻한 대화였어요! 서로에 대한 호기심과 배려가 잘 드러났고, 공통 관심사를 통해 자연스럽게 친밀감을 쌓아가는 모습이 인상적이었습니다.',
  tips: [
    '상대방이 말할 때 "맞아요", "그렇죠" 같은 공감 표현을 더 자주 사용해보세요. 더 깊은 연결감을 만들 수 있어요.',
    '개인적인 경험을 조금 더 구체적으로 공유해보세요. "그때 정말 재밌었어요" 같은 감정 표현이 친밀감을 높여줍니다.',
    '질문할 때 "어떠세요?"보다는 "어떤 기분이셨어요?" 같이 감정을 묻는 질문을 해보세요. 더 깊은 대화로 이어질 거예요.'
  ]
};

// 전체 세션 mock 데이터
export const mockSessionData = {
  phase: "done" as const,
  error: null,
  startTime: Date.now() - 1080000, // 18분 전
  duration: 1080, // 18분 (1080초)
  audioBlob: null,
  prosody: mockProsodyData,
  currentRMS: 0.58,
  segments: mockTranscriptSegments,
  emotion: mockEmotionAnalysis,
  conversation: mockConversationAnalysis,
  match: mockMatchScore,
  feedback: mockFeedback
};

/**
 * 세션 스토어에 mock 데이터를 로드하는 헬퍼 함수
 */
export const loadMockSessionData = (sessionStore: any) => {
  // 단계별로 데이터 로드 (실제 분석 과정을 시뮬레이션)
  sessionStore.reset();
  sessionStore.setPhase("processing");
  
  // 전사 데이터 로드
  mockTranscriptSegments.forEach(segment => {
    sessionStore.pushSegment(segment);
  });
  
  // Prosody 데이터 로드
  mockProsodyData.forEach(sample => {
    sessionStore.pushProsody(sample);
  });
  
  // 분석 결과 로드
  setTimeout(() => {
    sessionStore.setEmotion(mockEmotionAnalysis);
    sessionStore.setConversation(mockConversationAnalysis);
    sessionStore.setMatch(mockMatchScore);
    sessionStore.setFeedback(mockFeedback);
    sessionStore.setPhase("done");
    sessionStore.setDuration(1080);
  }, 1000);
};

/**
 * 개발용 빠른 로드 함수
 */
export const loadMockSessionDataInstant = (sessionStore: any) => {
  sessionStore.reset();
  
  // 모든 데이터를 즉시 로드
  mockTranscriptSegments.forEach(segment => {
    sessionStore.pushSegment(segment);
  });
  
  mockProsodyData.forEach(sample => {
    sessionStore.pushProsody(sample);
  });
  
  sessionStore.setEmotion(mockEmotionAnalysis);
  sessionStore.setConversation(mockConversationAnalysis);
  sessionStore.setMatch(mockMatchScore);
  sessionStore.setFeedback(mockFeedback);
  sessionStore.setPhase("done");
  sessionStore.setDuration(1080);
  sessionStore.setCurrentRMS(0.58);
};


