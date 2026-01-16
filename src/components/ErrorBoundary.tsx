'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * React Error Boundary 컴포넌트
 * v4.md 개선사항: 전역 에러 처리 시스템 구축
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // 에러 로깅 서비스에 전송 (예: Sentry, LogRocket 등)
    if (process.env.NODE_ENV === 'production') {
      // TODO: 실제 에러 로깅 서비스 연동
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // 에러 로깅 서비스에 전송하는 로직
    console.log('Logging error to service:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      // 커스텀 폴백 UI가 제공된 경우 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-destructive" />
              </div>
              <CardTitle className="text-xl">문제가 발생했습니다</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center text-muted-foreground">
                <p>예상치 못한 오류가 발생했습니다.</p>
                <p>잠시 후 다시 시도해 주세요.</p>
              </div>

              {/* 개발 환경에서만 에러 상세 정보 표시 */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4 p-3 bg-muted rounded-lg text-sm">
                  <summary className="cursor-pointer font-medium mb-2">
                    에러 상세 정보 (개발용)
                  </summary>
                  <div className="space-y-2">
                    <div>
                      <strong>에러 메시지:</strong>
                      <pre className="mt-1 text-xs bg-background p-2 rounded overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    <div>
                      <strong>스택 트레이스:</strong>
                      <pre className="mt-1 text-xs bg-background p-2 rounded overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry} 
                  variant="outline" 
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  다시 시도
                </Button>
                <Button 
                  onClick={this.handleGoHome} 
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  홈으로
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

/**
 * 특정 컴포넌트용 간단한 에러 폴백 컴포넌트
 */
export function SimpleErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error; 
  resetError: () => void; 
}) {
  return (
    <div className="p-4 border border-destructive/20 bg-destructive/10 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="h-4 w-4 text-destructive" />
        <h3 className="font-medium text-destructive">오류가 발생했습니다</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {error.message || '알 수 없는 오류가 발생했습니다.'}
      </p>
      <Button onClick={resetError} size="sm" variant="outline">
        다시 시도
      </Button>
    </div>
  );
}