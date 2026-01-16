# API 키 설정 가이드

## 필수 설정

### 1. OpenAI API 키 설정

1. [OpenAI Platform](https://platform.openai.com/api-keys)에서 계정 생성
2. API 키 생성 (gpt-4o-mini 모델 사용 권장)
3. 프로젝트 루트에 `.env.local` 파일 생성:

```bash
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here
NEXT_PUBLIC_APP_ENV=development
```

### 2. 보안 주의사항

- `.env.local` 파일은 절대 git에 커밋하지 마세요
- API 키는 외부에 노출되지 않도록 주의하세요
- 프로덕션 환경에서는 백엔드 프록시 사용을 권장합니다

## 선택적 설정

### Google Speech-to-Text (향후 확장용)
- 현재는 Web Speech API 사용 (무료)
- 더 높은 정확도가 필요한 경우에만 설정

### Supabase (향후 확장용)
- 현재는 로컬 상태 관리만 사용
- 데이터 저장이 필요한 경우에만 설정

## 환경변수 템플릿

```bash
# 필수
NEXT_PUBLIC_OPENAI_API_KEY=sk-your-openai-api-key-here
NEXT_PUBLIC_APP_ENV=development

# 선택적 (주석 처리됨)
# NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
# GOOGLE_SPEECH_API_KEY=your-google-speech-api-key
```
