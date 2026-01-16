# HeartSignal Git 설정 및 배포 스크립트
# 한글 경로 문제 해결 버전

Write-Host "🚀 HeartSignal Git 설정 및 배포 스크립트" -ForegroundColor Cyan
Write-Host ""

# 현재 스크립트 위치에서 프로젝트 루트 찾기
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = $scriptPath

# package.json이 있는지 확인
while (-not (Test-Path (Join-Path $projectRoot "package.json"))) {
    $parent = Split-Path -Parent $projectRoot
    if ($parent -eq $projectRoot) {
        Write-Host "❌ 프로젝트 루트를 찾을 수 없습니다." -ForegroundColor Red
        exit 1
    }
    $projectRoot = $parent
}

Write-Host "📁 프로젝트 디렉토리: $projectRoot" -ForegroundColor Green
Set-Location $projectRoot

# Git 초기화
Write-Host ""
Write-Host "🔧 Git 저장소 초기화 중..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✅ Git 저장소 초기화 완료" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Git 저장소가 이미 존재합니다." -ForegroundColor Blue
}

# Git 사용자 정보 확인
Write-Host ""
Write-Host "👤 Git 사용자 정보 확인 중..." -ForegroundColor Yellow
$userName = git config user.name
$userEmail = git config user.email

if (-not $userName -or -not $userEmail) {
    Write-Host "⚠️  Git 사용자 정보가 설정되지 않았습니다." -ForegroundColor Yellow
    $setUser = Read-Host "Git 사용자 정보를 설정하시겠습니까? (y/n)"
    if ($setUser -eq "y" -or $setUser -eq "Y") {
        $inputName = Read-Host "이름을 입력하세요"
        $inputEmail = Read-Host "이메일을 입력하세요"
        git config user.name $inputName
        git config user.email $inputEmail
        Write-Host "✅ Git 사용자 정보 설정 완료" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Git 사용자 정보: $userName <$userEmail>" -ForegroundColor Green
}

# 파일 추가
Write-Host ""
Write-Host "📦 파일 추가 중..." -ForegroundColor Yellow
git add .
Write-Host "✅ 파일 추가 완료" -ForegroundColor Green

# 커밋
Write-Host ""
Write-Host "💾 커밋 중..." -ForegroundColor Yellow
$commitMessage = @"
feat: v6.0 이슈 해결 및 Netlify 배포 설정

- 이슈 #001: Next.js 15 호환성 (params Promise 처리)
- 이슈 #002: 스토어 중복 정의 해결 (통합 스토어 생성)
- 이슈 #003: API 에러 핸들링 강화 (Circuit Breaker, 재시도 전략)
- 이슈 #004: 메모리 누수 방지 개선 (리소스 관리 시스템)

배포 설정:
- Netlify 배포 설정 파일 추가 (netlify.toml)
- GitHub Actions 워크플로우 추가
- 배포 가이드 문서 추가

적용된 원칙:
- SOLID 원칙 (SRP, OCP, LSP, ISP, DIP)
- 디자인 패턴 (Strategy, Circuit Breaker, Observer, Composite, Adapter, Decorator)

새로운 파일:
- src/store/session/unified-store.ts
- src/domain/controllers/useAnalysisController-v6.ts
- src/domain/adapters/llm.openai-v6.ts
- src/hooks/useResourceManager.ts
- netlify.toml
- .github/workflows/netlify-deploy.yml
- docs/deployment.md
- ISSUE_RESOLUTION_REPORT.md

기존 서비스 영향: 없음 (완전 분리)
"@

git commit -m $commitMessage
Write-Host "✅ 커밋 완료" -ForegroundColor Green

# 원격 저장소 확인
Write-Host ""
Write-Host "🌐 원격 저장소 확인 중..." -ForegroundColor Yellow
$remoteUrl = git remote get-url origin 2>$null

if (-not $remoteUrl) {
    Write-Host "⚠️  원격 저장소가 설정되지 않았습니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "다음 단계를 수행하세요:" -ForegroundColor Cyan
    Write-Host "1. GitHub에서 새 저장소를 생성하세요"
    Write-Host "2. 다음 명령어를 실행하세요:" -ForegroundColor Yellow
    Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/heartsignal.git" -ForegroundColor White
    Write-Host "   git branch -M main" -ForegroundColor White
    Write-Host "   git push -u origin main" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "✅ 원격 저장소: $remoteUrl" -ForegroundColor Green
    Write-Host ""
    $push = Read-Host "GitHub에 푸시하시겠습니까? (y/n)"
    if ($push -eq "y" -or $push -eq "Y") {
        Write-Host "📤 GitHub에 푸시 중..." -ForegroundColor Yellow
        git push -u origin main
        Write-Host "✅ 푸시 완료" -ForegroundColor Green
    }
}

# 배포 안내
Write-Host ""
Write-Host "🎉 Git 설정 완료!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "1. GitHub 저장소 생성 및 연동 (위의 안내 참고)" -ForegroundColor White
Write-Host "2. Netlify 대시보드에서 GitHub 저장소 연결" -ForegroundColor White
Write-Host "3. 환경 변수 설정 (NEXT_PUBLIC_OPENAI_API_KEY)" -ForegroundColor White
Write-Host "4. 자동 배포 확인" -ForegroundColor White
Write-Host ""
Write-Host "📖 자세한 배포 가이드: docs/deployment.md" -ForegroundColor Yellow
Write-Host "✅ 배포 체크리스트: DEPLOYMENT_CHECKLIST.md" -ForegroundColor Yellow
Write-Host ""