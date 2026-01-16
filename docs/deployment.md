# 🚀 HeartSignal 배포 가이드

## Netlify 배포 및 GitHub 연동

### 1. GitHub 저장소 생성 및 연동

#### 1.1 GitHub 저장소 생성
1. GitHub에 로그인 후 새 저장소 생성
2. 저장소 이름: `heartsignal` (또는 원하는 이름)
3. Public 또는 Private 선택
4. README, .gitignore, license는 추가하지 않음 (이미 존재)

#### 1.2 로컬 저장소와 GitHub 연동
```bash
# Git 저장소 초기화 (이미 되어 있다면 스킵)
git init

# 사용자 정보 설정
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 모든 파일 추가
git add .

# 초기 커밋
git commit -m "feat: initial commit - HeartSignal v6.0"

# GitHub 저장소를 원격 저장소로 추가
git remote add origin https://github.com/YOUR_USERNAME/heartsignal.git

# 기본 브랜치를 main으로 설정
git branch -M main

# GitHub에 푸시
git push -u origin main
```

### 2. Netlify 배포 설정

#### 2.1 Netlify 계정 생성 및 로그인
1. [Netlify](https://www.netlify.com/) 접속
2. GitHub 계정으로 로그인 (권장)

#### 2.2 새 사이트 생성
1. Netlify 대시보드에서 **"Add new site"** → **"Import an existing project"** 클릭
2. **GitHub** 선택
3. 방금 생성한 `heartsignal` 저장소 선택
4. 브랜치: `main` 선택

#### 2.3 빌드 설정
Netlify가 자동으로 Next.js를 감지하지만, 다음 설정을 확인:

- **Build command**: `npm run build`
- **Publish directory**: `.next` (자동 설정됨)
- **Node version**: `20` (netlify.toml에서 설정됨)

#### 2.4 환경 변수 설정
Netlify 대시보드에서 환경 변수 추가:

1. **Site settings** → **Environment variables** 이동
2. 다음 변수 추가:
   - `NEXT_PUBLIC_OPENAI_API_KEY`: OpenAI API 키
   - `NEXT_PUBLIC_APP_ENV`: `production`

**⚠️ 중요**: 
- `NEXT_PUBLIC_` 접두사가 있는 변수만 클라이언트에서 접근 가능
- 민감한 정보는 서버 사이드에서만 사용

### 3. 자동 배포 설정

#### 3.1 GitHub Actions (선택사항)
`.github/workflows/netlify-deploy.yml` 파일이 이미 생성되어 있습니다.

**설정 방법**:
1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. 다음 Secrets 추가:
   - `NETLIFY_AUTH_TOKEN`: Netlify 대시보드 → User settings → Applications → New access token
   - `NETLIFY_SITE_ID`: Netlify 대시보드 → Site settings → General → Site details → Site ID

#### 3.2 Netlify 자동 배포
- GitHub에 푸시할 때마다 자동으로 배포됩니다
- Pull Request 생성 시 프리뷰 배포가 자동 생성됩니다

### 4. 커스텀 도메인 설정 (선택사항)

1. Netlify 대시보드 → **Domain settings**
2. **Add custom domain** 클릭
3. 도메인 입력 (예: `heartsignal.com`)
4. DNS 설정 안내에 따라 DNS 레코드 추가

### 5. 배포 확인

배포가 완료되면:
- Netlify 대시보드에서 배포 상태 확인
- 제공된 URL로 접속하여 사이트 확인
- 예: `https://heartsignal.netlify.app`

### 6. 트러블슈팅

#### 빌드 실패 시
1. **Netlify 로그 확인**: Deploys → 실패한 배포 → Deploy log
2. **로컬 빌드 테스트**: `npm run build` 실행하여 로컬에서 확인
3. **환경 변수 확인**: 모든 필수 환경 변수가 설정되었는지 확인

#### 일반적인 문제
- **Node 버전 불일치**: `netlify.toml`에서 `NODE_VERSION = "20"` 확인
- **의존성 문제**: `package-lock.json`이 커밋되었는지 확인
- **환경 변수 누락**: Netlify 대시보드에서 환경 변수 확인

### 7. CI/CD 워크플로우

현재 설정된 워크플로우:
- ✅ GitHub에 푸시 시 자동 빌드 및 배포
- ✅ Pull Request 시 프리뷰 배포
- ✅ 빌드 전 자동 린트 검사
- ✅ 빌드 실패 시 알림

### 8. 성능 최적화

Netlify에서 자동으로 적용되는 최적화:
- ✅ Next.js 자동 최적화
- ✅ 이미지 최적화
- ✅ 정적 파일 캐싱
- ✅ CDN 배포
- ✅ HTTP/2 지원

### 9. 모니터링

Netlify 대시보드에서 확인 가능:
- 배포 히스토리
- 사이트 성능 메트릭
- 폼 제출 (설정 시)
- 함수 호출 (설정 시)

---

## 📝 체크리스트

배포 전 확인사항:
- [ ] GitHub 저장소 생성 및 연동 완료
- [ ] Netlify 계정 생성 및 사이트 연결 완료
- [ ] 환경 변수 설정 완료 (`NEXT_PUBLIC_OPENAI_API_KEY`)
- [ ] 로컬 빌드 테스트 통과 (`npm run build`)
- [ ] `.gitignore`에 민감한 파일 제외 확인
- [ ] `netlify.toml` 설정 확인
- [ ] 첫 배포 성공 확인

---

**작성일**: 2026-01-16  
**버전**: HeartSignal v6.0