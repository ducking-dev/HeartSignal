# 티켓 #008: 마이크 권한 거부 시 에러 처리 개선 필요

**티켓 번호**: TICKET-008  
**심각도**: 🟡 Medium  
**우선순위**: P2 (향후 개선)  
**작성일**: 2024년 12월  
**담당자**: 개발팀

---

## 📋 문제 요약

마이크 권한이 거부되었을 때 에러 메시지만 표시하고, 사용자에게 권한 요청 방법에 대한 가이드가 제공되지 않습니다.

---

## 🔍 상세 설명

### 현재 구현
```typescript
// src/domain/controllers/useAnalysisController.ts:84-87
catch (permissionError: any) {
  console.error('마이크 권한 오류:', permissionError);
  throw new Error('마이크 사용 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
}
```

### 문제점
1. **가이드 부족**: 브라우저별 권한 설정 방법 안내 없음
2. **에러 타입 구분 없음**: 사용자 거부와 시스템 오류 구분 안 됨
3. **재시도 옵션 없음**: 권한 요청 재시도 버튼 없음

---

## ✅ 해결 방안

### 개선된 권한 에러 처리

```typescript
// 마이크 권한 에러 타입 정의
enum MicrophonePermissionError {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PERMISSION_DISMISSED = 'PERMISSION_DISMISSED',
  NOT_SUPPORTED = 'NOT_SUPPORTED',
  UNKNOWN = 'UNKNOWN',
}

// 권한 에러 감지 함수
function detectPermissionError(error: any): MicrophonePermissionError {
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    return MicrophonePermissionError.PERMISSION_DENIED;
  }
  if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    return MicrophonePermissionError.NOT_SUPPORTED;
  }
  return MicrophonePermissionError.UNKNOWN;
}

// 브라우저별 가이드 컴포넌트
function MicrophonePermissionGuide({ errorType }: { errorType: MicrophonePermissionError }) {
  const browser = detectBrowser();
  
  const guides = {
    chrome: {
      title: 'Chrome에서 마이크 권한 허용하기',
      steps: [
        '주소창 왼쪽의 자물쇠 아이콘 클릭',
        '사이트 설정 클릭',
        '마이크 권한을 "허용"으로 변경',
        '페이지를 새로고침하세요',
      ],
    },
    firefox: {
      title: 'Firefox에서 마이크 권한 허용하기',
      steps: [
        '주소창 왼쪽의 자물쇠 아이콘 클릭',
        '권한 > 마이크 > 허용 선택',
        '페이지를 새로고침하세요',
      ],
    },
    safari: {
      title: 'Safari에서 마이크 권한 허용하기',
      steps: [
        'Safari > 설정 > 웹사이트 > 마이크',
        '이 웹사이트를 "허용"으로 변경',
        '페이지를 새로고침하세요',
      ],
    },
  };

  const guide = guides[browser] || guides.chrome;

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          마이크 권한이 필요합니다
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-orange-700">
          {errorType === MicrophonePermissionError.PERMISSION_DENIED
            ? '마이크 사용 권한이 거부되었습니다.'
            : '마이크를 찾을 수 없습니다.'}
        </p>

        <div className="space-y-2">
          <h4 className="font-medium text-orange-900">{guide.title}</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-orange-800">
            {guide.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <Button 
          onClick={async () => {
            try {
              await navigator.mediaDevices.getUserMedia({ audio: true });
              window.location.reload();
            } catch (e) {
              // 권한 요청 실패
            }
          }}
          className="w-full"
        >
          권한 다시 요청하기
        </Button>
      </CardContent>
    </Card>
  );
}

// 브라우저 감지 함수
function detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'other' {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome')) return 'chrome';
  if (userAgent.includes('firefox')) return 'firefox';
  if (userAgent.includes('safari')) return 'safari';
  return 'other';
}
```

---

## 📁 관련 파일

- `src/domain/controllers/useAnalysisController.ts` - **수정 필요**
- `src/components/SessionRecorder.tsx` - 에러 표시 개선 필요

---

## 🧪 테스트 계획

1. **기능 테스트**
   - 권한 거부 시 가이드 표시 확인
   - 브라우저별 가이드 정확성 확인
   - 재시도 버튼 동작 확인

2. **사용자 경험 테스트**
   - 가이드 명확성 확인
   - 권한 설정 후 정상 동작 확인

---

## 📊 영향도 분석

**개선 효과**:
- 사용자 경험 향상
- 권한 문제 해결 시간 단축
- 사용자 이탈률 감소

---

## 📝 체크리스트

- [ ] 에러 타입 구분 로직 추가
- [ ] 브라우저별 가이드 작성
- [ ] 가이드 컴포넌트 구현
- [ ] 재시도 기능 추가
- [ ] 테스트 완료
- [ ] 코드 리뷰 완료

---

## 🔗 관련 티켓

- 독립적인 이슈
