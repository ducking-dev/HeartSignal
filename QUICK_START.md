# 🚀 빠른 시작 가이드

## Git 설정 및 GitHub 연동

### 1단계: Git 저장소 초기화 및 커밋

프로젝트 루트 디렉토리에서 다음 명령어를 실행하세요:

```powershell
# PowerShell에서 실행
.\setup-git-and-deploy.ps1
```

또는 수동으로 실행:

```powershell
# Git 초기화
git init

# 사용자 정보 설정 (필요시)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 모든 파일 추가
git add .

# 커밋
git commit -m "feat: v6.0 이슈 해결 및 Netlify 배포 설정"
```

### 2단계: GitHub 저장소 생성 및 연동

1. **GitHub 저장소 생성**
   - [GitHub](https://github.com)에 로그인
   - 우측 상단 **"+"** → **"New repository"** 클릭
   - 저장소 이름: `heartsignal` (또는 원하는 이름)
   - Public 또는 Private 선택
   - **"Create repository"** 클릭

2. **로컬 저장소와 연결**
   ```powershell
   # 원격 저장소 추가 (YOUR_USERNAME을 실제 GitHub 사용자명으로 변경)
   git remote add origin https://github.com/YOUR_USERNAME/heartsignal.git
   
   # 브랜치 이름을 main으로 설정
   git branch -M main
   
   # GitHub에 푸시
   git push -u origin main
   ```

### 3단계: Netlify 배포 설정

1. **Netlify 계정 생성**
   - [Netlify](https://www.netlify.com/) 접속
   - **"Sign up"** → GitHub 계정으로 로그인 (권장)

2. **새 사이트 생성**
   - Netlify 대시보드에서 **"Add new site"** → **"Import an existing project"** 클릭
   - **GitHub** 선택
   - 방금 생성한 `heartsignal` 저장소 선택
   - 브랜치: `main` 선택

3. **빌드 설정 확인**
   - Build command: `npm run build` (자동 감지됨)
   - Publish directory: `.next` (자동 설정됨)
   - **"Deploy site"** 클릭

4. **환경 변수 설정**
   - 배포 완료 후 **Site settings** → **Environment variables** 이동
   - 다음 변수 추가:
     - `NEXT_PUBLIC_OPENAI_API_KEY`: OpenAI API 키
     - `NEXT_PUBLIC_APP_ENV`: `production`

### 4단계: 배포 확인

- Netlify 대시보드에서 배포 상태 확인
- 제공된 URL로 접속 (예: `https://heartsignal.netlify.app`)
- 사이트가 정상적으로 작동하는지 확인

## 자동 배포 설정 (선택사항)

GitHub Actions를 사용하여 자동 배포를 설정하려면:

1. **Netlify Access Token 생성**
   - Netlify 대시보드 → **User settings** → **Applications** → **New access token**
   - 토큰 복사

2. **Site ID 확인**
   - Netlify 대시보드 → **Site settings** → **General** → **Site details** → **Site ID** 복사

3. **GitHub Secrets 설정**
   - GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
   - **New repository secret** 클릭
   - 다음 Secrets 추가:
     - `NETLIFY_AUTH_TOKEN`: Netlify Access Token
     - `NETLIFY_SITE_ID`: Netlify Site ID

이제 GitHub에 푸시할 때마다 자동으로 Netlify에 배포됩니다!

## 트러블슈팅

### Git 푸시 실패 시
```powershell
# 원격 저장소 확인
git remote -v

# 원격 저장소 재설정
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/heartsignal.git
git push -u origin main
```

### Netlify 빌드 실패 시
1. Netlify 대시보드 → **Deploys** → 실패한 배포 → **Deploy log** 확인
2. 로컬에서 빌드 테스트: `npm run build`
3. 환경 변수 확인: 모든 필수 변수가 설정되었는지 확인

### 한글 경로 문제
프로젝트 경로에 한글이 포함된 경우:
- PowerShell에서 스크립트 실행 시 인코딩 문제가 발생할 수 있습니다
- 수동으로 Git 명령어를 실행하거나
- 영어 경로로 프로젝트를 이동하는 것을 권장합니다

## 추가 리소스

- 📖 [상세 배포 가이드](docs/deployment.md)
- ✅ [배포 체크리스트](DEPLOYMENT_CHECKLIST.md)
- 🐛 [이슈 해결 리포트](ISSUE_RESOLUTION_REPORT.md)

---

**질문이나 문제가 있으시면 GitHub Issues에 등록해주세요!** 🚀