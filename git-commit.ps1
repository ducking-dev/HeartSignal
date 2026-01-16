# Git 커밋 스크립트 - 한글 경로 문제 우회
# PowerShell 스크립트

# 현재 스크립트 위치에서 프로젝트 루트 찾기
$scriptPath = $PSScriptRoot
if (-not $scriptPath) {
    $scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
}

# 프로젝트 루트로 이동 (package.json이 있는 디렉토리)
$projectRoot = $scriptPath
while (-not (Test-Path (Join-Path $projectRoot "package.json"))) {
    $parent = Split-Path -Parent $projectRoot
    if ($parent -eq $projectRoot) {
        Write-Host "프로젝트 루트를 찾을 수 없습니다."
        exit 1
    }
    $projectRoot = $parent
}

Set-Location $projectRoot
Write-Host "프로젝트 디렉토리: $projectRoot"

# Git 초기화
if (-not (Test-Path ".git")) {
    Write-Host "Git 저장소 초기화 중..."
    git init
} else {
    Write-Host "Git 저장소가 이미 존재합니다."
}

# Git 사용자 정보 설정
git config user.name "HeartSignal Developer"
git config user.email "dev@heartsignal.com"

# 모든 파일 추가
Write-Host "파일 추가 중..."
git add .

# 커밋
Write-Host "커밋 중..."
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

Write-Host "Git 커밋 완료!"
Write-Host "현재 브랜치: $(git branch --show-current)"
Write-Host "커밋 해시: $(git rev-parse HEAD)"
