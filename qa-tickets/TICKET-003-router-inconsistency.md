# 티켓 #003: Next.js 라우터와 `window.location.href` 혼용

**티켓 번호**: TICKET-003  
**심각도**: 🔴 Critical  
**우선순위**: P0 (즉시 수정 필요)  
**작성일**: 2024년 12월  
**담당자**: 개발팀

---

## 📋 문제 요약

애플리케이션 전체에서 Next.js의 `useRouter().push()`와 `window.location.href`가 혼용되어 사용되고 있습니다. `window.location.href`는 전체 페이지 리로드를 발생시켜 성능 저하와 사용자 경험 저하를 초래합니다.

---

## 🔍 상세 설명

### 현재 사용 현황

#### `window.location.href` 사용 (❌ 문제)
- `src/app/mypage/page.tsx:50, 89` - 마이페이지
- `src/app/conversation/[id]/page.tsx:84, 96` - 대화 상세 페이지
- `src/components/layout/Header.tsx:103` - 헤더 컴포넌트
- `src/features/mypage/components/ConversationHistoryList.tsx:116, 132` - 대화 히스토리 리스트

#### `router.push()` 사용 (✅ 정상)
- `src/app/page.tsx:56, 322` - 메인 페이지
- `src/app/settings/page.tsx:79, 124, 141` - 설정 페이지
- `src/app/conversation/[id]/page.tsx:57, 115, 228` - 대화 상세 페이지

### 문제점

1. **성능 저하**
   - `window.location.href`는 전체 페이지 리로드 발생
   - 불필요한 리소스 재로딩

2. **상태 손실**
   - 클라이언트 사이드 상태가 초기화될 수 있음
   - Zustand persist 데이터도 일시적으로 손실 가능

3. **사용자 경험 저하**
   - 페이지 전환 시 깜빡임 발생
   - 부드러운 전환 효과 불가능

4. **일관성 부족**
   - 같은 기능을 다른 방식으로 구현

---

## 🐛 예상 증상

1. 페이지 전환 시 깜빡임 발생
2. 로딩 시간 증가
3. 상태 관리 문제 가능성

---

## ✅ 해결 방안

### 모든 네비게이션을 `useRouter().push()`로 통일

**수정 필요 파일 및 위치**:

#### 1. `src/app/mypage/page.tsx`
```typescript
// Before
import { useEffect } from 'react';

// After
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Before
<Button onClick={() => window.location.href = '/'}>

// After
const router = useRouter();
<Button onClick={() => router.push('/')}>

// Before
onClick={() => window.location.href = '/settings'}

// After
onClick={() => router.push('/settings')}
```

#### 2. `src/app/conversation/[id]/page.tsx`
```typescript
// Before
url: window.location.href,

// After
url: typeof window !== 'undefined' ? window.location.href : '',

// Before
await navigator.clipboard.writeText(window.location.href);

// After
const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
await navigator.clipboard.writeText(currentUrl);
```

#### 3. `src/components/layout/Header.tsx`
```typescript
// Before
import React, { type ReactNode } from 'react';

// After
import React, { type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Before
onClick={() => window.location.href = '/mypage'}

// After
const router = useRouter();
onClick={() => router.push('/mypage')}
```

#### 4. `src/features/mypage/components/ConversationHistoryList.tsx`
```typescript
// Before
import React from 'react';

// After
import React from 'react';
import { useRouter } from 'next/navigation';

// Before
const handleViewDetails = (conversation: ConversationHistory) => {
  window.location.href = `/conversation/${conversation.id}`;
};

// After
const router = useRouter();
const handleViewDetails = (conversation: ConversationHistory) => {
  router.push(`/conversation/${conversation.id}`);
};

// Before
<Button variant="outline" onClick={() => window.location.href = '/'}>

// After
<Button variant="outline" onClick={() => router.push('/')}>
```

---

## 📁 관련 파일

- `src/app/mypage/page.tsx` - **수정 필요**
- `src/app/conversation/[id]/page.tsx` - **수정 필요** (일부만)
- `src/components/layout/Header.tsx` - **수정 필요**
- `src/features/mypage/components/ConversationHistoryList.tsx` - **수정 필요**

---

## 🧪 테스트 계획

1. **기능 테스트**
   - 모든 네비게이션 버튼 클릭 시 정상 동작 확인
   - 페이지 전환 시 깜빡임 없음 확인
   - 상태 유지 확인

2. **성능 테스트**
   - 페이지 전환 속도 측정
   - 네트워크 요청 수 확인 (불필요한 리로드 없음)

3. **회귀 테스트**
   - 기존 기능 정상 동작 확인
   - 브라우저 뒤로가기/앞으로가기 동작 확인

---

## 📊 영향도 분석

**개선 효과**:
- 페이지 전환 속도 향상
- 사용자 경험 개선
- 상태 관리 안정성 향상

**영향받는 페이지**:
- 마이페이지
- 대화 상세 페이지
- 헤더 네비게이션
- 대화 히스토리 리스트

---

## 📝 체크리스트

- [ ] 모든 `window.location.href` 사용 위치 확인
- [ ] `useRouter` import 추가
- [ ] 네비게이션 코드 수정 완료
- [ ] 모든 페이지 전환 테스트
- [ ] 성능 개선 확인
- [ ] 코드 리뷰 완료
- [ ] 배포 전 검증 완료

---

## 🔗 관련 티켓

- 독립적인 이슈 (다른 티켓과 직접 연관 없음)
