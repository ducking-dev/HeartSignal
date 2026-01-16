# QA 티켓 목록

이 디렉토리에는 HeartSignal 프론트엔드 QA 과정에서 발견된 모든 오류 티켓이 포함되어 있습니다.

---

## 📊 티켓 통계

- **Critical Issues**: 3개
- **High Priority Issues**: 3개
- **Medium Priority Issues**: 3개
- **Low Priority Issues**: 2개 (향후 추가 예정)

---

## 🚨 Critical Issues (즉시 수정 필요)

| 티켓 번호 | 제목 | 상태 |
|---------|------|------|
| [TICKET-001](./TICKET-001-addConversation-duplicate-check.md) | `addConversation` 함수에서 중복 체크 누락 | 🔴 Open |
| [TICKET-002](./TICKET-002-store-usage-inconsistency.md) | `useUserStore`와 `useEnhancedUserStore` 혼용 | 🔴 Open |
| [TICKET-003](./TICKET-003-router-inconsistency.md) | Next.js 라우터와 `window.location.href` 혼용 | 🔴 Open |

---

## ⚠️ High Priority Issues (1주일 내 수정)

| 티켓 번호 | 제목 | 상태 |
|---------|------|------|
| [TICKET-004](./TICKET-004-conversation-detail-error-handling.md) | 대화 상세 페이지에서 존재하지 않는 대화 ID 처리 개선 | 🟠 Open |
| [TICKET-005](./TICKET-005-settings-not-saving.md) | 설정 페이지에서 알림/개인정보 설정 저장 기능 없음 | 🟠 Open |
| [TICKET-006](./TICKET-006-mock-data-duplicate.md) | Mock 데이터 로딩 시 중복 생성 가능성 | 🟠 Open |

---

## 📊 Medium Priority Issues (향후 개선)

| 티켓 번호 | 제목 | 상태 |
|---------|------|------|
| [TICKET-007](./TICKET-007-error-boundary-improvement.md) | 에러 바운더리에서 에러 상세 정보 부족 | 🟡 Open |
| [TICKET-008](./TICKET-008-microphone-permission-error.md) | 마이크 권한 거부 시 에러 처리 개선 필요 | 🟡 Open |
| [TICKET-009](./TICKET-009-empty-state-improvement.md) | 대화 히스토리에서 빈 상태 처리 개선 | 🟡 Open |

---

## 📋 티켓 상태 설명

- 🔴 **Open**: 아직 수정되지 않음
- 🟡 **In Progress**: 수정 진행 중
- 🟢 **Resolved**: 수정 완료, 테스트 대기
- ✅ **Closed**: 수정 완료 및 검증 완료

---

## 🔗 관련 문서

- [전체 QA 리포트](../QA_ERROR_REPORT.md) - 모든 발견 사항 요약
- [이슈 해결 리포트](../ISSUE_RESOLUTION_REPORT.md) - 이전 이슈 해결 내역

---

## 📝 티켓 작성 가이드

각 티켓은 다음 구조를 따릅니다:

1. **문제 요약**: 간단한 문제 설명
2. **상세 설명**: 문제의 원인과 현재 구현
3. **재현 단계**: 문제를 재현하는 방법
4. **해결 방안**: 제안된 해결책
5. **관련 파일**: 수정이 필요한 파일 목록
6. **테스트 계획**: 수정 후 테스트 방법
7. **영향도 분석**: 수정의 영향 범위
8. **체크리스트**: 수정 완료 확인 항목

---

## 🚀 수정 우선순위

### Phase 1: Critical Issues (즉시)
1. TICKET-001: 중복 체크 추가
2. TICKET-002: Store 사용 통일
3. TICKET-003: 라우터 통일

### Phase 2: High Priority (1주일 내)
4. TICKET-004: 에러 처리 개선
5. TICKET-005: 설정 저장 기능
6. TICKET-006: Mock 데이터 중복 방지

### Phase 3: Medium Priority (향후)
7. TICKET-007: 에러 바운더리 개선
8. TICKET-008: 마이크 권한 가이드
9. TICKET-009: 빈 상태 UI 개선

---

**마지막 업데이트**: 2024년 12월
