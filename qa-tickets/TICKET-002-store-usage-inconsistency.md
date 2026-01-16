# 티켓 #002: `useUserStore`와 `useEnhancedUserStore` 혼용

**티켓 번호**: TICKET-002  
**심각도**: 🔴 Critical  
**우선순위**: P0 (즉시 수정 필요)  
**작성일**: 2024년 12월  
**담당자**: 개발팀

---

## 📋 문제 요약

애플리케이션 전체에서 `useUserStore`와 `useEnhancedUserStore`가 혼용되어 사용되고 있어, 일관성 없는 동작이 발생할 수 있습니다. Enhanced Store의 안전 기능(중복 방지 등)이 일부 페이지에서 적용되지 않습니다.

---

## 🔍 상세 설명

### 현재 사용 현황

#### `useEnhancedUserStore` 사용 페이지
- `src/app/page.tsx:39` - 메인 페이지
- `src/app/mypage/page.tsx:24` - 마이페이지

#### `useUserStore` 사용 페이지
- `src/app/settings/page.tsx:35` - 설정 페이지
- `src/app/conversation/[id]/page.tsx:40` - 대화 상세 페이지

### 문제점
1. **일관성 부족**: 같은 기능을 다른 Store로 구현
2. **안전 기능 누락**: Enhanced Store의 중복 방지 기능이 일부 페이지에서 작동하지 않음
3. **유지보수 어려움**: 두 가지 Store를 모두 관리해야 함

---

## 🐛 예상 증상

1. 설정 페이지에서 대화 추가 시 중복 체크가 작동하지 않을 수 있음
2. 대화 상세 페이지에서도 중복 방지 로직이 적용되지 않음
3. 개발자가 어떤 Store를 사용해야 할지 혼란스러울 수 있음

---

## ✅ 해결 방안

### 옵션 1: 모든 페이지에서 `useEnhancedUserStore`로 통일 (권장)

**장점**:
- 안전 기능이 모든 페이지에 적용됨
- 일관성 확보

**수정 필요 파일**:
- `src/app/settings/page.tsx`
- `src/app/conversation/[id]/page.tsx`

**수정 예시**:
```typescript
// Before
import { useUserStore } from '@/store/user/store';

// After
import { useEnhancedUserStore } from '@/store/user/store-enhancer';

// 사용
const store = useEnhancedUserStore();
```

### 옵션 2: `useUserStore`에 중복 체크 로직 추가

**장점**:
- 기존 코드 변경 최소화

**단점**:
- Enhanced Store의 존재 이유가 약해짐

---

## 📁 관련 파일

- `src/app/page.tsx` - Enhanced Store 사용 중
- `src/app/mypage/page.tsx` - Enhanced Store 사용 중
- `src/app/settings/page.tsx` - **수정 필요** (useUserStore → useEnhancedUserStore)
- `src/app/conversation/[id]/page.tsx` - **수정 필요** (useUserStore → useEnhancedUserStore)
- `src/store/user/store.ts` - 기본 Store
- `src/store/user/store-enhancer.ts` - Enhanced Store

---

## 🧪 테스트 계획

1. **기능 테스트**
   - 모든 페이지에서 Store 기능 정상 동작 확인
   - 중복 방지 기능이 모든 페이지에서 작동하는지 확인

2. **통합 테스트**
   - 페이지 간 네비게이션 시 데이터 일관성 확인
   - Mock 데이터 로드 후 모든 페이지에서 중복 없음 확인

---

## 📊 영향도 분석

**영향받는 페이지**:
- 설정 페이지
- 대화 상세 페이지

**사용자 영향**:
- 중복 데이터 생성 가능성
- 일관성 없는 동작 경험

---

## 📝 체크리스트

- [ ] 수정 방안 결정 (옵션 1 또는 2)
- [ ] 관련 파일 수정 완료
- [ ] 모든 페이지에서 Store 기능 테스트
- [ ] 중복 방지 기능 동작 확인
- [ ] 코드 리뷰 완료
- [ ] 배포 전 검증 완료

---

## 🔗 관련 티켓

- TICKET-001: `addConversation` 중복 체크 문제와 연관
- TICKET-006: Mock 데이터 중복 로드 문제와 연관
