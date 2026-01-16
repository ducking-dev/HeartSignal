# ✅ 배포 체크리스트

## GitHub 연동

- [ ] GitHub 저장소 생성
- [ ] 로컬 Git 저장소 초기화
- [ ] 원격 저장소 연결 (`git remote add origin`)
- [ ] 초기 커밋 및 푸시 완료
- [ ] GitHub Actions Secrets 설정 (선택사항)

## Netlify 설정

- [ ] Netlify 계정 생성
- [ ] GitHub 저장소 연결
- [ ] 빌드 설정 확인
- [ ] 환경 변수 설정:
  - [ ] `NEXT_PUBLIC_OPENAI_API_KEY`
  - [ ] `NEXT_PUBLIC_APP_ENV` (production)
- [ ] 첫 배포 성공 확인
- [ ] 배포 URL 확인

## 코드 검증

- [ ] 로컬 빌드 테스트 통과 (`npm run build`)
- [ ] 린터 에러 없음 (`npm run lint`)
- [ ] 타입 체크 통과 (`tsc --noEmit`)
- [ ] 환경 변수 사용 확인
- [ ] `.gitignore` 설정 확인

## 문서

- [ ] `netlify.toml` 파일 생성 확인
- [ ] `docs/deployment.md` 가이드 확인
- [ ] README 업데이트 (배포 정보 추가)

## 보안

- [ ] 환경 변수에 민감한 정보 포함 확인
- [ ] `.env` 파일이 `.gitignore`에 포함 확인
- [ ] API 키가 코드에 하드코딩되지 않음 확인

---

**다음 단계**: `docs/deployment.md` 파일을 참고하여 배포를 진행하세요.