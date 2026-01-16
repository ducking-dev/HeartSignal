# 티켓 #001: `addConversation` 함수에서 중복 체크 누락

**티켓 번호**: TICKET-001  
**심각도**: 🔴 Critical  
**우선순위**: P0 (즉시 수정 필요)  
**작성일**: 2024년 12월  
**담당자**: 개발팀

---

## 📋 문제 요약

`useUserStore`의 `addConversation` 함수에서 중복 체크 로직이 없어 동일한 대화가 여러 번 저장될 수 있습니다. 이로 인해 React key 중복 에러가 발생할 수 있습니다.

---

## 🔍 상세 설명

### 발생 위치
- 파일: `src/store/user/store.ts`
- 함수: `addConversation` (라인 25-34)

### 현재 코드
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

### 문제점
1. 동일한 `id`를 가진 대화가 중복으로 추가될 수 있음
2. React에서 같은 key를 가진 요소가 여러 개 생성되어 에러 발생
3. 대화 목록에서 중복 항목이 표시됨

---

## 🐛 재현 단계

1. Mock 데이터 로드 (`loadMockUserData` 호출)
2. 세션 완료 후 자동 저장 (`useSessionToHistorySync` 훅)
3. 동일한 세션 ID로 다시 저장 시도
4. 중복 데이터가 생성됨

### 예상 에러 메시지
```
Error: Encountered two children with the same key, `conv_001_jiyoung`. 
Keys should be unique so that components maintain their identity across updates.
```

---

## ✅ 해결 방안

### 수정 코드
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

### 대안: Enhanced Store 사용
이미 `useEnhancedUserStore`에 `addConversationSafely` 함수가 구현되어 있으므로, 이를 사용하거나 모든 페이지에서 Enhanced Store로 통일하는 방법도 있습니다.

---

## 📁 관련 파일

- `src/store/user/store.ts` - 수정 필요
- `src/store/user/store-enhancer.ts` - 참고 (안전한 버전 존재)
- `src/hooks/useSessionToHistorySync.ts` - 호출 위치
- `src/lib/user-mock-data.ts` - 호출 위치
- `src/lib/user-mock-data-safe.ts` - 호출 위치

---

## 🧪 테스트 계획

1. **단위 테스트**
   - 동일한 ID로 `addConversation` 호출 시 중복 방지 확인
   - 다른 ID로 호출 시 정상 추가 확인

2. **통합 테스트**
   - Mock 데이터 로드 후 중복 확인
   - 세션 완료 후 자동 저장 시 중복 확인

3. **회귀 테스트**
   - 기존 대화 목록 기능 정상 동작 확인
   - 통계 업데이트 정상 동작 확인

---

## 📊 영향도 분석

**영향받는 기능**:
- 대화 히스토리 목록
- 통계 계산
- 대화 상세 페이지

**사용자 영향**:
- 중복 대화 표시로 인한 혼란
- React 에러로 인한 페이지 크래시 가능성

---

## 📝 체크리스트

- [ ] 코드 수정 완료
- [ ] 단위 테스트 작성 및 통과
- [ ] 통합 테스트 수행
- [ ] 코드 리뷰 완료
- [ ] 배포 전 검증 완료

---

## 🔗 관련 티켓

- TICKET-002: Store 사용 통일 문제와 연관
- TICKET-006: Mock 데이터 중복 로드 문제와 연관
