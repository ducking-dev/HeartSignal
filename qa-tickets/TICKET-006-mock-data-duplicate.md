# 티켓 #006: Mock 데이터 로딩 시 중복 생성 가능성

**티켓 번호**: TICKET-006  
**심각도**: 🟠 High  
**우선순위**: P1 (1주일 내 수정)  
**작성일**: 2024년 12월  
**담당자**: 개발팀

---

## 📋 문제 요약

개발 환경에서 Hot Reload 시 Mock 데이터가 중복으로 로드될 수 있습니다. `loadMockUserDataSafely` 함수가 있으나 완벽하지 않아 중복 방지가 완전하지 않습니다.

---

## 🔍 상세 설명

### 현재 구현

#### `loadMockUserDataSafely` 함수
```typescript
// src/lib/user-mock-data-safe.ts
export function loadMockUserDataSafely(store: ReturnType<typeof useEnhancedUserStore>): boolean {
  // 중복 체크 로직이 있으나 완벽하지 않음
  if (store.isAuthenticated) {
    return false;
  }
  
  // Mock 데이터 로드...
}
```

### 문제점
1. **Hot Reload 시 중복**: 개발 서버 재시작 시 중복 로드 가능
2. **여러 컴포넌트에서 호출**: 여러 페이지에서 동시에 호출될 수 있음
3. **로딩 상태 플래그 없음**: 로딩 중인지 확인할 수 없음

---

## 🐛 재현 단계

1. 개발 서버 실행 (`npm run dev`)
2. 메인 페이지 접근 (Mock 데이터 자동 로드)
3. 마이페이지 접근 (Mock 데이터 자동 로드)
4. Hot Reload 발생
5. Mock 데이터가 중복으로 추가될 수 있음

---

## ✅ 해결 방안

### 개선된 Mock 데이터 로더

```typescript
// src/lib/user-mock-data-safe.ts

// 전역 로딩 상태 플래그
let isMockDataLoading = false;
let mockDataLoaded = false;

export function loadMockUserDataSafely(
  store: ReturnType<typeof useEnhancedUserStore>
): boolean {
  // 이미 로딩 중이면 무시
  if (isMockDataLoading) {
    console.log('Mock 데이터 로딩 중... 대기');
    return false;
  }

  // 이미 로드되었으면 무시
  if (mockDataLoaded) {
    console.log('Mock 데이터 이미 로드됨');
    return false;
  }

  // 인증된 사용자가 있으면 무시
  if (store.isAuthenticated && store.profile) {
    console.log('이미 인증된 사용자 존재');
    return false;
  }

  // 기존 Mock 데이터가 있으면 무시
  if (store.conversations.length > 0) {
    console.log('기존 대화 데이터 존재');
    mockDataLoaded = true;
    return false;
  }

  // 로딩 시작
  isMockDataLoading = true;

  try {
    // Mock 데이터 로드 로직
    const mockData = generateMockUserData();
    
    // 안전하게 추가
    store.login(mockData.profile);
    mockData.conversations.forEach(conv => {
      store.addConversationSafely(conv); // Enhanced Store의 안전한 함수 사용
    });

    mockDataLoaded = true;
    console.log('✅ Mock 데이터 안전하게 로드됨');
    return true;
  } catch (error) {
    console.error('Mock 데이터 로드 실패:', error);
    return false;
  } finally {
    isMockDataLoading = false;
  }
}

// 개발 환경에서만 사용 가능한 리셋 함수
export function resetMockDataState() {
  if (process.env.NODE_ENV === 'development') {
    isMockDataLoading = false;
    mockDataLoaded = false;
    console.log('Mock 데이터 상태 리셋됨');
  }
}
```

### 컴포넌트에서 사용 시

```typescript
// src/app/page.tsx
useEffect(() => {
  if (!isAuthenticated) {
    const loaded = loadMockUserDataSafely(enhancedStore);
    if (loaded && process.env.NODE_ENV === 'development') {
      console.log('✅ Home: Mock 데이터 안전하게 로드됨');
    }
  }
}, [isAuthenticated, enhancedStore]); // 의존성 배열 최적화 필요
```

### 추가 개선: 단일 진입점 패턴

```typescript
// src/lib/mock-data-loader.ts (새 파일)
let loaderInitialized = false;

export function initializeMockDataOnce(store: ReturnType<typeof useEnhancedUserStore>) {
  if (loaderInitialized) return;
  loaderInitialized = true;
  
  loadMockUserDataSafely(store);
}

// App 컴포넌트나 최상위 레이아웃에서 한 번만 호출
```

---

## 📁 관련 파일

- `src/lib/user-mock-data-safe.ts` - **수정 필요**
- `src/lib/user-mock-data.ts` - 참고
- `src/app/page.tsx` - Mock 데이터 호출 위치
- `src/app/mypage/page.tsx` - Mock 데이터 호출 위치

---

## 🧪 테스트 계획

1. **단위 테스트**
   - 중복 호출 시 한 번만 로드되는지 확인
   - 로딩 상태 플래그 동작 확인

2. **통합 테스트**
   - Hot Reload 후 중복 없음 확인
   - 여러 페이지에서 동시 접근 시 중복 없음 확인

3. **회귀 테스트**
   - Mock 데이터 정상 로드 확인
   - 기존 기능 정상 동작 확인

---

## 📊 영향도 분석

**개선 효과**:
- 중복 데이터 생성 방지
- 개발 환경 안정성 향상
- 디버깅 용이성 향상

**영향받는 환경**:
- 개발 환경만 (프로덕션에는 영향 없음)

---

## 📝 체크리스트

- [ ] 로딩 상태 플래그 추가
- [ ] 중복 방지 로직 강화
- [ ] Enhanced Store의 `addConversationSafely` 사용
- [ ] 테스트 완료
- [ ] 코드 리뷰 완료
- [ ] 배포 전 검증 완료

---

## 🔗 관련 티켓

- TICKET-001: `addConversation` 중복 체크 문제와 연관
- TICKET-002: Store 사용 통일 문제와 연관
