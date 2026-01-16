# 하트시그널 (HeartSignal) 💕

> **당신의 말과 마음, 우리는 섬세하게 듣습니다.**

소개팅 대화를 AI로 분석하여 매칭율과 실행 가능한 피드백을 제공하는 브라우저 기반 MVP 서비스입니다.

## ✨ 주요 기능

- 🎤 **실시간 음성 녹음**: MediaRecorder API를 통한 브라우저 기반 녹음
- 📝 **실시간 전사**: Web Speech API를 통한 즉시 텍스트 변환
- 🧠 **AI 감정 분석**: OpenAI GPT-4o-mini를 통한 4단계 대화 분석
- 📊 **매칭율 점수**: 텍스트(45%) + 음성(35%) + 균형(20%) 종합 평가
- 💡 **실행 가능한 피드백**: 다음 데이트에서 바로 적용할 수 있는 구체적 조언
- 🎨 **아름다운 UI**: Framer Motion 애니메이션과 따뜻한 브랜드 디자인

## 🚀 빠른 시작

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정

**중요**: AI 기능을 사용하려면 OpenAI API 키가 필요합니다.

#### 2-1. OpenAI API 키 발급
1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 계정 생성
2. "Create new secret key" 클릭
3. API 키 복사 (sk-로 시작하는 문자열)

#### 2-2. 환경변수 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 추가하세요:

```bash
# .env.local (프로젝트 루트에 생성)
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-actual-openai-api-key-here
NEXT_PUBLIC_APP_ENV=development
```

#### 2-3. 환경변수 테스트
환경변수가 올바르게 설정되었는지 확인하려면:
```bash
# 개발 서버 실행 후
http://localhost:3000/test-env
```

> ⚠️ **주의사항**: 
> - `.env.local` 파일은 git에 커밋되지 않습니다 (보안상 안전)
> - API 키 없이도 데모 데이터로 앱을 체험할 수 있습니다
> - 실제 AI 분석을 위해서는 API 키가 필수입니다

### 3. 개발 서버 실행
```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 앱을 확인하세요!

## 🛠 기술 스택

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **상태관리**: Zustand
- **UI 라이브러리**: shadcn/ui + Framer Motion
- **음성처리**: MediaRecorder API + Web Speech API
- **AI 분석**: OpenAI GPT-4o-mini
- **배포**: Netlify (Vercel 대안 지원)

## 📁 프로젝트 구조

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지
│   ├── layout.tsx         # 레이아웃
│   └── globals.css        # 전역 스타일
├── components/            # UI 컴포넌트
│   ├── SessionRecorder.tsx    # 녹음 컨트롤
│   ├── ScoreGauge.tsx        # 점수 게이지
│   ├── FeedbackBubble.tsx    # 피드백 말풍선
│   ├── LiveTranscriptPanel.tsx # 실시간 전사
│   ├── ControlsBar.tsx       # 컨트롤 버튼
│   └── ui/                   # shadcn/ui 기본 컴포넌트
├── store/                 # Zustand 상태 관리
│   └── useSessionStore.ts
├── domain/                # 비즈니스 로직
│   ├── audio/            # 음성 처리
│   ├── adapters/         # 외부 API 어댑터
│   ├── analysis/         # AI 분석 로직
│   └── controllers/      # 컨트롤러
└── lib/                  # 유틸리티
    ├── tokens.ts         # Design System
    └── utils.ts          # 공통 유틸리티
```

## 🎯 사용 방법

1. **녹음 시작**: 메인 화면의 마이크 버튼을 클릭
2. **대화 진행**: 자연스럽게 대화하면 실시간으로 전사됩니다
3. **녹음 중지**: 대화가 끝나면 정지 버튼 클릭
4. **결과 확인**: AI가 분석한 매칭율 점수와 개선 피드백을 확인

## 🔧 개발 정보

### 환경 요구사항
- Node.js 18+
- 모던 브라우저 (Chrome, Firefox, Safari)
- 마이크 접근 권한

### 브라우저 호환성
- ✅ Chrome (권장)
- ✅ Firefox
- ✅ Safari
- ❌ Internet Explorer

### 주요 API
- **MediaRecorder API**: 음성 녹음
- **Web Speech API**: 실시간 전사 (한국어 지원)
- **OpenAI API**: GPT-4o-mini를 통한 대화 분석

## 📊 분석 알고리즘

매칭율 점수는 다음 공식으로 계산됩니다:

```
최종 점수 = (텍스트 분석 × 45%) + (음성 분석 × 35%) + (대화 균형 × 20%)
```

- **텍스트 분석**: 감정 극성 + 라포 형성도
- **음성 분석**: 음성 활력도 + 감정 각성도  
- **대화 균형**: 발화 균형 (50:50이 이상적)

## 🚀 배포

### Netlify 배포 (권장)
1. GitHub에 코드 푸시
2. [Netlify](https://www.netlify.com/)에서 프로젝트 import
3. 환경 변수 설정 (`NEXT_PUBLIC_OPENAI_API_KEY`)
4. 자동 배포 완료!

자세한 배포 가이드는 [`docs/deployment.md`](docs/deployment.md)를 참고하세요.

### Vercel 배포 (대안)
1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정 (`NEXT_PUBLIC_OPENAI_API_KEY`)
4. 배포 완료!

### 환경 변수 (Production)
```bash
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-production-api-key
NEXT_PUBLIC_APP_ENV=production
```

### 배포 체크리스트
배포 전 [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)를 확인하세요.

## 🔒 개인정보 보호

- ✅ 모든 음성 데이터는 브라우저 메모리에만 저장
- ✅ 세션 종료 시 모든 데이터 자동 삭제
- ✅ 서버에 개인정보 저장하지 않음
- ✅ OpenAI API 호출 시에만 텍스트 전송

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 💖 만든 사람

하트시그널 팀 - **"감정은 섬세하게, 결과는 간단하게"**

---

**🎉 하트시그널과 함께 더 나은 대화를 시작해보세요!**