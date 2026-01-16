# 티켓 #005: 설정 페이지에서 알림/개인정보 설정 저장 기능 없음

**티켓 번호**: TICKET-005  
**심각도**: 🟠 High  
**우선순위**: P1 (1주일 내 수정)  
**작성일**: 2024년 12월  
**담당자**: 개발팀

---

## 📋 문제 요약

설정 페이지(`/settings`)에서 알림 설정과 개인정보 설정을 변경할 수 있지만, 변경 사항이 저장되지 않습니다. 페이지를 새로고침하면 설정이 초기화됩니다.

---

## 🔍 상세 설명

### 현재 구현

```typescript
// 알림 설정
const [notifications, setNotifications] = useState({
  newMessages: true,
  analysisComplete: true,
  weeklyReport: false,
  marketing: false
});

// 개인정보 설정
const [privacy, setPrivacy] = useState({
  profileVisible: true,
  shareAnalytics: false,
  dataRetention: true
});
```

### 문제점
1. **로컬 상태만 사용**: `useState`로만 관리되어 페이지 새로고침 시 초기화됨
2. **저장 기능 없음**: 변경 사항을 저장하는 함수가 없음
3. **persist 없음**: Zustand persist나 localStorage에 저장하지 않음

---

## 🐛 재현 단계

1. 설정 페이지 접근 (`/settings`)
2. 알림 설정 변경 (예: 주간 리포트 활성화)
3. 개인정보 설정 변경 (예: 프로필 공개 비활성화)
4. 페이지 새로고침
5. 설정이 초기 상태로 돌아감

---

## ✅ 해결 방안

### 옵션 1: Zustand Store에 설정 추가 (권장)

#### 1. Store 타입 확장
```typescript
// src/store/user/types.ts
export interface UserSettings {
  notifications: {
    newMessages: boolean;
    analysisComplete: boolean;
    weeklyReport: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisible: boolean;
    shareAnalytics: boolean;
    dataRetention: boolean;
  };
}

export interface UserState {
  // ... 기존 필드들
  settings: UserSettings;
}
```

#### 2. Store에 설정 액션 추가
```typescript
// src/store/user/store.ts
const initialState: UserState = {
  // ... 기존 필드들
  settings: {
    notifications: {
      newMessages: true,
      analysisComplete: true,
      weeklyReport: false,
      marketing: false,
    },
    privacy: {
      profileVisible: true,
      shareAnalytics: false,
      dataRetention: true,
    },
  },
};

// 액션 추가
updateSettings: (settings: Partial<UserSettings>) => {
  set(
    (state) => ({
      settings: { ...state.settings, ...settings },
    }),
    false,
    'updateSettings'
  );
},
```

#### 3. persist에 설정 포함
```typescript
partialize: (state) => ({
  profile: state.profile,
  conversations: state.conversations,
  isAuthenticated: state.isAuthenticated,
  settings: state.settings, // 추가
}),
```

#### 4. 설정 페이지 수정
```typescript
// src/app/settings/page.tsx
const { profile, setProfile, logout, isAuthenticated, settings, updateSettings } = useUserStore();

// 초기 상태를 Store에서 가져오기
const [notifications, setNotifications] = useState(settings.notifications);
const [privacy, setPrivacy] = useState(settings.privacy);

// 저장 함수 추가
const handleSaveSettings = () => {
  updateSettings({
    notifications,
    privacy,
  });
  success('설정이 저장되었습니다!');
};
```

### 옵션 2: localStorage 직접 사용

```typescript
const SETTINGS_KEY = 'heartsignal-settings';

const loadSettings = (): UserSettings => {
  if (typeof window === 'undefined') return defaultSettings;
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? JSON.parse(stored) : defaultSettings;
};

const saveSettings = (settings: UserSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
```

---

## 📁 관련 파일

- `src/app/settings/page.tsx` - **수정 필요**
- `src/store/user/types.ts` - **수정 필요** (옵션 1 선택 시)
- `src/store/user/store.ts` - **수정 필요** (옵션 1 선택 시)

---

## 🧪 테스트 계획

1. **기능 테스트**
   - 설정 변경 후 저장 확인
   - 페이지 새로고침 후 설정 유지 확인
   - 여러 설정 조합 테스트

2. **통합 테스트**
   - 다른 페이지에서 설정 반영 확인
   - 로그아웃/로그인 후 설정 유지 확인

---

## 📊 영향도 분석

**개선 효과**:
- 사용자 설정 영구 저장
- 사용자 경험 향상
- 설정 기능 완성도 향상

**영향받는 기능**:
- 알림 설정
- 개인정보 설정

---

## 📝 체크리스트

- [ ] 저장 방안 결정 (옵션 1 또는 2)
- [ ] Store 타입 확장 (옵션 1 선택 시)
- [ ] 설정 저장 로직 구현
- [ ] 설정 페이지 UI 수정 (저장 버튼 추가)
- [ ] 테스트 완료
- [ ] 코드 리뷰 완료
- [ ] 배포 전 검증 완료

---

## 🔗 관련 티켓

- 독립적인 이슈
