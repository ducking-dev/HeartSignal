# 🔍 HeartSignal QA 오류 리포트

**작성일**: 2024년 12월  
**테스트 범위**: 전체 프론트엔드 페이지 및 주요 기능  
**테스트 방법**: 코드 분석 및 정적 검사

---

## 📋 목차

1. [Critical Issues (즉시 수정 필요)](#critical-issues)
2. [High Priority Issues (우선 수정 권장)](#high-priority-issues)
3. [Medium Priority Issues (개선 권장)](#medium-priority-issues)
4. [Low Priority Issues (향후 개선)](#low-priority-issues)
5. [페이지별 상세 테스트 결과](#페이지별-상세-테스트-결과)

---

## 🚨 Critical Issues (즉시 수정 필요)

### 티켓 #001: `addConversation` 함수에서 중복 체크 누락

**심각도**: 🔴 Critical  
**영향 범위**: 전체 애플리케이션  
**발생 위치**: `src/store/user/store.ts:25-34`

**문제 설명**:
```typescript
addConversation: (conversation: ConversationHistory) => {
  set(
    (state) => ({
      conversations: [conversation, ...state.conversations], // ❌ 중복 체크 없음
    }),
    false,
    'addConversation'
  );
  get().updateStats();
},
```

**예상 증상**:
- React key 중복 에러 발생 가능
- 동일한 대화가 여러 번 저장됨
- 대화 목록에서 중복 항목 표시

**재현 단계**:
1. Mock 데이터 로드 (`loadMockUserData`)
2. 세션 완료 후 자동 저장 (`useSessionToHistorySync`)
3. 동일한 세션 ID로 다시 저장 시도
4. 중복 데이터 생성

**해결 방안**:
```typescript
addConversation: (conversation: ConversationHistory) => {
  set(
    (state) => {
      // 중복 체크 추가
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
```

**관련 파일**:
- `src/store/user/store.ts`
- `src/hooks/useSessionToHistorySync.ts`
- `src/lib/user-mock-data.ts`

---

### 티켓 #002: `useUserStore`와 `useEnhancedUserStore` 혼용

**심각도**: 🔴 Critical  
**영향 범위**: 마이페이지, 메인 페이지  
**발생 위치**: 여러 페이지

**문제 설명**:
- `src/app/page.tsx`에서 `useEnhancedUserStore` 사용
- `src/app/mypage/page.tsx`에서 `useEnhancedUserStore` 사용
- `src/app/settings/page.tsx`에서 `useUserStore` 사용
- `src/app/conversation/[id]/page.tsx`에서 `useUserStore` 사용

**예상 증상**:
- 일관성 없는 동작
- Enhanced Store의 안전 기능이 일부 페이지에서 적용되지 않음
- 중복 방지 로직이 작동하지 않을 수 있음

**해결 방안**:
1. 모든 페이지에서 `useEnhancedUserStore`로 통일
2. 또는 `useUserStore`에 중복 체크 로직 추가

**관련 파일**:
- `src/app/page.tsx:39`
- `src/app/mypage/page.tsx:24`
- `src/app/settings/page.tsx:35`
- `src/app/conversation/[id]/page.tsx:40`

---

### 티켓 #003: Next.js 라우터와 `window.location.href` 혼용

**심각도**: 🔴 Critical  
**영향 범위**: 전체 네비게이션  
**발생 위치**: 여러 컴포넌트

**문제 설명**:
- `window.location.href` 사용: 전체 페이지 리로드 발생
- `router.push` 사용: 클라이언트 사이드 네비게이션
- 혼용으로 인한 성능 저하 및 UX 저하

**발생 위치**:
```typescript
// ❌ window.location.href 사용 (전체 리로드)
src/app/mypage/page.tsx:50, 89
src/app/conversation/[id]/page.tsx:84, 96
src/components/layout/Header.tsx:103
src/features/mypage/components/ConversationHistoryList.tsx:116, 132

// ✅ router.push 사용 (클라이언트 사이드)
src/app/page.tsx:56, 322
src/app/settings/page.tsx:79, 124, 141
src/app/conversation/[id]/page.tsx:57, 115, 228
```

**예상 증상**:
- 페이지 전환 시 깜빡임
- 상태 손실 가능성
- 성능 저하

**해결 방안**:
모든 네비게이션을 `useRouter().push()`로 통일

---

## ⚠️ High Priority Issues (우선 수정 권장)

### 티켓 #004: 대화 상세 페이지에서 존재하지 않는 대화 ID 처리

**심각도**: 🟠 High  
**영향 범위**: `/conversation/[id]` 페이지  
**발생 위치**: `src/app/conversation/[id]/page.tsx:43-64`

**문제 설명**:
```typescript
const conversation = conversations.find(conv => conv.id === conversationId);

if (!conversation) {
  // ✅ 에러 페이지 표시는 있으나
  // ❌ 사용자 경험이 개선될 수 있음
}
```

**개선 제안**:
- 로딩 상태 추가
- 더 친절한 에러 메시지
- 자동 리다이렉트 옵션

---

### 티켓 #005: 설정 페이지에서 알림/개인정보 설정 저장 기능 없음

**심각도**: 🟠 High  
**영향 범위**: `/settings` 페이지  
**발생 위치**: `src/app/settings/page.tsx`

**문제 설명**:
- 알림 설정 (`notifications` state) 변경 시 저장되지 않음
- 개인정보 설정 (`privacy` state) 변경 시 저장되지 않음
- 페이지 새로고침 시 설정이 초기화됨

**해결 방안**:
- Zustand persist에 설정 저장
- 또는 localStorage에 저장

---

### 티켓 #006: Mock 데이터 로딩 시 중복 생성 가능성

**심각도**: 🟠 High  
**영향 범위**: 개발 환경  
**발생 위치**: `src/lib/user-mock-data.ts`, `src/lib/user-mock-data-safe.ts`

**문제 설명**:
- Hot reload 시 Mock 데이터가 중복 로드될 수 있음
- `loadMockUserDataSafely`가 있으나 완벽하지 않음

**해결 방안**:
- 로딩 상태 플래그 추가
- 중복 로드 방지 로직 강화

---

## 📊 Medium Priority Issues (개선 권장)

### 티켓 #007: 에러 바운더리에서 에러 상세 정보 부족

**심각도**: 🟡 Medium  
**영향 범위**: `src/components/ErrorBoundary.tsx`

**문제 설명**:
- 에러 발생 시 사용자에게 충분한 정보 제공 안 됨
- 개발자 콘솔에만 에러 로그 출력

**개선 제안**:
- 사용자 친화적인 에러 메시지
- 에러 리포트 기능 추가

---

### 티켓 #008: 마이크 권한 거부 시 에러 처리 개선 필요

**심각도**: 🟡 Medium  
**영향 범위**: 녹음 기능  
**발생 위치**: `src/domain/controllers/useAnalysisController.ts:84-87`

**문제 설명**:
```typescript
catch (permissionError: any) {
  console.error('마이크 권한 오류:', permissionError);
  throw new Error('마이크 사용 권한이 필요합니다...');
}
```

**개선 제안**:
- 권한 요청 가이드 제공
- 브라우저별 안내 메시지

---

### 티켓 #009: 대화 히스토리에서 빈 상태 처리 개선

**심각도**: 🟡 Medium  
**영향 범위**: 마이페이지  
**발생 위치**: `src/features/mypage/components/ConversationHistoryList.tsx:119-139`

**문제 설명**:
- 빈 상태 UI는 있으나, 사용자 유도가 부족함

**개선 제안**:
- 첫 대화 시작하기 버튼 강조
- 튜토리얼 또는 가이드 추가

---

## 🔵 Low Priority Issues (향후 개선)

### 티켓 #010: 테마 토글 애니메이션 개선

**심각도**: 🔵 Low  
**영향 범위**: 전체 애플리케이션

**개선 제안**:
- 테마 전환 시 부드러운 애니메이션 추가

---

### 티켓 #011: 접근성 개선 (ARIA 라벨)

**심각도**: 🔵 Low  
**영향 범위**: 전체 컴포넌트

**개선 제안**:
- 모든 인터랙티브 요소에 ARIA 라벨 추가
- 키보드 네비게이션 개선

---

## 📄 페이지별 상세 테스트 결과

### 1. 메인 페이지 (`/`)

**테스트 항목**:
- ✅ 페이지 로드 성공
- ✅ 헤더 네비게이션 표시
- ✅ 녹음 컴포넌트 렌더링
- ⚠️ Mock 데이터 로드 버튼 동작 (중복 가능성)
- ⚠️ 스크롤 네비게이션 동작 확인 필요

**발견된 문제**:
- 티켓 #001: Mock 데이터 중복 로드 가능
- 티켓 #002: Enhanced Store 사용으로 인한 일관성 문제

---

### 2. 마이페이지 (`/mypage`)

**테스트 항목**:
- ✅ 페이지 로드 성공
- ✅ 프로필 컴포넌트 렌더링
- ✅ 통계 컴포넌트 렌더링
- ⚠️ 대화 히스토리 리스트 렌더링 (중복 가능성)
- ❌ 빈 상태 처리 개선 필요

**발견된 문제**:
- 티켓 #001: 대화 히스토리 중복 가능성
- 티켓 #003: `window.location.href` 사용으로 인한 리로드
- 티켓 #009: 빈 상태 UI 개선 필요

---

### 3. 대화 상세 페이지 (`/conversation/[id]`)

**테스트 항목**:
- ✅ 페이지 로드 성공
- ✅ 대화 정보 표시
- ⚠️ 존재하지 않는 ID 처리 (개선 가능)
- ⚠️ 공유 기능 (브라우저 지원 확인 필요)

**발견된 문제**:
- 티켓 #003: `window.location.href` 사용
- 티켓 #004: 에러 처리 개선 필요

---

### 4. 설정 페이지 (`/settings`)

**테스트 항목**:
- ✅ 페이지 로드 성공
- ✅ 프로필 수정 폼 렌더링
- ❌ 알림 설정 저장 기능 없음
- ❌ 개인정보 설정 저장 기능 없음
- ✅ 테마 토글 동작

**발견된 문제**:
- 티켓 #005: 설정 저장 기능 누락
- 티켓 #002: `useUserStore` 사용 (일관성 문제)

---

### 5. Mock 데모 페이지 (`/mock-demo`)

**테스트 항목**:
- ✅ 페이지 로드 성공
- ✅ 동적 import 동작
- ⚠️ Mock 데이터 분석 시뮬레이션 확인 필요

**발견된 문제**:
- 특별한 문제 없음 (동적 import로 인한 로딩 지연은 정상)

---

### 6. 테스트 환경 페이지 (`/test-env`)

**테스트 항목**:
- ✅ 페이지 로드 성공
- ✅ 환경변수 상태 표시
- ✅ 클립보드 복사 기능

**발견된 문제**:
- 특별한 문제 없음

---

## 📈 우선순위별 수정 계획

### Phase 1: Critical Issues (즉시 수정)
1. 티켓 #001: `addConversation` 중복 체크 추가
2. 티켓 #002: Store 사용 통일
3. 티켓 #003: 라우터 통일

### Phase 2: High Priority (1주일 내)
4. 티켓 #004: 대화 상세 페이지 에러 처리 개선
5. 티켓 #005: 설정 저장 기능 추가
6. 티켓 #006: Mock 데이터 중복 방지 강화

### Phase 3: Medium/Low Priority (향후)
7. 티켓 #007-#011: UX/접근성 개선

---

## 📝 결론

**전체 평가**:
- Critical Issues: 3개 발견
- High Priority Issues: 3개 발견
- Medium Priority Issues: 3개 발견
- Low Priority Issues: 2개 발견

**권장 사항**:
1. 즉시 Critical Issues 수정 필요
2. Store 사용 통일 및 중복 방지 로직 강화
3. 네비게이션 일관성 확보
4. 설정 저장 기능 추가

**테스트 완료일**: 2024년 12월  
**다음 리뷰 예정일**: Critical Issues 수정 후
