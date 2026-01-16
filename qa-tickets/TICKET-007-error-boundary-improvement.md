# 티켓 #007: 에러 바운더리에서 에러 상세 정보 부족

**티켓 번호**: TICKET-007  
**심각도**: 🟡 Medium  
**우선순위**: P2 (향후 개선)  
**작성일**: 2024년 12월  
**담당자**: 개발팀

---

## 📋 문제 요약

에러 바운더리(`ErrorBoundary`)에서 에러 발생 시 사용자에게 충분한 정보를 제공하지 않으며, 개발자 콘솔에만 에러 로그가 출력됩니다.

---

## 🔍 상세 설명

### 현재 구현
```typescript
// src/components/ErrorBoundary.tsx
render() {
  if (this.state.hasError) {
    return (
      <div className="error-container">
        <h2>문제가 발생했습니다</h2>
        <p>앱을 새로고침해주세요.</p>
        <button onClick={this.handleReset}>다시 시도</button>
      </div>
    );
  }
}
```

### 문제점
1. **에러 정보 부족**: 사용자가 무엇이 잘못되었는지 알 수 없음
2. **에러 리포트 없음**: 개발팀에 에러 정보 전달 불가
3. **복구 옵션 제한적**: 새로고침 외 다른 옵션 없음

---

## ✅ 해결 방안

### 개선된 에러 바운더리

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    errorId: null,
  };

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = `error-${Date.now()}`;
    
    // 에러 로깅 서비스에 전송 (예: Sentry)
    this.logErrorToService(error, errorInfo, errorId);

    this.setState({
      hasError: true,
      error,
      errorInfo,
      errorId,
    });
  }

  logErrorToService = (error: Error, errorInfo: React.ErrorInfo, errorId: string) => {
    // 에러 리포트 서비스 연동
    console.error('에러 리포트:', {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                문제가 발생했습니다
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-foreground">
                  예기치 않은 오류가 발생했습니다. 불편을 드려 죄송합니다.
                </p>
                {this.state.errorId && (
                  <p className="text-sm text-muted-foreground">
                    에러 ID: <code className="bg-muted px-2 py-1 rounded">{this.state.errorId}</code>
                  </p>
                )}
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="bg-muted p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium mb-2">
                    개발자 정보 (개발 환경에서만 표시)
                  </summary>
                  <pre className="text-xs overflow-auto">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleReset}>
                  다시 시도
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                  홈으로 가기
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // 에러 리포트 복사
                    const report = `에러 ID: ${this.state.errorId}\n메시지: ${this.state.error?.message}`;
                    navigator.clipboard.writeText(report);
                  }}
                >
                  에러 정보 복사
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 📁 관련 파일

- `src/components/ErrorBoundary.tsx` - **수정 필요**

---

## 🧪 테스트 계획

1. **기능 테스트**
   - 에러 발생 시 에러 바운더리 표시 확인
   - 에러 정보 표시 확인
   - 복구 버튼 동작 확인

2. **사용자 경험 테스트**
   - 에러 메시지 명확성 확인
   - 복구 옵션 다양성 확인

---

## 📊 영향도 분석

**개선 효과**:
- 사용자 경험 향상
- 에러 디버깅 용이성 향상
- 에러 추적 능력 향상

---

## 📝 체크리스트

- [ ] 에러 정보 표시 개선
- [ ] 에러 리포트 기능 추가
- [ ] 복구 옵션 추가
- [ ] 테스트 완료
- [ ] 코드 리뷰 완료

---

## 🔗 관련 티켓

- 독립적인 이슈
