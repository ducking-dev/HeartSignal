export const tokens = {
  color: {
    // Primary - Rose Coral (윌유 영감)
    primary: "#E95877",
    primary500: "#F26B88", 
    primary100: "#FFE6EC",
    
    // Accent - Lilac (보조 포인트)
    accent: "#7B6EF6",
    
    // Semantic Colors
    success: "#2FBF71",    // 민트 (긍정 피드백)
    warning: "#F59E0B",    // 앰버 (주의)
    danger: "#E11D48",     // 루비 (오류)
    
    // Neutral Grays
    gray900: "#1A1A1A",    // 본문
    gray700: "#4D4D4D",    // 보조
    gray500: "#9CA3AF",    // placeholder
    gray100: "#F5F5F5",    // 카드 배경
    white: "#FFFFFF"
  },
  
  typography: {
    // Pretendard (한글) + Inter (숫자)
    fontFamily: {
      sans: ['Pretendard', 'Inter', 'system-ui'],
      mono: ['Inter', 'monospace']
    },
    fontSize: {
      h1: '40px',          // 메인 히어로
      h2: '28px',          // 섹션 타이틀 (점수)
      h3: '20px',          // 카드 타이틀
      body: '16px',        // 본문
      caption: '13px'      // 보조 설명
    },
    lineHeight: {
      h1: '48px', h2: '36px', h3: '28px', 
      body: '26px', caption: '20px'
    },
    fontWeight: {
      regular: 400, semibold: 600, bold: 700
    }
  },
  
  spacing: (n: number) => `${n * 8}px`, // 8pt 시스템
  radius: { xs: 6, md: 12, lg: 20 },
  shadow: {
    elev1: "0 1px 3px rgba(0,0,0,.08)",
    elev2: "0 8px 24px rgba(0,0,0,.12)"
  },
  motion: {
    duration: { fast: "150ms", base: "200ms", slow: "250ms" },
    easing: { out: "ease-out", spring: "cubic-bezier(0.34, 1.56, 0.64, 1)" }
  },
  zIndex: { header: 10, modal: 1000 }
};

export const copy = {
  hero: "당신의 말과 마음, 우리는 섬세하게 듣습니다.",
  recording: {
    start: "지금 이 순간을 기록할게요.",
    stop: "녹음을 중지하고 분석을 시작할까요?"
  },
  processing: {
    analyzing: "당신의 대화 속 감정을 정리하고 있어요…",
    progress: ["전사 중", "감정 분석 중", "결과 생성 중"]
  },
  results: {
    title: "오늘 대화의 호흡, 괜찮았어요.",
    feedback: "다음번엔 이렇게 해보세요"
  },
  privacy: "오디오는 브라우저 메모리에만 머물러요. 원하면 언제든 삭제할 수 있어요.",
  errors: {
    permission: "마이크 권한을 허용해주세요. 설정에서 변경할 수 있어요.",
    network: "네트워크를 확인하고 다시 시도해주세요.",
    shortRecording: "조금 더 길게 대화 후 분석해볼까요?"
  }
};
