#!/bin/bash
# Git 커밋 스크립트 - 한글 경로 문제 우회

# 프로젝트 디렉토리로 이동 (실제 경로)
cd "C:/Users/lynn2/OneDrive/바탕 화면/HeartSignal/heartsignal" || exit 1

# Git 초기화 (이미 있으면 스킵)
git init

# 모든 파일 추가
git add .

# 커밋
git commit -m "feat: v6.0 이슈 해결 - SOLID 원칙 적용

- 이슈 #001: Next.js 15 호환성 (params Promise 처리)
- 이슈 #002: 스토어 중복 정의 해결 (통합 스토어 생성)
- 이슈 #003: API 에러 핸들링 강화 (Circuit Breaker, 재시도 전략)
- 이슈 #004: 메모리 누수 방지 개선 (리소스 관리 시스템)

적용된 원칙:
- SOLID 원칙 (SRP, OCP, LSP, ISP, DIP)
- 디자인 패턴 (Strategy, Circuit Breaker, Observer, Composite, Adapter, Decorator)

새로운 파일:
- src/store/session/unified-store.ts
- src/domain/controllers/useAnalysisController-v6.ts
- src/domain/adapters/llm.openai-v6.ts
- src/hooks/useResourceManager.ts
- ISSUE_RESOLUTION_REPORT.md

기존 서비스 영향: 없음 (완전 분리)"

echo "Git 커밋 완료!"
